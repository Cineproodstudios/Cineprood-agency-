
import React, { useEffect, useRef, useState } from 'react';

const panels = [
  {
    num: "01",
    title: "TRADICIONAL",
    desc: "Rodaje real con acabado cinematográfico."
  },
  {
    num: "02",
    title: "IA",
    desc: "Creatividad rápida con estética premium."
  },
  {
    num: "03",
    title: "HÍBRIDO",
    desc: "Lo mejor de ambos mundos, optimizado."
  }
];

const Modos: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    const handleScroll = () => {
      if (!containerRef.current || mediaQuery.matches) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const start = rect.top;
      const height = rect.height - window.innerHeight;
      
      const progress = Math.max(0, Math.min(1, -start / height));
      requestAnimationFrame(() => setScrollProgress(progress));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  if (isReducedMotion) {
    return (
      <section id="modos" className="py-28 px-8 md:px-24 bg-white dark:bg-black transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-36">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-16">MODOS DE PRODUCCIÓN</h2>
          {panels.map((p, i) => (
            <div key={i} className="relative py-16">
              <span className="text-[14vw] font-black absolute -top-8 -left-8 opacity-[0.04] dark:opacity-[0.04] select-none">{p.num}</span>
              <h3 className="text-4xl md:text-6xl font-black relative z-10">{p.title}</h3>
              <p className="text-base md:text-lg opacity-50 mt-3">{p.desc}</p>
            </div>
          ))}
          <div className="pt-24 text-center">
            <h3 className="text-xl md:text-3xl font-black uppercase opacity-80 leading-tight">
              ESCOGE EL MÁS ADECUADO<br/>PARA TU PRESUPUESTO.
            </h3>
          </div>
        </div>
      </section>
    );
  }

  const getSnapTranslation = (p: number) => {
    const totalItems = 4;
    const sectionWidth = 1 / totalItems;
    
    // Handle the edge case where p is exactly 1 or very close
    if (p >= 0.99) return (totalItems - 1) * 100;

    const currentItem = Math.floor(p / sectionWidth);
    const progressInItem = (p % sectionWidth) / sectionWidth;
    const transitionThreshold = 0.25;
    let itemOffset = 0;
    
    if (progressInItem > (1 - transitionThreshold)) {
        // Only transition if we are NOT on the last item
        if (currentItem < totalItems - 1) {
            const t = (progressInItem - (1 - transitionThreshold)) / transitionThreshold;
            itemOffset = t * t * (3 - 2 * t);
        }
    }
    
    return (currentItem + itemOffset) * 100;
  };

  const xTranslation = getSnapTranslation(scrollProgress);
  const finalPhaseProgress = Math.max(0, (scrollProgress - 0.8) / 0.2);

  return (
    <section 
      ref={containerRef} 
      id="modos" 
      className="relative h-[400vh] bg-white dark:bg-black transition-colors duration-500"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <div 
          className="flex will-change-transform"
          style={{ transform: `translateX(-${xTranslation}vw)`, transition: 'transform 0.1s linear' }}
        >
          {panels.map((p, i) => {
            const sectorSize = 0.25;
            const sectorStart = i * sectorSize;
            const isActive = scrollProgress >= sectorStart && scrollProgress < (i + 1) * sectorSize;

            return (
              <div 
                key={i} 
                className="min-w-[100vw] h-screen flex flex-col items-center justify-center relative px-8 overflow-hidden"
              >
                <div 
                  className="absolute text-[30vw] md:text-[22vw] font-black text-black dark:text-white opacity-[0.03] select-none pointer-events-none transition-transform duration-1000 ease-out"
                  style={{ 
                    transform: `translateX(${(scrollProgress - (sectorStart + 0.125)) * 200}px)`,
                    left: '10%'
                  }}
                >
                  {p.num}
                </div>

                <div className="relative z-10 text-center flex flex-col items-center max-w-4xl">
                  <h3 
                    className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase transition-all duration-700 ease-out ${isActive ? 'scale-[1.02] opacity-100' : 'scale-100 opacity-20'}`}
                  >
                    {p.title}
                  </h3>
                  
                  <div className="mt-4 w-full flex flex-col items-center">
                    <p 
                      className={`text-sm md:text-lg lg:text-xl font-light uppercase tracking-[0.2em] transition-all duration-700 ${isActive ? 'opacity-80 translate-y-0 text-red-600 font-semibold' : 'opacity-0 translate-y-4'}`}
                    >
                      {p.desc}
                    </p>
                    <div 
                      className={`h-[2px] bg-red-600 transition-all duration-700 ease-in-out mt-6 ${isActive ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="min-w-[100vw] h-screen flex items-center justify-center p-8">
            <div 
              className="text-center transition-all duration-1000 ease-out"
              style={{ 
                opacity: finalPhaseProgress,
                transform: `scale(${0.92 + (finalPhaseProgress * 0.08)})`
              }}
            >
              <h3 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase max-w-4xl leading-tight tracking-tighter">
                ESCOGE EL MÁS ADECUADO<br/>PARA TU PRESUPUESTO.
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Modos;
