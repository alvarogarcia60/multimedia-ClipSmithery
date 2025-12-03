// ====== ELEMENTOS ======
const inputVideo = document.getElementById("inputVideo");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");

const videoOriginal = document.getElementById("videoOriginal");
const videoCompressed = document.getElementById("videoCompressed");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

let loadedFile = null;
let compressedBlob = null;

// ====== Cargar vídeo original ======
inputVideo.addEventListener("change", () => {
    loadedFile = inputVideo.files[0];
    if (loadedFile) {
        videoOriginal.src = URL.createObjectURL(loadedFile);
        progressText.textContent = "Progreso: 0%";
        progressFill.style.width = "0%";
        downloadBtn.disabled = true;
    }
});

// ====== COMPRESIÓN PRO: Audio + Vídeo ======
async function compressVideo(file) {
    return new Promise(async (resolve, reject) => {

        // ===== Preparar vídeo =====
        const tempVideo = document.createElement("video");
        tempVideo.src = URL.createObjectURL(file);
        tempVideo.crossOrigin = "anonymous";

        // Necesario para permitir audioTrack
        tempVideo.muted = false;
        tempVideo.volume = 1.0;

        // ===== Silenciar salida real =====
        const silenceCtx = new AudioContext();
        const silenceSource = silenceCtx.createMediaElementSource(tempVideo);
        const silenceGain = silenceCtx.createGain();
        silenceGain.gain.value = 0.0;

        silenceSource.connect(silenceGain);
        silenceGain.connect(silenceCtx.destination);

        await tempVideo.play();
        tempVideo.pause();

        // ===== 1) AUDIO STREAM ORIGINAL ======
        const originalStream = tempVideo.captureStream();
        const originalAudioTrack = originalStream.getAudioTracks()[0];

        // ===== 2) VÍDEO COMPRIMIDO ======
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const targetWidth = tempVideo.videoWidth * 0.7;
        const targetHeight = tempVideo.videoHeight * 0.7;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const compressedVideoStream = canvas.captureStream(30);
        const compressedVideoTrack = compressedVideoStream.getVideoTracks()[0];

        // ===== 3) COMBINAR VIDEO + AUDIO ======
        const finalStream = new MediaStream();
        if (compressedVideoTrack) finalStream.addTrack(compressedVideoTrack);
        if (originalAudioTrack) finalStream.addTrack(originalAudioTrack);

        // ===== 4) RECORDER ======
        let chunks = [];

        const recorder = new MediaRecorder(finalStream, {
            mimeType: "video/webm;codecs=vp9,opus",
            videoBitsPerSecond: 900000,
            audioBitsPerSecond: 128000
        });

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onerror = err => reject(err);
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));

        recorder.start();

        // ===== 5) DIBUJADO DE FRAMES ======
        function draw() {
            ctx.drawImage(tempVideo, 0, 0, targetWidth, targetHeight);

            if (tempVideo.ended) {
                recorder.stop();
                return;
            }
            requestAnimationFrame(draw);
        }

        tempVideo.play();
        draw();
    });
}

// ====== Procesar ======
processBtn.addEventListener("click", async () => {
    if (!loadedFile) {
        alert("Sube un vídeo primero");
        return;
    }

    progressText.textContent = "Comprimiendo vídeo...";
    progressFill.style.width = "40%";

    compressedBlob = await compressVideo(loadedFile);

    videoCompressed.src = URL.createObjectURL(compressedBlob);

    progressFill.style.width = "100%";
    progressText.textContent = "Completado ✔";
    downloadBtn.disabled = false;

    // ===== PANEL DE ANÁLISIS =====
    const analysisBox = document.getElementById("analysis-section");

    document.getElementById("sizeOriginal").textContent =
        (loadedFile.size / 1024 / 1024).toFixed(2) + " MB";

    document.getElementById("sizeCompressed").textContent =
        (compressedBlob.size / 1024 / 1024).toFixed(2) + " MB";

    document.getElementById("resOriginal").textContent =
        `${videoOriginal.videoWidth} x ${videoOriginal.videoHeight}`;

    document.getElementById("resCompressed").textContent =
        `${videoCompressed.videoWidth} x ${videoCompressed.videoHeight}`;

    document.getElementById("durationVideo").textContent =
        videoOriginal.duration.toFixed(2) + " s";

    const reduction =
        100 - (compressedBlob.size / loadedFile.size) * 100;

    document.getElementById("reductionPercent").textContent =
        reduction.toFixed(1) + "%";

    analysisBox.style.display = "block";
});

// ====== Descargar ======
downloadBtn.addEventListener("click", () => {
    if (!compressedBlob) return;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(compressedBlob);
    a.download = "video_comprimido.webm";
    a.click();
});
