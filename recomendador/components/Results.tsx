import React from 'react';
import { Movie } from '../types';
import { Star, RotateCcw } from 'lucide-react';
// Se ha eliminado la importación de generateMoviePoster, Loader2 y Film

interface ResultsProps {
  movies: Movie[];
  onReset: () => void;
}

// Sub-component for individual movie card (simplificado, sin lógica de imagen)
const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  // Se ha eliminado useState y useEffect ya que no hay imagen para cargar.

  return (
    // Se han ajustado las clases para que ocupe todo el ancho sin la columna de la imagen.
    <div className="bg-[#141420]/55 backdrop-blur-[14px] rounded-[18px] overflow-hidden border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(102,252,241,0.1)] transition-all duration-300 group flex flex-col h-full">
      
      {/* Contenido de la película (ahora ocupa todo el ancho) */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-2xl font-bold text-white group-hover:text-[#66fcf1] transition-colors leading-tight">
              {movie.title}
            </h3>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-sm text-[#45a29e] italic mt-1">{movie.originalTitle}</p>
            )}
          </div>
          <span className="bg-[#141420] text-[#66fcf1] text-xs font-bold px-3 py-1 rounded border border-[#66fcf1]/30 ml-2 whitespace-nowrap">
            {movie.year}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-[#b1b1b1]">
          <span className="px-3 py-1 rounded-full bg-[#45a29e]/10 text-[#66fcf1] border border-[#45a29e]/30">
            {movie.genre}
          </span>
          <span className="text-[#45a29e]">•</span>
          <span>{movie.director}</span>
        </div>

        <p className="text-[#e0e0e0] mb-4 leading-relaxed text-sm flex-grow">
          {movie.description}
        </p>

        <div className="bg-[#66fcf1]/5 border border-[#66fcf1]/20 rounded-xl p-3">
          <p className="text-xs sm:text-sm text-[#66fcf1] flex items-start gap-2">
            <Star className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#66fcf1] fill-[#66fcf1]" />
            <span className="opacity-90">{movie.reason}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Results: React.FC<ResultsProps> = ({ movies, onReset }) => {
  return (
    <div className="w-full max-w-7xl mx-auto pb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#66fcf1] mb-2">Cartelera Personalizada</h2>
        {/* Se ha eliminado la referencia a la generación de pósteres por IA */}
        <p className="text-[#c5c6c7]">Selección optimizada para tu perfil.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {movies.map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-3 rounded-[10px] bg-gradient-to-br from-[#45a29e] to-[#66fcf1] text-[#0b0c10] font-bold shadow-[0_0_15px_rgba(102,252,241,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(102,252,241,0.5)] transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Reiniciar Análisis
        </button>
      </div>
    </div>
  );
};