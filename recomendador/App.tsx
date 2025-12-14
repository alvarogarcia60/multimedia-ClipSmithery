import React, { useState } from 'react';
import { AppView, QuizState, Movie } from './types';
import { getMovieRecommendations } from './services/gemini';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { ChatBot } from './components/ChatBot';
import { Loader } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<AppView>('intro');
  const [movies, setMovies] = useState<Movie[]>([]);
  
  // Handlers
  const handleStart = () => setView('quiz');
  
  const handleQuizComplete = async (data: QuizState) => {
    setView('loading');
    const results = await getMovieRecommendations(data);
    setMovies(results);
    setView('results');
  };

  const handleReset = () => {
    setMovies([]);
    setView('intro');
  };

  return (
    <div className="min-h-screen bg-[#06060d] text-white flex flex-col font-sans selection:bg-[#66fcf1] selection:text-[#0b0c10]">
      
      {/* Navbar Style from Clip Smithery */}
      <nav className="w-full px-12 py-5 bg-[#0f0f19]/85 backdrop-blur-[15px] border-b border-white/5 fixed top-0 left-0 z-40 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => setView('intro')}
        >
          <h1 className="text-2xl font-bold text-[#66fcf1] tracking-tight group-hover:brightness-110 transition-all">
            CineMágico <span className="text-[#45a29e]">[AI]</span>
          </h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 w-full max-w-[1100px] mx-auto mt-32 mb-12">
        
        {/* Intro View */}
        {view === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-[fadeIn_0.9s_ease_forwards]">
            <div className="max-w-3xl space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Tu Estudio Personal de <br/>
                <span className="text-[#66fcf1]">Recomendación de Cine</span>
              </h2>
              <p className="text-xl text-[#c5c6c7] max-w-2xl mx-auto leading-relaxed">
                Herramienta de análisis semántico para descubrir contenido audiovisual adaptado a tu perfil psicométrico actual.
              </p>
              
              <div className="pt-8 flex justify-center">
                <button
                  onClick={handleStart}
                  className="bg-gradient-to-br from-[#45a29e] to-[#66fcf1] text-[#0b0c10] text-lg px-8 py-3 rounded-[10px] font-bold shadow-[0_0_15px_rgba(102,252,241,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(102,252,241,0.6)]"
                >
                  Iniciar Análisis de Perfil
                </button>
              </div>

              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { title: "Filtrado Neuronal", desc: "Algoritmos de Gemini 2.5 para matching preciso." },
                  { title: "Generación Visual", desc: "La IA crea un póster único para cada recomendación." },
                  { title: "Asistente Virtual", desc: "Chatbot integrado para debate cinematográfico." }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-[#141420]/55 backdrop-blur-[14px] rounded-[18px] border border-white/10 hover:-translate-y-1 transition-transform duration-300">
                    <h3 className="font-bold text-[#66fcf1] mb-2 text-lg">{item.title}</h3>
                    <p className="text-[#b1b1b1] text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz View */}
        {view === 'quiz' && (
          <div className="flex-1 flex items-center justify-center">
            <Quiz onComplete={handleQuizComplete} />
          </div>
        )}

        {/* Loading View */}
        {view === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
            <Loader className="w-16 h-16 text-[#66fcf1] animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Procesando Datos...</h3>
            <p className="text-[#b1b1b1]">Consultando bases de datos con Gemini AI</p>
            {/* Custom progress bar style */}
            <div className="w-64 h-2 bg-[#101018] rounded-full mt-6 overflow-hidden">
               <div className="h-full bg-gradient-to-r from-[#45a29e] to-[#66fcf1] animate-[width_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
            </div>
          </div>
        )}

        {/* Results View */}
        {view === 'results' && (
          <div className="animate-[fadeIn_0.9s_ease_forwards]">
            <Results 
              movies={movies} 
              onReset={handleReset} 
            />
          </div>
        )}

      </main>

      {/* Global Components */}
      <ChatBot />
      
      {/* Footer - Minimalist */}
      <footer className="p-6 text-center text-[#45a29e] text-sm opacity-60">
        <p>© 2025 Clip Smithery AI Tools Suite.</p>
      </footer>
    </div>
  );
}