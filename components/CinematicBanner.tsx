import React from 'react';

interface CinematicBannerProps {
  onOpenVideo: (url: string) => void;
}

const CinematicBanner: React.FC<CinematicBannerProps> = ({ onOpenVideo }) => {
  const videoUrl = 'https://player.vimeo.com/video/1230682471';
  const posterImage =
    'https://i.vimeocdn.com/video/2205637822-418eebe83d879cf6114a6262472e36352cf1d757c3b57f3508bc5959b27fca7d-d_1920';

  return (
    <section
      id="cinematic-banner"
      className="relative w-full my-16 sm:my-24 md:my-32 overflow-hidden bg-black select-none"
      aria-label="Manifiesta — Cortometraje"
    >
      {/* 
        BANNER FULL-BLEED (DE LADO A LADO)
        - Sin márgenes laterales, ocupa el 100% del ancho de la pantalla
        - Altura cinematográfica ultrapanorámica
        - Filtro de monitor de TV / CRT auténtico
      */}
      <div
        onClick={() => onOpenVideo(videoUrl)}
        className="short-film-poster group relative w-full md:h-[75vh] md:min-h-[420px] md:max-h-[820px] overflow-hidden cursor-pointer select-none bg-black"
      >
        {/* Imagen del fotograma: en móvil 100% visible (object-contain / 16:9), en desktop object-cover como antes */}
        <img
          src={posterImage}
          alt="Manifiesta"
          className="w-full h-full object-contain md:object-cover object-center transform scale-100 group-hover:scale-[1.02] transition-transform duration-1000 ease-out will-change-transform filter brightness-[0.92] contrast-[1.08] group-hover:brightness-[1.02] group-hover:contrast-[1.14]"
          referrerPolicy="no-referrer"
        />

        {/* 
          FILTRO DE TELEVISIÓN / CRT MONITOR
          1. Líneas de escaneo horizontales (Scanlines)
          2. Rejilla de fósforos RGB
          3. Viñeteado curvo de tubo catódico (CRT Tube Vignette)
          4. Barrido sutil de haz de electrones
        */}
        {/* Scanlines horizontales fijas */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-70 group-hover:opacity-60 transition-opacity duration-500"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Malla de fósforos RGB analógica */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-color-dodge"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255, 0, 0, 0.08) 0px, rgba(255, 0, 0, 0.08) 1px, rgba(0, 255, 0, 0.08) 1px, rgba(0, 255, 0, 0.08) 2px, rgba(0, 0, 255, 0.08) 2px, rgba(0, 0, 255, 0.08) 3px)',
            backgroundSize: '3px 100%',
          }}
        />

        {/* Barrido dinámico de línea de TV (Scanline Beam Roll) */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="w-full h-24 bg-gradient-to-b from-transparent via-white/[0.04] to-transparent animate-[tvScanline_6s_linear_infinite]" />
        </div>

        {/* Viñeta curva de tubo de TV CRT (curvatura y sombreado en las esquinas) */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(circle at center, transparent 55%, rgba(0, 0, 0, 0.45) 85%, rgba(0, 0, 0, 0.85) 100%)',
          }}
        />

        {/* Degradado inferior para legibilidad del título */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none z-10" />

        {/* Indicador superior de señal analógica de TV */}
        <div className="absolute top-3.5 sm:top-10 left-4 sm:left-12 z-20 pointer-events-none flex items-center gap-2.5">
          <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-[9px] sm:text-[11px] font-mono tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/60">
            VIDEO 1 // CINEPROOD
          </span>
        </div>

        {/* Indicador de reproducción retro en la esquina superior derecha */}
        <div className="absolute top-3.5 sm:top-10 right-4 sm:right-12 z-20 pointer-events-none">
          <span className="text-[9px] sm:text-[11px] font-mono tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white/40 group-hover:text-white/80 transition-colors flex items-center gap-1.5">
            <span>PLAY</span>
            <span className="inline-block text-[10px] sm:text-xs">▶</span>
          </span>
        </div>

        {/* 
          TÍTULO CINEMATOGRÁFICO: MANIFIESTA
          - Tipografía cinematográfica majestuosa (Cinzel)
          - En móvil proporcional al encuadre 16:9, en desktop idéntico al diseño original
        */}
        <div className="absolute bottom-4 sm:bottom-14 md:bottom-20 left-4 sm:left-14 md:left-20 z-20 pointer-events-none max-w-4xl pr-4">
          <p className="text-[8px] sm:text-xs font-mono tracking-[0.4em] sm:tracking-[0.6em] uppercase text-white/60 mb-1 sm:mb-3">
            CORTOMETRAJE ORIGINAL
          </p>
          
          <h2 className="font-cinematic text-2xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-normal tracking-[0.16em] sm:tracking-[0.28em] text-white uppercase leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] transform group-hover:translate-x-1 transition-transform duration-500">
            MANIFIESTA
          </h2>
        </div>

        {/* Botón sutil interactivo en la zona inferior derecha */}
        <div className="absolute bottom-8 sm:bottom-14 md:bottom-20 right-6 sm:right-14 md:right-20 z-20 pointer-events-none hidden sm:flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-md border border-white/20 group-hover:border-white/50 text-white text-[10px] font-mono tracking-[0.3em] uppercase transition-all duration-300">
            VER CORTOMETRAJE
          </div>
        </div>
      </div>

      {/* Animación del haz de barrido de TV */}
      <style>{`
        @keyframes tvScanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(850px);
          }
        }
      `}</style>
    </section>
  );
};

export default CinematicBanner;
