import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { Movie, QuizState } from "../types";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY is automatically injected
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Movie Recommendations ---

const movieSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Título de la película en español" },
    originalTitle: { type: Type.STRING, description: "Título original" },
    year: { type: Type.STRING, description: "Año de lanzamiento" },
    director: { type: Type.STRING, description: "Director" },
    genre: { type: Type.STRING, description: "Género principal" },
    description: { type: Type.STRING, description: "Breve sinopsis en español (max 20 palabras)" },
    reason: { type: Type.STRING, description: "Por qué se recomienda esta película basada en los gustos del usuario" },
  },
  required: ["title", "year", "description", "reason", "genre", "director"],
};

export const getMovieRecommendations = async (preferences: QuizState): Promise<Movie[]> => {
  const prompt = `
    Actúa como un experto cinéfilo. Recomienda 4 películas basadas en las siguientes preferencias del usuario:
    - Géneros favoritos: ${preferences.genre.join(", ")}
    - Estado de ánimo actual: ${preferences.mood}
    - Época preferida: ${preferences.era}
    - Compañía: ${preferences.company}
    - Detalles extra: ${preferences.extra}

    Asegúrate de que sean recomendaciones de alta calidad y variadas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: movieSchema,
        },
        systemInstruction: "Eres un asistente de cine útil y experto. Responde siempre en formato JSON válido.",
      },
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as Movie[];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};

// --- Chatbot ---

let chatSession: Chat | null = null;

export const initChatSession = () => {
  chatSession = ai.chats.create({
    model: "gemini-3-pro-preview", // Use Pro for better conversation
    config: {
      systemInstruction: "Eres un experto en cine amigable. Ayuda al usuario a decidir qué ver o discute sobre películas. Sé conciso.",
    },
  });
};

export const sendChatMessage = async (message: string): Promise<string> => {
  if (!chatSession) initChatSession();
  try {
    const response = await chatSession!.sendMessage({ message });
    return response.text || "Lo siento, no pude procesar eso.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Hubo un error al conectar con el chat.";
  }
};

// --- Image Generation ---

export const generateMoviePoster = async (titleOrPrompt: string, description?: string): Promise<string | null> => {
  try {
    let prompt = titleOrPrompt;
    if (description) {
        // More specific prompt to try and look like the "Official" poster
        prompt = `Official movie poster style for the film "${titleOrPrompt}" (${description}). High quality, cinematic lighting, photorealistic, movie title typography, vertical aspect ratio composition.`;
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: prompt,
      config: {
         // flash-image doesn't support aspect ratio param in config yet via this SDK method sometimes, 
         // so we rely on prompt engineering or default square if 2.5.
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null; // Return null to show a fallback or placeholder
  }
};

export const editMoviePoster = async (base64Image: string, instruction: string): Promise<string | null> => {
  try {
    const mimeTypeMatch = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!mimeTypeMatch) {
       console.error("Invalid base64 image format");
       return null;
    }
    const mimeType = mimeTypeMatch[1];
    const data = mimeTypeMatch[2];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data,
            },
          },
          {
            text: instruction,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Image editing error:", error);
    return null;
  }
};