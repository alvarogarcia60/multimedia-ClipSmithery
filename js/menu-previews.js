// Cargar previews en las tarjetas estilo Netflix
document.querySelectorAll(".preview-card").forEach(card => {
    const video = card.querySelector(".preview-video");
    const src = card.dataset.preview;

    if (src) {
        video.src = src;
    }
});
