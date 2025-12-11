// --- Elementos del DOM ---
const inputVideo      = document.getElementById("inputVideo");
const burnInBtn       = document.getElementById("burnInBtn");

const progressSection = document.getElementById("progressSection");
const progressText    = document.getElementById("progressText");
const progressFill    = document.getElementById("progressFill");

const videoOriginal   = document.getElementById("videoOriginal");
const videoBurnedIn   = document.getElementById("videoBurnedIn");

const resultGrid      = document.getElementById("resultGrid");
const downloadBtn     = document.getElementById("downloadBtn");

// --- Variables de Estado ---
let loadedFile  = null; // Almacena el archivo de video cargado por el usuario
let burnedBlob  = null; // Almacena el Blob del video resultante con subtítulos incrustados

// URL de tu servidor Flask (Debe estar corriendo en el puerto 5000)
const SERVER_URL = "http://127.0.0.1:5000"; 

// Cargar vídeo original
inputVideo.addEventListener("change", () => {
    loadedFile = inputVideo.files[0];
    if (loadedFile) {
        // Asigna el archivo cargado al elemento <video> original para previsualización
        videoOriginal.src = URL.createObjectURL(loadedFile);
        
        // Resetear la interfaz al cargar un nuevo archivo
        resultGrid.style.display = "none";
        downloadBtn.style.display = "none";
        progressSection.style.display = "none";
        progressFill.style.width = "0%";
    }
});

/**
 * Función para obtener subtítulos enviando el vídeo al servidor (Flask).
 * Usa el endpoint simulado /api/transcribe-video para obtener la transcripción.
 * @param {File} file El archivo de vídeo a transcribir.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con el array de subtítulos.
 */
async function fetchSubtitlesFromServer(file) {
    const formData = new FormData();
    formData.append("video", file); // Prepara el archivo para ser enviado como formulario

    // Realiza la petición POST al servidor
    const response = await fetch(`${SERVER_URL}/api/transcribe-video`, {
        method: 'POST',
        body: formData,
    });

    // Manejo de errores de conexión o respuesta HTTP
    if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    // Manejo de errores devueltos en el JSON del servidor
    if (jsonResponse.status !== "success") {
        throw new Error(`Fallo en la transcripción: ${jsonResponse.error}`);
    }

    return jsonResponse.subtitles;
}

/**
 * Realiza la incrustación de subtítulos (Burn-in) usando Canvas y MediaRecorder.
 * Este proceso ocurre completamente en el navegador.
 * @param {File} videoFile El archivo de vídeo original.
 * @param {Array<Object>} subtitles El array de subtítulos con tiempo y texto.
 * @returns {Promise<Blob>} Una promesa que resuelve con un Blob del nuevo video.
 */
/**
 * Realiza la incrustación de subtítulos (Burn-in) usando Canvas y MediaRecorder.
 * Este proceso ocurre completamente en el navegador.
 * @param {File} videoFile El archivo de vídeo original.
 * @param {Array<Object>} subtitles El array de subtítulos con tiempo y texto.
 * @returns {Promise<Blob>} Una promesa que resuelve con un Blob del nuevo video.
 */
async function burnInSubtitles(videoFile, subtitles) {
    return new Promise(async (resolve, reject) => {
        const tempVideo = document.createElement("video");
        tempVideo.src = URL.createObjectURL(videoFile); // Crea una URL temporal para el video
        tempVideo.muted = true; 

        // 1. Esperar a que el video esté listo para reproducirse y obtener metadatos
        await new Promise((res, rej) => {
            tempVideo.onloadedmetadata = res;
            tempVideo.onerror = (e) => rej(new Error(`Error de carga de vídeo: ${e.target.error.code}`));
        }).catch(err => {
            URL.revokeObjectURL(tempVideo.src); 
            reject(new Error("Error al cargar metadatos del vídeo. " + err.message));
            return;
        });

        // Verificación de dimensiones
        if (!tempVideo.videoWidth || !tempVideo.videoHeight) {
            URL.revokeObjectURL(tempVideo.src);
            reject(new Error("Dimensiones de vídeo no válidas."));
            return;
        }

        // Ejecutar play y pause para forzar la inicialización del frame
        await tempVideo.play();
        tempVideo.pause(); 
        
        // Pausa breve para estabilizar el frame inicial antes de empezar a dibujar
        await new Promise(r => setTimeout(r, 100)); 

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width  = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;

        // Captura el stream del Canvas (lo que se dibuja) a 15 frames por segundo (fps)
        const stream = canvas.captureStream(15); 
        const chunks = []; 

        // MediaRecorder: ¡USANDO EL CÓDEC POR DEFECTO DEL NAVEGADOR!
        const recorder = new MediaRecorder(stream); 

        recorder.ondataavailable = (e) => chunks.push(e.data); 
        
        recorder.onstop = () => {
            // Liberar la URL temporal del video original para liberar memoria
            URL.revokeObjectURL(tempVideo.src); 
            
            // El formato de salida será el que elija el navegador (típicamente WebM)
            const blob = new Blob(chunks, { type: recorder.mimeType.split(';')[0] });
            resolve(blob);
        };
        
        // Manejo de errores del MediaRecorder (si falla la grabación)
        recorder.onerror = (e) => {
            console.error("Error en MediaRecorder:", e.error);
            URL.revokeObjectURL(tempVideo.src); // Liberar también en caso de error
            reject(new Error("Fallo durante la grabación del vídeo (MediaRecorder)."));
        };

        recorder.start(); // Inicia la grabación

        function drawFrame() {
            // Dibuja el frame actual del video en el Canvas
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);

            const currentTime = tempVideo.currentTime;

            // Busca el subtítulo activo (activo durante 3 segundos)
            const active = subtitles.find(
                (s) => currentTime >= s.time && currentTime < s.time + 3
            );

            if (active) {
                // Configuración y dibujo de la caja negra
                ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
                const boxHeight = 90;
                ctx.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight);

                // Configuración y dibujo del texto
                ctx.fillStyle = "white";
                ctx.font = "38px Poppins";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const x = canvas.width / 2;
                const y = canvas.height - boxHeight / 2;

                ctx.fillText(active.text, x, y);
            }

            // Condición de parada
            if (tempVideo.ended || tempVideo.currentTime >= tempVideo.duration) {
                if (recorder.state !== "inactive") {
                    recorder.stop(); // Detiene la grabación
                }
                return;
            }

            // Avanzar el vídeo y solicitar el siguiente frame para el loop
            tempVideo.currentTime += 1/15; // Avanza el tiempo según la tasa de frames (15 FPS)
            requestAnimationFrame(drawFrame);
        }

        tempVideo.currentTime = 0; // Comienza desde el inicio
        tempVideo.play();
        drawFrame(); // Inicia el loop de dibujo
    });
}

// --- Lógica del Botón Principal ---
burnInBtn.addEventListener("click", async () => {
    if (!loadedFile) {
        alert("Sube un vídeo primero");
        return;
    }

    try {
        progressSection.style.display = "block";
        progressText.textContent = "1/2 Enviando vídeo y esperando transcripción del servidor…";
        progressFill.style.width = "35%";

        // 1) Obtener subtítulos del servidor (Llama a Flask)
        const subtitles = await fetchSubtitlesFromServer(loadedFile);

        progressText.textContent = "2/2 Generando vídeo con subtítulos incrustados (Burn-in)…";
        progressFill.style.width = "70%";

        // 2) Burn-in real sobre el vídeo (Proceso pesado en el navegador)
        burnedBlob = await burnInSubtitles(loadedFile, subtitles);

        // Finalización exitosa
        progressFill.style.width = "100%";
        progressText.textContent = "✔ Completado";

        // Muestra el video resultante y el botón de descarga
        videoBurnedIn.src = URL.createObjectURL(burnedBlob);
        resultGrid.style.display = "grid";
        downloadBtn.style.display = "block";

    } catch (err) {
        console.error(err);
        alert("❌ Ha ocurrido un error al obtener subtítulos o generar el vídeo: " + err.message);
        progressSection.style.display = "none";
    }
});

// --- Lógica de Descarga ---
downloadBtn.addEventListener("click", () => {
    if (!burnedBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(burnedBlob);
    a.download = "video_subtitulos_burnin.webm"; // Nombre del archivo descargado
    a.click();
});