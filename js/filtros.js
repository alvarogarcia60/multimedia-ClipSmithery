console.log("Módulo: FILTROS CINEMATOGRÁFICOS cargado.");

/* =====================================================
   ELEMENTOS Y ESTADO
===================================================== */
const inputVideo = document.getElementById("inputVideo");
const videoOriginal = document.getElementById("videoOriginal");
const videoCanvas = document.getElementById("videoCanvas");
const filterSelect = document.getElementById("filterSelect");

// NUEVOS BOTONES SEPARADOS
const previewBtn = document.getElementById("previewBtn"); 
const startRecordingBtn = document.getElementById("startRecordingBtn"); 

const previewGrid = document.getElementById("previewGrid");
const resultSection = document.getElementById("resultSection");
const videoFiltered = document.getElementById("videoFiltered");
const downloadBtn = document.getElementById("downloadBtn");
const ctx = videoCanvas.getContext("2d");

let animationFrameId = null; 
let mediaRecorder = null;
let chunks = [];

/* =====================================================
   LÓGICA DE FILTROS (Manipulación de Píxeles)
===================================================== */

/**
 * Función auxiliar para limitar un valor entre 0 y 255.
 */
function clamp(value) {
    return Math.min(255, Math.max(0, value));
}

/**
 * Aplica el filtro seleccionado directamente a los datos de píxeles (ImageData).
 */
function applyFilter(imageData, filter) {
    const data = imageData.data;
    const width = videoCanvas.width;
    const height = videoCanvas.height;
    
    // Calcular el centro y el radio para el filtro Vignette
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // --- 1. FILTROS BÁSICOS Y DE CONTRASTE ---
        if (filter === 'grayscale') {
            const avg = (r + g + b) / 3;
            r = g = b = avg;
        } else if (filter === 'sepia') {
            const newR = (r * 0.393) + (g * 0.769) + (b * 0.189);
            const newG = (r * 0.349) + (g * 0.686) + (b * 0.168);
            const newB = (r * 0.272) + (g * 0.534) + (b * 0.131);
            r = newR;
            g = newG;
            b = newB;
        } else if (filter === 'invert') {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
        } else if (filter === 'contrast_boost') {
            const contrastFactor = 1.2;
            const bias = -30;
            r = clamp((r * contrastFactor) + bias);
            g = clamp((g * contrastFactor) + bias);
            b = clamp((b * contrastFactor) + bias);
        } else if (filter === 'night_blue') {
            r = clamp(r * 0.5); 
            g = clamp(g * 0.7); 
            b = clamp(b * 1.3); 
        } 
        
        // --- 2. FILTROS AVANZADOS (Añadidos) ---
        
        if (filter === 'warm_vintage') {
            // Tono Cálido (Hollywood)
            r = clamp(r + 30);
            g = clamp(g + 15);
            b = clamp(b - 20);
        } else if (filter === 'cool_mood') {
            // Tono Frío (Thriller)
            r = clamp(r - 25);
            g = clamp(g - 10);
            b = clamp(b + 35);
        } else if (filter === 'hdr_sim') {
            // SIMULACIÓN HDR (Aumentar contraste/detalle local)
            const boost = 1.1;
            const sat = 1.15;
            const lum = (r + g + b) / 3;
            
            r = clamp(r * boost * sat + (lum * (1 - sat)) * 0.5);
            g = clamp(g * boost * sat + (lum * (1 - sat)) * 0.5);
            b = clamp(b * boost * sat + (lum * (1 - sat)) * 0.5);

        } else if (filter === 'lomo_effect') {
             // EFECTO LOMO (Alta saturación y contraste)
             const satFactor = 1.3;
             r = clamp(r * satFactor);
             g = clamp(g * satFactor);
             b = clamp(b * satFactor);

        } else if (filter === 'vignette_dark') {
            // VIÑETA OSCURA (Oscurecer los bordes)
            const dist = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            const darknessFactor = 1.0 - (dist / maxDistance) * 0.6; // 0.6 es la intensidad
            
            r = clamp(r * darknessFactor);
            g = clamp(g * darknessFactor);
            b = clamp(b * darknessFactor);
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
}

/**
 * Loop principal de dibujo para PREVISUALIZACIÓN (muestra el filtro en vivo).
 */
function drawLoop() {
    if (videoOriginal.paused || videoOriginal.ended) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }
    
    ctx.drawImage(videoOriginal, 0, 0, videoCanvas.width, videoCanvas.height);
    const imageData = ctx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
    
    const selectedFilter = filterSelect.value;
    applyFilter(imageData, selectedFilter);

    ctx.putImageData(imageData, 0, 0);

    animationFrameId = requestAnimationFrame(drawLoop);
}


// =====================================================
// PROCESO DE GRABACIÓN Y DESCARGA (Segundo Botón)
// =====================================================

function processAndRecord(canvas, videoElement, filterName) {
    return new Promise((resolve, reject) => {
        chunks = [];
        
        // 1. Configurar stream y MediaRecorder
        const stream = canvas.captureStream(30); // 30 FPS para calidad de salida
        
        // Obtener el audio original y añadirlo al stream
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

        // 2. Iniciar Grabación, Reproducción y Dibujo
        videoElement.currentTime = 0; // Reiniciar video
        videoElement.play();
        mediaRecorder.start();
        
        // Bucle de dibujo para alimentar el MediaRecorder durante la reproducción
        function recordLoop() {
            if (videoElement.paused || videoElement.ended) {
                // Si el video terminó, detener el loop
                cancelAnimationFrame(animationFrameId);
                return;
            }
            
            // Redibujar el frame y aplicar el filtro (misma lógica que drawLoop)
            ctx.drawImage(videoElement, 0, 0, videoCanvas.width, videoCanvas.height);
            const imageData = ctx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
            applyFilter(imageData, filterName);
            ctx.putImageData(imageData, 0, 0);

            animationFrameId = requestAnimationFrame(recordLoop);
        }
        
        recordLoop();


        // 3. Detener la grabación cuando el vídeo original termina
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

// 1. Cargar Video y preparar Canvas
inputVideo.addEventListener("change", () => {
    const file = inputVideo.files[0];
    if (!file) return;

    videoOriginal.src = URL.createObjectURL(file);
    previewBtn.disabled = true;
    startRecordingBtn.disabled = true;
    previewGrid.style.display = "none";
    resultSection.style.display = "none";

    // Esperar a que el video cargue los metadatos para fijar el tamaño del Canvas
    videoOriginal.onloadedmetadata = () => {
        const aspectRatio = videoOriginal.videoWidth / videoOriginal.videoHeight;
        
        // Fijar tamaño del Canvas
        videoCanvas.width = 640;
        videoCanvas.height = 640 / aspectRatio;
        
        previewBtn.disabled = false; // Habilitar previsualización
        startRecordingBtn.disabled = false; // Habilitar grabación
        previewGrid.style.display = "flex";
        
        // Mostrar el primer frame en el canvas (dibujo inicial)
        videoOriginal.currentTime = 0;
        videoOriginal.pause(); 
        drawLoop(); // Dibuja el frame estático con el filtro seleccionado actualmente
    };
});

// 2. Botón 1: Previsualizar Filtro
previewBtn.addEventListener("click", () => {
    if (!videoOriginal.src) return;
    
    // Si el video está corriendo, detener y reiniciar el loop de dibujo
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    videoOriginal.currentTime = 0;
    videoOriginal.play(); // Iniciar la reproducción
    
    // El drawLoop se encargará de dibujar y detenerse solo al final
    drawLoop();
});

// 3. Botón 2: Iniciar Procesamiento y Descarga
startRecordingBtn.addEventListener("click", async () => {
    if (!videoOriginal.src) return;

    startRecordingBtn.disabled = true;
    startRecordingBtn.textContent = "⚙️ Procesando...";
    downloadBtn.style.display = 'none';
    resultSection.style.display = 'none';

    // Detener cualquier previsualización que esté ocurriendo
    cancelAnimationFrame(animationFrameId);
    videoOriginal.pause();

    try {
        const selectedFilter = filterSelect.value;
        const filteredBlob = await processAndRecord(videoCanvas, videoOriginal, selectedFilter);
        
        // Mostrar el vídeo filtrado en el resultado
        videoFiltered.src = URL.createObjectURL(filteredBlob);
        resultSection.style.display = 'block';

        startRecordingBtn.textContent = "✅ Proceso Terminado";
        
        // Configurar la descarga
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = videoFiltered.src;
            a.download = `clipsmithery_filtro_${selectedFilter}.webm`;
            a.click();
        };

    } catch(e) {
        console.error("Error durante el procesamiento/grabación:", e);
        alert("Ocurrió un error al procesar el vídeo. Asegúrate de que el formato sea compatible (ej. MP4 o WebM).");
        startRecordingBtn.textContent = "❌ Error. Reintentar.";
    } finally {
        startRecordingBtn.disabled = false;
        // Restaurar el texto del botón al estado inicial o de listo
        if (startRecordingBtn.textContent.includes('Terminado')) {
             startRecordingBtn.textContent = "✅ Listo";
        } else if (startRecordingBtn.textContent.includes('Error')) {
             // Mantener el mensaje de error hasta que el usuario reintente
             startRecordingBtn.textContent = "❌ Error. Reintentar.";
        } else {
             startRecordingBtn.textContent = "▶️ Procesar y Grabar Vídeo Filtrado";
        }
    }
});