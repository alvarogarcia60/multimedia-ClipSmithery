console.log("Módulo: ROTACIÓN Y ESPEJO cargado.");

/* =====================================================
   ELEMENTOS Y ESTADO
===================================================== */
const inputVideo = document.getElementById("inputVideo");
const videoOriginal = document.getElementById("videoOriginal");
const videoCanvas = document.getElementById("videoCanvas");
const transformSelect = document.getElementById("transformSelect");
const processBtn = document.getElementById("processBtn");
const previewGrid = document.getElementById("previewGrid");
const videoTransformado = document.getElementById("videoTransformado");
const downloadBtn = document.getElementById("downloadBtn");
const ctx = videoCanvas.getContext("2d");

let mediaRecorder = null;
let chunks = [];
let animationFrameId = null;

// =====================================================
// LÓGICA DE TRANSFORMACIÓN (Canvas Matrix)
// =====================================================

/**
 * Función que dibuja el frame con la transformación (rotación/espejo) aplicada.
 */
function drawTransformada(videoElement, ctx, transform) {
    const vw = videoElement.videoWidth;
    const vh = videoElement.videoHeight;
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    
    // Siempre resetear la matriz antes de dibujar
    ctx.setTransform(1, 0, 0, 1, 0, 0); 

    // Limpiar el canvas
    ctx.clearRect(0, 0, cw, ch);
    
    // Aplicar la transformación geométrica
    if (transform === 'rotate90') {
        ctx.translate(cw, 0); // Mover el origen al punto de rotación
        ctx.rotate(Math.PI / 2); // Rotar 90 grados
        ctx.drawImage(videoElement, 0, 0, ch, cw); // Invertir el destino de la imagen
    } else if (transform === 'rotate180') {
        ctx.translate(cw, ch);
        ctx.rotate(Math.PI);
        ctx.drawImage(videoElement, 0, 0, cw, ch);
    } else if (transform === 'rotate270') {
        ctx.translate(0, ch);
        ctx.rotate(Math.PI * 1.5);
        ctx.drawImage(videoElement, 0, 0, ch, cw);
    } else if (transform === 'flipH') {
        ctx.translate(cw, 0); // Mover el origen al borde derecho
        ctx.scale(-1, 1); // Reflejar horizontalmente
        ctx.drawImage(videoElement, 0, 0, cw, ch);
    } else if (transform === 'flipV') {
        ctx.translate(0, ch); // Mover el origen al borde inferior
        ctx.scale(1, -1); // Reflejar verticalmente
        ctx.drawImage(videoElement, 0, 0, cw, ch);
    } else {
        // Ninguna transformación (none)
        ctx.drawImage(videoElement, 0, 0, cw, ch);
    }
}

/**
 * Loop principal de dibujo para previsualización estática.
 */
function drawLoop() {
    if (videoOriginal.paused || videoOriginal.ended) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }
    const selectedTransform = transformSelect.value;
    drawTransformada(videoOriginal, ctx, selectedTransform);
    animationFrameId = requestAnimationFrame(drawLoop);
}


// =====================================================
// PROCESO DE GRABACIÓN
// =====================================================

function processAndRecord(videoElement, transform) {
    return new Promise((resolve, reject) => {
        chunks = [];
        
        // El canvas de salida debe ser configurado para reflejar la rotación
        const isRotated = transform.startsWith('rotate') && transform !== 'rotate180';
        
        // 1. Configurar stream
        const stream = videoCanvas.captureStream(30); 
        
        // 2. Obtener el audio original y añadirlo
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
                return;
            }
            drawTransformada(videoElement, ctx, transform); 
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

// Ajustar el tamaño del Canvas y reiniciar la previsualización
function setCanvasSize(videoElement, transform) {
    const isRotated = transform.startsWith('rotate') && transform !== 'rotate180';
    
    // Si hay rotación de 90/270, se invierte la relación ancho/alto del canvas.
    if (isRotated) {
        videoCanvas.width = videoElement.videoHeight;
        videoCanvas.height = videoElement.videoWidth;
    } else {
        videoCanvas.width = videoElement.videoWidth;
        videoCanvas.height = videoElement.videoHeight;
    }
    
    // Asegurarse de que el elemento de vídeo de resultado se limpie
    videoTransformado.style.display = "none";
    downloadBtn.style.display = "none";
}

// 1. Cargar Video
inputVideo.addEventListener("change", () => {
    const file = inputVideo.files[0];
    if (!file) return;

    videoOriginal.src = URL.createObjectURL(file);
    processBtn.disabled = true;
    previewGrid.style.display = "none";
    
    videoOriginal.onloadedmetadata = () => {
        // Inicializar el tamaño del canvas (se usará el tamaño original del video)
        setCanvasSize(videoOriginal, transformSelect.value);

        processBtn.disabled = false;
        previewGrid.style.display = "flex";
        
        // Previsualización estática del primer frame
        videoOriginal.currentTime = 0;
        videoOriginal.pause(); 
        
        // El drawTransformada se ejecuta una vez para mostrar el frame estático
        drawTransformada(videoOriginal, ctx, transformSelect.value);
    };
});

// 2. Cambio en la selección de transformación
transformSelect.addEventListener("change", () => {
    if (!videoOriginal.src) return;
    
    // 1. Ajustar tamaño si es necesario (para rotaciones)
    setCanvasSize(videoOriginal, transformSelect.value);
    
    // 2. Redibujar el frame estático con la nueva transformación
    videoOriginal.pause(); 
    videoOriginal.currentTime = 0.01; // Forzar redibujo en el frame 1
    
    // Usamos onseeked para asegurar que el frame se actualice antes de dibujar
    videoOriginal.onseeked = () => {
        drawTransformada(videoOriginal, ctx, transformSelect.value);
        videoOriginal.onseeked = null; // Limpiar el handler
    };
    
});

// 3. Botón de Procesamiento y Descarga
processBtn.addEventListener("click", async () => {
    if (!videoOriginal.src) return;

    processBtn.disabled = true;
    processBtn.textContent = "⚙️ Procesando Transformación...";
    videoTransformado.style.display = "none";
    downloadBtn.style.display = "none";

    // Detener cualquier previsualización que esté ocurriendo
    cancelAnimationFrame(animationFrameId);
    videoOriginal.pause();

    try {
        const selectedTransform = transformSelect.value;
        
        // AJUSTE CRÍTICO: Reconfigurar el Canvas ANTES de grabar por si la rotación cambió
        setCanvasSize(videoOriginal, selectedTransform);
        
        const transformadoBlob = await processAndRecord(videoOriginal, selectedTransform);

        videoTransformado.src = URL.createObjectURL(transformadoBlob);
        videoTransformado.style.display = 'block';
        
        processBtn.textContent = "✅ Proceso Terminado";
        downloadBtn.style.display = 'block';
        
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = videoTransformado.src;
            a.download = `clipsmithery_transformado_${selectedTransform}.webm`;
            a.click();
        };

    } catch(e) {
        console.error("Error durante el procesamiento/grabación:", e);
        alert("Ocurrió un error al procesar el vídeo. Asegúrate de que el formato sea compatible.");
        processBtn.textContent = "❌ Error. Reintentar.";
    } finally {
        processBtn.disabled = false;
        if (!processBtn.textContent.includes('Terminado') && !processBtn.textContent.includes('Error')) {
             processBtn.textContent = "▶️ Procesar y Grabar Transformación";
        }
    }
});