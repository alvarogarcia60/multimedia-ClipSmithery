import React from 'react';
import { Movie } from '../types.ts';
import { Star, RotateCcw, ExternalLink } from 'lucide-react';

interface ResultsProps {
  movies: Movie[];
  onReset: () => void;
}

// Sub-component for individual movie card
const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  // Construct a smart search URL for IMDb
   const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.year} trailer sub español`)}`;


  return (
    <div className="bg-[#141420]/55 backdrop-blur-[14px] rounded-[18px] overflow-hidden border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(102,252,241,0.1)] transition-all duration-300 group flex flex-col h-full relative">
      
      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-[#f5c518] underline-offset-4 decoration-2">
              <h3 className="text-2xl font-bold text-white group-hover:text-[#f5c518] transition-colors leading-tight">
                {movie.title}
              </h3>
            </a>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-sm text-[#45a29e] italic mt-1">{movie.originalTitle}</p>
            )}
          </div>
          <span className="bg-[#141420] text-[#66fcf1] text-xs font-bold px-3 py-1 rounded border border-[#66fcf1]/30 whitespace-nowrap">
            {movie.year}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-[#b1b1b1]">
          <span className="px-3 py-1 rounded-full bg-[#45a29e]/10 text-[#66fcf1] border border-[#45a29e]/30">
            {movie.genre}
          </span>
          <span className="text-[#45a29e]">•</span>
          <span>{movie.director}</span>
        </div>

        <p className="text-[#e0e0e0] mb-6 leading-relaxed text-sm flex-grow">
          {movie.description}
        </p>

        <div className="bg-[#66fcf1]/5 border border-[#66fcf1]/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-[#66fcf1] flex items-start gap-2">
            <Star className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#66fcf1] fill-[#66fcf1]" />
            <span className="opacity-90">{movie.reason}</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2 flex justify-end">
          <a 
            href={trailerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#b1b1b1] hover:text-[#f5c518] flex items-center gap-1 transition-colors uppercase tracking-wider group/link"
          >
            Ver Trailer <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
          </a>
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
        <p className="text-[#c5c6c7]">Selección optimizada por Gemini 2.5</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
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