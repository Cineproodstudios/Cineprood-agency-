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

export const RedesSociales: React.FC = () => {
  const [isTikTokLoaded, setIsTikTokLoaded] = useState(false);
  const [isInstagramLoading, setIsInstagramLoading] = useState(true);

  useEffect(() => {
    // 1. TikTok Script handling
    const tiktokScriptId = 'tiktok-embed-script';
    let tiktokScript = document.getElementById(tiktokScriptId) as HTMLScriptElement | null;

    if (tiktokScript) {
      tiktokScript.remove();
    }

    tiktokScript = document.createElement('script');
    tiktokScript.id = tiktokScriptId;
    tiktokScript.src = 'https://www.tiktok.com/embed.js';
    tiktokScript.async = true;

    tiktokScript.onload = () => {
      setIsTikTokLoaded(true);
    };

    document.body.appendChild(tiktokScript);

    const tiktokTimer = setTimeout(() => {
      setIsTikTokLoaded(true);
    }, 2000);

    // 2. Instagram Script handling
    let instagramTimer: NodeJS.Timeout;
    const processInstagramEmbeds = () => {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
      }
      setIsInstagramLoading(false);
    };

    const instagramScriptId = 'instagram-embed-script';
    let instagramScript = document.getElementById(instagramScriptId) as HTMLScriptElement | null;

    if (!instagramScript) {
      instagramScript = document.createElement('script');
      instagramScript.id = instagramScriptId;
      instagramScript.src = 'https://www.instagram.com/embed.js';
      instagramScript.async = true;

      const handleInstagramLoad = () => {
        processInstagramEmbeds();
      };

      instagramScript.addEventListener('load', handleInstagramLoad);
      document.body.appendChild(instagramScript);

      instagramTimer = setTimeout(() => {
        setIsInstagramLoading(false);
      }, 2500);

      return () => {
        clearTimeout(tiktokTimer);
        if (instagramScript) {
          instagramScript.removeEventListener('load', handleInstagramLoad);
        }
        if (instagramTimer) clearTimeout(instagramTimer);
      };
    } else {
      if (window.instgrm?.Embeds) {
        processInstagramEmbeds();
      } else {
        const handleInstagramLoad = () => {
          processInstagramEmbeds();
        };
        instagramScript.addEventListener('load', handleInstagramLoad);
        instagramTimer = setTimeout(() => {
          setIsInstagramLoading(false);
        }, 2500);

        return () => {
          clearTimeout(tiktokTimer);
          if (instagramScript) {
            instagramScript.removeEventListener('load', handleInstagramLoad);
          }
          if (instagramTimer) clearTimeout(instagramTimer);
        };
      }
    }
  }, []);

  return (
    <section 
      id="redes" 
      className="py-24 md:py-36 bg-black text-white relative overflow-hidden border-t border-b border-white/10"
    >
      {/* Subtle cinematic ambient glow in corporate red & black */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
        {/* Main Section Header */}
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white font-medium">
              COMUNIDAD & PROCESOS CREATIVOS
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none mb-6">
            SÍGUENOS EN <span className="text-red-600 relative inline-block">
              NUESTRAS REDES
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.8)]"></span>
            </span>
          </h2>

          <p className="text-sm md:text-base max-w-2xl mx-auto text-white/70 font-light leading-relaxed mb-16">
            Descubre nuestros proyectos audiovisuales, procesos creativos, breakdowns y contenido generado con inteligencia artificial en TikTok e Instagram.
          </p>
        </Reveal>

        {/* Dual Grid: TikTok & Instagram */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto items-stretch">
          
          {/* TIKTOK CARD */}
          <Reveal delay={100} className="w-full flex flex-col">
            <div className="h-full flex flex-col justify-between rounded-2xl bg-white/5 border border-white/10 p-4 md:p-8 shadow-2xl relative backdrop-blur-sm">
              <div>
                {/* Platform Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.33V9.05a8.16 8.16 0 0 0 4.92 1.63v-3.4a4.85 4.85 0 0 1-1-.59z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-bold uppercase tracking-wider">TIKTOK</h3>
                      <p className="text-xs font-mono text-red-500">@cineprood</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 border border-white/10 px-2.5 py-1 rounded">
                    Vídeos & Breakdowns
                  </span>
                </div>

                {/* Embed Loading State */}
                {!isTikTokLoaded && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/60">
                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-mono tracking-widest uppercase">
                      Cargando perfil de TikTok…
                    </p>
                  </div>
                )}

                {/* TikTok Embed Widget */}
                <div className="w-full flex justify-center overflow-x-hidden my-2">
                  <blockquote
                    className="tiktok-embed"
                    cite="https://www.tiktok.com/@cineprood"
                    data-unique-id="cineprood"
                    data-embed-type="creator"
                    style={{ maxWidth: '720px', minWidth: '280px', width: '100%', margin: '0 auto' }}
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

              {/* TikTok Direct Action Button */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href="https://www.tiktok.com/@cineprood"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-[0.25em] rounded-lg shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span>VER PERFIL EN TIKTOK</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5M18 6l-7.5 7.5M6 18h12" />
                  </svg>
                </a>
              </div>
            </div>
          </Reveal>

          {/* INSTAGRAM CARD */}
          <Reveal delay={200} className="w-full flex flex-col">
            <div className="h-full flex flex-col justify-between rounded-2xl bg-white/5 border border-white/10 p-4 md:p-8 shadow-2xl relative backdrop-blur-sm">
              <div>
                {/* Platform Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
                      <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-bold uppercase tracking-wider">INSTAGRAM</h3>
                      <p className="text-xs font-mono text-red-500">@cineprood</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 border border-white/10 px-2.5 py-1 rounded">
                    Feed & Proyectos IA
                  </span>
                </div>

                {/* Embed Loading State */}
                {isInstagramLoading && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/60">
                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-mono tracking-widest uppercase">
                      Cargando perfil de Instagram…
                    </p>
                  </div>
                )}

                {/* Instagram Embed Widget */}
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

                {/* Backup Card Details */}
                <div className="w-full mt-4 pt-3 border-t border-white/10 flex flex-col items-center gap-1 text-center">
                  <p className="text-xs text-white/60 font-light">Contenido audiovisual y creación con IA</p>
                </div>
              </div>

              {/* Instagram Direct Action Button */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href="https://www.instagram.com/cineprood/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-[0.25em] rounded-lg shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span>VER PERFIL EN INSTAGRAM</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5M18 6l-7.5 7.5M6 18h12" />
                  </svg>
                </a>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

export default RedesSociales;
