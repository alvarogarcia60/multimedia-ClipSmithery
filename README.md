# Clip Smithery [AI] 
### La Forja del Contenido Multimedia Inteligente.

Este proyecto es una aplicación web interactiva diseñada como un **Laboratorio de Post-producción Multimedia**. Se enfoca en la manipulación avanzada de vídeo y audio, combinando el procesamiento a nivel de píxel (Canvas API) con la recodificación eficiente (MediaRecorder API).

---

## Autores

Proyecto concebido, diseñado y desarrollado por:

* **Adrián Alameda Alcaide**
* **Álvaro García Martínez**

*UCLM – Ingeniería Informática (Asignatura Multimedia)*

---

## Funcionalidades Clave Operativas (Estables)

El proyecto se centra ahora en herramientas robustas que demuestran el control sobre el *client-side* media processing.

| Módulo | Enfoque | Tecnología Clave |
| :--- | :--- | :--- |
| **Compresión de Vídeo** | Optimización de archivos. | `MediaRecorder API` (Recodificación). |
| **Cambio de Resolución** | Manipulación de la Geometría. | `Canvas API` (Reescalado). |
| **Generación de Miniaturas** | Extracción de *Frames*. | `Video API` / `Canvas API`. |
| **Análisis de Paleta de Color** | Analítica Visual. | `Canvas API` (`getImageData` + Muestreo de Píxeles). |
| **Filtros Cinematográficos** | Manipulación de Píxeles en Vivo (10 Filtros). | `Canvas API` (Filtros Personalizados) / `MediaRecorder` (Grabación del resultado). |
| **Recorte Vertical (9:16)** | Adaptación de Geometría (Reels/Shorts). | `Canvas API` (`drawImage` con recorte centrado) / `MediaRecorder`. |
| **Recomendador de Películas** | Test Asistido por IA. | Flask / Gemini API (Modo Fallback Estructurado). |

---

## Tecnologías Clave Utilizadas

* **Frontend:** HTML5, CSS3 (Glassmorphism), **JavaScript Vanilla**.
* **Multimedia Core:** **`Canvas API`**, **`MediaRecorder API`**, `Video & Audio API`.
* **Backend (Servicios IA/CORS):** **Python Flask** (usado para el *endpoint* del Recomendador).
* **IA (Opcional):** Uso de la API de **Google Gemini** para generación de texto (Requiere `GEMINI_API_KEY`).

---

## Instalación y Uso Local

La aplicación ahora arranca directamente desde la raíz del proyecto.

### 1. Clonación del Repositorio y Entorno

Clona el proyecto y configura tu entorno virtual:

```bash
git clone [https://github.com/alvarogarcia60/multimedia-ClipSmithery.git](https://github.com/alvarogarcia60/multimedia-ClipSmithery.git)
cd multimedia-ClipSmithery
# Si usas Python/Flask: Instala dependencias y activa el entorno virtual (venv)
```
### 2. Ejecución del Servidor Local

Abre la carpeta del proyecto y ejecuta un servidor local. **Nota:** Dado que el Recomendador de Películas requiere un *backend* activo, la **Opción C (Doble Servidor)** es la más completa.

#### Opción A: VSCode Live Server (Solo Frontend)

1.  Instala la extensión **Live Server** en Visual Studio Code.
2.  Haz clic derecho sobre el archivo **`index.html`** (en la raíz) y selecciona **'Open with Live Server'**.

#### Opción B: Servidor Python (Solo Frontend)

1.  Abre tu terminal (WSL/Linux/macOS).
2.  Ejecuta el servidor HTTP simple de Python:

```bash
python3 -m http.server 5500
