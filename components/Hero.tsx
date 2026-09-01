
import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const [stage, setStage] = useState<'title' | 'full'>('title');
  const [showContent, setShowContent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Secuencia de tiempos cinematográfica
    const timer = setTimeout(() => {
      setStage('full');
      setShowContent(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section id="hero" className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-white dark:bg-black p-6 transition-colors duration-500">
      {/* Cinematic Letterbox effect - adapt to theme */}
      <div className={`absolute top-0 left-0 w-full bg-black z-50 transition-all duration-1000 ease-in-out ${stage === 'full' ? 'h-0' : 'h-[12vh]'}`}></div>
      <div className={`absolute bottom-0 left-0 w-full bg-black z-50 transition-all duration-1000 ease-in-out ${stage === 'full' ? 'h-0' : 'h-[12vh]'}`}></div>

      <div className={`relative z-10 flex flex-col items-center justify-center text-center w-full max-w-7xl transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Stage: CINEPROOD */}
        <div className={`transition-all duration-[1.5s] ease-out flex flex-col items-center opacity-100 scale-100`}>
          <h1 className={`text-[11vw] md:text-[8vw] lg:text-[7vw] font-black leading-none tracking-[-0.05em] uppercase select-none transition-all duration-[2s] ${stage === 'full' ? 'tracking-normal' : 'tracking-[0.02em]'}`}>
            CINEPROOD
          </h1>
          
          <div className={`flex flex-col items-center transition-all duration-1000 delay-500 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-red-600/30 bg-red-600/5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <p className="text-[10px] md:text-xs font-mono tracking-[0.4em] uppercase text-black dark:text-white font-semibold">
                  TRADICIONAL <span className="text-red-600">/</span> IA <span className="text-red-600">/</span> HÍBRIDO
                </p>
              </div>
              <p className="text-sm md:text-base max-w-sm opacity-60 font-light leading-relaxed">
                Producción cinematográfica para artistas emergentes y marcas con ambición.
              </p>
            </div>

            <div className="mt-12 flex gap-8">
              <a 
                href="#proyectos" 
                className="group relative overflow-hidden px-8 py-4 text-[10px] font-black uppercase tracking-[0.5em] border border-red-600/40 hover:border-red-600 transition-all"
              >
                <span className="relative z-10 font-bold group-hover:text-white transition-colors">[ VER PROYECTOS ]</span>
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              </a>
              <a 
                href="#contacto" 
                className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.5em] opacity-60 hover:opacity-100 hover:text-red-600 transition-all flex items-center"
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
