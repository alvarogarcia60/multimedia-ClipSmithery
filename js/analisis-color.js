const inputVideo = document.getElementById("inputVideo");
const analyzeBtn = document.getElementById("analyzeBtn");

const progressSection = document.getElementById("progressSection");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const resultsSection = document.getElementById("resultsSection");

// Elementos de la interfaz de carga (Sincronización con HTML)
const fileLabel = document.getElementById("fileLabel");
const fileNameDisplay = document.getElementById("fileNameDisplay");

const colorBox = document.getElementById("colorBox");
const colorValue = document.getElementById("colorValue");
const brightnessValue = document.getElementById("brightnessValue");
const saturationValue = document.getElementById("saturationValue");
const tempValue = document.getElementById("tempValue");

const paletteBar = document.getElementById("paletteBar");
const timelineBar = document.getElementById("timelineBar");

const chartCanvas = document.getElementById("colorChart");
const chartCtx = chartCanvas.getContext("2d");

const posterCanvas = document.getElementById("posterCanvas");
const posterCtx = posterCanvas.getContext("2d");

const downloadPoster = document.getElementById("downloadPoster");

let loadedFile = null;
let palette = null;
let last = null;
let R = 0, G = 0, B = 0;


/* MANEJO DE INTERFAZ DE CARGA */
inputVideo.addEventListener("change", () => {
    const fileSelected = inputVideo.files.length > 0;
    loadedFile = fileSelected ? inputVideo.files[0] : null;

    // Sincronización de la interfaz
    analyzeBtn.disabled = !fileSelected;
    fileLabel.textContent = fileSelected ? 'Cambiar archivo' : 'Elegir archivo';
    fileNameDisplay.textContent = fileSelected ? loadedFile.name : 'Ningún archivo seleccionado.';
    
    // Resetear resultados
    progressSection.style.display = 'none';
    resultsSection.style.display = 'none';
    analyzeBtn.textContent = "Analizar vídeo";
});

/* FUNCIONES DE UTILIDAD*/
function rgbToTemp(r,g,b) {
    const t=(r*0.3 + g*0.59 + b*0.11);
    // Ajuste de rangos para percepción de temperatura
    return t<80?"Frío ❄️":t<150?"Neutro 🌤️":"Cálido 🔥";
}

function colorToHex(r,g,b){
    return "#" + [r,g,b].map(x=>{
        x=Math.round(x);
        return (x<16?"0":"") + x.toString(16);
    }).join("");
}

function getPalette(colors, k=5){
    // Algoritmo K-Means simplificado para extraer paleta dominante
    let centroids = colors.slice(0,k);
    for(let iter=0;iter<6;iter++){
        let groups = Array.from({length:k},()=>[]);
        colors.forEach(c=>{
            let d = centroids.map(m=>Math.hypot(c.r-m.r,c.g-m.g,c.b-m.b));
            groups[d.indexOf(Math.min(...d))].push(c);
        });
        centroids = groups.map(g=>{
            if(!g.length) return {r:0,g:0,b:0};
            return {
                r:g.reduce((a,c)=>a+c.r,0)/g.length,
                g:g.reduce((a,c)=>a+c.g,0)/g.length,
                b:g.reduce((a,c)=>a+c.b,0)/g.length
            };
        });
    }
    return centroids;
}

/* ANÁLISIS PRINCIPAL */
analyzeBtn.addEventListener("click", async () => {
    if(!loadedFile) return alert("Sube un vídeo primero.");

    // Resetear y mostrar progreso
    progressSection.style.display="block";
    resultsSection.style.display="none";
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analizando...";
    progressFill.style.width="10%";
    progressText.textContent="Extrayendo frames...";


    try {
        const video=document.createElement("video");
        video.src=URL.createObjectURL(loadedFile);
        video.muted = true;

        await new Promise(r => video.onloadedmetadata = r);
        await video.play();
        video.pause();

        const canvas=document.createElement("canvas");
        const ctx=canvas.getContext("2d");
        canvas.width=video.videoWidth;
        canvas.height=video.videoHeight;

        const frames=40;
        let allColors=[];
        let timeline=[];

        for(let i=0;i<frames;i++){
            video.currentTime=(video.duration/frames)*i;
            // Pequeña pausa para asegurar que el frame se cargue
            await new Promise(r=>setTimeout(r,80));

            ctx.drawImage(video,0,0,canvas.width,canvas.height);
            // Tomamos los datos de color de la imagen
            const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;

            let r=0,g=0,b=0,bright=0,sat=0;
            const step=20; // Muestreo: solo se toman 1 de cada 'step' píxeles

            for(let j=0;j<data.length;j+=4*step){
                let Rv=data[j], Gv=data[j+1], Bv=data[j+2];
                r+=Rv; g+=Gv; b+=Bv;
                bright+=(Rv+Gv+Bv)/3;
                sat+=(Math.max(Rv,Gv,Bv)-Math.min(Rv,Gv,Bv))/Math.max(1,Math.max(Rv,Gv,Bv));
                allColors.push({r:Rv,g:Gv,b:Bv});
            }

            const pixels=data.length/(4*step);

            timeline.push({
                color:`rgb(${(r/pixels)|0},${(g/pixels)|0},${(b/pixels)|0})`,
                brightness:bright/pixels,
                saturation:sat/pixels
            });

            // Actualizar progreso
            progressFill.style.width=`${10+(i/frames)*80}%`;
            progressText.textContent=`Analizando frames: ${i+1} de ${frames}`;
        }

        // CALCULAR Y MOSTRAR RESULTADOS
        
        last = timeline[timeline.length-1];
        const rgb = last.color.match(/\d+/g);
        R=+rgb[0]; G=+rgb[1]; B=+rgb[2];

        // 1. Color Dominante & Temperatura
        colorBox.style.background=last.color;
        colorValue.textContent=`${last.color} | ${colorToHex(R,G,B)}`;
        tempValue.textContent=rgbToTemp(R,G,B);

        // 2. Brillo y Saturación Medios
        brightnessValue.textContent=(
            timeline.reduce((a,c)=>a+c.brightness,0)/timeline.length
        ).toFixed(1);

        saturationValue.textContent=(
            timeline.reduce((a,c)=>a+c.saturation,0)/timeline.length
        ).toFixed(2);

        // 3. Paleta Cinematográfica (K-Means)
        palette=getPalette(allColors,5);
        paletteBar.innerHTML="";
        palette.forEach(c=>{
            const div=document.createElement("div");
            div.className="palette-color";
            div.style.cssText = `background-color: ${colorToHex(c.r,c.g,c.b)}; flex-grow: 1;`; // Usar flex-grow: 1 para distribución uniforme
            paletteBar.appendChild(div);
        });

        // 4. Línea de Tiempo de Color
        timelineBar.innerHTML="";
        timeline.forEach(seg=>{
            const d=document.createElement("div");
            d.className="timeline-color";
            d.style.cssText = `background-color: ${seg.color}; flex-grow: 1;`; // Usar flex-grow: 1 para distribución uniforme
            timelineBar.appendChild(d);
        });

        // 5. Gráfico de Brillo (Histograma simplificado)
        chartCtx.clearRect(0,0,chartCanvas.width,chartCanvas.height);
        timeline.forEach((seg,i)=>{
            const x=(chartCanvas.width/timeline.length)*i;
            const y=chartCanvas.height - (seg.brightness/255)*chartCanvas.height;
            chartCtx.fillStyle=seg.color;
            chartCtx.fillRect(x,y,chartCanvas.width/timeline.length,chartCanvas.height);
        });

        // Finalización
        progressFill.style.width="100%";
        progressText.textContent="✔ Análisis Completado";
        resultsSection.style.display="block";
        analyzeBtn.textContent = "Re-analizar";


    } catch(e) {
        console.error("Error al procesar el vídeo:", e);
        progressText.textContent="❌ Error en el análisis. Intenta con otro formato.";
        analyzeBtn.textContent = "Reintentar análisis";
        
    } finally {
        analyzeBtn.disabled = false;
    }
});


/* DESCARGAR POSTER (ACTUALIZACIÓN DE BRANDING)*/
downloadPoster.addEventListener("click", async () => {
    if(!loadedFile || !palette) return alert("Primero analiza un vídeo.");

    const video=document.createElement("video");
    video.src=URL.createObjectURL(loadedFile);
    video.muted = true; // Asegurar que no haya sonido

    // Esperar metadatos y luego reproducir/pausar para asegurar frame
    await new Promise(r => video.onloadedmetadata = r);
    await video.play();
    video.pause();

    video.currentTime = video.duration * 0.30;
    await new Promise(r=>setTimeout(r,150)); // Asegurar posición del frame

    // Crear frame de miniatura
    const frameCanvas=document.createElement("canvas");
    const fctx=frameCanvas.getContext("2d");
    frameCanvas.width=video.videoWidth;
    frameCanvas.height=video.videoHeight;
    fctx.drawImage(video,0,0,frameCanvas.width,frameCanvas.height);

    // Configuración del Poster Canvas
    posterCanvas.width=800;
    posterCanvas.height=1100;

    posterCtx.fillStyle="#0b0c10"; // Fondo oscuro de Clip Smithery
    posterCtx.fillRect(0,0,800,1100);

    const img=new Image();
    img.src=frameCanvas.toDataURL("image/jpeg");

    img.onload=()=>{
        // 1. Imagen (Ajuste a 16:9 de la parte superior)
        posterCtx.drawImage(img,0,0,800,450);

        // 2. Título (Actualizado con branding Clip Smithery)
        posterCtx.fillStyle="#66fcf1"; 
        posterCtx.font="46px Poppins";
        posterCtx.fillText("Mood Poster — Clip Smithery",40,520);

        // 3. Color dominante
        posterCtx.fillStyle="white";
        posterCtx.font="30px Poppins";
        posterCtx.fillText("Color dominante:",40,600);
        posterCtx.fillStyle=last.color;
        posterCtx.fillRect(350,560,120,80);
        posterCtx.fillStyle="white";
        posterCtx.font="20px Poppins";
        posterCtx.fillText(colorToHex(R,G,B), 350, 660); // Mostrar valor HEX

        // 4. Temperatura
        posterCtx.fillStyle="white";
        posterCtx.font="30px Poppins";
        posterCtx.fillText("Temperatura: "+rgbToTemp(R,G,B),40,730);

        // 5. Paleta Cinematográfica
        posterCtx.fillText("Paleta cinematográfica:",40,810);

        let x=40;
        palette.forEach(c=>{
            posterCtx.fillStyle=colorToHex(c.r,c.g,c.b);
            posterCtx.fillRect(x,850,120,120);
            x+=140;
        });

        // 6. Descarga
        const link=document.createElement("a");
        link.href=posterCanvas.toDataURL("image/png");
        link.download="clipsmithery_mood_poster.png";
        link.click();
    };
});