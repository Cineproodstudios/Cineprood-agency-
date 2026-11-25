import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile, preloadImageUrl } from '../utils/mobile';

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
  const mobileSectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Preload primeras fotos en móvil antes de que la sección entre en pantalla
  useEffect(() => {
    if (!isMobile) return;
    const el = mobileSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          images.slice(0, 4).forEach((src) => preloadImageUrl(src));
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;

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
  }, [prefersReducedMotion, isMobile]);

  // Experiencia móvil (<= 768px): galería táctil horizontal fluida sin trampa vertical de 1100vh
  if (isMobile) {
    const handleMobileStripScroll = () => {
      const strip = stripRef.current;
      if (!strip) return;
      const firstCard = strip.firstElementChild as HTMLElement | null;
      const step = firstCard ? firstCard.offsetWidth + 12 : Math.max(1, strip.clientWidth * 0.85);
      const nextIdx = Math.max(0, Math.min(images.length - 1, Math.round(strip.scrollLeft / step)));
      if (nextIdx !== currentIndex) {
        setCurrentIndex(nextIdx);
        if (images[nextIdx + 1]) preloadImageUrl(images[nextIdx + 1]);
        if (images[nextIdx + 2]) preloadImageUrl(images[nextIdx + 2]);
      }
    };

    const progressPct = ((currentIndex + 1) / images.length) * 100;

    return (
      <section
        ref={mobileSectionRef}
        id="fotos"
        className="bg-black text-white py-14 select-none overflow-x-clip"
        aria-label="Galería de fotografía"
      >
        <div className="px-5 mb-5 flex items-center justify-between">
          <h2 className="text-[10px] font-mono tracking-[0.55em] uppercase text-white/45">
            FOTOS
          </h2>
          <p className="text-[10px] font-mono tracking-[0.32em] uppercase text-white/65 tabular-nums">
            <span className="text-red-600 font-bold">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>{' '}
            / {String(images.length).padStart(2, '0')}
          </p>
        </div>

        <div
          ref={stripRef}
          onScroll={handleMobileStripScroll}
          className="mobile-scroll-strip flex overflow-x-auto snap-x snap-mandatory gap-3 px-5 pb-2"
        >
          {images.map((src, i) => (
            <figure
              key={i}
              className="w-[84vw] max-w-[360px] aspect-[4/5] shrink-0 snap-center bg-[#060606] border border-white/10 rounded-[2px] overflow-hidden flex items-center justify-center"
            >
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                width={960}
                height={1200}
                className="w-full h-full object-contain bg-black block"
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </figure>
          ))}
        </div>

        <div className="px-5 mt-4 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-white/15 overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[9px] font-mono tracking-[0.28em] uppercase text-white/40 whitespace-nowrap">
            Desliza →
          </span>
        </div>
      </section>
    );
  }

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
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-60">
            <span className="text-red-600 font-bold">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(images.length).padStart(2, '0')}
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
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-60">
          <div className="w-[1px] h-12 bg-red-600 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Fotos;
