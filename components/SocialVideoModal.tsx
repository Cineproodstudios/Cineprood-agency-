import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import VimeoPlayer from './VimeoPlayer';
import TikTokPlayer from './TikTokPlayer';
import { ClientSocialProfile } from '../data/clientWork';
import { useIsMobile } from '../utils/mobile';

export interface SocialVideoModalProps {
  client: ClientSocialProfile;
  activeIndex: number;
  onChangeIndex: (nextIndex: number) => void;
  onClose: () => void;
}

export const SocialVideoModal: React.FC<SocialVideoModalProps> = ({
  client,
  activeIndex,
  onChangeIndex,
  onClose,
}) => {
  const scrollPositionRef = useRef<number>(0);
  const isMobile = useIsMobile();

  const total = client.posts.length;
  const safeIndex = Math.max(0, Math.min(activeIndex, total - 1));
  const currentPost = client.posts[safeIndex];
  const hasMultiple = total > 1;

  const goToPrev = useCallback(() => {
    if (!hasMultiple) return;
    onChangeIndex((safeIndex - 1 + total) % total);
  }, [hasMultiple, onChangeIndex, safeIndex, total]);

  const goToNext = useCallback(() => {
    if (!hasMultiple) return;
    onChangeIndex((safeIndex + 1) % total);
  }, [hasMultiple, onChangeIndex, safeIndex, total]);

  useEffect(() => {
    scrollPositionRef.current = window.scrollY;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant' as ScrollBehavior,
      });
    };
  }, [goToNext, goToPrev, hasMultiple, onClose]);

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999,
        background: 'rgba(0,0,0,0.96)',
        ...(isMobile
          ? {
              paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top, 0px) + 2.75rem))',
              paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
              paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
              paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
            }
          : {}),
      }}
      className="flex flex-col items-center justify-center px-4 py-14 sm:py-10 select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${client.name} — Reproductor`}
    >
      {/* Botón × arriba a la derecha */}
      <button
        type="button"
        onClick={onClose}
        style={
          isMobile
            ? {
                top: 'max(10px, env(safe-area-inset-top, 0px))',
                right: 'max(10px, env(safe-area-inset-right, 0px))',
              }
            : undefined
        }
        className="fixed top-3 sm:top-6 right-3 sm:right-6 z-[100000] min-w-[48px] min-h-[48px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center text-white/85 md:text-white/75 hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60 md:hover:rotate-90 cursor-pointer"
        aria-label="Cerrar reproductor"
        title="Cerrar (Esc)"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Flechas laterales en escritorio para perfiles con varias publicaciones */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="hidden md:flex fixed left-6 lg:left-10 top-1/2 -translate-y-1/2 z-[100000] w-11 h-11 items-center justify-center border border-white/15 bg-black/70 text-white/75 hover:text-white hover:border-red-600 transition-colors duration-200 cursor-pointer rounded-[2px]"
            aria-label="Publicación anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="hidden md:flex fixed right-6 lg:right-10 top-1/2 -translate-y-1/2 z-[100000] w-11 h-11 items-center justify-center border border-white/15 bg-black/70 text-white/75 hover:text-white hover:border-red-600 transition-colors duration-200 cursor-pointer rounded-[2px]"
            aria-label="Publicación siguiente"
          >
            →
          </button>
        </>
      )}

      {/* Marco centrado adaptado a 16:9 horizontal o 9:16 vertical */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col items-center justify-center w-full max-h-full ${
          currentPost.aspectRatio === '16:9' ? 'max-w-[1040px]' : 'max-w-[420px]'
        }`}
      >
        <div
          className={`relative ${
            currentPost.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'
          } bg-black border border-white/15 rounded-[3px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95)]`}
          style={
            currentPost.aspectRatio === '16:9'
              ? {
                  width: isMobile
                    ? 'min(94vw, calc(68dvh * 16 / 9))'
                    : 'min(92vw, 1040px, calc(76dvh * 16 / 9))',
                  maxHeight: isMobile ? '68dvh' : '76dvh',
                }
              : {
                  height: isMobile
                    ? hasMultiple
                      ? 'min(64dvh, 620px)'
                      : 'min(72dvh, 680px)'
                    : 'min(76dvh, 720px)',
                  maxWidth: 'min(92vw, 420px)',
                  width: 'auto',
                }
          }
        >
          {currentPost.platform === 'vimeo' ? (
            <VimeoPlayer
              key={`vimeo-${currentPost.videoId}`}
              videoId={currentPost.videoId}
              vimeoHash={currentPost.vimeoHash}
              title={`${client.name} — Publicación ${safeIndex + 1}`}
            />
          ) : (
            <TikTokPlayer
              key={`tiktok-${currentPost.videoId}`}
              videoId={currentPost.videoId}
              title={`${client.name} — Publicación ${safeIndex + 1}`}
            />
          )}
        </div>

        {/* Pie minimalista Cineprood */}
        <div className="mt-4 w-full flex flex-col items-center text-center gap-1">
          <div className="flex items-center justify-center gap-2.5">
            <span className="text-xs sm:text-sm font-black tracking-tight uppercase text-white">
              {client.name}
            </span>
            {hasMultiple && (
              <>
                <span aria-hidden="true" className="text-white/30 text-xs">
                  ·
                </span>
                <span className="text-[11px] font-mono tracking-[0.22em] text-white/55 tabular-nums">
                  {String(safeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/50">
            {client.role}
          </p>
        </div>

        {/* Navegación táctil en móvil para clientes con varias publicaciones */}
        {hasMultiple && (
          <div className="mt-4 flex md:hidden items-center justify-center gap-3">
            <button
              type="button"
              onClick={goToPrev}
              className="min-h-[44px] px-4 border border-white/15 hover:border-red-600 text-[10px] font-mono tracking-[0.22em] uppercase text-white/80 hover:text-white rounded-[2px] transition-colors cursor-pointer whitespace-nowrap"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="min-h-[44px] px-4 border border-white/15 hover:border-red-600 text-[10px] font-mono tracking-[0.22em] uppercase text-white/80 hover:text-white rounded-[2px] transition-colors cursor-pointer whitespace-nowrap"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default SocialVideoModal;
