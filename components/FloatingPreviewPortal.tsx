import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import VimeoPlayer from './VimeoPlayer';
import TikTokPlayer from './TikTokPlayer';
import { ClientSocialPost, ClientSocialProfile } from '../data/clientWork';

export interface PreviewOriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ActiveFloatingPreview {
  client: ClientSocialProfile;
  post: ClientSocialPost;
  postIndex: number;
  originRect: PreviewOriginRect;
  thumbnail: string | null;
  source: 'mouse' | 'keyboard';
}

export interface FloatingPreviewPortalProps {
  preview: ActiveFloatingPreview;
  isClosing: boolean;
  onCancelClose: () => void;
  onScheduleClose: () => void;
  onImmediateClose: () => void;
  onOpenFullModal: () => void;
}

const VIEWPORT_MARGIN = 20;
const FOOTER_HEIGHT = 60;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const FloatingPreviewPortal: React.FC<FloatingPreviewPortalProps> = ({
  preview,
  isClosing,
  onCancelClose,
  onScheduleClose,
  onImmediateClose,
  onOpenFullModal,
}) => {
  const previewCardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const reducedMotion = prefersReducedMotion();
  const { client, post, postIndex, originRect, thumbnail, source } = preview;
  const pieceNumber = String(postIndex + 1).padStart(2, '0');

  const isHorizontal = post.aspectRatio === '16:9';

  // Calcular tamaño ampliado (~1.15–1.2x sobre la tarjeta, acotado a viewport en 16:9 o 9:16)
  const layout = useMemo(() => {
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 900;

    let targetWidth: number;
    let targetVideoHeight: number;

    if (isHorizontal) {
      const maxVideoHeight = Math.max(
        220,
        Math.min(viewportH - VIEWPORT_MARGIN * 2 - FOOTER_HEIGHT, 540)
      );
      const scaledWidth = reducedMotion
        ? originRect.width * 1.04
        : Math.max(originRect.width * 1.15, Math.min(780, viewportW * 0.86));
      targetWidth = Math.round(
        Math.min(
          920,
          viewportW - VIEWPORT_MARGIN * 2,
          maxVideoHeight * (16 / 9),
          scaledWidth
        )
      );
      targetVideoHeight = Math.round(targetWidth * (9 / 16));
    } else {
      const maxVideoHeight = Math.max(
        280,
        Math.min(viewportH - VIEWPORT_MARGIN * 2 - FOOTER_HEIGHT, 660)
      );
      const scaledWidth = reducedMotion
        ? originRect.width * 1.04
        : Math.max(originRect.width * 1.2, Math.min(400, viewportW * 0.78));
      targetWidth = Math.round(
        Math.min(420, viewportW * 0.8, maxVideoHeight * (9 / 16), scaledWidth)
      );
      targetVideoHeight = Math.round(targetWidth * (16 / 9));
    }

    const totalHeight = targetVideoHeight + FOOTER_HEIGHT;

    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;

    const idealLeft = originCenterX - targetWidth / 2;
    const idealTop = originCenterY - totalHeight / 2;

    const clampedLeft = Math.round(
      Math.max(
        VIEWPORT_MARGIN,
        Math.min(idealLeft, viewportW - targetWidth - VIEWPORT_MARGIN)
      )
    );
    const clampedTop = Math.round(
      Math.max(
        VIEWPORT_MARGIN,
        Math.min(idealTop, viewportH - totalHeight - VIEWPORT_MARGIN)
      )
    );

    const targetCenterX = clampedLeft + targetWidth / 2;
    const targetCenterY = clampedTop + totalHeight / 2;

    const initialDx = originCenterX - targetCenterX;
    const initialDy = originCenterY - targetCenterY;
    const initialScale = Math.max(
      0.35,
      Math.min(0.98, originRect.width / Math.max(1, targetWidth))
    );

    return {
      left: clampedLeft,
      top: clampedTop,
      width: targetWidth,
      videoHeight: targetVideoHeight,
      totalHeight,
      initialDx,
      initialDy,
      initialScale,
    };
  }, [originRect, reducedMotion, isHorizontal]);

  // Transición fluida (0.35s ease-out) respetando prefers-reduced-motion
  useEffect(() => {
    setIsExpanded(false);
    setIsVideoPlaying(false);

    if (reducedMotion) {
      setIsExpanded(true);
      return;
    }

    let raf2: number | null = null;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setIsExpanded(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2 !== null) window.cancelAnimationFrame(raf2);
    };
  }, [post.id, reducedMotion]);

  // Tolerancia entre miniatura original y preview expandida + cierre con Escape o scroll
  useEffect(() => {
    const isInsideRect = (
      x: number,
      y: number,
      r: { left: number; top: number; width: number; height: number },
      pad: number
    ) =>
      x >= r.left - pad &&
      x <= r.left + r.width + pad &&
      y >= r.top - pad &&
      y <= r.top + r.height + pad;

    const handlePointerMove = (e: PointerEvent) => {
      if (source !== 'mouse' || e.pointerType !== 'mouse') return;

      const previewBox = {
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.totalHeight,
      };

      const overPreview = isInsideRect(e.clientX, e.clientY, previewBox, 14);
      const overOrigin = isInsideRect(e.clientX, e.clientY, originRect, 8);

      if (overPreview || overOrigin) {
        onCancelClose();
      } else {
        onScheduleClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onImmediateClose();
      }
    };

    const handleScroll = () => {
      onImmediateClose();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    layout.left,
    layout.top,
    layout.width,
    layout.totalHeight,
    originRect,
    source,
    onCancelClose,
    onScheduleClose,
    onImmediateClose,
  ]);

  const showOpenState = isExpanded && !isClosing;

  const transformStyle = showOpenState
    ? 'translate3d(0px, 0px, 0px) scale(1)'
    : isClosing
      ? `translate3d(${Math.round(layout.initialDx * 0.35)}px, ${Math.round(
          layout.initialDy * 0.35
        )}px, 0px) scale(${Math.min(0.94, layout.initialScale + 0.08)})`
      : `translate3d(${Math.round(layout.initialDx)}px, ${Math.round(
          layout.initialDy
        )}px, 0px) scale(${layout.initialScale})`;

  const transitionCss = reducedMotion
    ? 'opacity 120ms ease-out'
    : 'transform 350ms ease-out, opacity 320ms ease-out';

  const portalContent = (
    <>
      {/* Capa independiente de blur gaussiano (10px) + oscurecimiento sutil detrás de la preview */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0, 0, 0, 0.32)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          pointerEvents: 'none',
          transition: reducedMotion ? 'opacity 120ms ease-out' : 'opacity 350ms ease-out',
        }}
        className={showOpenState ? 'opacity-100' : 'opacity-0'}
      />

      {/* Preview flotante ampliada y completamente nítida encima del blur */}
      <div
        ref={previewCardRef}
        role="button"
        tabIndex={-1}
        onClick={onOpenFullModal}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') {
            onCancelClose();
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') {
            onScheduleClose();
          }
        }}
        aria-label={`Abrir ${client.name} — Publicación ${pieceNumber} en pantalla completa con sonido`}
        style={{
          position: 'fixed',
          top: `${layout.top}px`,
          left: `${layout.left}px`,
          width: `${layout.width}px`,
          zIndex: 10000,
          transform: transformStyle,
          opacity: showOpenState ? 1 : isClosing ? 0 : 0.35,
          transition: transitionCss,
          willChange: 'transform, opacity',
        }}
        className="group cursor-pointer select-none rounded-xl overflow-hidden bg-[#060606] border border-white/15 shadow-[0_28px_80px_rgba(0,0,0,0.88)]"
      >
        {/* Área vertical 9:16 con reproducción automática silenciada en bucle */}
        <div
          className="relative w-full bg-black overflow-hidden"
          style={{ height: `${layout.videoHeight}px` }}
        >
          {/* Reproductor real (Vimeo SDK o TikTok Embed) montado al abrir y desmontado al cerrar */}
          <div className="absolute inset-0 z-0">
            {post.platform === 'vimeo' ? (
              <VimeoPlayer
                key={`preview-vimeo-${post.videoId}`}
                videoId={post.videoId}
                vimeoHash={post.vimeoHash}
                title={`${client.name} — Preview ${pieceNumber}`}
                mode="preview"
                active={!isClosing}
                onPlaying={() => setIsVideoPlaying(true)}
              />
            ) : (
              <TikTokPlayer
                key={`preview-tiktok-${post.videoId}`}
                videoId={post.videoId}
                title={`${client.name} — Preview ${pieceNumber}`}
                mode="preview"
                active={!isClosing}
                onPlaying={() => setIsVideoPlaying(true)}
              />
            )}
          </div>

          {/* Portada puente sin flash negro: se desvanece suavemente en cuanto empieza el vídeo */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ease-out ${
              isVideoPlaying ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#060606] flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border border-white/15 bg-black/60 flex items-center justify-center text-sm font-mono tracking-[0.2em] text-white/75">
                  {client.initials}
                </div>
              </div>
            )}
          </div>

          {/* Escudo superior de click para abrir siempre el modal completo con sonido */}
          <div aria-hidden="true" className="absolute inset-0 z-20" />
        </div>

        {/* Pie minimalista Cineprood */}
        <div
          className="px-4 bg-[#070707] border-t border-white/10 flex items-center justify-between gap-3"
          style={{ height: `${FOOTER_HEIGHT}px` }}
        >
          <div className="min-w-0">
            <p className="text-xs font-black tracking-tight uppercase text-white truncate">
              {client.name}
            </p>
            <p className="text-[10px] font-mono tracking-[0.24em] uppercase text-white/50 mt-0.5 truncate">
              {client.role}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-white/70 group-hover:text-red-500 transition-colors duration-200 whitespace-nowrap shrink-0">
            <span>VER COMPLETO</span>
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </div>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(portalContent, document.body);
  }

  return portalContent;
};

export default FloatingPreviewPortal;
