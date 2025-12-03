console.log("Módulo de cambio de resolución cargado");

// Elementos
const inputResolution = document.getElementById("inputResolution");
const changeResBtn = document.getElementById("changeResBtn");
const resolutionSelect = document.getElementById("resolutionSelect");
const resOriginalVideo = document.getElementById("resOriginalVideo");
const resChangedVideo = document.getElementById("resChangedVideo");
const resProgressSection = document.getElementById("resProgressSection");
const resProgressText = document.getElementById("resProgressText");
const resProgressFill = document.getElementById("resProgressFill");
const downloadResBtn = document.getElementById("downloadResBtn");

let resFile = null;
let resBlob = null;


// Cargar vídeo
inputResolution.addEventListener("change", () => {
    resFile = inputResolution.files[0];
    if (resFile) {
        resOriginalVideo.src = URL.createObjectURL(resFile);
        resProgressSection.style.display = "none";
        resProgressFill.style.width = "0%";
        downloadResBtn.disabled = true;
    }
});


// FUNCIÓN DE CAMBIO DE RESOLUCIÓN
async function resizeVideo(file, newHeight) {
    return new Promise(async (resolve, reject) => {

        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.crossOrigin = "anonymous";
        video.muted = true;

        // Cargar metadatos
        await new Promise(r => video.onloadedmetadata = r);

        // Necesario para obtener frames reales
        await video.play();
        video.pause();

        const originalW = video.videoWidth;
        const originalH = video.videoHeight;

        let targetH = (newHeight === "original") ? originalH : parseInt(newHeight);
        let targetW = Math.round(originalW * (targetH / originalH));

        // Crear canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");

        // STREAM DE VIDEO NUEVO
        const outVideoStream = canvas.captureStream(30);

        // ======== AUDIO FIABLE MEDIANTE AUDIOCONTEXT ========
        const audioCtx = new AudioContext();
        const sourceNode = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();

        sourceNode.connect(dest); 
        sourceNode.connect(audioCtx.destination);

        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) outVideoStream.addTrack(audioTrack);

        // ======== GRABACIÓN DEL NUEVO STREAM ========
        let chunks = [];
        const recorder = new MediaRecorder(outVideoStream, {
            mimeType: "video/webm;codecs=vp9,opus",
            videoBitsPerSecond: 1500000,
            audioBitsPerSecond: 128000
        });

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onerror = reject;
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));

        recorder.start();

        function drawFrame() {
            ctx.drawImage(video, 0, 0, targetW, targetH);

            if (video.currentTime >= video.duration) {
                recorder.stop();
                return;
            }
            requestAnimationFrame(drawFrame);
        }

        video.play();
        drawFrame();
    });
}


// BOTÓN CAMBIAR RESOLUCIÓN
changeResBtn.addEventListener("click", async () => {

    if (!resFile) return alert("Sube un vídeo primero");

    const newRes = resolutionSelect.value;

    resProgressSection.style.display = "block";
    resProgressFill.style.width = "40%";
    resProgressText.textContent = "Procesando...";

    resBlob = await resizeVideo(resFile, newRes);

    resChangedVideo.src = URL.createObjectURL(resBlob);

    resProgressFill.style.width = "100%";
    resProgressText.textContent = "Completado ✓";

    downloadResBtn.disabled = false;
});


// DESCARGAR
downloadResBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resBlob);
    a.download = "video_reescalado.webm";
    a.click();
});
