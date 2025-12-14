console.log("Módulo: RECORTE VERTICAL cargado.");

/*  ELEMENTOS Y ESTADO */
const inputVideo = document.getElementById("inputVideo");
const videoOriginal = document.getElementById("videoOriginal");
const videoCanvas = document.getElementById("videoCanvas");
const processBtn = document.getElementById("processBtn");
const previewGrid = document.getElementById("previewGrid");
const videoRecortado = document.getElementById("videoRecortado");
const downloadBtn = document.getElementById("downloadBtn");
const ctx = videoCanvas.getContext("2d");

// UI
const fileLabel = document.getElementById("fileLabel");
const fileNameDisplay = document.getElementById("fileNameDisplay");

// Estado
let mediaRecorder = null;
let chunks = [];
let animationFrameId = null;
let recortadoBlob = null;

/*  DIBUJO Y RECORTE 9:16 */
function drawRecortado(videoElement, ctx) {
    const vw = videoElement.videoWidth;
    const vh = videoElement.videoHeight;
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // Capturar franja central para 9:16
    const targetWidth = vh * (9 / 16);
    const sx = (vw - targetWidth) / 2;

    ctx.drawImage(
        videoElement,
        sx, 0, targetWidth, vh,
        0, 0, cw, ch
    );
}

/*  PROCESAR Y GRABAR VÍDEO RECORTADO */
function processAndRecord(videoElement) {
    return new Promise((resolve, reject) => {
        chunks = [];

        // Stream del canvas
        const stream = videoCanvas.captureStream(30);

        // Audio original
        const audioCtx = new AudioContext();
        const sourceNode = audioCtx.createMediaElementSource(videoElement);
        const dest = audioCtx.createMediaStreamDestination();
        sourceNode.connect(dest);

        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
            stream.addTrack(audioTracks[0]);
        }

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp9,opus"
        });

        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onerror = reject;

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            resolve(blob);
        };

        // Iniciar
        videoElement.currentTime = 0;
        videoElement.play();
        mediaRecorder.start();

        function recordingLoop() {
            if (videoElement.paused || videoElement.ended) return;
            drawRecortado(videoElement, ctx);
            requestAnimationFrame(recordingLoop);
        }
        recordingLoop();

        videoElement.onended = () => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
        };
    });
}

/*  PREVIEW DINÁMICA EN CANVAS */
function startPreviewLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    videoOriginal.currentTime = 0;
    videoOriginal.play();

    function loop() {
        if (videoOriginal.paused || videoOriginal.ended) {
            animationFrameId = null;
            return;
        }
        drawRecortado(videoOriginal, ctx);
        animationFrameId = requestAnimationFrame(loop);
    }
    loop();
}

/*  EVENTOS */

// Cargar vídeo
inputVideo.addEventListener("change", () => {
    const file = inputVideo.files[0];
    const fileSelected = !!file;

    fileLabel.textContent = fileSelected ? "Cambiar archivo" : "Elegir archivo";
    fileNameDisplay.textContent = fileSelected ? file.name : "Ningún archivo seleccionado.";

    if (!fileSelected) {
        processBtn.disabled = true;
        return;
    }

    videoOriginal.src = URL.createObjectURL(file);
    previewGrid.style.display = "none";
    videoRecortado.style.display = "none";
    downloadBtn.style.display = "none";
    processBtn.disabled = true;

    videoOriginal.onloadedmetadata = () => {
        const aspectRatio = videoOriginal.videoWidth / videoOriginal.videoHeight;
        if (aspectRatio <= 1) {
            alert("⚠️ El vídeo debe ser horizontal (16:9).");
            videoOriginal.src = "";
            return;
        }

        // Canvas fijo 9:16
        videoCanvas.width = 360;
        videoCanvas.height = 640;

        processBtn.disabled = false;
        previewGrid.style.display = "flex";

        videoOriginal.pause();
        drawRecortado(videoOriginal, ctx);

        videoCanvas.onclick = startPreviewLoop;
    };
});

// Procesar recorte
processBtn.addEventListener("click", async () => {
    if (!videoOriginal.src) return;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        videoOriginal.pause();
    }

    processBtn.disabled = true;
    processBtn.textContent = "⚙️ Procesando Recorte...";
    videoRecortado.style.display = "none";
    downloadBtn.style.display = "none";

    try {
        recortadoBlob = await processAndRecord(videoOriginal);

        const recortadoURL = URL.createObjectURL(recortadoBlob);
        videoRecortado.src = recortadoURL;
        videoRecortado.style.display = "block";
        videoCanvas.style.display = "none";

        processBtn.textContent = "✅ Recorte completado";
        downloadBtn.style.display = "inline-block";
        downloadBtn.disabled = false;

    } catch (e) {
        console.error("Error en el recorte:", e);
        alert("Error al procesar el vídeo.");
        processBtn.textContent = "❌ Error. Reintentar";
        videoCanvas.style.display = "block";
    } finally {
        processBtn.disabled = false;
    }
});

// Descargar vídeo recortado
downloadBtn.addEventListener("click", () => {
    if (!recortadoBlob) return;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(recortadoBlob);
    a.download = "clipsmithery_reels_9x16.webm";
    a.click();
});
