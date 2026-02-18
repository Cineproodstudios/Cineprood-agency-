
import React, { useEffect, useRef, useState } from 'react';

const narrativeSteps = [
  { id: 1, text: ["Desde muy pequeño,", "la imagen dejó de ser solo imagen."] },
  { id: 2, text: ["La fotografía era una forma", "de entender la luz y el silencio."] },
  { id: 3, text: ["Aprender, probar,", "equivocarse, mejorar."] },
  { id: 4, text: ["Y entonces llegó", "la inteligencia artificial."] },
  { id: 5, text: ["No como sustitución.", "Sino como evolución."] },
  { id: 6, text: ["CINEPROOD nace de esa mentalidad.", "Artesanía visual. Tecnología contemporánea."] }
];

const Origen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      requestAnimationFrame(() => setProgress(p));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeStep = Math.min(narrativeSteps.length - 1, Math.floor(progress * narrativeSteps.length));

  return (
    <section ref={containerRef} id="origen" className="relative h-[400vh] bg-white dark:bg-black transition-colors duration-500">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-8">
        <div className="relative w-full max-w-4xl h-32 flex items-center justify-center">
          {narrativeSteps.map((step, index) => {
            const opacity = index === activeStep ? 1 : 0;
            return (
              <div 
                key={step.id} 
                className="absolute inset-0 flex flex-col justify-center items-center text-center transition-all duration-700 ease-out"
                style={{ opacity, transform: `translateY(${index === activeStep ? 0 : 20}px)` }}
              >
                {step.text.map((line, i) => (
                  <p key={i} className="text-2xl md:text-5xl font-bold tracking-tight leading-tight uppercase">
                    {line}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Origen;
