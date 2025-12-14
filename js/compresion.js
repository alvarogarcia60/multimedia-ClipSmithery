console.log("Módulo: COMPRESIÓN cargado correctamente");

/*  ELEMENTOS */
const inputVideo = document.getElementById("inputVideo");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");

const videoOriginal = document.getElementById("videoOriginal");
const videoCompressed = document.getElementById("videoCompressed");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

// Elementos del nuevo diseño (Añadidos para referencia)
const fileLabel = document.getElementById('fileLabel');
const fileNameDisplay = document.getElementById('fileNameDisplay'); 
const progressSection = document.getElementById('progressSection');
const videoComparison = document.getElementById('videoComparison');
const analysisSection = document.getElementById('analysis-section');


let loadedFile = null;
let compressedBlob = null;


/*  Cargar vídeo original (Ajustado para el nuevo diseño) */
inputVideo.addEventListener("change", () => {
    const fileSelected = inputVideo.files.length > 0;
    loadedFile = inputVideo.files[0];
    
    // 1. Actualización de la interfaz
    if (fileSelected) {
        const fileName = loadedFile.name;

        videoOriginal.src = URL.createObjectURL(loadedFile);
        
        fileNameDisplay.textContent = fileName;
        fileLabel.textContent = 'Cambiar archivo';
        processBtn.disabled = false;

        // Resetear visualización
        progressText.textContent = "Listo para procesar";
        progressFill.style.width = "0%";
        
        progressSection.style.display = "none";
        videoComparison.style.display = "none";
        analysisSection.style.display = "none";
        downloadBtn.style.display = "none";
        downloadBtn.disabled = true;

    } else {
        // En caso de que se cancele la selección
        fileNameDisplay.textContent = 'Ningún archivo seleccionado.';
        fileLabel.textContent = 'Elegir archivo';
        processBtn.disabled = true;
        loadedFile = null;
    }
});


/*  COMPRESIÓN PRO: Audio + Vídeo */
async function compressVideo(file) {
    return new Promise(async (resolve, reject) => {

        const tempVideo = document.createElement("video");
        tempVideo.src = URL.createObjectURL(file);
        tempVideo.crossOrigin = "anonymous";

        tempVideo.muted = false;
        tempVideo.volume = 1.0;

        // Silenciar el output para que no suene
        const silenceCtx = new AudioContext();
        const silenceSource = silenceCtx.createMediaElementSource(tempVideo);
        const silenceGain = silenceCtx.createGain();
        silenceGain.gain.value = 0.0;
        silenceSource.connect(silenceGain);
        silenceGain.connect(silenceCtx.destination);

        // Esperar a que el vídeo cargue metadata antes de reproducir
        await new Promise(resolve => tempVideo.onloadedmetadata = resolve);

        await tempVideo.play();
        tempVideo.pause();

        // Audio original
        const originalStream = tempVideo.captureStream();
        const originalAudioTrack = originalStream.getAudioTracks()[0];

        // Canvas → vídeo comprimido
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Compresión al 70%
        const targetWidth = tempVideo.videoWidth * 0.7;
        const targetHeight = tempVideo.videoHeight * 0.7;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const compressedVideoStream = canvas.captureStream(30);
        const compressedVideoTrack = compressedVideoStream.getVideoTracks()[0];

        // Combinar audio + vídeo
        const finalStream = new MediaStream();
        if (compressedVideoTrack) finalStream.addTrack(compressedVideoTrack);
        if (originalAudioTrack) finalStream.addTrack(originalAudioTrack);

        // Recorder
        let chunks = [];
        const recorder = new MediaRecorder(finalStream, {
            mimeType: "video/webm;codecs=vp9,opus",
            videoBitsPerSecond: 900000,
            audioBitsPerSecond: 128000
        });

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onerror = err => reject(err);
        recorder.onstop = () =>
            resolve(new Blob(chunks, { type: "video/webm" }));

        recorder.start();

        // Dibujado de vídeo (bucle de grabación)
        function draw() {
            ctx.drawImage(tempVideo, 0, 0, targetWidth, targetHeight);

            if (tempVideo.ended) {
                recorder.stop();
                return;
            }
            requestAnimationFrame(draw);
        }

        // Iniciar reproducción y dibujo
        tempVideo.currentTime = 0;
        tempVideo.play();
        draw();
    });
}


/*  Procesar vídeo */
processBtn.addEventListener("click", async () => {
    if (!loadedFile) {
        alert("Sube un vídeo primero");
        return;
    }

    // 1. Mostrar secciones de progreso y análisis
    progressSection.style.display = "block";
    videoComparison.style.display = "flex";
    
    processBtn.disabled = true;
    processBtn.textContent = "Procesando...";

    progressText.textContent = "Comprimiendo vídeo...";
    progressFill.style.width = "40%";

    try {
        compressedBlob = await compressVideo(loadedFile);
        videoCompressed.src = URL.createObjectURL(compressedBlob);
        videoCompressed.onloadedmetadata = () => {
            // Actualización final de la interfaz tras la compresión
            progressFill.style.width = "100%";
            progressText.textContent = "Completado ✔";
            processBtn.textContent = "Proceso Finalizado";
            processBtn.disabled = false; // Re-habilitar si se quiere procesar otro
            
            downloadBtn.style.display = "block";
            downloadBtn.disabled = false;
            
            // Mostrar y rellenar el Panel de Análisis
            analysisSection.style.display = "block";
            fillAnalysisPanel();
        };

    } catch(error) {
        console.error("Error de compresión:", error);
        progressText.textContent = "Error en el proceso ❌";
        processBtn.textContent = "Reintentar";
        processBtn.disabled = false;
        alert("Fallo la compresión. Intenta con otro formato.");
    }
});


/*  Rellenar Panel de Análisis */
function fillAnalysisPanel() {
    // Asegurarse de que los videos tienen metadata cargada antes de leer dimensiones
    if (!loadedFile || !compressedBlob || !videoOriginal.videoWidth) return;

    document.getElementById("sizeOriginal").textContent =
        (loadedFile.size / 1024 / 1024).toFixed(2) + " MB";

    document.getElementById("sizeCompressed").textContent =
        (compressedBlob.size / 1024 / 1024).toFixed(2) + " MB";

    document.getElementById("resOriginal").textContent =
        `${videoOriginal.videoWidth} x ${videoOriginal.videoHeight}`;
    
    // Nota: videoCompressed.videoWidth solo funcionará si la metadata se ha cargado.
    document.getElementById("resCompressed").textContent =
        `${videoCompressed.videoWidth} x ${videoCompressed.videoHeight}`;

    document.getElementById("durationVideo").textContent =
        videoOriginal.duration.toFixed(2) + " s";

    const reduction =
        100 - (compressedBlob.size / loadedFile.size) * 100;

    document.getElementById("reductionPercent").textContent =
        reduction.toFixed(1) + "%";
}


/*  Descargar vídeo */
downloadBtn.addEventListener("click", () => {
    if (!compressedBlob) return;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(compressedBlob);
    a.download = "video_comprimido_ClipSmithery.webm";
    a.click();
});