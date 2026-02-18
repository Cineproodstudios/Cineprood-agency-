
import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const [stage, setStage] = useState<'welcome' | 'title' | 'full'>('welcome');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Secuencia de tiempos cinematográfica
    const timer1 = setTimeout(() => setStage('title'), 2000);
    const timer2 = setTimeout(() => {
      setStage('full');
      setShowContent(true);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <section id="hero" className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-white dark:bg-black p-6 transition-colors duration-500">
      {/* Cinematic Letterbox effect - adapt to theme */}
      <div className={`absolute top-0 left-0 w-full bg-black z-50 transition-all duration-1000 ease-in-out ${stage === 'full' ? 'h-0' : 'h-[12vh]'}`}></div>
      <div className={`absolute bottom-0 left-0 w-full bg-black z-50 transition-all duration-1000 ease-in-out ${stage === 'full' ? 'h-0' : 'h-[12vh]'}`}></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-7xl">
        
        {/* Stage 1: Welcome */}
        <div className={`absolute transition-all duration-1000 ease-in-out ${stage === 'welcome' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl pointer-events-none'}`}>
          <p className="text-xs md:text-sm font-mono tracking-[1.2em] uppercase opacity-50">
            Bienvenido a
          </p>
        </div>

        {/* Stage 2: CINEPROOD */}
        <div className={`transition-all duration-[1.5s] ease-out flex flex-col items-center ${stage !== 'welcome' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-md'}`}>
          <h1 className={`text-[18vw] md:text-[14vw] font-black leading-none tracking-[-0.08em] uppercase select-none transition-all duration-[2s] ${stage === 'full' ? 'tracking-normal' : 'tracking-[0.02em]'}`}>
            CINEPROOD
          </h1>
          
          <div className={`flex flex-col items-center transition-all duration-1000 delay-500 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mt-8 flex flex-col items-center gap-6">
              <p className="text-[10px] md:text-xs font-mono tracking-[0.6em] uppercase opacity-30">
                TRADICIONAL / IA / HÍBRIDO
              </p>
              <p className="text-sm md:text-base max-w-sm opacity-40 font-light leading-relaxed">
                Producción cinematográfica para artistas emergentes y marcas con ambición.
              </p>
            </div>

            <div className="mt-12 flex gap-8">
              <a 
                href="#proyectos" 
                className="group relative overflow-hidden px-8 py-4 text-[10px] font-black uppercase tracking-[0.5em] border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 transition-all"
              >
                <span className="relative z-10">[ VER PROYECTOS ]</span>
                <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="absolute inset-0 z-20 flex items-center justify-center text-white dark:text-black opacity-0 group-hover:opacity-100 transition-opacity duration-500">[ VER PROYECTOS ]</span>
              </a>
              <a 
                href="#contacto" 
                className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity flex items-center"
              >
                CONTACTO
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
