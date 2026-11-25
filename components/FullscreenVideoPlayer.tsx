import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getIsMobileViewport, useIsMobile } from '../utils/mobile';

export interface FullscreenVideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
  autoplay?: boolean;
  label?: string;
}

/**
 * Extrae de forma robusta el ID de Vimeo desde cualquier URL o string de ID.
 */
export function extractVimeoParams(input: string): { id: string; hash?: string } {
  if (!input) return { id: '' };
  const trimmed = input.trim();
  const idMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  const hashQueryMatch = trimmed.match(/[?&]h=([a-zA-Z0-9]+)/);
  const hashPathMatch = trimmed.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/);

  const id = idMatch?.[1] ?? (/^\d+$/.test(trimmed) ? trimmed : trimmed);
  const hash = hashQueryMatch?.[1] ?? hashPathMatch?.[1];
  return { id, hash };
}

export const FullscreenVideoPlayer: React.FC<FullscreenVideoPlayerProps> = ({
  videoUrl,
  onClose,
  label,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const isMobile = useIsMobile();

  const { id: vimeoId, hash: vimeoHash } = extractVimeoParams(videoUrl);
  const hashParam = vimeoHash ? `&h=${encodeURIComponent(vimeoHash)}` : '';
  const mobileInlineParam = isMobile ? '&playsinline=1' : '';
  const vimeoEmbedSrc = vimeoId.startsWith('http')
    ? `${vimeoId}${vimeoId.includes('?') ? '&' : '?'}autoplay=1&title=0&byline=0&portrait=0${mobileInlineParam}${hashParam}`
    : `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}?autoplay=1&title=0&byline=0&portrait=0${mobileInlineParam}${hashParam}`;

  const handleClose = useCallback(() => {
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

  useEffect(() => {
    scrollPositionRef.current = window.scrollY;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const el = containerRef.current;
    if (el && !getIsMobileViewport()) {
      try {
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if (
          (el as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen
        ) {
          (el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
        }
      } catch {
        // Fallback visual fixed 100dvh activo
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

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

      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant' as ScrollBehavior,
      });
    };
  }, [handleClose]);

  const modalContent = (
    <div
      ref={containerRef}
      onClick={handleClose}
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
      aria-label={label || 'Reproductor de vídeo en pantalla completa'}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={
          isMobile
            ? {
                top: 'max(12px, env(safe-area-inset-top, 0px))',
                right: 'max(12px, env(safe-area-inset-right, 0px))',
              }
            : undefined
        }
        className="fixed top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 z-[100000] min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0 flex items-center justify-center text-white/85 md:text-white/75 hover:text-white p-2.5 transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60 md:hover:rotate-90 group cursor-pointer"
        aria-label="Cerrar vídeo"
        title="Cerrar (Esc)"
      >
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

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
          src={vimeoEmbedSrc}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
          className="bg-black"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Reproductor Vimeo Cineprood"
        />
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default FullscreenVideoPlayer;
