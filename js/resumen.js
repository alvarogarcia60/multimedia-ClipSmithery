console.log("Módulo: RESUMEN AUTOMÁTICO IA cargado correctamente");

/* =====================================================
   ELEMENTOS
===================================================== */
const inputText = document.getElementById("inputText");
const processBtn = document.getElementById("processBtn");
const progressSection = document.getElementById("progressSection");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const resultSection = document.getElementById("resultSection");
const summaryOutput = document.getElementById("summaryOutput");
const downloadBtn = document.getElementById("downloadBtn");

let summaryResult = "";


/* =====================================================
   Función de Resumen (Llamada al Backend)
===================================================== */
async function generateSummary(text) {
    progressText.textContent = `Analizando texto (${text.length} caracteres)...`;
    progressFill.style.width = "20%";

    try {
        const response = await fetch("http://127.0.0.1:5000/api/generate-summary", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });
        
        progressFill.style.width = "70%";
        progressText.textContent = "Generando resumen con GPT...";

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        const data = await response.json();
        
        summaryResult = data.summary;
        return summaryResult;

    } catch (error) {
        console.error("Fallo la generación del resumen:", error);
        alert("Fallo el procesamiento. Asegúrate de que el backend esté activo y la API key sea válida.");
        progressSection.style.display = "none";
        return null;
    }
}


/* =====================================================
   Eventos UI
===================================================== */
processBtn.addEventListener("click", async () => {
    const textToSummarize = inputText.value.trim();
    if (!textToSummarize) {
        alert("Pega el texto que quieres resumir primero.");
        return;
    }
    
    // Reset UI
    summaryOutput.value = "";
    resultSection.style.display = "none";
    progressSection.style.display = "block";
    progressFill.style.width = "0%";

    const result = await generateSummary(textToSummarize);
    
    if (result) {
        progressFill.style.width = "100%";
        progressText.textContent = "¡Resumen Completado! ✔";

        summaryOutput.value = result;
        resultSection.style.display = "block";
    }
});


downloadBtn.addEventListener("click", () => {
    if (!summaryResult) return;
    
    const blob = new Blob([summaryResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "resumen_ia.txt";
    a.click();

    URL.revokeObjectURL(url);
});