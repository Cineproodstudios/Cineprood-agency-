import React, { useEffect, useRef, useState } from 'react';

const images = [
  "https://i.postimg.cc/wvSB6RV5/DSC00426-copia.jpg",
  "https://i.postimg.cc/W3Q42qn5/DSC00429-copia.jpg",
  "https://i.postimg.cc/Jn9h1Hqx/DSC00434-webflow.jpg",
  "https://i.postimg.cc/d0V3nY3s/IMG-4704-copia.jpg",
  "https://i.postimg.cc/mrpD551p/IMG-5418-copia.jpg",
  "https://i.postimg.cc/wB4vGGs8/IMG-5431-copia.jpg",
  "https://i.postimg.cc/SsXsFfcg/IMG-5439-copia.jpg",
  "https://i.postimg.cc/R0pFDDJw/IMG-5791-copia.jpg",
  "https://i.postimg.cc/4dKdkQpL/IMG-6544.jpg",
  "https://i.postimg.cc/nz6LH9kj/vans-normal.jpg",
  "https://i.postimg.cc/Y2mpF6Pb/IMG-6359-2.jpg"
];

const Fotos: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollDistance = rect.height - window.innerHeight;
      
      // Calculate progress (0 to 1)
      const progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
      
      // Map progress to index
      const index = Math.min(images.length - 1, Math.floor(progress * images.length));
      
      requestAnimationFrame(() => {
        setCurrentIndex(index);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section id="fotos" className="bg-black py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          <h2 className="text-[10px] font-mono tracking-[0.8em] uppercase opacity-30 mb-8">FOTOS</h2>
          {images.map((src, i) => (
            <div key={i} className="w-full overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={src} 
                alt={`Foto ${i + 1}`} 
                className="w-full h-auto block" 
                loading="lazy" 
                referrerPolicy="no-referrer" 
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef} 
      id="fotos" 
      className="relative bg-black snap-y snap-mandatory"
      style={{ height: `${images.length * 100}vh` }}
    >
      {/* Snap Points */}
      {images.map((_, i) => (
        <div key={i} className="absolute w-full h-screen snap-start pointer-events-none" style={{ top: `${i * 100}vh` }}></div>
      ))}

      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Title */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
          <h2 className="text-[10px] font-mono tracking-[0.8em] uppercase opacity-30">FOTOS</h2>
        </div>

        {/* Counter */}
        <div className="absolute top-12 right-12 z-20">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-30">
            {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </p>
        </div>

        {/* Stack Container */}
        <div className="relative w-[90vw] md:w-[75vw] lg:w-[65vw] h-[70vh] flex items-center justify-center">
          {images.map((src, i) => {
            const isPassed = i < currentIndex;
            const isActive = i === currentIndex;
            const isFuture = i > currentIndex;

            const diff = currentIndex - i;
            const isVisibleBehind = diff > 0 && diff <= 4;
            
            let opacity = 0;
            let scale = 1;
            let rotate = 0;
            let x = 0;
            let y = 0;
            let zIndex = images.length - i;

            if (isActive) {
              opacity = 1;
              scale = 1;
              rotate = 0;
              zIndex = 50;
            } else if (isPassed) {
              if (isVisibleBehind) {
                opacity = 1 - (diff * 0.15); 
                scale = 1 - (diff * 0.04); 
                rotate = (i % 2 === 0 ? 1.5 : -1.5); 
                x = (i % 2 === 0 ? -20 : -10); 
                y = 20 * diff; 
                zIndex = 40 - diff;
              } else {
                opacity = 0;
              }
            } else if (isFuture) {
              opacity = 0;
              scale = 1.1;
              zIndex = 10;
            }

            return (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out will-change-transform"
                style={{
                  opacity,
                  transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
                  zIndex,
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
              >
                <div className="max-w-full max-h-full border border-white/10 shadow-2xl bg-black/20 overflow-hidden">
                  <img 
                    src={src} 
                    alt={`Foto ${i + 1}`} 
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain block"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20">
          <div className="w-[1px] h-12 bg-white animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Fotos;
