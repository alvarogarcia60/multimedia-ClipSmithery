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
const videoComparison = document.getElementById("videoComparison"); // Añadido para mostrar la sección de comparación

// Elementos de la interfaz de carga (para sincronización)
const fileLabel = document.getElementById('fileLabel');
const fileNameDisplay = document.getElementById('fileNameDisplay');


let resFile = null;
let resBlob = null;


/*  Cargar vídeo original */
inputResolution.addEventListener("change", () => {
    const fileSelected = inputResolution.files.length > 0;
    resFile = fileSelected ? inputResolution.files[0] : null;

    if (resFile) {
        const fileName = resFile.name;
        
        // Mostrar original
        resOriginalVideo.src = URL.createObjectURL(resFile);
        
        // Actualizar interfaz
        fileNameDisplay.textContent = fileName;
        fileLabel.textContent = 'Cambiar archivo';
        changeResBtn.disabled = false;
        
        // Resetear estado
        resProgressSection.style.display = "none";
        videoComparison.style.display = "none";
        downloadResBtn.style.display = "none";
        downloadResBtn.disabled = true;
        changeResBtn.textContent = "Cambiar resolución";

    } else {
        // En caso de cancelación
        fileNameDisplay.textContent = 'Ningún archivo seleccionado.';
        fileLabel.textContent = 'Elegir archivo';
        changeResBtn.disabled = true;
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

        // Evitar división por cero o errores de NaN si el originalH es cero 
        if (isNaN(targetW) || targetW <= 0) {
            targetW = originalW;
            targetH = originalH;
        }

        // Crear canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");

        // STREAM DE VIDEO NUEVO
        const outVideoStream = canvas.captureStream(30);

        //  AUDIO FIABLE MEDIANTE AUDIOCONTEXT 
        const audioCtx = new AudioContext();
        const sourceNode = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();

        sourceNode.connect(dest); 


        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) outVideoStream.addTrack(audioTrack);

        // GRABACIÓN DEL NUEVO STREAM 
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
        
        // Función para actualizar el progreso (simulado o mejorado)
        const updateProgress = () => {
             const currentTime = video.currentTime;
             const duration = video.duration;
             if (duration && duration > 0) {
                 const percentage = Math.min(95, (currentTime / duration) * 100);
                 resProgressFill.style.width = `${percentage}%`;
                 resProgressText.textContent = `Procesando: ${percentage.toFixed(0)}%`;
             }
        };


        function drawFrame() {
            ctx.drawImage(video, 0, 0, targetW, targetH);
            updateProgress(); // Actualizar progreso en cada frame

            if (video.currentTime >= video.duration) {
                recorder.stop();
                return;
            }
            requestAnimationFrame(drawFrame);
        }

        video.currentTime = 0; // Asegurar el inicio
        video.play();
        drawFrame();
    });
}


// BOTÓN CAMBIAR RESOLUCIÓN
changeResBtn.addEventListener("click", async () => {

    if (!resFile) {
        alert("Sube un vídeo primero");
        return;
    }
    
    // 1. Configuración de la interfaz
    videoComparison.style.display = "flex"; // Mostrar la comparativa
    resProgressSection.style.display = "block";
    
    changeResBtn.disabled = true;
    changeResBtn.textContent = "Procesando...";
    downloadResBtn.style.display = "none";

    const newRes = resolutionSelect.value;
    resProgressFill.style.width = "10%";
    resProgressText.textContent = "Iniciando reescalado...";

    try {
        // 2. Ejecutar la función
        resBlob = await resizeVideo(resFile, newRes);

        // 3. Finalización y éxito
        resChangedVideo.src = URL.createObjectURL(resBlob);

        resProgressFill.style.width = "100%";
        resProgressText.textContent = "Completado ✓";
        changeResBtn.textContent = "Reescalado listo";
        
        downloadResBtn.style.display = "block";
        downloadResBtn.disabled = false;

    } catch (error) {
        // 4. Manejo de Errores
        console.error("Error durante el reescalado:", error);
        resProgressText.textContent = "Error ❌: No se pudo reescalar. Intenta otro formato.";
        resProgressFill.style.width = "100%";
        resProgressFill.style.backgroundColor = "red"; // Indicador visual de error
        
        changeResBtn.textContent = "Reintentar";
        
    } finally {
        changeResBtn.disabled = false;
        // Limpiar el color de error después de un reintento fallido si es necesario
        if (resProgressFill.style.backgroundColor === "red") {
            setTimeout(() => {
                resProgressFill.style.backgroundColor = ""; // Volver al color base (CSS)
            }, 3000);
        }
    }
});


// DESCARGAR
downloadResBtn.addEventListener("click", () => {
    if (!resBlob) return;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(resBlob);
    a.download = `video_reescalado_${resolutionSelect.value}.webm`;
    a.click();
});