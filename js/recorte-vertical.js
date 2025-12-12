console.log("Módulo: RECORTE VERTICAL cargado.");

/* =====================================================
   ELEMENTOS Y ESTADO
===================================================== */
const inputVideo = document.getElementById("inputVideo");
const videoOriginal = document.getElementById("videoOriginal");
const videoCanvas = document.getElementById("videoCanvas");
const processBtn = document.getElementById("processBtn");
const previewGrid = document.getElementById("previewGrid");
const videoRecortado = document.getElementById("videoRecortado");
const downloadBtn = document.getElementById("downloadBtn");
const ctx = videoCanvas.getContext("2d");

let mediaRecorder = null;
let chunks = [];

// =====================================================
// LÓGICA DE RECORTES
// =====================================================

/**
 * Función que realiza el dibujo y recorte centrado en el Canvas.
 * @param {HTMLVideoElement} videoElement - El video de origen.
 * @param {CanvasRenderingContext2D} ctx - El contexto del canvas.
 */
function drawRecortado(videoElement, ctx) {
    const vw = videoElement.videoWidth;
    const vh = videoElement.videoHeight;
    const cw = ctx.canvas.width; // 900
    const ch = ctx.canvas.height; // 1600

    // 1. Calcular el área de visualización (la caja vertical)
    // El formato vertical es 9/16. Queremos que la altura (vh) sea el límite.
    
    // Ancho que necesitamos capturar del vídeo original para un 9:16
    // Ancho_a_capturar = Altura_Original * (9 / 16)
    const targetWidth = vh * (9 / 16); 
    
    // 2. Calcular el punto de inicio X (sx) para centrar el recorte
    // El punto de inicio es (Ancho_Original - Ancho_a_Capturar) / 2
    const sx = (vw - targetWidth) / 2; 

    // 3. Dibujar la porción central del vídeo original en el canvas de salida
    // drawImage(imagen, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
        videoElement, 
        sx, 0, targetWidth, vh, // Origen: Capturar la tira central de 9:16
        0, 0, cw, ch           // Destino: Estirar al Canvas completo (que es 9:16)
    );
}

/**
 * Procesa el vídeo original y lo graba en formato vertical.
 */
function processAndRecord(videoElement) {
    return new Promise((resolve, reject) => {
        chunks = [];
        
        // 1. Configurar stream (captura la salida del Canvas)
        const stream = videoCanvas.captureStream(30); 
        
        // 2. Obtener el audio original y añadirlo al stream
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

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onerror = reject;

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(blob);
        };

        // 3. Iniciar Grabación y Reproducción
        videoElement.currentTime = 0; 
        videoElement.play();
        mediaRecorder.start();

        // 4. Bucle de dibujo (alimenta el MediaRecorder)
        function recordingLoop() {
            if (videoElement.paused || videoElement.ended) {
                // El onended handler se encargará de detener el MediaRecorder
                return;
            }
            drawRecortado(videoElement, ctx); // Dibuja el frame recortado
            requestAnimationFrame(recordingLoop);
        }
        recordingLoop(); 

        // 5. Detener la grabación cuando el vídeo original termina
        videoElement.onended = () => {
             if (mediaRecorder.state === 'recording') {
                 mediaRecorder.stop();
             }
        };
    });
}


// =====================================================
// EVENTOS PRINCIPALES
// =====================================================

// 1. Cargar Video
inputVideo.addEventListener("change", () => {
    const file = inputVideo.files[0];
    if (!file) return;

    videoOriginal.src = URL.createObjectURL(file);
    processBtn.disabled = true;
    previewGrid.style.display = "none";
    videoRecortado.style.display = "none";
    downloadBtn.style.display = "none";
    
    // Esperar a que el vídeo cargue los metadatos
    videoOriginal.onloadedmetadata = () => {
        // Aseguramos que solo funciona con videos horizontales (aspectRatio > 1)
        const aspectRatio = videoOriginal.videoWidth / videoOriginal.videoHeight;
        if (aspectRatio <= 1.0) {
            alert("⚠️ Este módulo requiere un vídeo horizontal (16:9 o similar).");
            videoOriginal.src = '';
            return;
        }

        // Fijar tamaño del Canvas a 9:16 (ej. 360x640)
        videoCanvas.width = 360; 
        videoCanvas.height = 640; 
        
        processBtn.disabled = false;
        previewGrid.style.display = "flex";
        
        // Mostrar el primer frame recortado en el Canvas (Previsualización estática)
        videoOriginal.currentTime = 0;
        videoOriginal.pause(); 
        drawRecortado(videoOriginal, ctx);
    };
});

// 2. Botón de Procesamiento y Descarga
processBtn.addEventListener("click", async () => {
    if (!videoOriginal.src) return;

    processBtn.disabled = true;
    processBtn.textContent = "⚙️ Procesando Recorte...";
    videoRecortado.style.display = "none";
    downloadBtn.style.display = "none";

    try {
        const recortadoBlob = await processAndRecord(videoOriginal);

        videoRecortado.src = URL.createObjectURL(recortadoBlob);
        videoRecortado.style.display = 'block';
        
        processBtn.textContent = "✅ Proceso Terminado";
        downloadBtn.style.display = 'block';
        
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = videoRecortado.src;
            a.download = `clipsmithery_reels_9x16.webm`;
            a.click();
        };

    } catch(e) {
        console.error("Error durante el procesamiento/grabación:", e);
        alert("Ocurrió un error al procesar el vídeo. Asegúrate de que el formato sea compatible.");
        processBtn.textContent = "❌ Error. Reintentar.";
    } finally {
        processBtn.disabled = false;
        // Restaurar el texto del botón al estado inicial o de listo
        if (!processBtn.textContent.includes('Terminado') && !processBtn.textContent.includes('Error')) {
             processBtn.textContent = "▶️ Procesar Recorte Vertical";
        }
    }
});