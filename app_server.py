import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# 1. Cargar variables de entorno (para la API Key)
load_dotenv()

loaded_key = os.getenv('OPENAI_API_KEY')
print(f"\n--- DEBUG KEY LOADED ---")
print(f"Clave cargada: {bool(loaded_key)}") 
if loaded_key:
    print(f"Primeros 15 caracteres: {loaded_key[:15]}...")
print("--------------------------\n")

# 2. Inicialización
app = Flask(__name__)
# Permitir peticiones desde tu frontend (CORS)
# Ajusta el puerto (5500) si usas Live Server en otro puerto.
CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})

# Inicializar cliente de OpenAI
# La clave se carga automáticamente desde las variables de entorno
client = OpenAI()

# Directorio temporal para guardar el archivo subido
UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/api/transcribe-video', methods=['POST'])
def transcribe_video():
    """Endpoint para recibir el vídeo, transcribirlo con Whisper y devolver el texto."""
    
    # 3. Verificar si el archivo está presente
    if 'video' not in request.files:
        return jsonify({"error": "No se encontró el archivo de vídeo en la petición."}), 400

    video_file = request.files['video']
    
    if video_file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío."}), 400

    # 4. Guardar el archivo temporalmente
    filepath = os.path.join(UPLOAD_FOLDER, video_file.filename)
    try:
        video_file.save(filepath)
    except Exception as e:
        return jsonify({"error": f"Error al guardar el archivo: {e}"}), 500

    transcription_text = ""
    try:
        # 5. Llamada a la API de Whisper
        with open(filepath, "rb") as audio_file:
            print(f"-> Transcribiendo archivo: {video_file.filename} con Whisper...")
            
            # Whisper puede transcribir directamente archivos de vídeo/audio
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text" # Pedimos el resultado solo como texto plano
            )
            transcription_text = transcription
            
    except Exception as e:
        print(f"Error en la API de OpenAI: {e}")
        return jsonify({"error": f"Fallo la transcripción con OpenAI: {e}"}), 500
    finally:
        # 6. Limpiar: eliminar el archivo temporal
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"-> Archivo temporal eliminado: {filepath}")

    # 7. Devolver el resultado
    return jsonify({
        "status": "success",
        "transcription": transcription_text
    })


if __name__ == '__main__':
    # Usamos un puerto diferente al de tu frontend (5000 es el estándar de Flask)
    print("Servidor Flask inicializado. Ejecutando en http://127.0.0.1:5000")
    app.run(debug=True, port=5000)