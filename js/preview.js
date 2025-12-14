const inputPreview = document.getElementById("inputPreview");
const generatePreviewBtn = document.getElementById("generatePreviewBtn");
const previewProgressSection = document.getElementById("previewProgressSection");
const previewProgressText = document.getElementById("previewProgressText");
const previewProgressFill = document.getElementById("previewProgressFill");
const previewResult = document.getElementById("previewResult");
const previewVideo = document.getElementById("previewVideo");
const downloadPreviewBtn = document.getElementById("downloadPreviewBtn");

// Elementos de la interfaz de carga (Sincronización con HTML)
const fileLabel = document.getElementById('fileLabel');
const fileNameDisplay = document.getElementById('fileNameDisplay'); 

let loadedFile = null;
let previewBlob = null;


/*  LÓGICA DE INTERFAZ DE CARGA */
inputPreview.addEventListener("change", () => {
    const fileSelected = inputPreview.files.length > 0;
    loadedFile = fileSelected ? inputPreview.files[0] : null;

    // Sincronización de la interfaz
    generatePreviewBtn.disabled = !fileSelected;
    // La lógica de actualizar fileLabel y fileNameDisplay se maneja en el script interno del HTML
    
    // Resetear resultados
    previewResult.style.display = "none";
    previewProgressSection.style.display = "none";
    previewProgressFill.style.width = "0%";
    generatePreviewBtn.textContent = "Generar vista previa";
    downloadPreviewBtn.disabled = true;
});


/*  LÓGICA DE ANÁLISIS Y GENERACIÓN*/

// Detectar diferencia entre frames (movimiento)
function frameDifference(video, scale = 0.25) {
    const w = video.videoWidth * scale;
    const h = video.videoHeight * scale;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext("2d");

    // Dibuja el frame actual (frame N)
    ctx.drawImage(video, 0, 0, w, h);
    const before = ctx.getImageData(0, 0, w, h).data;

    return new Promise(resolve => {
        // Salta hacia adelante 0.35 segundos
        video.currentTime += 0.35; 
        
        video.onseeked = () => {
            // Dibuja el siguiente frame (frame N+1)
            ctx.drawImage(video, 0, 0, w, h);
            const after = ctx.getImageData(0, 0, w, h).data;

            // Calcula la diferencia absoluta de color (solo canal rojo es suficiente para movimiento)
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

    // Solo busca en los primeros 20 segundos o hasta 3 segundos antes del final
    const limit = Math.min(video.duration - 3, 20); 

    // Se busca cada 0.75 segundos
    for (let t = 1; t < limit; t += 0.75) {
        
        // Actualizar progreso de la interfaz
        const percentage = 30 + (t / limit) * 20; // 30% a 50% del progreso
        previewProgressFill.style.width = `${percentage}%`;
        previewProgressText.textContent = `Buscando punto de acción... (${t.toFixed(1)}s)`;

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
    if (duration < 10) return Math.max(3, duration * 0.30); // Min 3s, 30% del vídeo
    if (duration < 60) return 4;               
    return 6;                                  
}


// Generar clip cinematográfico
async function generatePreview(file) {
    return new Promise(async (resolve, reject) => { // Añadido reject

        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.crossOrigin = "anonymous";
        video.muted = true;
        
        // Esperar a que el vídeo esté cargado y listo para play/seek
        await new Promise(r => video.onloadedmetadata = r);
        await video.play();
        video.pause();

        // 1. Encontrar duración y punto de inicio
        const previewLen = smartDuration(video.duration);
        previewProgressText.textContent = `Duración seleccionada: ${previewLen.toFixed(1)}s`;
        const start = await findBestStart(video); // Esto mueve el progreso de 30% a 50%

        previewProgressText.textContent = `Grabando clip... (Inicio: ${start.toFixed(1)}s)`;
        previewProgressFill.style.width = "50%";


        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 2. Configurar MediaRecorder
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
            mimeType: "video/webm"
        });

        let chunks = [];

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onerror = reject; // Manejo de errores
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));

        recorder.start();

        // 3. Iniciar reproducción y loop de dibujo
        video.currentTime = start;
        await video.play();

        let frames = 0;
        const maxFrames = Math.floor(30 * previewLen); // 30 FPS × duración elegida

        function draw() {
            if (frames >= maxFrames) {
                recorder.stop();
                video.pause(); // Asegurar que el video se detenga
                return;
            }

            // Efecto de Zoom Cinematográfico (12% de aumento total)
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
            // Actualizar progreso de grabación (50% a 90%)
            const percentage = 50 + (frames / maxFrames) * 40;
            previewProgressFill.style.width = `${percentage}%`;

            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw); // Iniciar el loop
    });
}


// Evento principal para generar la vista previa
generatePreviewBtn.addEventListener("click", async () => {

    if (!loadedFile) {
        alert("Selecciona un vídeo primero");
        return;
    }

    // 1. Configurar estado de la interfaz
    generatePreviewBtn.disabled = true;
    generatePreviewBtn.textContent = "Analizando...";
    downloadPreviewBtn.disabled = true;
    
    previewProgressSection.style.display = "block";
    previewProgressText.textContent = "Iniciando análisis...";
    previewProgressFill.style.width = "10%";
    previewResult.style.display = "none";


    try {
        // 2. Generar el clip
        previewBlob = await generatePreview(loadedFile);
        
        // 3. Finalización y éxito
        previewVideo.src = URL.createObjectURL(previewBlob);

        previewProgressFill.style.width = "100%";
        previewProgressText.textContent = "Completado ✔";

        previewResult.style.display = "block";
        downloadPreviewBtn.disabled = false;
        generatePreviewBtn.textContent = "Generar de nuevo";

    } catch(e) {
        // 4. Manejo de Errores
        console.error("Error durante la generación de la vista previa:", e);
        previewProgressText.textContent = "❌ Error en la generación. Intenta con otro vídeo.";
        
    } finally {
        generatePreviewBtn.disabled = false;
    }
});

// Evento de descarga
downloadPreviewBtn.addEventListener("click", () => {
    if (!previewBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(previewBlob);
    a.download = "clipsmithery_preview.webm"; // Nombre de archivo profesional
    a.click();
});