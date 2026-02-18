
import React, { useEffect, useState } from 'react';

const sections = [
  { id: 'hero', name: 'INICIO' },
  { id: 'origen', name: 'ORIGEN' },
  { id: 'modos', name: 'MODOS' },
  { id: 'proyectos', name: 'PROYECTOS' },
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
    <nav className={`fixed top-0 left-0 w-full z-[60] transition-all duration-700 border-b ${
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

          {/* Visual Guide - Non Clickable Indicator */}
          <div className="flex flex-col items-end text-right pointer-events-none hidden md:flex">
            <div className="flex items-center gap-4 overflow-hidden h-6">
              <span className="text-[9px] font-mono opacity-20 dark:opacity-20 tracking-widest uppercase">
                0{currentIndex} / 0{sections.length}
              </span>
              <div className="w-8 h-[1px] bg-black/10 dark:bg-white/10"></div>
              <span 
                key={activeSectionId}
                className="text-[10px] font-black tracking-[0.5em] uppercase opacity-50 dark:opacity-50 animate-slide-up"
              >
                {currentSection?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 0.5; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Custom glass refraction look */
        nav {
          backdrop-filter: blur(25px) saturate(160%) contrast(90%);
          -webkit-backdrop-filter: blur(25px) saturate(160%) contrast(90%);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
