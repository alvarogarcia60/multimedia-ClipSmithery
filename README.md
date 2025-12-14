# Clip Smithery [AI]  
### La Forja del Contenido Multimedia Inteligente.

Este proyecto es una aplicación web interactiva diseñada como un **Laboratorio de Post-producción Multimedia**. Se enfoca en la manipulación avanzada de vídeo y audio, combinando el procesamiento a nivel de píxel (Canvas API) con la recodificación eficiente (MediaRecorder API).

---

## Autores

Proyecto concebido, diseñado y desarrollado por:

- **Adrián Alameda Alcaide**
- **Álvaro García Martínez**

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
| **Recomendador de Películas** | Test Asistido por IA. | **Vite/React** (Compilado) / Gemini API (Recomendaciones y Pósteres AI). |

---

## Tecnologías Clave Utilizadas

- **Frontend Principal:** HTML5, CSS3 (Glassmorphism), **JavaScript Vanilla**.
- **Módulo Recomendador (CineMágico AI):** **Vite** para *bundling*, **React** (v18.x) y **TypeScript**.
- **Multimedia Core:** **Canvas API**, **MediaRecorder API**, `Video & Audio API`.
- **Backend y Servidor de Contenido:** **Python Flask** (para posibles *endpoints* de la suite) y **Servidor HTTP Simple de Python** (`http.server`) para ejecución local.
- **IA:** Uso de la API de **Google Gemini** para generación de recomendaciones de texto y pósteres.

---

## Instalación y Uso Local

La aplicación se ejecuta a través de un servidor simple de Python lanzado por el script `run_app.bat`.

### 1. Prerrequisitos

- **Node.js y npm** (Necesario para compilar el módulo `recomendador`).
- **Python 3 y pip** (Necesario para el servidor web local).
- Una **Clave de API de Google Gemini**.

### 2. Configuración del Recomendador (Vite/React)

El módulo del recomendador (`recomendador/`) es un proyecto Node.js anidado.

#### 2.1. Instalar dependencias de Node.js

Abre tu terminal y navega al subdirectorio `recomendador/`:

```bash
cd recomendador
npm install


```markdown
```

#### 2.2. Configuración de la API y Variables de Entorno

Crea un archivo llamado **`.env.local`** dentro de la carpeta `recomendador/` y añade tu clave de la API de Google Gemini:

```env
GEMINI_API_KEY="TU_CLAVE_DE_GEMINI_AQUÍ"
```

> ⚠️ **Importante:**
> Este archivo no debe subirse al repositorio. Asegúrate de que esté incluido en el `.gitignore`.

---

#### 2.3. Compilar la Aplicación

Dado que el proyecto utiliza un **servidor estático en Python**, el recomendador debe compilarse a archivos estáticos **cada vez que se modifique su código**.

Ejecuta el siguiente comando desde `recomendador/`:

```bash
npm run build
```

Este comando generará la carpeta:

```text
recomendador/dist/
```

La cual será servida directamente por el servidor Python.

---

## Ejecución del Proyecto Completo

Una vez compilado el recomendador, vuelve al **directorio raíz del proyecto**:

```bash
cd ..
```

Y ejecuta el script principal:

```bash
.\run_app.bat
```

Este script realiza automáticamente las siguientes acciones:

1. Inicia un **servidor HTTP simple de Python** en el puerto `5000`.
2. Abre el navegador web por defecto en la siguiente URL:

```
http://127.0.0.1:5000/menu.html
```

---

## Uso de la Aplicación

Desde el menú principal podrás acceder a todos los módulos del laboratorio multimedia:

* Compresión y reescalado de vídeo
* Generación de miniaturas
* Análisis de color
* Filtros cinematográficos
* Recorte vertical para redes sociales
* **Test de Películas (IA)**

Al acceder al módulo **Test de Películas (IA)**, la aplicación **CineMágico AI** se cargará correctamente desde la versión compilada ubicada en `recomendador/dist/`.

---

## Notas Técnicas

* El procesamiento multimedia se realiza **completamente en el cliente** (navegador).
* No se suben vídeos ni audios a servidores externos.
* El uso de `Canvas API` permite manipulación directa a nivel de píxel.
* `MediaRecorder API` se emplea para capturar y exportar los resultados procesados.
* La IA se utiliza únicamente como **herramienta asistida de recomendación y generación visual**.

---

## Licencia

Proyecto desarrollado con fines **académicos y educativos**
Asignatura: **Multimedia – Ingeniería Informática (UCLM)**

Uso libre para evaluación, demostración y aprendizaje.



