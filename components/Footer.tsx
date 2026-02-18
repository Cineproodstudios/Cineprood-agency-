
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-8 md:px-24 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] opacity-40 gap-8 bg-white dark:bg-black transition-colors duration-500">
      <div className="order-2 md:order-1">
        © 2026 CINEPROOD — TODOS LOS DERECHOS RESERVADOS
      </div>
      
      <div className="flex gap-8 order-3 md:order-2">
        <a href="#modos" className="hidden md:inline hover:opacity-100 transition-opacity">Tradicional</a>
        <a href="#modos" className="hidden md:inline hover:opacity-100 transition-opacity">IA</a>
        <a href="#modos" className="hidden md:inline hover:opacity-100 transition-opacity">Híbrido</a>
      </div>

      <div className="flex items-center gap-6 order-1 md:order-3">
        <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" aria-label="Vimeo">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.396 7.114c-.057 1.626-1.202 3.855-3.435 6.687-2.31 2.94-4.259 4.41-5.846 4.41-1.023 0-1.896-.943-2.621-2.828-.48-1.744-.961-3.49-1.442-5.233-.531-2.022-1.114-3.033-1.748-3.033-.142 0-.642.298-1.503.894l-.903-1.163c.914-.805 1.808-1.607 2.682-2.407 1.201-1.037 2.103-1.583 2.706-1.637 1.418-.124 2.285.845 2.601 2.909.349 2.276.592 3.682.729 4.218.409 1.905.86 2.857 1.353 2.857.385 0 1.055-.615 2.01-1.846.953-1.231 1.464-2.157 1.534-2.775.142-1.231-.339-1.846-1.442-1.846-.516 0-1.045.118-1.586.354 1.059-3.461 3.064-5.064 6.014-4.809 2.176.19 3.233 1.441 3.171 3.75z"/>
          </svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" aria-label="Instagram">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" aria-label="LinkedIn">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </a>
      </div>

      <div className="order-4">
        MADE WITH OBSESSION
      </div>
    </footer>
  );
};

export default Footer;
