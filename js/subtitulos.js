const inputVideo      = document.getElementById("inputVideo");
const burnInBtn       = document.getElementById("burnInBtn");

const progressSection = document.getElementById("progressSection");
const progressText    = document.getElementById("progressText");
const progressFill    = document.getElementById("progressFill");

const videoOriginal   = document.getElementById("videoOriginal");
const videoBurnedIn   = document.getElementById("videoBurnedIn");

const resultGrid      = document.getElementById("resultGrid");
const downloadBtn     = document.getElementById("downloadBtn");

let loadedFile  = null;
let burnedBlob  = null;

// Cargar vídeo original

inputVideo.addEventListener("change", () => {
    loadedFile = inputVideo.files[0];
    if (loadedFile) {
        videoOriginal.src = URL.createObjectURL(loadedFile);
        resultGrid.style.display = "none";
        downloadBtn.style.display = "none";
        progressSection.style.display = "none";
        progressFill.style.width = "0%";
    }
});

// "Transcripción" simulada EN EL NAVEGADOR 
// Genera varias líneas de subtítulo repartidas a lo largo del vídeo.

async function buildFakeSubtitlesFromVideo(file) {
    return new Promise((resolve) => {
        const temp = document.createElement("video");
        temp.preload = "metadata";
        temp.src = URL.createObjectURL(file);

        temp.onloadedmetadata = () => {
            const duration = temp.duration || 10; 
            URL.revokeObjectURL(temp.src);

            const templateLines = [
                "Bienvenido a Mini-Netflix AI.",
                "Procesando tu vídeo de forma inteligente.",
                "Subtítulos incrustados mediante Canvas + MediaRecorder.",
                "Ejemplo de proyecto avanzado de Multimedia (UCLM).",
                "Este texto es una simulación de transcripción."
            ];

            const step = duration / templateLines.length;

            const subtitles = templateLines.map((text, i) => ({
                time: Math.max(0, i * step),
                text
            }));

            resolve(subtitles);
        };

        temp.onerror = () => {
            // Si algo falla, devolvemos una sola línea genérica
            resolve([
                { time: 0, text: "Subtítulos simulados — Mini-Netflix AI" }
            ]);
        };
    });
}

// Burn-in de subtítulos sobre el vídeo 

async function burnInSubtitles(videoFile, subtitles) {
    return new Promise(async (resolve) => {
        const tempVideo = document.createElement("video");
        tempVideo.src = URL.createObjectURL(videoFile);
        tempVideo.muted = true;

        await tempVideo.play();
        tempVideo.pause();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width  = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;

        const stream = canvas.captureStream(30);
        const chunks = [];

        const recorder = new MediaRecorder(stream, {
            mimeType: "video/webm; codecs=vp9"
        });

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            resolve(blob);
        };

        recorder.start();

        function drawFrame() {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);

            const currentTime = tempVideo.currentTime;

            const active = subtitles.find(
                (s) => currentTime >= s.time && currentTime < s.time + 3
            );

            if (active) {
                // Caja negra semitransparente
                ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
                const boxHeight = 90;
                ctx.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight);

                // Texto blanco centrado
                ctx.fillStyle = "white";
                ctx.font = "38px Poppins";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const x = canvas.width / 2;
                const y = canvas.height - boxHeight / 2;

                ctx.fillText(active.text, x, y);
            }

            if (tempVideo.ended || tempVideo.currentTime >= tempVideo.duration) {
                recorder.stop();
                return;
            }

            requestAnimationFrame(drawFrame);
        }

        tempVideo.currentTime = 0;
        tempVideo.play();
        drawFrame();
    });
}

// Botón principal

burnInBtn.addEventListener("click", async () => {
    if (!loadedFile) {
        alert("Sube un vídeo primero");
        return;
    }

    try {
        progressSection.style.display = "block";
        progressText.textContent = "1/2 Generando transcripción simulada…";
        progressFill.style.width = "35%";

        // 1) “Transcripción” simulada en base a la duración
        const subtitles = await buildFakeSubtitlesFromVideo(loadedFile);

        progressText.textContent = "2/2 Generando vídeo con subtítulos incrustados…";
        progressFill.style.width = "70%";

        // 2) Burn-in real sobre el vídeo
        burnedBlob = await burnInSubtitles(loadedFile, subtitles);

        progressFill.style.width = "100%";
        progressText.textContent = "✔ Completado";

        videoBurnedIn.src = URL.createObjectURL(burnedBlob);
        resultGrid.style.display = "grid";
        downloadBtn.style.display = "block";

    } catch (err) {
        console.error(err);
        alert("❌ Ha ocurrido un error al generar el vídeo con subtítulos.");
        progressSection.style.display = "none";
    }
});

// Descargar resultado

downloadBtn.addEventListener("click", () => {
    if (!burnedBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(burnedBlob);
    a.download = "video_subtitulos_burnin.webm";
    a.click();
});
