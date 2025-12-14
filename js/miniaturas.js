console.log("Módulo: MINIATURAS cargado.");

/*  ELEMENTOS DE LA INTERFAZ */
const inputThumbs = document.getElementById("inputThumbs");
const thumbCount = document.getElementById("thumbCount");
const generateBtn = document.getElementById("generateThumbsBtn");
const thumbGrid = document.getElementById("thumbGrid");
const thumbResults = document.getElementById("thumbResults");

// Elementos de la interfaz de carga (Sincronización con HTML)
const fileLabel = document.getElementById('fileLabel');
const fileNameDisplay = document.getElementById('fileNameDisplay'); 

let loadedFile = null;

/*  LÓGICA DE INTERFAZ DE CARGA */
inputThumbs.addEventListener("change", () => {
    const fileSelected = inputThumbs.files.length > 0;
    loadedFile = fileSelected ? inputThumbs.files[0] : null;

    // Sincronización de la interfaz
    generateBtn.disabled = !fileSelected;
    fileLabel.textContent = fileSelected ? 'Cambiar archivo' : 'Elegir archivo';
    fileNameDisplay.textContent = fileSelected ? loadedFile.name : 'Ningún archivo seleccionado.';

    // Resetear resultados
    thumbGrid.innerHTML = "";
    thumbResults.style.display = "none";
    generateBtn.textContent = "Generar miniaturas";
});


/*  GENERACIÓN DE MINIATURAS */
generateBtn.addEventListener("click", async () => {
    if (!loadedFile) return alert("Sube un vídeo primero");

    // 1. Configuración de estados
    thumbGrid.innerHTML = "";
    thumbResults.style.display = "block";
    generateBtn.disabled = true;
    generateBtn.textContent = "Generando...";

    const video = document.createElement("video");
    video.src = URL.createObjectURL(loadedFile);
    video.muted = true; // No necesitamos sonido para las miniaturas

    try {
        // Esperar a que el vídeo cargue metadatos (CLAVE para la duración)
        await new Promise(r => video.onloadedmetadata = r);
        
        // El video debe estar en pausa al inicio de la captura
        video.pause();

        const totalThumbs = parseInt(thumbCount.value);
        const duration = video.duration;

        for (let i = 0; i < totalThumbs; i++) {
            // Distribuir los puntos en el tiempo
            const time = (duration / (totalThumbs + 1)) * (i + 1); // +1 para asegurar margen inicial y final

            video.currentTime = time;
            // Esperar a que el frame en la nueva posición esté listo
            await new Promise(res => {
                video.onseeked = res;
                // Si el evento no se dispara, también usamos un timeout de seguridad (ej. 100ms)
                setTimeout(res, 100); 
            });

            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Asegurar que dibuja con el tamaño correcto

            const imgURL = canvas.toDataURL("image/jpeg", 0.9); // Calidad JPEG 90%

            // Formato de la tarjeta de resultado (Sincronización con CSS/HTML)
            const imgCard = document.createElement("div");
            imgCard.className = "thumbnail-item";
            
            // Convertir segundos a formato MM:SS
            const timeFormatted = `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`;

            imgCard.innerHTML = `
                <img src="${imgURL}" alt="Miniatura ${i + 1}" class="thumb-img">
                <p style="color: white; font-size: 0.8rem; padding: 5px; position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.6); border-radius: 0 0 5px 0;">
                    ${timeFormatted}
                </p>
                <a download="clipsmithery_thumb_${i + 1}.jpg" href="${imgURL}" class="download-link">
                    ⬇ Descargar
                </a>
            `;

            thumbGrid.appendChild(imgCard);
        }

        generateBtn.textContent = "✅ Generación Completada";

    } catch(e) {
        console.error("Error durante la generación de miniaturas:", e);
        generateBtn.textContent = "❌ Error. Reintentar.";
        alert("Ocurrió un error al procesar el vídeo. Asegúrate de que el formato sea compatible.");
        
    } finally {
        generateBtn.disabled = false;
        // Restaurar texto del botón si no es el de éxito
        if (generateBtn.textContent.includes('Generando')) {
            generateBtn.textContent = "Generar miniaturas";
        }
    }
});