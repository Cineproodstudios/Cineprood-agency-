import React, { useEffect, useState } from 'react';
import Reveal from './Reveal';

export const TikTokProfile: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Re-initialize or load TikTok embed script when component mounts
    const scriptId = 'tiktok-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (script) {
      script.remove();
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    document.body.appendChild(script);

    // Fallback timer to set loaded state after 2 seconds
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section 
      id="tiktok" 
      className="py-24 md:py-32 bg-black text-white relative overflow-hidden border-t border-b border-white/10"
    >
      {/* Subtle cinematic gradient ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/15 via-black to-black pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
        {/* Header Block */}
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white font-medium">
              CONTENIDO EXCLUSIVO
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none mb-6">
            SÍGUEME EN <span className="text-red-600 relative inline-block">
              TIKTOK
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full"></span>
            </span>
          </h2>

          <p className="text-sm md:text-base max-w-2xl mx-auto text-white/70 font-light leading-relaxed mb-12">
            Descubre mis proyectos, procesos creativos y breakdowns de producción audiovisual con IA.
          </p>
        </Reveal>

        {/* TikTok Official Profile Embed Container */}
        <Reveal delay={150} className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[720px] min-w-[288px] mx-auto relative rounded-2xl bg-white/5 border border-white/10 p-3 md:p-6 min-h-[320px] flex flex-col items-center justify-center shadow-xl">
            
            {!isLoaded && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/60">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono tracking-widest uppercase">
                  Cargando perfil de TikTok…
                </p>
              </div>
            )}

            <div className="w-full flex justify-center overflow-x-hidden">
              <blockquote
                className="tiktok-embed"
                cite="https://www.tiktok.com/@cineprood"
                data-unique-id="cineprood"
                data-embed-type="creator"
                style={{ maxWidth: '720px', minWidth: '288px', width: '100%', margin: '0 auto' }}
              >
                <section>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.tiktok.com/@cineprood?refer=creator_embed"
                    className="text-red-500 hover:underline font-mono text-sm"
                  >
                    @cineprood
                  </a>
                </section>
              </blockquote>
            </div>
          </div>
        </Reveal>

        {/* Backup / Direct Action Button */}
        <Reveal delay={250} className="mt-10 flex flex-col items-center justify-center">
          <a
            href="https://www.tiktok.com/@cineprood"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-[0.3em] rounded-lg shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>VER PERFIL EN TIKTOK</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5M18 6l-7.5 7.5M6 18h12" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default TikTokProfile;
