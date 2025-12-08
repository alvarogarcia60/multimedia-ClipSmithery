console.log("Módulo: TRANSCRIPCIÓN IA cargado correctamente");

/* =====================================================
   ELEMENTOS
===================================================== */
const inputVideo = document.getElementById("inputVideo");
const processBtn = document.getElementById("processBtn");
const progressSection = document.getElementById("progressSection");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const resultSection = document.getElementById("resultSection");
const transcriptionOutput = document.getElementById("transcriptionOutput");
const downloadBtn = document.getElementById("downloadBtn");

let loadedFile = null;
let transcriptionResult = "";


/* =====================================================
   Cargar vídeo
===================================================== */
inputVideo.addEventListener("change", () => {
    loadedFile = inputVideo.files[0];
    if (loadedFile) {
        // Resetear UI
        resultSection.style.display = "none";
        progressSection.style.display = "none";
        progressFill.style.width = "0%";
    }
});


/* =====================================================
   Función de Transcripción (Simulando Backend)
===================================================== */
async function transcribeVideo(file) {
    // ⚠️ ATENCIÓN: Esta es la sección donde necesitas un BACKEND SEGURO ⚠️
    
    progressText.textContent = `Subiendo archivo (${(file.size / 1024 / 1024).toFixed(2)} MB)...`;
    progressFill.style.width = "10%";

    const formData = new FormData();
    formData.append("video", file);

    try {
        const response = await fetch("/api/transcribe-video", {
            method: "POST",
            body: formData
            // NO se necesita 'Content-Type' con FormData
        });

        // Simulación de progreso de transcripción en el cliente
        progressFill.style.width = "50%";
        progressText.textContent = "Procesando audio con Whisper AI...";

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        const data = await response.json();
        
        // ¡Transcripción recibida!
        transcriptionResult = data.transcription;
        return transcriptionResult;

    } catch (error) {
        console.error("Fallo la transcripción:", error);
        alert("Fallo el procesamiento. Asegúrate de que el backend esté activo y la API key sea válida.");
        progressSection.style.display = "none";
        return null;
    }
}


/* =====================================================
   Eventos UI
===================================================== */
processBtn.addEventListener("click", async () => {
    if (!loadedFile) {
        alert("Selecciona un vídeo primero");
        return;
    }

    progressSection.style.display = "block";
    
    const result = await transcribeVideo(loadedFile);
    
    if (result) {
        progressFill.style.width = "100%";
        progressText.textContent = "¡Transcripción Completada! ✔";

        transcriptionOutput.value = result;
        resultSection.style.display = "block";
    }
});


downloadBtn.addEventListener("click", () => {
    if (!transcriptionResult) return;
    
    const blob = new Blob([transcriptionResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcripcion_ai.txt";
    a.click();

    URL.revokeObjectURL(url);
});