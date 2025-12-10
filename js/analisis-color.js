const inputVideo = document.getElementById("inputVideo");
const analyzeBtn = document.getElementById("analyzeBtn");

const progressSection = document.getElementById("progressSection");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const resultsSection = document.getElementById("resultsSection");

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

inputVideo.addEventListener("change", () => {
    loadedFile = inputVideo.files[0];
});

function rgbToTemp(r,g,b) {
    const t=(r*0.3 + g*0.59 + b*0.11);
    return t<100?"Frío ❄️":t<160?"Neutro 🌤️":"Cálido 🔥";
}

function colorToHex(r,g,b){
    return "#" + [r,g,b].map(x=>{
        x=Math.round(x);
        return (x<16?"0":"") + x.toString(16);
    }).join("");
}

function getPalette(colors, k=5){
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

analyzeBtn.addEventListener("click", async () => {
    if(!loadedFile) return alert("Sube un vídeo primero.");

    progressSection.style.display="block";
    progressFill.style.width="10%";

    const video=document.createElement("video");
    video.src=URL.createObjectURL(loadedFile);
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
        await new Promise(r=>setTimeout(r,80));

        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;

        let r=0,g=0,b=0,bright=0,sat=0;
        const step=20;

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

        progressFill.style.width=`${10+(i/frames)*80}%`;
    }

    last = timeline[timeline.length-1];
    const rgb = last.color.match(/\d+/g);
    R=+rgb[0]; G=+rgb[1]; B=+rgb[2];

    colorBox.style.background=last.color;
    colorValue.textContent=last.color;

    brightnessValue.textContent=(
        timeline.reduce((a,c)=>a+c.brightness,0)/timeline.length
    ).toFixed(1);

    saturationValue.textContent=(
        timeline.reduce((a,c)=>a+c.saturation,0)/timeline.length
    ).toFixed(2);

    tempValue.textContent=rgbToTemp(R,G,B);

    palette=getPalette(allColors,5);
    paletteBar.innerHTML="";
    palette.forEach(c=>{
        const div=document.createElement("div");
        div.className="palette-color";
        div.style.background=colorToHex(c.r,c.g,c.b);
        paletteBar.appendChild(div);
    });

    timelineBar.innerHTML="";
    timeline.forEach(seg=>{
        const d=document.createElement("div");
        d.className="timeline-color";
        d.style.background=seg.color;
        timelineBar.appendChild(d);
    });

    chartCtx.clearRect(0,0,chartCanvas.width,chartCanvas.height);
    timeline.forEach((seg,i)=>{
        const x=(chartCanvas.width/timeline.length)*i;
        const y=chartCanvas.height - (seg.brightness/255)*chartCanvas.height;
        chartCtx.fillStyle=seg.color;
        chartCtx.fillRect(x,y,10,chartCanvas.height);
    });

    progressFill.style.width="100%";
    progressText.textContent="✔ Completado";
    resultsSection.style.display="block";
});


downloadPoster.addEventListener("click", async () => {
    if(!loadedFile) return alert("Primero analiza un vídeo.");

    const video=document.createElement("video");
    video.src=URL.createObjectURL(loadedFile);

    await video.play();
    video.pause();

    video.currentTime = video.duration * 0.30;
    await new Promise(r=>setTimeout(r,150));

    const frameCanvas=document.createElement("canvas");
    const fctx=frameCanvas.getContext("2d");
    frameCanvas.width=video.videoWidth;
    frameCanvas.height=video.videoHeight;
    fctx.drawImage(video,0,0,frameCanvas.width,frameCanvas.height);

    posterCanvas.width=800;
    posterCanvas.height=1100;

    posterCtx.fillStyle="black";
    posterCtx.fillRect(0,0,800,1100);

    const img=new Image();
    img.src=frameCanvas.toDataURL("image/jpeg");

    img.onload=()=>{
        posterCtx.drawImage(img,0,0,800,450);

        posterCtx.fillStyle="white";
        posterCtx.font="46px Poppins";
        posterCtx.fillText("Mood Poster — MiniNetflix AI",40,520);

        posterCtx.font="30px Poppins";
        posterCtx.fillText("Color dominante:",40,600);
        posterCtx.fillStyle=last.color;
        posterCtx.fillRect(350,560,120,80);

        posterCtx.fillStyle="white";
        posterCtx.fillText("Temperatura: "+rgbToTemp(R,G,B),40,700);

        posterCtx.fillText("Paleta cinematográfica:",40,780);

        let x=40;
        palette.forEach(c=>{
            posterCtx.fillStyle=colorToHex(c.r,c.g,c.b);
            posterCtx.fillRect(x,820,120,120);
            x+=140;
        });

        const link=document.createElement("a");
        link.href=posterCanvas.toDataURL("image/png");
        link.download="mood_poster.png";
        link.click();
    };
});
