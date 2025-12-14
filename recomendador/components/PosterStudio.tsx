import React, { useState } from 'react';
import { generateMoviePoster, editMoviePoster } from '../services/gemini';
import { Wand2, X, Download, Edit2, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PosterStudioProps {
  initialPrompt?: string;
  onClose: () => void;
}

export const PosterStudio: React.FC<PosterStudioProps> = ({ initialPrompt = '', onClose }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setEditMode(false); // Reset edit mode on new generation
    const img = await generateMoviePoster(prompt);
    setGeneratedImage(img);
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!generatedImage || !editInstruction) return;
    setLoading(true);
    const img = await editMoviePoster(generatedImage, editInstruction);
    if (img) setGeneratedImage(img);
    setEditInstruction('');
    setEditMode(false);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-[#141420] border border-white/10 rounded-[20px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-[fadeUp_0.5s_ease_forwards]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f0f19]">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wand2 className="text-[#66fcf1]" />
              Estudio de Generación <span className="text-[#45a29e]">[AI]</span>
            </h2>
            <p className="text-[#b1b1b1] text-sm">Crea arte conceptual para tus películas con Gemini.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#b1b1b1] hover:text-[#66fcf1]">
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col md:flex-row gap-10 h-full">
            
            {/* Controls */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              {!generatedImage || (!editMode && generatedImage) ? (
                 <div className="space-y-4">
                    <label className="block text-sm font-semibold text-[#66fcf1]">
                      {generatedImage ? "Generar nueva versión" : "Prompt de Generación"}
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ej: Póster minimalista, película sci-fi, tonos neón, ciudad futurista..."
                      className="w-full h-40 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.2)] rounded-xl p-4 text-white focus:border-[#66fcf1] focus:ring-1 focus:ring-[#66fcf1] focus:outline-none resize-none"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !prompt}
                      className="w-full py-3 bg-gradient-to-br from-[#45a29e] to-[#66fcf1] text-[#0b0c10] rounded-[10px] font-bold shadow-[0_0_15px_rgba(102,252,241,0.3)] hover:scale-105 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                      {generatedImage ? "Regenerar" : "Generar Arte"}
                    </button>
                 </div>
              ) : null}

              {generatedImage && (
                <div className={`space-y-4 ${editMode ? 'block' : 'hidden md:block'}`}>
                  {!editMode ? (
                     <button
                        onClick={() => setEditMode(true)}
                        className="w-full py-3 bg-transparent border-2 border-[#66fcf1] text-[#66fcf1] rounded-[10px] font-bold hover:bg-[#66fcf1]/10 transition-all flex justify-center items-center gap-2"
                      >
                        <Edit2 size={18} />
                        Editar Resultado
                      </button>
                  ) : (
                    <div className="animate-[fadeIn_0.3s_ease_forwards] space-y-4 bg-[#1f1f2e] p-5 rounded-xl border border-white/5">
                      <label className="block text-sm font-semibold text-[#66fcf1]">
                        Instrucción de Edición
                      </label>
                      <input
                        type="text"
                        value={editInstruction}
                        onChange={(e) => setEditInstruction(e.target.value)}
                        placeholder="Ej: Cambiar fondo a rojo..."
                        className="w-full bg-[#141420] border border-white/10 rounded-lg p-3 text-white focus:border-[#66fcf1] focus:outline-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditMode(false)}
                          className="flex-1 py-2 bg-transparent border border-white/20 hover:bg-white/5 text-white rounded-lg text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleEdit}
                          disabled={loading || !editInstruction}
                          className="flex-1 py-2 bg-[#66fcf1] text-[#0b0c10] rounded-lg text-sm font-bold hover:bg-[#45a29e] transition-colors flex justify-center items-center gap-2"
                        >
                          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="w-full md:w-2/3 flex items-center justify-center bg-[#0f0f19] rounded-2xl border border-white/5 p-4 min-h-[400px] relative shadow-inner">
              {loading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-[#66fcf1] animate-spin mx-auto" />
                  <p className="text-[#66fcf1] animate-pulse font-medium">Renderizando píxeles...</p>
                </div>
              ) : generatedImage ? (
                <div className="relative group w-full h-full flex items-center justify-center">
                  <img 
                    src={generatedImage} 
                    alt="Generated Poster" 
                    className="max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  />
                  <a 
                    href={generatedImage} 
                    download="poster-ai.png"
                    className="absolute bottom-6 right-6 bg-[#0b0c10]/80 backdrop-blur-md hover:bg-[#66fcf1] hover:text-[#0b0c10] text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    title="Descargar Alta Resolución"
                  >
                    <Download size={24} />
                  </a>
                </div>
              ) : (
                <div className="text-center text-[#45a29e]/30 space-y-3">
                  <ImageIcon className="w-20 h-20 mx-auto" />
                  <p className="text-lg">El lienzo está vacío</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};