const inputPreview = document.getElementById("inputPreview");
const generatePreviewBtn = document.getElementById("generatePreviewBtn");
const previewProgressSection = document.getElementById("previewProgressSection");
const previewProgressText = document.getElementById("previewProgressText");
const previewProgressFill = document.getElementById("previewProgressFill");
const previewResult = document.getElementById("previewResult");
const previewVideo = document.getElementById("previewVideo");
const downloadPreviewBtn = document.getElementById("downloadPreviewBtn");

let loadedFile = null;
let previewBlob = null;


// Detectar diferencia entre frames (movimiento)
function frameDifference(video, scale = 0.25) {
    const w = video.videoWidth * scale;
    const h = video.videoHeight * scale;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext("2d");

    ctx.drawImage(video, 0, 0, w, h);
    const before = ctx.getImageData(0, 0, w, h).data;

    return new Promise(resolve => {
        video.currentTime += 0.35;
        video.onseeked = () => {
            ctx.drawImage(video, 0, 0, w, h);
            const after = ctx.getImageData(0, 0, w, h).data;

            let diff = 0;
            for (let i = 0; i < before.length; i += 4) {
                diff += Math.abs(before[i] - after[i]);
            }

            resolve(diff);
        };
    });
}


// Encuentra el mejor punto del vídeo para empezar
async function findBestStart(video) {
    let bestTime = 1;
    let maxDiff = 0;

    const limit = Math.min(video.duration - 3, 20);

    for (let t = 1; t < limit; t += 0.75) {
        video.currentTime = t;
        await new Promise(r => video.onseeked = r);

        const d = await frameDifference(video);
        if (d > maxDiff) {
            maxDiff = d;
            bestTime = t;
        }
    }
    return bestTime;
}


// Duración inteligente segun vídeo
function smartDuration(duration) {
    if (duration < 10) return duration * 0.30; // 30% del vídeo
    if (duration < 60) return 4;               // vídeos cortos → 4s
    return 6;                                  // vídeos largos → 6s
}


// Generar clip cinematográfico
async function generatePreview(file) {
    return new Promise(async resolve => {

        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.crossOrigin = "anonymous";
        video.muted = true;

        await video.play();
        video.pause();

        const previewLen = smartDuration(video.duration);
        const start = await findBestStart(video);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
            mimeType: "video/webm"
        });

        let chunks = [];

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));

        recorder.start();

        video.currentTime = start;
        await video.play();

        let frames = 0;
        const maxFrames = Math.floor(30 * previewLen); // 30 FPS × duración elegida

        function draw() {
            if (frames >= maxFrames) {
                recorder.stop();
                return;
            }

            const zoom = 1 + (frames / maxFrames) * 0.12;

            const zoomW = canvas.width * zoom;
            const zoomH = canvas.height * zoom;

            ctx.drawImage(
                video,
                (canvas.width - zoomW) / 2,
                (canvas.height - zoomH) / 2,
                zoomW,
                zoomH
            );

            frames++;
            requestAnimationFrame(draw);
        }

        draw();
    });
}


// Eventos UI
inputPreview.addEventListener("change", () => {
    loadedFile = inputPreview.files[0];
    previewResult.style.display = "none";
    previewProgressSection.style.display = "none";
    previewProgressFill.style.width = "0%";
});

generatePreviewBtn.addEventListener("click", async () => {

    if (!loadedFile) {
        alert("Selecciona un vídeo primero");
        return;
    }

    previewProgressSection.style.display = "block";
    previewProgressText.textContent = "Analizando vídeo…";
    previewProgressFill.style.width = "30%";

    previewBlob = await generatePreview(loadedFile);

    previewProgressFill.style.width = "100%";
    previewProgressText.textContent = "Completado ✔";

    previewVideo.src = URL.createObjectURL(previewBlob);

    previewResult.style.display = "block";
    downloadPreviewBtn.disabled = false;
});

downloadPreviewBtn.addEventListener("click", () => {
    if (!previewBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(previewBlob);
    a.download = "vista_previa_cinematica.webm";
    a.click();
});
