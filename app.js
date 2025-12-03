const inputVideo = document.getElementById("inputVideo");
const videoPlayer = document.getElementById("videoPlayer");
const processBtn = document.getElementById("processBtn");

let loadedFile = null;

// Cargar vídeo en el reproductor
inputVideo.addEventListener("change", () => {
    loadedFile = inputVideo.files[0];
    
    if (loadedFile) {
        const url = URL.createObjectURL(loadedFile);
        videoPlayer.src = url;
    }
});

// Botón de procesar
processBtn.addEventListener("click", () => {
    if (!loadedFile) {
        alert("Sube un vídeo primero");
        return;
    }

    alert("Procesando vídeo... (por ahora solo la base)");
});
