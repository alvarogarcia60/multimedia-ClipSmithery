console.log("Módulo: ROTACIÓN Y ESPEJO cargado.");

/* =====================================================
   ELEMENTOS
===================================================== */
const inputVideo = document.getElementById("inputVideo");
const videoOriginal = document.getElementById("videoOriginal");
const transformSelect = document.getElementById("transformSelect");
const processBtn = document.getElementById("processBtn");
const previewGrid = document.getElementById("previewGrid");
const videoTransformado = document.getElementById("videoTransformado");
const downloadBtn = document.getElementById("downloadBtn");

/* Canvas SOLO para procesamiento (no visible) */
const videoCanvas = document.createElement("canvas");
const ctx = videoCanvas.getContext("2d");

/* Estado */
let mediaRecorder = null;
let chunks = [];
let transformedBlob = null;

/*  TRANSFORMACIÓN GEOMÉTRICA */
function drawTransformada(video, transform) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const rotated = transform === "rotate90" || transform === "rotate270";
    videoCanvas.width = rotated ? vh : vw;
    videoCanvas.height = rotated ? vw : vh;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);

    switch (transform) {
        case "rotate90":
            ctx.translate(videoCanvas.width, 0);
            ctx.rotate(Math.PI / 2);
            break;
        case "rotate180":
            ctx.translate(videoCanvas.width, videoCanvas.height);
            ctx.rotate(Math.PI);
            break;
        case "rotate270":
            ctx.translate(0, videoCanvas.height);
            ctx.rotate(-Math.PI / 2);
            break;
        case "flipH":
            ctx.translate(videoCanvas.width, 0);
            ctx.scale(-1, 1);
            break;
        case "flipV":
            ctx.translate(0, videoCanvas.height);
            ctx.scale(1, -1);
            break;
        default:
            break;
    }

    ctx.drawImage(video, 0, 0, vw, vh);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/*  PROCESAR Y GRABAR VÍDEO TRANSFORMADO */
function processAndRecord(video, transform) {
    return new Promise((resolve, reject) => {
        chunks = [];

        const stream = videoCanvas.captureStream(30);

        /* Audio original */
        const audioCtx = new AudioContext();
        const sourceNode = audioCtx.createMediaElementSource(video);
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

        video.currentTime = 0;
        video.play();
        mediaRecorder.start();

        function recordingLoop() {
            if (video.paused || video.ended) return;
            drawTransformada(video, transform);
            requestAnimationFrame(recordingLoop);
        }
        recordingLoop();

        video.onended = () => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
        };
    });
}

/*  EVENTOS */

/* Cargar vídeo */
inputVideo.addEventListener("change", () => {
    const file = inputVideo.files[0];
    if (!file) return;

    videoOriginal.src = URL.createObjectURL(file);
    previewGrid.style.display = "none";
    processBtn.disabled = true;
    downloadBtn.style.display = "none";
    videoTransformado.style.display = "none";

    videoOriginal.onloadedmetadata = () => {
        previewGrid.style.display = "flex";
        processBtn.disabled = false;
    };
});

/* Procesar */
processBtn.addEventListener("click", async () => {
    if (!videoOriginal.src) return;

    const selectedTransform = transformSelect.value;

    processBtn.disabled = true;
    processBtn.textContent = "⚙️ Procesando transformación…";
    downloadBtn.style.display = "none";
    videoTransformado.style.display = "none";

    try {
        transformedBlob = await processAndRecord(videoOriginal, selectedTransform);

        const url = URL.createObjectURL(transformedBlob);
        videoTransformado.src = url;
        videoTransformado.style.display = "block";

        downloadBtn.style.display = "inline-block";
        processBtn.textContent = "✅ Proceso terminado";

    } catch (e) {
        console.error("Error en la transformación:", e);
        alert("Error al procesar el vídeo.");
        processBtn.textContent = "❌ Error. Reintentar";
    } finally {
        processBtn.disabled = false;
    }
});

/* Descargar */
downloadBtn.addEventListener("click", () => {
    if (!transformedBlob) return;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(transformedBlob);
    a.download = `clipsmithery_transformado_${transformSelect.value}.webm`;
    a.click();
});
