
import React, { useEffect, useRef, useState } from 'react';

const narrativeBlocks = [
  {
    id: 1,
    text: "Mi interés por la fotografía comenzó en el colegio, en una asignatura que despertó algo que hasta entonces no sabía que tenía. Aquella primera cámara fue el inicio de una forma distinta de mirar el mundo."
  },
  {
    id: 2,
    text: "A partir de ahí todo fue práctica. Mucha práctica. Fotografías, errores, aprendizaje constante. No fue un camino rápido, pero sí continuo. Cada fallo era una mejora en construcción."
  },
  {
    id: 3,
    text: "Con el tiempo, la imagen dejó de ser solo técnica y se convirtió en narrativa. Esa evolución me llevó a estudiar Comunicación Audiovisual, donde los proyectos se transformaron en cortometrajes y la dirección empezó a tener intención."
  },
  {
    id: 4,
    text: "Siempre he creído que crecer significa adaptarse. Por eso decidí entender las nuevas tecnologías en lugar de evitarlas. La inteligencia artificial no sustituye el cine: lo amplía.\n\nCINEPROOD nace de esa mentalidad: tradición visual, narrativa cinematográfica y tecnología contemporánea trabajando juntas."
  }
];

const Origen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollDistance = rect.height - window.innerHeight;
      
      // Calculate progress (0 to 1) based on how much of the container has been scrolled past the top
      const p = Math.max(0, Math.min(1, -rect.top / scrollDistance));
      
      requestAnimationFrame(() => {
        setProgress(p);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getBlockStyles = (index: number) => {
    const totalBlocks = narrativeBlocks.length;
    const blockRange = 1 / totalBlocks;
    const start = index * blockRange;
    
    // localProgress goes from 0 to 1 within this block's range
    const localProgress = (progress - start) / blockRange;

    if (prefersReducedMotion) {
      const isActive = localProgress >= 0 && localProgress < 1;
      return { 
        opacity: isActive ? 1 : 0, 
        transform: 'scale(1)', 
        filter: 'blur(0px)',
        pointerEvents: isActive ? 'auto' : 'none' as any,
        transition: 'opacity 0.3s ease-in-out'
      };
    }

    let opacity = 0;
    let scale = 0.95;
    let blur = 6;

    // Animation logic:
    // 0% - 30%: Fade in (scale 0.95->1, blur 6->0, opacity 0->1)
    // 30% - 70%: Fully visible
    // 70% - 100%: Fade out (opacity 1->0, blur 0->6)
    
    if (localProgress >= 0 && localProgress <= 0.3) {
      const t = localProgress / 0.3;
      opacity = t;
      scale = 0.95 + 0.05 * t;
      blur = 6 * (1 - t);
    } else if (localProgress > 0.3 && localProgress <= 0.7) {
      opacity = 1;
      scale = 1;
      blur = 0;
    } else if (localProgress > 0.7 && localProgress <= 1.0) {
      const t = (1.0 - localProgress) / 0.3;
      opacity = t;
      scale = 1.0; // Keep scale at 1 or slightly increase? User specified 0.95 -> 1.0 for entry.
      blur = 6 * (1 - t);
    }

    return {
      opacity,
      transform: `scale(${scale})`,
      filter: `blur(${blur}px)`,
      pointerEvents: opacity > 0.1 ? 'auto' : 'none' as any,
      transition: 'none' // We handle smoothness via requestAnimationFrame and scroll granularity
    };
  };

  return (
    <section 
      ref={containerRef} 
      id="origen" 
      className="relative h-[500vh] bg-black text-white"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Skip Button */}
        <a 
          href="#proyectos" 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 text-[10px] font-mono uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-all duration-500 flex flex-col items-center gap-3 group"
        >
          <span className="group-hover:translate-y-[-2px] transition-transform duration-500">Saltar historia</span>
          <div className="w-[1px] h-8 bg-white/20 group-hover:h-12 transition-all duration-500"></div>
        </a>

        <div className="relative w-full max-w-5xl px-6 md:px-12 h-full flex items-center justify-center">
          {narrativeBlocks.map((block, index) => (
            <div
              key={block.id}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              style={getBlockStyles(index)}
            >
              <div className="max-w-3xl">
                <p className="text-xl md:text-3xl lg:text-4xl font-light leading-relaxed tracking-tight whitespace-pre-line px-4">
                  {block.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Origen;
