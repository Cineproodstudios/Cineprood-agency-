import React, { useEffect, useRef, useCallback } from 'react';

interface FullscreenVideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
  autoplay?: boolean;
}

/**
 * Extrae de forma robusta el ID de Vimeo desde cualquier URL o string de ID.
 * Admite formatos:
 * - 1230682471
 * - https://vimeo.com/1230682471
 * - https://vimeo.com/1230682471?share=copy...
 * - https://player.vimeo.com/video/1230682471
 */
export function extractVimeoId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Si ya es un ID numérico puro
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export const FullscreenVideoPlayer: React.FC<FullscreenVideoPlayerProps> = ({
  videoUrl,
  onClose,
  autoplay = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Normalizar la URL para el reproductor de Vimeo
  const vimeoId = extractVimeoId(videoUrl);
  const embedSrc = vimeoId.startsWith('http')
    ? `${vimeoId}${vimeoId.includes('?') ? '&' : '?'}autoplay=1&muted=0&title=0&byline=0&portrait=0&badge=0`
    : `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&title=0&byline=0&portrait=0&badge=0`;

  // Cerrar y salir de fullscreen
  const handleClose = useCallback(() => {
    // Si la Fullscreen API está activa en el navegador, salir limpiamente
    if (
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (
        (document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen
      ) {
        (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      }
    }
    onClose();
  }, [onClose]);

  // Manejar tecla Escape y Fullscreen API
  useEffect(() => {
    // Guardar la posición exacta de scroll antes de abrir
    scrollPositionRef.current = window.scrollY;

    // Bloquear el scroll del documento
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Intentar solicitar Fullscreen real en el navegador
    const el = containerRef.current;
    if (el) {
      try {
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {
            // Silencioso si el navegador/política lo bloquea; el fallback visual fixed 100dvh se activa automáticamente
          });
        } else if (
          (el as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen
        ) {
          (el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
        }
      } catch {
        // Fallback visual activo
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    // Sincronizar si el usuario sale de fullscreen con gestos del navegador
    const handleFullscreenChange = () => {
      const isFullscreen =
        !!document.fullscreenElement ||
        !!(document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      if (!isFullscreen && containerRef.current) {
        // El usuario salió de fullscreen nativo
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);

      // Restaurar scroll de body y html
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      // Devolver exactamente al punto donde estaba el usuario
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant' as ScrollBehavior,
      });
    };
  }, [handleClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-[100dvh] bg-[#000000] z-[99999] flex items-center justify-center select-none overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999,
        backgroundColor: '#000000',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Reproductor de vídeo en pantalla completa"
    >
      {/* 
        BOTÓN DE CIERRE
        - Esquina superior derecha
        - Discreto, blanco, pequeño, visible
        - Sin card ni fondo exagerado
      */}
      <button
        onClick={handleClose}
        className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 z-50 text-white/70 hover:text-white p-2.5 transition-all duration-300 focus:outline-none hover:rotate-90 group cursor-pointer"
        aria-label="Cerrar vídeo"
        title="Cerrar (Esc)"
      >
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 
        CONTENEDOR DEL VÍDEO
        - Centrado absoluto horizontal y vertical
        - Proporción 16:9 estricta
        - Ajuste perfecto: ocupa el máximo ancho o alto del viewport sin rebasar
        - Nunca se recorta en desktop ni en móvil (object-fit contain)
      */}
      <div
        className="relative flex items-center justify-center bg-black overflow-hidden"
        style={{
          width: 'min(100vw, calc(100dvh * 16 / 9))',
          height: 'min(100dvh, calc(100vw * 9 / 16))',
          maxWidth: '100vw',
          maxHeight: '100dvh',
          aspectRatio: '16 / 9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={embedSrc}
          className="w-full h-full border-0 bg-black"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title="Reproductor Vimeo Cineprood"
        />
      </div>
    </div>
  );
};

export default FullscreenVideoPlayer;
