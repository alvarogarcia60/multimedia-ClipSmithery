const inputThumbs = document.getElementById("inputThumbs");
const thumbCount = document.getElementById("thumbCount");
const generateBtn = document.getElementById("generateThumbsBtn");
const thumbGrid = document.getElementById("thumbGrid");
const thumbResults = document.getElementById("thumbResults");

let loadedFile = null;

// Cargar archivo
inputThumbs.addEventListener("change", () => {
    loadedFile = inputThumbs.files[0];
});

// Generar Miniaturas
generateBtn.addEventListener("click", async () => {
    if (!loadedFile) return alert("Sube un vídeo primero");

    thumbGrid.innerHTML = "";
    thumbResults.style.display = "block";

    const video = document.createElement("video");
    video.src = URL.createObjectURL(loadedFile);
    await video.play();
    video.pause();

    const totalThumbs = parseInt(thumbCount.value);
    const duration = video.duration;

    for (let i = 0; i < totalThumbs; i++) {
        const time = (duration / totalThumbs) * i;

        video.currentTime = time;
        await new Promise(res => video.onseeked = res);

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const imgURL = canvas.toDataURL("image/jpeg");

        const imgCard = document.createElement("div");
        imgCard.className = "thumb-card";
        imgCard.innerHTML = `
            <img src="${imgURL}" class="thumb-img">
            <a download="miniatura_${i + 1}.jpg" href="${imgURL}" class="btn-secondary small">
                Descargar
            </a>
        `;

        thumbGrid.appendChild(imgCard);
    }
});
