
import React, { useEffect, useRef, useState } from 'react';

const Manifiesto: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    const handleScroll = () => {
      if (!containerRef.current || mediaQuery.matches) return;
      const rect = containerRef.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      requestAnimationFrame(() => setProgress(p));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const plateau = 0.8;
  const effectiveProgress = Math.min(1, progress / plateau);
  const scale = 0.75 + (effectiveProgress * 0.33);
  const blur = 10 * (1 - effectiveProgress);
  const opacity = 0.7 + (effectiveProgress * 0.3);

  if (isReducedMotion) {
    return (
      <section id="manifiesto" className="min-h-screen bg-white dark:bg-black transition-colors duration-500 flex items-center justify-center px-8">
        <div className="text-center max-w-5xl">
          <h2 className="text-4xl md:text-7xl font-black leading-tight uppercase tracking-tighter">
            HECHO PARA EL ENTORNO DIGITAL.<br/>
            <span className="opacity-60 font-light">CON MENTALIDAD DE CINE.</span>
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef} 
      id="manifiesto" 
      className="relative h-[220vh] bg-white dark:bg-black transition-colors duration-500"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Cinematic Grain Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.02] mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div 
          className="text-center transition-all duration-100 ease-out will-change-[transform,opacity,filter]"
          style={{
            transform: `scale(${scale})`,
            opacity: opacity,
            filter: `blur(${blur}px)`
          }}
        >
          <p className="text-[10px] font-mono opacity-20 tracking-[1em] uppercase mb-12">
            Manifiesto 01
          </p>
          
          <h2 className="text-4xl md:text-7xl lg:text-8xl font-black leading-[0.95] uppercase tracking-tighter max-w-6xl mx-auto px-6">
            HECHO PARA EL ENTORNO DIGITAL.<br/>
            <span className="inline-block mt-4">CON MENTALIDAD DE CINE.</span>
          </h2>

          <div 
            className="mt-16 flex justify-center gap-4 md:gap-8 opacity-20"
            style={{ transform: `translateY(${(1 - effectiveProgress) * 20}px)` }}
          >
            {['CALIDAD', 'NARRATIVA', 'ESTÉTICA', 'TECNOLOGÍA'].map((word, i) => (
              <span key={i} className="text-[9px] md:text-[11px] font-mono tracking-widest uppercase">
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-black/5 dark:bg-white/5">
          <div 
            className="w-full bg-black/40 dark:bg-white/40 transition-all duration-100 ease-out"
            style={{ height: `${progress * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default Manifiesto;
