# Mini-Netflix AI (Multimedia UCLM)
## Autores

Proyecto desarrollado por:
* **Adrián Alameda Alcaide**
* **Álvaro García Martínez**

*UCLM – Ingeniería Informática (Asignatura Multimedia)*

## Descripción del Proyecto

Este proyecto es una aplicación web interactiva diseñada para simular una plataforma de *streaming* a pequeña escala (Mini-Netflix). Incluye un conjunto de herramientas de procesamiento de vídeo y utilidades asistidas por IA, todas accesibles directamente desde el navegador (*client-side*).

---

### Funcionalidades Operativas (Client-Side)

Las siguientes funcionalidades están implementadas en JavaScript puro y son **totalmente operativas** en el navegador:

* **Compresión de Vídeo:**
    * Reduce el tamaño del archivo manteniendo la calidad y el audio.
    * Muestra datos comparativos (tamaño original vs. comprimido, resolución, porcentaje de reducción) y permite la descarga del nuevo archivo.
* **Cambio de Resolución:**
    * Reescala el vídeo a diferentes resoluciones estándar (1080p, 720p, 480p, etc.), conservando el audio original.
    * Incluye reproductores para comparar el vídeo antes y después del reescalado.
* **Generación de Miniaturas:**
    * Obtiene *frames* del vídeo en varios puntos y genera una galería estilo catálogo.
    * Permite la descarga individual de cada imagen.
* **Vista Previa Automática estilo Netflix:**
    * Genera un clip corto (tipo *teaser*) que simula el comportamiento de Netflix al pasar el ratón sobre una tarjeta de contenido.
* **Resumen Automático (AI - Frontend):**
    * Permite al usuario pegar texto (como una transcripción) para obtener un resumen generado por un modelo de lenguaje.

---

## Tecnologías Clave Utilizadas

* **Interfaz:** HTML5 / CSS3 (Diseño estilo Netflix + Glassmorphism).
* **Lógica:** JavaScript Vanilla.
* **Procesamiento:** `Canvas API` (para la manipulación de *frames* y reescalado).
* **Compresión/Grabación:** `MediaRecorder API` (para la recodificación y compresión directa en el navegador).
* **Multimedia:** `Video & Audio API`.
* **Datos Dinámicos:** Archivos `JSON` (utilizados en la simulación de catálogo).
* **IA (Opcional):** Uso de la API de **OpenAI GPT** para el resumen de texto.

---

## Instalación y Uso Local

Para ejecutar la aplicación, es necesario usar un servidor local para evitar problemas de seguridad del navegador.

### 1. Clonación del Repositorio

Clona el proyecto en tu máquina local:

```bash
git clone [https://github.com/alvarogarcia60/multimedia-mininetflix-ai.git](https://github.com/alvarogarcia60/multimedia-mininetflix-ai.git)
cd multimedia-mininetflix-ai
```
### 2. Ejecución del Servidor Local

Abre la carpeta del proyecto y ejecuta un servidor local:

#### Opción A: VSCode Live Server (Recomendado)

1.  Instala la extensión **Live Server** en Visual Studio Code.
2.  Haz clic derecho sobre el archivo **`html/index.html`** y selecciona **'Open with Live Server'**.

#### Opción B: Servidor Python

1.  Abre tu terminal (WSL/Linux/macOS).
2.  Ejecuta el servidor HTTP simple de Python:
    ```bash
    python3 -m http.server 5500
    ```

### 3. Acceso a la Aplicación

Accede a la aplicación en tu navegador:
http://127.0.0.1:5500/html/index.html

