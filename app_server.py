import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai # NUEVO: para Gemini API
from google.genai.errors import APIError # Para manejar errores de la API de Gemini

# 1. Cargar variables de entorno (para la API Key)
load_dotenv()

# --- DEBUG DE CLAVES AL INICIO ---
loaded_gemini_key = os.getenv('GEMINI_API_KEY')
print(f"\n--- DEBUG KEY LOADED ---")
print(f"Clave Gemini cargada: {bool(loaded_gemini_key)}") 
if loaded_gemini_key:
    print(f"Primeros 15 caracteres Gemini: {loaded_gemini_key[:15]}...")
print("--------------------------\n")

# 2. Inicialización
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})

# Inicializar cliente de Gemini
try:
    if loaded_gemini_key:
        client = genai.Client(api_key=loaded_gemini_key)
    else:
        # Crea un cliente de marcador de posición si la clave no está disponible
        print("ADVERTENCIA: Clave Gemini no cargada. Las funciones de IA fallarán.")
        client = None 
except Exception as e:
    print(f"Error al inicializar el cliente Gemini: {e}")
    client = None

# Directorio temporal para guardar el archivo subido
UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/api/generate-summary', methods=['POST'])
def generate_summary():
    """Endpoint para recibir texto y generar un resumen con Gemini (GRATUITO)."""
    
    if not client:
        return jsonify({"error": "Error de configuración: Cliente Gemini no inicializado."}), 500
        
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No se encontró el campo 'text' en la petición."}), 400
            
        text_to_summarize = data['text']
        
        if len(text_to_summarize) < 10:
            return jsonify({"error": "El texto es demasiado corto para resumir."}), 400

        print(f"-> Generando resumen para {len(text_to_summarize)} caracteres con Gemini-2.5-Flash...")
        
        # 1. Preparar la solicitud de Gemini
        prompt = (
            "Eres un experto en análisis de contenido. Tu tarea es generar un resumen "
            "profesional y conciso de no más de 100 palabras del siguiente texto: "
            f"TEXTO: {text_to_summarize}"
        )
        
        # 2. Llamada a la API de Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        summary_text = response.text
        
    except APIError as e:
        print(f"Error en la API de Gemini (Resumen): {e}")
        # La API de Gemini devuelve un error si la clave es inválida o la cuota se excede
        return jsonify({"error": f"Fallo la generación del resumen con Gemini: {e}"}), 400
    except Exception as e:
        print(f"Error desconocido en el resumen: {e}")
        return jsonify({"error": f"Fallo la generación del resumen: {e}"}), 500
    
    # 3. Devolver el resultado
    return jsonify({
        "status": "success",
        "summary": summary_text
    })

@app.route('/api/transcribe-video', methods=['POST'])
def transcribe_video():
    """ENDPOINT SIMULADO: Transcripción (Mantiene la simulación)."""
    
    if 'video' not in request.files:
        return jsonify({"error": "No se encontró el archivo de vídeo."}), 400
    
    video_file = request.files['video']
    
    # SIMULACIÓN DE PROCESAMIENTO
    print(f"-> INICIO DE SIMULACIÓN: Archivo {video_file.filename} recibido.")
    
    # Guardar temporalmente
    filepath = os.path.join(UPLOAD_FOLDER, video_file.filename)
    try:
        video_file.save(filepath)
    except Exception as e:
        return jsonify({"error": f"Error al guardar el archivo: {e}"}), 500
    
    # Respuesta simulada
    transcription_text = "Esta es la transcripción SIMULADA. La transcripción real de audio a texto requiere una API de pago (como Speech-to-Text de Google Cloud o Whisper) o una configuración avanzada."
    
    # Limpieza
    if os.path.exists(filepath):
        os.remove(filepath)
        print(f"-> FIN DE SIMULACIÓN: Archivo temporal eliminado.")
        
    # Devolver el resultado
    return jsonify({
        "status": "success",
        "transcription": transcription_text
    })


if __name__ == '__main__':
    # Usamos un puerto diferente al de tu frontend (5000 es el estándar de Flask)
    print("Servidor Flask inicializado. Ejecutando en http://127.0.0.1:5000")
    app.run(debug=True, port=5000)