
import React, { useState, useEffect } from 'react';
import { getIsMobileViewport } from '../utils/mobile';

const Hero: React.FC = () => {
  const [stage, setStage] = useState<'title' | 'full'>('title');
  const [showContent, setShowContent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isMobile = getIsMobileViewport();
    // Secuencia rápida en móvil para disponibilidad inmediata; en escritorio idéntica (1500ms)
    const timer = setTimeout(() => {
      setStage('full');
      setShowContent(true);
    }, isMobile ? 380 : 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section id="hero" className="mobile-hero relative h-screen flex flex-col justify-center items-center overflow-hidden bg-white dark:bg-black px-5 sm:p-6 transition-colors duration-500">
      {/* Cinematic Letterbox effect - adapt to theme */}
      <div className={`absolute top-0 left-0 w-full bg-black z-50 transition-all duration-500 md:duration-1000 ease-in-out ${stage === 'full' ? 'h-0' : 'h-[8dvh] md:h-[12vh]'}`}></div>
      <div className={`absolute bottom-0 left-0 w-full bg-black z-50 transition-all duration-500 md:duration-1000 ease-in-out ${stage === 'full' ? 'h-0' : 'h-[8dvh] md:h-[12vh]'}`}></div>

      <div className={`relative z-10 flex flex-col items-center justify-center text-center w-full max-w-7xl transition-opacity duration-500 md:duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Stage: CINEPROOD */}
        <div className="w-full transition-all duration-500 md:duration-[1.5s] ease-out flex flex-col items-center opacity-100 scale-100">
          <h1 className={`mobile-hero-title text-[11vw] md:text-[8vw] lg:text-[7vw] font-black leading-none tracking-[-0.05em] uppercase select-none transition-all duration-500 md:duration-[2s] max-w-full ${stage === 'full' ? 'tracking-normal' : 'tracking-[0.02em]'}`}>
            CINEPROOD
          </h1>
          
          <div className={`w-full flex flex-col items-center transition-all duration-500 md:duration-1000 md:delay-500 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 md:translate-y-10'}`}>
            <p className="hidden md:block mt-5 md:mt-8 text-sm md:text-base max-w-xs sm:max-w-sm opacity-65 md:opacity-60 font-light leading-relaxed px-2">
              Productora híbrida a tu alcance.
            </p>

            <div className="mt-8 md:mt-12 w-full md:w-auto flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 sm:gap-6 md:gap-8">
              {/* Liquid Glass: Ver Proyectos */}
              <a 
                href="#proyectos" 
                className="mobile-hero-cta group relative overflow-hidden px-9 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.45em] backdrop-blur-xl bg-gradient-to-b from-red-500/25 via-red-600/10 to-red-800/25 dark:from-red-500/20 dark:via-red-600/[0.08] dark:to-red-900/30 border border-red-500/50 hover:border-red-400/80 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-2px_4px_rgba(153,27,27,0.4),0_12px_36px_rgba(220,38,38,0.25)] hover:shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.85),inset_0_-2px_6px_rgba(153,27,27,0.6),0_18px_45px_rgba(220,38,38,0.45)] transition-all duration-300 md:duration-500 md:hover:scale-[1.04] active:scale-[0.97] flex items-center justify-center whitespace-nowrap before:absolute before:inset-x-3 before:top-1 before:h-[35%] before:rounded-full before:bg-gradient-to-b before:from-white/50 before:to-transparent before:pointer-events-none"
              >
                {/* Ambient liquid sheen ray */}
                <span className="hidden md:block absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none animate-liquid-glass"></span>

                {/* Molten liquid fill on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-red-600/90 to-red-500 translate-y-full md:group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-full"></div>

                <span className="relative z-10 font-bold text-red-600 dark:text-red-400 md:group-hover:text-white transition-colors duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                  [ VER PROYECTOS ]
                </span>
              </a>

              {/* Liquid Glass: Xenia */}
              <a 
                href="#xenia" 
                className="mobile-hero-cta group relative overflow-hidden px-9 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.45em] backdrop-blur-xl bg-gradient-to-b from-white/40 via-white/10 to-white/20 dark:from-white/[0.14] dark:via-white/[0.03] dark:to-white/[0.08] border border-black/15 dark:border-white/25 hover:border-black/30 dark:hover:border-white/45 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),inset_0_-2px_4px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.35),inset_0_-2px_5px_rgba(0,0,0,0.65),0_14px_36px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.2),0_16px_40px_rgba(0,0,0,0.14)] dark:hover:shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.5),inset_0_-2px_6px_rgba(0,0,0,0.75),0_18px_44px_rgba(0,0,0,0.7)] transition-all duration-300 md:duration-500 md:hover:scale-[1.04] active:scale-[0.97] flex items-center justify-center whitespace-nowrap before:absolute before:inset-x-3 before:top-1 before:h-[35%] before:rounded-full before:bg-gradient-to-b before:from-white/50 dark:before:from-white/30 before:to-transparent before:pointer-events-none"
              >
                {/* Ambient liquid sheen ray */}
                <span className="hidden md:block absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent pointer-events-none animate-liquid-glass"></span>

                <span className="relative z-10 font-bold opacity-80 md:group-hover:opacity-100 md:group-hover:text-red-600 md:dark:group-hover:text-red-400 transition-all duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  ENTRAR EN XENIA
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
