import React from 'react';
import XeniaChat from './XeniaChat';

interface XeniaExperienceProps {
  isActive: boolean;
  opacity?: number;
  onExit?: () => void;
}

export const XeniaExperience: React.FC<XeniaExperienceProps> = ({ isActive, opacity = 1, onExit }) => {
  return (
    <div 
      className="relative w-full h-[100dvh] flex flex-col justify-between py-5 md:py-7 px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden bg-white/98 dark:bg-black/98 text-black dark:text-white transition-colors duration-700"
      style={{ opacity }}
    >
      {/* Subtle Optical Caustics Ambient Background */}
      <div 
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 dark:opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(255, 0, 80, 0.15) 0%, rgba(180, 50, 255, 0.08) 50%, transparent 70%)'
        }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-20 dark:opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(0, 220, 255, 0.12) 0%, rgba(255, 230, 80, 0.06) 50%, transparent 70%)'
        }}
      />

      {/* Discrete Brand Header with Exit Option */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pt-1 pb-3.5 border-b border-black/5 dark:border-white/5 shrink-0 px-2">
        <div className="flex items-baseline gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">
            XENIA
          </h2>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase opacity-40 font-light">
            SISTEMA CREATIVO IA
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-black/60 dark:text-white/60 hover:text-red-600 transition-colors py-1.5 px-3.5 rounded-full border border-black/10 dark:border-white/10 hover:border-red-600/40 active:scale-95 cursor-pointer bg-black/[0.02] dark:bg-white/[0.02]"
              title="Salir de Xenia y regresar a la web"
            >
              <span>← Volver a la web</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] uppercase opacity-35">
            <span>CINEPROOD</span>
            <span>/</span>
            <span>PRODUCCIÓN HÍBRIDA</span>
          </div>
        </div>
      </header>

      {/* Main Conversation Center */}
      <main className="flex-1 w-full flex flex-col justify-center min-h-0 py-2">
        <XeniaChat isActive={isActive} onExit={onExit} />
      </main>

      {/* Footer line */}
      <footer className="w-full max-w-5xl mx-auto pt-2 pb-1 shrink-0 flex items-center justify-between text-[9px] font-mono tracking-[0.3em] uppercase opacity-30 px-2">
        <span>CINEPROOD STUDIO</span>
        <span>TRADICIONAL • IA • HÍBRIDO</span>
      </footer>
    </div>
  );
};

export default XeniaExperience;
