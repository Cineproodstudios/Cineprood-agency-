import React, { useState, useEffect, useRef } from 'react';
import {
  ClientSocialPost,
  ClientSocialProfile,
  getPostInitialThumbnail,
  resolveVimeoThumbnail,
} from '../data/clientWork';
import { PreviewOriginRect } from './FloatingPreviewPortal';

export interface SocialPostProps {
  client: ClientSocialProfile;
  post: ClientSocialPost;
  index: number;
  isPreviewActive: boolean;
  onOpenPreview: (
    post: ClientSocialPost,
    index: number,
    originRect: PreviewOriginRect,
    thumbnail: string | null,
    source: 'mouse' | 'keyboard'
  ) => void;
  onCancelPreviewClose: () => void;
  onSchedulePreviewClose: (postId: string) => void;
  onImmediateClosePreview: (postId: string) => void;
  onOpen: () => void;
}

const HOVER_OPEN_DELAY_MS = 200;

const FALLBACK_LIGHTING_GRADIENTS = [
  'radial-gradient(circle at 75% 22%, rgba(255, 255, 255, 0.075) 0%, transparent 52%), radial-gradient(circle at 20% 82%, rgba(220, 38, 38, 0.065) 0%, transparent 48%)',
  'radial-gradient(circle at 25% 24%, rgba(255, 255, 255, 0.07) 0%, transparent 54%), radial-gradient(circle at 80% 78%, rgba(220, 38, 38, 0.06) 0%, transparent 50%)',
  'radial-gradient(circle at 55% 18%, rgba(255, 255, 255, 0.065) 0%, transparent 50%), radial-gradient(circle at 30% 85%, rgba(220, 38, 38, 0.07) 0%, transparent 50%)',
];

function supportsDesktopHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export const SocialPost: React.FC<SocialPostProps> = ({
  client,
  post,
  index,
  isPreviewActive,
  onOpenPreview,
  onCancelPreviewClose,
  onSchedulePreviewClose,
  onImmediateClosePreview,
  onOpen,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);

  const [resolvedThumb, setResolvedThumb] = useState<string | null>(() =>
    getPostInitialThumbnail(post)
  );
  const [imgFailed, setImgFailed] = useState(false);

  // Resolver portada: prioridad absoluta a `post.thumbnail` manual; si no, caché/oEmbed de Vimeo
  useEffect(() => {
    setImgFailed(false);
    const initial = getPostInitialThumbnail(post);
    setResolvedThumb(initial);

    if (initial || post.platform !== 'vimeo') {
      return;
    }

    let cancelled = false;
    resolveVimeoThumbnail(post.videoId, post.vimeoHash).then((url) => {
      if (!cancelled && url) {
        setResolvedThumb(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [post]);

  // Limpieza del temporizador al desmontar la tarjeta
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, []);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const showImage = Boolean(resolvedThumb) && !imgFailed;
  const pieceNumber = String(index + 1).padStart(2, '0');
  const fallbackGradient =
    FALLBACK_LIGHTING_GRADIENTS[index % FALLBACK_LIGHTING_GRADIENTS.length];

  const triggerPreviewOpen = (source: 'mouse' | 'keyboard') => {
    clearHoverTimer();
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      onOpenPreview(
        post,
        index,
        {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        showImage ? resolvedThumb : null,
        source
      );
    }, HOVER_OPEN_DELAY_MS);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    // Únicamente ratón real en escritorio (en móvil y tablet un toque abre pantalla completa)
    if (e.pointerType !== 'mouse' || !supportsDesktopHover()) return;

    if (isPreviewActive) {
      onCancelPreviewClose();
      return;
    }

    triggerPreviewOpen('mouse');
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;

    clearHoverTimer();

    if (isPreviewActive) {
      onSchedulePreviewClose(post.id);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    // Accesibilidad: activar preview también al navegar con teclado (:focus-visible)
    if (e.currentTarget.matches(':focus-visible')) {
      triggerPreviewOpen('keyboard');
    }
  };

  const handleBlur = () => {
    clearHoverTimer();
    if (isPreviewActive) {
      onImmediateClosePreview(post.id);
    }
  };

  const handleActivate = () => {
    clearHoverTimer();
    onOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };

  const isHorizontal = post.aspectRatio === '16:9';

  return (
    <article className="w-full flex flex-col">
      {/* Tarjeta estática (9:16 vertical o 16:9 horizontal) con póster ligero */}
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={`Reproducir publicación ${pieceNumber} de ${client.name}`}
        className={`relative block w-full ${
          isHorizontal ? 'aspect-video' : 'aspect-[9/16]'
        } overflow-hidden rounded-xl bg-[#070707] border border-white/10 cursor-pointer select-none transition-colors duration-300 ease-out hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-4 focus-visible:ring-offset-black`}
      >
        {/* Portada específica del vídeo */}
        <div className="absolute inset-0 pointer-events-none">
          {showImage && resolvedThumb ? (
            <img
              src={resolvedThumb}
              alt={`${client.name} — Publicación ${pieceNumber}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-full h-full flex flex-col items-center justify-center p-4"
              style={{
                backgroundColor: '#060606',
                backgroundImage: `${fallbackGradient}, repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 14px)`,
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/15 bg-black/50 flex items-center justify-center text-xs sm:text-sm font-mono tracking-[0.2em] text-white/70">
                {client.initials}
              </div>
              <span className="mt-3 text-[10px] font-mono tracking-[0.28em] uppercase text-white/40 tabular-nums">
                PIEZA {pieceNumber}
              </span>
            </div>
          )}

          {/* Scrim discreto para contraste cinematográfico */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/15 opacity-70"
          />

          {/* Numeración discreta superior derecha */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="text-[10px] font-mono tracking-[0.24em] text-white/75 tabular-nums drop-shadow">
              {pieceNumber}
            </span>
          </div>

          {/* Icono Play pequeño y centrado */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/55 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white translate-x-0.5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pie limpio debajo de la portada: nombre del cliente + tipo de trabajo */}
      <div className="pt-3 space-y-0.5">
        <p className="text-xs sm:text-sm font-black tracking-tight uppercase text-white leading-tight truncate">
          {client.name}
        </p>
        <p className="text-[10px] font-mono tracking-[0.24em] uppercase text-white/50 truncate">
          {client.role}
        </p>
      </div>
    </article>
  );
};

export default SocialPost;
