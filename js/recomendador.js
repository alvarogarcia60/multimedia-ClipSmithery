// ===============================
//   GENERADOR DE PREGUNTAS
// ===============================

const questions = [
    {
        id: "ritmo",
        text: "¿Qué ritmo prefieres en una película?",
        options: ["Lento y contemplativo", "Equilibrado", "Rápido y dinámico"]
    },
    {
        id: "ambientacion",
        text: "¿Qué tipo de ambientación disfrutas más?",
        options: ["Fantasía", "Ciencia ficción", "Realista", "Histórica"]
    },
    {
        id: "emocion",
        text: "¿Qué emoción principal quieres sentir?",
        options: ["Reflexión profunda", "Tensión y adrenalina", "Ternura y empatía", "Inspiración"]
    },
    {
        id: "duracion",
        text: "¿Duración ideal?",
        options: ["Menos de 100 min", "100-130 min", "130-160 min", "Me da igual"]
    },
    {
        id: "mensaje",
        text: "¿Qué importancia tiene el mensaje final?",
        options: ["Muy importante", "Moderado", "No es esencial"]
    },
    {
        id: "protagonista",
        text: "Tipo de protagonista que prefieres:",
        options: ["Héroe clásico", "Personaje imperfecto", "Anti-héroe", "Grupo coral"]
    },
    {
        id: "violencia",
        text: "Nivel de violencia que toleras:",
        options: ["Baja", "Media", "Alta"]
    }
];

// ===============================
//   MOSTRAR PREGUNTAS
// ===============================

function renderQuiz() {
    const quiz = document.getElementById("quizContainer");
    quiz.innerHTML = "";

    questions.forEach(q => {
        let block = `
            <div class="quiz-question">
                <h3>${q.text}</h3>
                <div class="options">
                    ${q.options
                        .map(
                            opt => `
                        <label>
                            <input type="radio" name="${q.id}" value="${opt}">
                            ${opt}
                        </label>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;
        quiz.innerHTML += block;
    });
}

renderQuiz();


// ===============================
//   BOTÓN RECOMENDAR
// ===============================

document.getElementById("btnRecommend").addEventListener("click", async () => {
    const answers = {};

    // Recoger todas las respuestas
    let missing = false;
    questions.forEach(q => {
        const selected = document.querySelector(`input[name="${q.id}"]:checked`);
        if (!selected) missing = true;
        answers[q.id] = selected ? selected.value : null;
    });

    if (missing) {
        alert("⚠️ Por favor responde todas las preguntas.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(answers)
        });

        const data = await response.json();

        if (data.error) {
            alert("Error en la IA: " + data.error);
            return;
        }

        showResults(data);

    } catch (err) {
        alert("❌ Error al conectar con el servidor: " + err.message);
    }
});


// ===============================
//   MOSTRAR RESULTADOS
// ===============================

function showResults(data) {
    document.getElementById("resultBox").style.display = "block";

    document.getElementById("resultMovie").innerHTML =
        data.result || "No se pudo generar la recomendación.";

    document.getElementById("resultProfile").innerHTML = "";
    document.getElementById("resultAlternatives").innerHTML = "";
}

