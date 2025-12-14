import React, { useState } from 'react';
import { QuizState } from '../types';
import { ArrowRight, Film, Clock, Users, Smile, Sparkles } from 'lucide-react';

interface QuizProps {
  onComplete: (data: QuizState) => void;
}

const GENRES = ["Acción", "Comedia", "Drama", "Ciencia Ficción", "Terror", "Romance", "Documental", "Thriller"];
const MOODS = ["Alegre", "Melancólico", "Tenso", "Relajado", "Inspirador", "Reflexivo"];
const ERAS = ["Clásicos (Pre-1980)", "80s y 90s", "2000-2015", "Recientes (2016+)", "Cualquiera"];
const COMPANIES = ["Solo", "En pareja", "Con amigos", "En familia"];

export const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuizState>({
    genre: [],
    mood: "",
    era: "",
    company: "",
    extra: ""
  });

  const nextStep = () => setStep(p => p + 1);
  const prevStep = () => setStep(p => Math.max(0, p - 1));

  const toggleGenre = (g: string) => {
    setData(prev => {
      const exists = prev.genre.includes(g);
      return {
        ...prev,
        genre: exists ? prev.genre.filter(i => i !== g) : [...prev.genre, g]
      };
    });
  };

  const isStepValid = () => {
    if (step === 0) return data.genre.length > 0;
    if (step === 1) return !!data.mood;
    if (step === 2) return !!data.era;
    if (step === 3) return !!data.company;
    return true;
  };

  // Common button style for options
  const getOptionClass = (isSelected: boolean) => `
    p-4 rounded-xl border text-left transition-all duration-200
    ${isSelected 
      ? "bg-[#66fcf1]/10 border-[#66fcf1] text-[#66fcf1] shadow-[0_0_15px_rgba(102,252,241,0.2)] transform -translate-y-1" 
      : "bg-[#141420]/30 border-white/10 text-[#c5c6c7] hover:bg-[#141420]/60 hover:border-[#45a29e] hover:text-white"
    }
  `;

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-[#141420]/55 backdrop-blur-[14px] rounded-[18px] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] min-h-[500px] flex flex-col relative animate-[fadeUp_0.6s_ease_forwards]">
      
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-[#66fcf1]">Paso {step + 1} / 5</h2>
        <div className="h-2 w-32 bg-[#101018] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#45a29e] to-[#66fcf1] transition-all duration-300" 
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="animate-[fadeIn_0.5s_ease_forwards]">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <Film className="w-6 h-6 text-[#66fcf1]" />
              Selecciona Géneros
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={getOptionClass(data.genre.includes(g))}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#b1b1b1]">Puedes seleccionar múltiples opciones.</p>
          </div>
        )}

        {step === 1 && (
          <div className="animate-[fadeIn_0.5s_ease_forwards]">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <Smile className="w-6 h-6 text-[#66fcf1]" />
              Estado de Ánimo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setData({ ...data, mood: m })}
                  className={getOptionClass(data.mood === m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-[fadeIn_0.5s_ease_forwards]">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <Clock className="w-6 h-6 text-[#66fcf1]" />
              Preferencia Temporal
            </h3>
            <div className="space-y-3">
              {ERAS.map(e => (
                <button
                  key={e}
                  onClick={() => setData({ ...data, era: e })}
                  className={`w-full ${getOptionClass(data.era === e)}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-[fadeIn_0.5s_ease_forwards]">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <Users className="w-6 h-6 text-[#66fcf1]" />
              Contexto de Visualización
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {COMPANIES.map(c => (
                <button
                  key={c}
                  onClick={() => setData({ ...data, company: c })}
                  className={`text-center ${getOptionClass(data.company === c)}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-[fadeIn_0.5s_ease_forwards]">
             <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <Sparkles className="w-6 h-6 text-[#66fcf1]" />
              Parámetros Adicionales
            </h3>
            <p className="mb-4 text-[#b1b1b1]">
              Especifica actores, directores o elementos específicos a incluir/evitar.
            </p>
            <textarea
              value={data.extra}
              onChange={(e) => setData({ ...data, extra: e.target.value })}
              placeholder="Ej: Quiero algo con plot twist, evitar terror gore..."
              className="w-full p-4 h-40 bg-[rgba(0,0,0,0.1)] border border-[rgba(255,255,255,0.2)] rounded-xl text-white focus:border-[#66fcf1] focus:ring-1 focus:ring-[#66fcf1] focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className={`px-6 py-2 rounded-lg text-[#b1b1b1] hover:text-white disabled:opacity-30 transition-colors`}
        >
          Atrás
        </button>
        <button
          onClick={step === 4 ? () => onComplete(data) : nextStep}
          disabled={!isStepValid()}
          className="bg-gradient-to-br from-[#45a29e] to-[#66fcf1] text-[#0b0c10] px-8 py-3 rounded-[10px] font-bold shadow-[0_0_15px_rgba(102,252,241,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(102,252,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center gap-2"
        >
          {step === 4 ? "Generar Resultados" : "Siguiente"}
          {step !== 4 && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};