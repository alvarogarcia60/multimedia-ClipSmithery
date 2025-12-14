console.log("Módulo: GENERADOR DE TÍTULOS IA cargado.");

/* ELEMENTOS */
const inputDesc = document.getElementById("inputDesc");
const generateBtn = document.getElementById("generateBtn");
const resultSection = document.getElementById("resultSection");
const resultTitle = document.getElementById("resultTitle");
const resultDesc = document.getElementById("resultDesc");
const resultTags = document.getElementById("resultTags");
const copyBtn = document.getElementById("copyBtn");



/* FUNCIONES */
async function generateTitles() {
    const description = inputDesc.value.trim();
    
    if (description.length < 10) {
        return alert("Por favor, proporciona una descripción más detallada (mínimo 10 caracteres).");
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "⚙️ Generando ideas con IA...";
    resultSection.style.display = "none";

    try {
        const response = await fetch('http://127.0.0.1:5000/api/generate-titles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: description }),
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar resultados exitosos
            resultTitle.textContent = data.title;
            resultDesc.textContent = data.description;
            resultTags.textContent = data.tags;
            resultSection.style.display = "block";
        } else {
            // Manejar fallbacks o errores del servidor
            resultTitle.textContent = data.title || "Error en el servidor Flask.";
            resultDesc.textContent = data.description || "No se pudo obtener una respuesta válida de la IA.";
            resultTags.textContent = data.tags || "#Error";
            resultSection.style.display = "block"; 
            
            // Si el error es un 500, alertar al usuario
            if (response.status === 500) {
                 alert("Error crítico de IA: Revisa si tu clave de API está configurada correctamente en el servidor.");
            }
        }

    } catch (e) {
        console.error("Error de conexión:", e);
        alert("Fallo la conexión con el servidor Flask (puerto 5000). Asegúrate de que el servidor está corriendo.");
        
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generar Ideas con IA";
    }
}

function copyResults() {
    const title = resultTitle.textContent;
    const desc = resultDesc.textContent;
    const tags = resultTags.textContent;
    
    const textToCopy = `Título: ${title}\n\nDescripción:\n${desc}\n\nEtiquetas:\n${tags}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.textContent = '✅ ¡Copiado!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copiar Todo';
        }, 1500);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar automáticamente. Intenta seleccionando el texto.');
    });
}

/* EVENTOS */
generateBtn.addEventListener("click", generateTitles);
copyBtn.addEventListener("click", copyResults);