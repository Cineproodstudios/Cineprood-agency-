
import React, { useEffect, useState } from 'react';

const sections = [
  { id: 'hero', name: 'INICIO' },
  { id: 'origen', name: 'ORIGEN' },
  { id: 'modos', name: 'MODOS' },
  { id: 'proyectos', name: 'PROYECTOS' },
  { id: 'fotos', name: 'FOTOS' },
  { id: 'manifiesto', name: 'MANIFIESTO' },
  { id: 'contacto', name: 'CONTACTO' }
];

interface NavbarProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleTheme, isDarkMode }) => {
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [currentIndex, setCurrentIndex] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
          const index = sections.findIndex(s => s.id === entry.target.id);
          setCurrentIndex(index + 1);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const currentSection = sections.find(s => s.id === activeSectionId);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[70] transition-all duration-700 border-b ${
        scrolled 
          ? 'py-4 bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-black/5 dark:border-white/5' 
          : 'py-8 bg-transparent border-transparent'
      }`}>
        {/* Refraction effect overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b from-white/10 dark:from-white/5 to-transparent"></div>
        
        <div className="relative z-10 px-6 md:px-12 flex justify-between items-center">
          {/* Brand */}
          <div className="pointer-events-auto flex items-center gap-8">
            <a 
              href="#hero" 
              className="font-black text-[11px] tracking-[0.4em] uppercase opacity-100 hover:opacity-60 transition-opacity"
            >
              CINEPROOD
            </a>
          </div>
          
          <div className="flex items-center gap-12 pointer-events-auto">
            {/* Theme Toggle */}
            <button 
              onClick={onToggleTheme}
              className="flex items-center gap-2 group cursor-pointer"
              aria-label="Alternar tema"
            >
              <div className={`w-8 h-4 rounded-full border border-black/20 dark:border-white/20 relative transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black dark:bg-white transition-all duration-500 ${isDarkMode ? 'left-5' : 'left-1'}`}></div>
              </div>
              <span className="text-[9px] font-mono tracking-widest opacity-40 group-hover:opacity-100 transition-opacity uppercase">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Visual Guide / Menu Trigger */}
            <div 
              className="flex flex-col items-end text-right cursor-pointer group/menu"
              onMouseEnter={() => setIsMenuOpen(true)}
            >
              <div className="flex items-center gap-4 overflow-hidden h-6">
                <span className="text-[9px] font-mono opacity-20 dark:opacity-20 tracking-widest uppercase group-hover/menu:opacity-100 transition-opacity">
                   ÍNDICE
                </span>
                <div className="w-8 h-[1px] bg-black/10 dark:bg-white/10 group-hover/menu:w-12 transition-all"></div>
                <span 
                  key={activeSectionId}
                  className="text-[10px] font-black tracking-[0.5em] uppercase opacity-50 dark:opacity-50 animate-slide-up group-hover/menu:opacity-100 transition-opacity"
                >
                  {currentSection?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[65] transition-all duration-700 ease-expo ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-3xl"></div>
        
        {/* Content */}
        <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-8 max-w-6xl w-full">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={() => setHoveredSection(s.id)}
                onMouseLeave={() => setHoveredSection(null)}
                className={`group relative flex items-baseline gap-6 transition-all duration-500 ${
                  hoveredSection && hoveredSection !== s.id ? 'opacity-20 blur-[2px]' : 'opacity-100'
                }`}
              >
                <span className="text-[10px] font-mono opacity-30 group-hover:opacity-100 transition-opacity">
                  0{i + 1}
                </span>
                <h2 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase transition-all duration-500 group-hover:italic group-hover:translate-x-4">
                  {s.name}
                </h2>
                <div className="absolute -bottom-2 left-12 right-0 h-[1px] bg-black/10 dark:bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
              </a>
            ))}
          </div>

          {/* Close hint */}
          <div className="absolute bottom-12 text-[9px] font-mono tracking-[0.5em] uppercase opacity-20">
            Mueve el ratón fuera para cerrar
          </div>
        </div>
      </div>

      <style>{`
        .ease-expo {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 0.5; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
