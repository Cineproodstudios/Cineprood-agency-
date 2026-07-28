import React, { useEffect, useState } from 'react';
import Reveal from './Reveal';

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

export const InstagramProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const processEmbeds = () => {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
      }
      setIsLoading(false);
    };

    const scriptId = 'instagram-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;

      const handleScriptLoad = () => {
        processEmbeds();
      };

      script.addEventListener('load', handleScriptLoad);
      document.body.appendChild(script);

      // Fallback timer in case processing takes time or is blocked
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);

      return () => {
        if (script) {
          script.removeEventListener('load', handleScriptLoad);
        }
        if (timer) clearTimeout(timer);
      };
    } else {
      // Script already exists, process immediately or wait for window.instgrm
      if (window.instgrm?.Embeds) {
        processEmbeds();
      } else {
        const handleScriptLoad = () => {
          processEmbeds();
        };
        script.addEventListener('load', handleScriptLoad);
        timer = setTimeout(() => {
          setIsLoading(false);
        }, 2500);

        return () => {
          if (script) {
            script.removeEventListener('load', handleScriptLoad);
          }
          if (timer) clearTimeout(timer);
        };
      }
    }
  }, []);

  return (
    <section 
      id="instagram" 
      className="py-24 md:py-32 bg-black text-white relative overflow-hidden border-b border-white/10"
    >
      {/* Subtle cinematic ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/15 via-black to-black pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
        {/* Header Block */}
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white font-medium">
              FEED Y CREACIÓN CON IA
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none mb-6">
            SÍGUEME EN <span className="text-red-600 relative inline-block">
              INSTAGRAM
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.8)]"></span>
            </span>
          </h2>

          <p className="text-sm md:text-base max-w-2xl mx-auto text-white/70 font-light leading-relaxed mb-12">
            Descubre mis proyectos audiovisuales, procesos creativos, breakdowns y contenido generado con inteligencia artificial.
          </p>
        </Reveal>

        {/* Instagram Official Profile Embed Container */}
        <Reveal delay={150} className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[658px] min-w-[280px] mx-auto relative rounded-2xl bg-white/5 border border-white/10 p-3 md:p-6 min-h-[320px] flex flex-col items-center justify-center shadow-xl">
            
            {isLoading && (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-white/60">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono tracking-widest uppercase">
                  Cargando perfil de Instagram…
                </p>
              </div>
            )}

            <div className="w-full flex justify-center overflow-x-hidden my-2">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/cineprood/"
                data-instgrm-version="14"
                style={{
                  background: '#ffffff',
                  border: 0,
                  borderRadius: '12px',
                  margin: '0 auto',
                  maxWidth: '658px',
                  minWidth: '280px',
                  width: '100%'
                }}
              >
                <a
                  href="https://www.instagram.com/cineprood/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 text-center text-black font-sans text-sm font-semibold hover:text-red-600 transition-colors"
                >
                  Ver el perfil de @cineprood en Instagram
                </a>
              </blockquote>
            </div>

            {/* Preview / Backup Card Details */}
            <div className="w-full mt-4 pt-4 border-t border-white/10 flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-mono font-bold tracking-wider text-red-500">@cineprood</p>
              <p className="text-xs text-white/60 font-light">Contenido audiovisual y creación con IA</p>
            </div>
          </div>
        </Reveal>

        {/* Backup / Direct Action Button */}
        <Reveal delay={250} className="mt-10 flex flex-col items-center justify-center">
          <a
            href="https://www.instagram.com/cineprood/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-[0.3em] rounded-lg shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>VER PERFIL EN INSTAGRAM</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5M18 6l-7.5 7.5M6 18h12" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default InstagramProfile;
