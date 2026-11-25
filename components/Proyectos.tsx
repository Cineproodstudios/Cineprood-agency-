import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Reveal from './Reveal';
import VimeoPlayer from './VimeoPlayer';
import { resolveVimeoThumbnail } from '../data/clientWork';
import { preloadImageUrl, warmPreconnect } from '../utils/mobile';

interface Proyecto {
  id: string;
  title: string;
  vimeoId: string;
  /** Hash opcional para vídeos de Vimeo no listados (parámetro h=) */
  vimeoHash?: string;
  /** Póster manual opcional; si falta o falla, se obtiene automáticamente vía Vimeo oEmbed */
  image?: string;
}

interface CardRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ActivePortfolioPreview {
  proyecto: Proyecto;
  posterUrl: string | null;
  originRect: CardRect;
  source: 'mouse' | 'keyboard';
}

const HOVER_DELAY_MS = 200;
const CLOSE_TOLERANCE_MS = 140;
const CLOSE_ANIMATION_MS = 340;
const HOVER_SCALE = 1.2;
const VIEWPORT_MARGIN = 20;

function supportsDesktopHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buildFullscreenVimeoUrl(vimeoId: string, vimeoHash?: string): string {
  const hashQuery = vimeoHash ? `?h=${encodeURIComponent(vimeoHash)}` : '';
  return `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}${hashQuery}`;
}

interface PortfolioHoverPortalProps {
  preview: ActivePortfolioPreview;
  isClosing: boolean;
  onCancelClose: () => void;
  onScheduleClose: () => void;
  onImmediateClose: () => void;
  onOpenFullVideo: (videoUrl: string) => void;
}

const PortfolioHoverPortal: React.FC<PortfolioHoverPortalProps> = ({
  preview,
  isClosing,
  onCancelClose,
  onScheduleClose,
  onImmediateClose,
  onOpenFullVideo,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const reducedMotion = prefersReducedMotion();
  const { proyecto, posterUrl, originRect, source } = preview;

  // Calcular posición final escalada (~1.2x, 16:9) sin cortarse nunca por bordes ni overflow
  const layout = useMemo(() => {
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 900;

    const targetScale = reducedMotion ? 1.03 : HOVER_SCALE;
    const maxAllowedWidth = Math.max(260, viewportW - VIEWPORT_MARGIN * 2);
    const maxAllowedHeight = Math.max(160, viewportH - VIEWPORT_MARGIN * 2);

    const idealWidth = originRect.width * targetScale;
    const idealHeight = idealWidth * (9 / 16);

    const fitRatio = Math.min(
      1,
      maxAllowedWidth / Math.max(1, idealWidth),
      maxAllowedHeight / Math.max(1, idealHeight)
    );

    const width = Math.round(idealWidth * fitRatio);
    const height = Math.round(width * (9 / 16));

    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;

    const clampedLeft = Math.round(
      Math.max(
        VIEWPORT_MARGIN,
        Math.min(originCenterX - width / 2, viewportW - width - VIEWPORT_MARGIN)
      )
    );
    const clampedTop = Math.round(
      Math.max(
        VIEWPORT_MARGIN,
        Math.min(originCenterY - height / 2, viewportH - height - VIEWPORT_MARGIN)
      )
    );

    const targetCenterX = clampedLeft + width / 2;
    const targetCenterY = clampedTop + height / 2;

    const initialDx = originCenterX - targetCenterX;
    const initialDy = originCenterY - targetCenterY;
    const initialScale = Math.max(
      0.5,
      Math.min(1, originRect.width / Math.max(1, width))
    );

    return {
      left: clampedLeft,
      top: clampedTop,
      width,
      height,
      initialDx,
      initialDy,
      initialScale,
    };
  }, [originRect, reducedMotion]);

  // Transición suave (0.35s ease-out) respetando prefers-reduced-motion
  useEffect(() => {
    setIsExpanded(false);
    setIsIframeLoaded(false);

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
  }, [proyecto.id, reducedMotion]);

  // Puente de ratón entre tarjeta original y tarjeta ampliada + cierre con Esc o scroll
  useEffect(() => {
    const isInsideRect = (x: number, y: number, r: CardRect, pad: number) =>
      x >= r.left - pad &&
      x <= r.left + r.width + pad &&
      y >= r.top - pad &&
      y <= r.top + r.height + pad;

    const handlePointerMove = (e: PointerEvent) => {
      if (source !== 'mouse' || e.pointerType !== 'mouse') return;

      const previewRect: CardRect = {
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
      };

      if (
        isInsideRect(e.clientX, e.clientY, previewRect, 12) ||
        isInsideRect(e.clientX, e.clientY, originRect, 8)
      ) {
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
    layout.height,
    originRect,
    source,
    onCancelClose,
    onScheduleClose,
    onImmediateClose,
  ]);

  const showOpenState = isExpanded && !isClosing;

  const transformStyle = showOpenState
    ? 'translate3d(0px, 0px, 0px) scale(1)'
    : `translate3d(${Math.round(layout.initialDx)}px, ${Math.round(
        layout.initialDy
      )}px, 0px) scale(${layout.initialScale})`;

  const transitionCss = reducedMotion
    ? 'opacity 120ms ease-out'
    : 'transform 350ms ease-out, opacity 320ms ease-out, box-shadow 350ms ease-out';

  const portalContent = (
    <>
      {/* Overlay de blur independiente detrás de la tarjeta activa (nunca tapa el iframe) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0, 0, 0, 0.34)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          pointerEvents: 'none',
          transition: reducedMotion ? 'opacity 120ms ease-out' : 'opacity 350ms ease-out',
        }}
        className={showOpenState ? 'opacity-100' : 'opacity-0'}
      />

      {/* Tarjeta ampliada 16:9 en primer plano (z-index 10000) */}
      <div
        role="button"
        tabIndex={-1}
        onClick={() =>
          onOpenFullVideo(buildFullscreenVimeoUrl(proyecto.vimeoId, proyecto.vimeoHash))
        }
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
        aria-label={`Ver ${proyecto.title} a pantalla completa`}
        style={{
          position: 'fixed',
          top: `${layout.top}px`,
          left: `${layout.left}px`,
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          aspectRatio: '16 / 9',
          zIndex: 10000,
          transform: transformStyle,
          opacity: showOpenState ? 1 : isClosing ? 0 : 0.85,
          transition: transitionCss,
          willChange: 'transform, opacity',
        }}
        className="group cursor-pointer select-none rounded-xl overflow-hidden bg-[#060606] border border-white/15 shadow-[0_28px_80px_rgba(0,0,0,0.88)]"
      >
        {/* Capa 0: iframe embebido directo de Vimeo (background=1&autoplay=1&muted=1&loop=1&autopause=0) */}
        <div className="absolute inset-0 z-0">
          <VimeoPlayer
            key={`portfolio-preview-${proyecto.vimeoId}-${proyecto.vimeoHash ?? ''}`}
            videoId={proyecto.vimeoId}
            vimeoHash={proyecto.vimeoHash}
            title={`${proyecto.title} — Preview`}
            mode="preview"
            active={!isClosing}
            onPlaying={() => setIsIframeLoaded(true)}
          />
        </div>

        {/* Capa 1: póster visible hasta que el iframe dispara onLoad (evita flashes negros) */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ease-out ${
            isIframeLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {posterUrl && (
            <img
              src={posterUrl}
              alt={proyecto.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Capa 2: escudo transparente para que el iframe nunca capture el ratón ni los clics */}
        <div aria-hidden="true" className="absolute inset-0 z-20" />

        {/* Degradado cinematográfico inferior y título */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-30 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"
        />

        <div className="absolute inset-x-0 bottom-0 z-40 p-4 sm:p-5 flex items-end justify-between gap-4 pointer-events-none">
          <h4 className="text-sm sm:text-base font-bold tracking-tight uppercase text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-1">
            {proyecto.title}
          </h4>
          <span className="text-[10px] font-mono tracking-[0.26em] uppercase text-white/80 group-hover:text-red-500 transition-colors duration-200 whitespace-nowrap shrink-0">
            VER PROYECTO ↗
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

interface PortfolioCardProps {
  proyecto: Proyecto;
  index: number;
  isPreviewActive: boolean;
  onOpenPreview: (
    proyecto: Proyecto,
    posterUrl: string | null,
    originRect: CardRect,
    source: 'mouse' | 'keyboard'
  ) => void;
  onCancelClose: () => void;
  onScheduleClose: (id: string) => void;
  onImmediateClose: (id: string) => void;
  onOpenVideo: (url: string) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  proyecto,
  index,
  isPreviewActive,
  onOpenPreview,
  onCancelClose,
  onScheduleClose,
  onImmediateClose,
  onOpenVideo,
}) => {
  const mediaBoxRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(proyecto.image ?? null);

  // Obtener miniatura automáticamente desde la API oEmbed de Vimeo si no hay póster manual o falla
  useEffect(() => {
    setPosterUrl(proyecto.image ?? null);
    if (proyecto.image) return;

    let cancelled = false;
    resolveVimeoThumbnail(proyecto.vimeoId, proyecto.vimeoHash).then((thumb) => {
      if (!cancelled && thumb) {
        setPosterUrl(thumb);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [proyecto.image, proyecto.vimeoId, proyecto.vimeoHash]);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearHoverTimer();
    };
  }, [clearHoverTimer]);

  const schedulePreviewOpen = (source: 'mouse' | 'keyboard') => {
    clearHoverTimer();

    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null;
      const el = mediaBoxRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      onOpenPreview(
        proyecto,
        posterUrl,
        {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        source
      );
    }, HOVER_DELAY_MS);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    // En móvil y tablet (sin hover): un toque abre directamente la pantalla completa
    if (e.pointerType !== 'mouse' || !supportsDesktopHover()) return;

    if (isPreviewActive) {
      onCancelClose();
      return;
    }

    schedulePreviewOpen('mouse');
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;

    clearHoverTimer();
    if (isPreviewActive) {
      onScheduleClose(proyecto.id);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!supportsDesktopHover()) return;
    if (e.currentTarget.matches(':focus-visible')) {
      schedulePreviewOpen('keyboard');
    }
  };

  const handleBlur = () => {
    clearHoverTimer();
    if (isPreviewActive) {
      onImmediateClose(proyecto.id);
    }
  };

  const handleActivate = () => {
    clearHoverTimer();
    onImmediateClose(proyecto.id);
    onOpenVideo(buildFullscreenVimeoUrl(proyecto.vimeoId, proyecto.vimeoHash));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };

  const handlePosterError = () => {
    resolveVimeoThumbnail(proyecto.vimeoId, proyecto.vimeoHash).then((thumb) => {
      if (thumb && thumb !== posterUrl) {
        setPosterUrl(thumb);
      }
    });
  };

  return (
    <Reveal delay={index * 100} className="group">
      <div
        role="button"
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={`Reproducir ${proyecto.title} a pantalla completa`}
        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-xl"
      >
        <div
          ref={mediaBoxRef}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          className="relative aspect-video rounded-xl bg-black/5 dark:bg-[#080808] border border-black/5 dark:border-white/10 overflow-hidden mb-4 md:mb-8 transition-all duration-300 ease-out md:group-hover:border-red-600/50"
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={proyecto.title}
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              onError={handlePosterError}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 bg-black/5 dark:bg-white/5" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 dark:from-black/75 to-transparent opacity-65 pointer-events-none" />

          <div className="hidden md:flex absolute inset-0 items-center justify-center translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 pointer-events-none">
            <div className="bg-red-600 text-white px-7 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-[0.4em] shadow-lg shadow-red-600/20 whitespace-nowrap">
              VER PROYECTO
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-l border-transparent md:group-hover:border-red-600 pl-0 md:group-hover:pl-6 transition-all duration-300 ease-out">
          <div className="flex justify-between items-start">
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight uppercase md:group-hover:text-red-600 transition-colors duration-300">
              {proyecto.title}
            </h4>
          </div>

          <div className="h-[2px] bg-black/10 dark:bg-white/10 w-full relative mt-2 overflow-hidden">
            <div className="absolute inset-0 bg-red-600 -translate-x-full md:group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          </div>
        </div>
      </div>
    </Reveal>
  );
};

const proyectos: Proyecto[] = [
  {
    id: '2',
    title: 'Jeep — Spec Commercial',
    vimeoId: '1163583249',
    image:
      'https://i.postimg.cc/yxXVhQmJ/hf-20260203-123826-56d416d4-9f59-43c4-8baa-0514cf967b19.jpg',
  },
  {
    id: '4',
    title: 'Ferrari Aspire',
    vimeoId: '1163585610',
    image: 'https://i.postimg.cc/RFWdn2zf/IMG-3842-Recuperado.jpg',
  },
  {
    id: '6',
    title: 'Cruzcampo Pilsen Una obra de arte',
    vimeoId: '1180748644',
    image:
      'https://i.postimg.cc/MHGVssfL/hf-20260406-122659-1c3aed91-fcf1-4147-8427-afb51d25cb6a-(1).jpg',
  },
  {
    id: '8',
    title: 'VISIT CÓRDOBA',
    vimeoId: '1193698974',
    image: 'https://i.postimg.cc/jqWCVDNf/Timeline-1-01-00-04-13.jpg',
  },
  {
    id: '9',
    title: 'Hay Cosas que Nunca Cambian, Mejoran | Renault 5 E-tech',
    vimeoId: '1209219710',
    image:
      'https://i.postimg.cc/pXpSqh33/hf-20260712-105941-dd0833b0-b2e8-4ac9-8c1c-f1c2d115f34f.png',
  },
  {
    id: '10',
    title: 'Jeep avenger | Nacido para dominar cualquier era',
    vimeoId: '1213647026',
    image: 'https://i.postimg.cc/d02HKRGC/Timeline-1-01-00-43-22.jpg',
  },
  {
    id: '11',
    title: 'Cantabria | Travel video',
    vimeoId: '1222737449',
    image:
      'https://i.vimeocdn.com/video/2195772112-4befaf2a9d5567cf2874b9e192e5138f5418b94d4cbda7e4523f1e3e4ae6deba-d_1280',
  },
];

const accidentadosImages = [
  'https://i.postimg.cc/qBsLQm90/Timeline-1-01-00-08-07.jpg',
  'https://i.postimg.cc/KcPNQ9db/Timeline-1-01-01-05-18.jpg',
  'https://i.postimg.cc/9Xdp1xvc/Timeline-1-01-01-20-17.jpg',
  'https://i.postimg.cc/y6mPnfws/Timeline-1-01-02-45-23.jpg',
  'https://i.postimg.cc/v8rzXPpY/Timeline-1-01-03-02-13.jpg',
  'https://i.postimg.cc/pVfZk0gV/Timeline-1-01-03-11-20.jpg',
  'https://i.postimg.cc/Y2638XJq/Timeline-1-01-03-41-09.jpg',
  'https://i.postimg.cc/XqkkJJw1/Timeline-1-01-05-21-12.jpg',
];

const murmulloImages = [
  'https://i.postimg.cc/QMP34NKn/Timeline-1-01-00-25-12.jpg',
  'https://i.postimg.cc/W3kPQR06/Timeline-1-01-04-19-02.jpg',
  'https://i.postimg.cc/ydZzwq0T/Timeline-1-01-13-37-10.jpg',
  'https://i.postimg.cc/pTFtgNKC/Timeline-1-01-13-51-18.jpg',
  'https://i.postimg.cc/8C3SKkfy/Timeline-1-01-16-20-12.jpg',
  'https://i.postimg.cc/mrqsXZ15/Timeline-1-01-16-45-20.jpg',
];

const humoImages = [
  'https://i.postimg.cc/cHCqrdd2/Timeline-1-01-00-04-10.jpg',
  'https://i.postimg.cc/Tw18pTRv/Timeline-1-01-00-16-01.jpg',
  'https://i.postimg.cc/63qsyB9w/Timeline-1-01-03-10-12.jpg',
  'https://i.postimg.cc/tTJ0Y9XH/Timeline-1-01-03-22-08.jpg',
  'https://i.postimg.cc/FRzt7h9N/Timeline-1-01-03-49-15.jpg',
  'https://i.postimg.cc/cHCqrds4/Timeline-1-01-04-13-00.jpg',
  'https://i.postimg.cc/XJqMpnVv/Timeline-1-01-06-15-20.jpg',
  'https://i.postimg.cc/cHCqrdsH/Timeline-1-01-07-21-20.jpg',
];

const Proyectos: React.FC<{ onOpenVideo: (url: string) => void }> = ({ onOpenVideo }) => {
  const [view, setView] = useState<'portfolio' | 'shorts'>('portfolio');
  const [activePreview, setActivePreview] = useState<ActivePortfolioPreview | null>(null);
  const [isPreviewClosing, setIsPreviewClosing] = useState(false);

  const activePreviewRef = useRef<ActivePortfolioPreview | null>(null);
  activePreviewRef.current = activePreview;
  const isClosingRef = useRef(false);
  const closeDelayTimerRef = useRef<number | null>(null);
  const closeUnmountTimerRef = useRef<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const portfolioRef = React.useRef<HTMLDivElement>(null);
  const shortsRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | string>('auto');

  const clearPreviewTimers = useCallback(() => {
    if (closeDelayTimerRef.current !== null) {
      window.clearTimeout(closeDelayTimerRef.current);
      closeDelayTimerRef.current = null;
    }
    if (closeUnmountTimerRef.current !== null) {
      window.clearTimeout(closeUnmountTimerRef.current);
      closeUnmountTimerRef.current = null;
    }
  }, []);

  const handleImmediateClose = useCallback(
    (id?: string) => {
      const current = activePreviewRef.current;
      if (id && current && current.proyecto.id !== id) return;
      clearPreviewTimers();
      isClosingRef.current = false;
      setIsPreviewClosing(false);
      setActivePreview(null);
    },
    [clearPreviewTimers]
  );

  const handleCancelClose = useCallback(() => {
    clearPreviewTimers();
    if (isClosingRef.current) {
      isClosingRef.current = false;
      setIsPreviewClosing(false);
    }
  }, [clearPreviewTimers]);

  const handleScheduleClose = useCallback((id?: string) => {
    if (
      closeDelayTimerRef.current !== null ||
      closeUnmountTimerRef.current !== null ||
      isClosingRef.current
    ) {
      return;
    }

    closeDelayTimerRef.current = window.setTimeout(() => {
      closeDelayTimerRef.current = null;
      const current = activePreviewRef.current;
      if (!current) return;
      if (id && current.proyecto.id !== id) return;

      isClosingRef.current = true;
      setIsPreviewClosing(true);

      const exitMs = prefersReducedMotion() ? 120 : CLOSE_ANIMATION_MS;
      closeUnmountTimerRef.current = window.setTimeout(() => {
        closeUnmountTimerRef.current = null;
        isClosingRef.current = false;
        setIsPreviewClosing(false);
        setActivePreview(null);
      }, exitMs);
    }, CLOSE_TOLERANCE_MS);
  }, []);

  const handlePortalScheduleClose = useCallback(() => {
    handleScheduleClose();
  }, [handleScheduleClose]);

  const handleOpenPreview = useCallback(
    (
      proyecto: Proyecto,
      posterUrl: string | null,
      originRect: CardRect,
      source: 'mouse' | 'keyboard'
    ) => {
      clearPreviewTimers();
      isClosingRef.current = false;
      setIsPreviewClosing(false);
      setActivePreview({ proyecto, posterUrl, originRect, source });
    },
    [clearPreviewTimers]
  );

  const handleOpenFullVideo = useCallback(
    (videoUrl: string) => {
      handleImmediateClose();
      onOpenVideo(videoUrl);
    },
    [handleImmediateClose, onOpenVideo]
  );

  useEffect(() => {
    if (view !== 'portfolio') {
      handleImmediateClose();
    }
  }, [view, handleImmediateClose]);

  useEffect(() => {
    return () => {
      clearPreviewTimers();
    };
  }, [clearPreviewTimers]);

  useEffect(() => {
    if (!activePreview) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleImmediateClose();
      }
    };
    const handleBlur = () => handleImmediateClose();
    const handleDocumentMouseLeave = () => handleScheduleClose();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.documentElement.addEventListener('mouseleave', handleDocumentMouseLeave);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.documentElement.removeEventListener('mouseleave', handleDocumentMouseLeave);
    };
  }, [activePreview, handleImmediateClose, handleScheduleClose]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          proyectos.forEach((p) => {
            if (p.image) preloadImageUrl(p.image);
          });
          warmPreconnect('https://player.vimeo.com');
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const updateHeight = () => {
      if (view === 'portfolio' && portfolioRef.current) {
        setHeight(portfolioRef.current.offsetHeight);
      } else if (view === 'shorts' && shortsRef.current) {
        setHeight(shortsRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    const activeTarget = view === 'portfolio' ? portfolioRef.current : shortsRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (activeTarget && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(activeTarget);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [view]);

  return (
    <section
      ref={sectionRef}
      id="proyectos"
      className="bg-white dark:bg-black transition-all duration-1000 ease-expo overflow-hidden"
      style={{ height }}
    >
      <div
        className="flex w-[200%] transition-transform duration-1000 ease-expo items-start"
        style={{ transform: `translateX(${view === 'portfolio' ? '0%' : '-50%'})` }}
      >
        {/* VIEW 1: PORTFOLIO */}
        <div ref={portfolioRef} className="w-1/2 py-14 md:py-32 px-5 md:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-between items-center md:items-end gap-4 mb-10 md:mb-32">
              <Reveal>
                <p className="text-[10px] md:text-xs font-mono tracking-[0.55em] md:tracking-[0.8em] uppercase opacity-30 mb-0 md:mb-4 select-none">
                  Portafolio
                </p>
              </Reveal>
              <Reveal delay={200}>
                <button
                  type="button"
                  onClick={() => setView('shorts')}
                  className="group flex items-center gap-3 md:gap-4 min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 border border-red-600/30 hover:border-red-600 text-[10px] font-mono tracking-[0.3em] md:tracking-[0.4em] uppercase transition-all duration-500 bg-red-600/5 hover:bg-red-600 hover:text-white cursor-pointer"
                >
                  <span>Cortometrajes</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path
                      d="M1 6H11M11 6L6 1M11 6L6 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 md:gap-y-32">
              {proyectos.map((p, i) => (
                <PortfolioCard
                  key={p.id}
                  proyecto={p}
                  index={i}
                  isPreviewActive={activePreview?.proyecto.id === p.id}
                  onOpenPreview={handleOpenPreview}
                  onCancelClose={handleCancelClose}
                  onScheduleClose={handleScheduleClose}
                  onImmediateClose={handleImmediateClose}
                  onOpenVideo={handleOpenFullVideo}
                />
              ))}
            </div>

            <Reveal className="mt-14 md:mt-40 text-center" delay={300}>
              <p className="text-xs font-mono tracking-[0.3em] md:tracking-[0.4em] uppercase opacity-30 select-none">
                Nuevas piezas en producción constante.
              </p>
            </Reveal>
          </div>
        </div>

        {/* VIEW 2: SHORTS */}
        <div ref={shortsRef} className="w-1/2 py-14 md:py-32 px-5 md:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-10 md:mb-24">
              <Reveal>
                <div>
                  <p className="text-[10px] md:text-xs font-mono tracking-[0.55em] md:tracking-[0.8em] uppercase opacity-30 mb-3 md:mb-4 select-none">
                    Cortometrajes
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase">
                    Accidentados
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <button
                  type="button"
                  onClick={() => setView('portfolio')}
                  className="group flex items-center gap-3 md:gap-4 min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 border border-red-600/30 hover:border-red-600 text-[10px] font-mono tracking-[0.3em] md:tracking-[0.4em] uppercase transition-all duration-500 bg-red-600/5 hover:bg-red-600 hover:text-white cursor-pointer"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rotate-180 transition-transform group-hover:-translate-x-1"
                  >
                    <path
                      d="M1 6H11M11 6L6 1M11 6L6 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Volver</span>
                </button>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {accidentadosImages.map((src, i) => (
                <Reveal
                  key={`acc-${i}`}
                  delay={i * 100}
                  className={`relative overflow-hidden group ${
                    i % 3 === 0 ? 'md:col-span-2 aspect-video md:aspect-[21/9]' : 'aspect-video'
                  }`}
                >
                  <img
                    src={src}
                    alt={`Accidentados frame ${i + 1}`}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out md:group-hover:scale-[1.05]"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white opacity-0 md:group-hover:opacity-60 transition-opacity duration-500 uppercase tracking-widest">
                    Frame 0{i + 1}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* MURMULLO DE LOS GRILLOS */}
            <Reveal className="mt-16 mb-8 md:mt-48 md:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase">
                Murmullo de los grillos
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {murmulloImages.map((src, i) => (
                <Reveal
                  key={`mur-${i}`}
                  delay={i * 100}
                  className={`relative overflow-hidden group ${
                    i % 3 === 0 ? 'md:col-span-2 aspect-video md:aspect-[21/9]' : 'aspect-video'
                  }`}
                >
                  <img
                    src={src}
                    alt={`Murmullo frame ${i + 1}`}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out md:group-hover:scale-[1.05]"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white opacity-0 md:group-hover:opacity-60 transition-opacity duration-500 uppercase tracking-widest">
                    Frame 0{i + 1}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* HUMO */}
            <Reveal className="mt-16 mb-8 md:mt-48 md:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase">
                Humo
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {humoImages.map((src, i) => (
                <Reveal
                  key={`humo-${i}`}
                  delay={i * 100}
                  className={`relative overflow-hidden group ${
                    i % 3 === 0 ? 'md:col-span-2 aspect-video md:aspect-[21/9]' : 'aspect-video'
                  }`}
                >
                  <img
                    src={src}
                    alt={`Humo frame ${i + 1}`}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out md:group-hover:scale-[1.05]"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white opacity-0 md:group-hover:opacity-60 transition-opacity duration-500 uppercase tracking-widest">
                    Frame 0{i + 1}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portal de preview ampliada (~1.2x) con blur gaussiano detrás y desmontaje al salir */}
      {activePreview && (
        <PortfolioHoverPortal
          preview={activePreview}
          isClosing={isPreviewClosing}
          onCancelClose={handleCancelClose}
          onScheduleClose={handlePortalScheduleClose}
          onImmediateClose={() => handleImmediateClose()}
          onOpenFullVideo={handleOpenFullVideo}
        />
      )}
    </section>
  );
};

export default Proyectos;
