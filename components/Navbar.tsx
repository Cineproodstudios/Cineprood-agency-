import React, { useEffect, useState } from 'react';

const sections = [
  { id: 'hero', name: 'INICIO' },
  { id: 'historia', name: 'ORIGEN' },
  { id: 'modos', name: 'MODOS' },
  { id: 'trabajo-clientes', name: 'CLIENTES' },
  { id: 'proyectos', name: 'PORTAFOLIO' },
  { id: 'fotos', name: 'FOTOS' },
  { id: 'redes', name: 'REDES' }
];

interface NavbarProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
  isVideoActive?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleTheme, isDarkMode, isVideoActive = false }) => {
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Lock body scroll only while the full-screen menu drawer is open (and close on Escape)
  useEffect(() => {
    if (!isMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const currentSection = sections.find(s => s.id === activeSectionId);
  const isVideoSection = isVideoActive || activeSectionId === 'historia' || activeSectionId === 'origen';

  return (
    <>
      {/* 
        NAVBAR VISIBILITY:
        - When video is active: translateY(-100%), opacity: 0, pointer-events: none
        - Transition: 400ms cubic-bezier(0.16, 1, 0.3, 1)
        - When returning to hero or next section: translateY(0), opacity: 1
      */}
      <nav 
        className={`mobile-nav-bar fixed top-0 left-0 w-full z-[70] border-b transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVideoSection && !isMenuOpen
            ? '-translate-y-full opacity-0 pointer-events-none' 
            : 'translate-y-0 opacity-100 pointer-events-auto'
        } ${
          scrolled 
            ? 'py-4 bg-white/80 md:bg-white/30 dark:bg-black/80 md:dark:bg-black/30 backdrop-blur-md md:backdrop-blur-2xl border-black/5 dark:border-white/5' 
            : 'py-8 bg-transparent border-transparent'
        }`}
      >
        {/* Refraction effect overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b from-white/10 dark:from-white/5 to-transparent"></div>
        
        <div className="relative z-10 px-4 sm:px-6 md:px-12 flex justify-between items-center gap-3">
          {/* Brand */}
          <div className="pointer-events-auto flex items-center gap-8 shrink-0">
            <a 
              href="#hero" 
              onClick={() => setIsMenuOpen(false)}
              className="min-h-[44px] md:min-h-0 flex items-center font-black text-[11px] tracking-[0.34em] md:tracking-[0.4em] uppercase opacity-100 hover:text-red-600 transition-colors whitespace-nowrap"
            >
              <span>CINEPROOD</span>
            </a>
          </div>

          {/* 
            Centered Active Section (Desktop only — hidden on mobile <768px to prevent 320px-390px collisions):
            Simple clean navigation indicator.
            NO DROPDOWN on hover, NO table, NO panel.
            Only opens the full-screen menu when explicitly clicked.
          */}
          <div 
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer group/menu items-center justify-center py-2 px-4 select-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
          >
            <span 
              key={activeSectionId}
              className="text-[10px] md:text-[11px] font-black tracking-[0.5em] uppercase opacity-80 dark:opacity-80 animate-slide-up group-hover/menu:text-red-600 group-hover/menu:opacity-100 transition-all text-center whitespace-nowrap"
            >
              {currentSection?.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-12 pointer-events-auto shrink-0">
            {/* Theme Toggle */}
            <button 
              type="button"
              onClick={onToggleTheme}
              className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center gap-2 group cursor-pointer"
              aria-label="Alternar tema"
            >
              <div className={`w-8 h-4 rounded-full border border-black/20 dark:border-white/20 relative transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-600 transition-all duration-500 ${isDarkMode ? 'left-5' : 'left-1'}`}></div>
              </div>
              <span className="hidden md:inline text-[9px] font-mono tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-red-600 transition-all uppercase">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Mobile Minimalist Menu Trigger (< 768px only) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-2 text-black dark:text-white active:opacity-60 transition-opacity cursor-pointer"
            >
              <span className="text-[9px] font-mono tracking-[0.26em] uppercase opacity-75">
                {isMenuOpen ? 'CERRAR' : 'MENÚ'}
              </span>
              <span className="relative w-5 h-3.5 flex flex-col justify-between" aria-hidden="true">
                <span
                  className={`block w-full h-[1.5px] bg-current transition-transform duration-300 ${
                    isMenuOpen ? 'translate-y-[6px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`block w-full h-[1.5px] bg-current transition-transform duration-300 ${
                    isMenuOpen ? '-translate-y-[6px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Menu Overlay - only openable on explicit click */}
      <div 
        className={`fixed inset-0 z-[65] transition-opacity duration-300 md:duration-700 ease-expo ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md md:backdrop-blur-3xl"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Content */}
        <div
          className="relative h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-y-auto"
          style={{
            paddingTop: 'max(5rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(4.5rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-5 md:gap-y-8 max-w-6xl w-full">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => {
                  setIsMenuOpen(false);
                  if (s.id === 'xenia') {
                    window.dispatchEvent(new CustomEvent('enter-xenia'));
                  }
                }}
                onMouseEnter={() => setHoveredSection(s.id)}
                onMouseLeave={() => setHoveredSection(null)}
                className={`group relative flex items-baseline gap-4 md:gap-6 min-h-[48px] md:min-h-0 transition-all duration-300 md:duration-500 ${
                  hoveredSection && hoveredSection !== s.id ? 'md:opacity-20 md:blur-[2px]' : 'opacity-100'
                }`}
              >
                <span className="text-[10px] font-mono text-red-600 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all tabular-nums">
                  0{i + 1}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase transition-all duration-300 md:duration-500 group-hover:text-red-600 md:group-hover:translate-x-4">
                  {s.name}
                </h2>
                <div className="hidden md:block absolute -bottom-2 left-12 right-0 h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
              </a>
            ))}
          </div>

          {/* Close button */}
          <button 
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="mt-10 md:mt-0 md:absolute md:bottom-12 min-h-[44px] px-5 text-[10px] font-mono tracking-[0.4em] uppercase opacity-60 md:opacity-40 hover:opacity-100 hover:text-red-600 transition-all cursor-pointer"
          >
            [ CERRAR MENÚ ]
          </button>
        </div>
      </div>

      <style>{`
        .ease-expo {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slide-up {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 0.8; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        nav {
          backdrop-filter: blur(25px) saturate(160%) contrast(90%);
          -webkit-backdrop-filter: blur(25px) saturate(160%) contrast(90%);
        }
      `}</style>
    </>
  );
};

export default Navbar;
