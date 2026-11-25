import React, { useState, useEffect } from 'react';
import { VideoPlatform, resolveVimeoThumbnail } from '../data/clientWork';

export interface MobileVideoCardProps {
  platform: VideoPlatform;
  videoId: string;
  vimeoHash?: string;
  aspectRatio?: '9:16' | '16:9';
  posterUrl?: string | null;
  title: string;
  isPlaying: boolean;
  onPlay: () => void;
  /** Optional direct-embed mode (e.g. presentation video) without requiring a tap */
  autoEmbed?: boolean;
  /** Optional continuous muted loop mode for the opening presentation video */
  ambientLoop?: boolean;
}

/**
 * Reproductor audiovisual exclusivo para móvil (<= 768px).
 * - Nunca reutiliza el sistema oculto de previews hover de escritorio.
 * - Contenedor con aspect-ratio real reservado (9:16 o 16:9).
 * - El iframe móvil es siempre visible (opacity: 1, visibility: visible, pointer-events: auto).
 * - Sin loaders ni texto "Cargando": la portada hace crossfade rápido (~200ms) al estar listo.
 */
export const MobileVideoCard: React.FC<MobileVideoCardProps> = ({
  platform,
  videoId,
  vimeoHash,
  aspectRatio = '9:16',
  posterUrl,
  title,
  isPlaying,
  onPlay,
  autoEmbed = false,
  ambientLoop = false,
}) => {
  const [resolvedPoster, setResolvedPoster] = useState<string | null>(posterUrl ?? null);
  const [posterFailed, setPosterFailed] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [coverDismissed, setCoverDismissed] = useState(false);

  const isHorizontal = aspectRatio === '16:9';
  const shouldMountPlayer = autoEmbed || isPlaying;

  // Resolver portada inicial o vía Vimeo oEmbed si falta
  useEffect(() => {
    setPosterFailed(false);
    setResolvedPoster(posterUrl ?? null);

    if (posterUrl || platform !== 'vimeo') return;

    let cancelled = false;
    resolveVimeoThumbnail(videoId, vimeoHash).then((url) => {
      if (!cancelled && url) {
        setResolvedPoster(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [posterUrl, platform, videoId, vimeoHash]);

  // Al activar el reproductor, desvanecer la portada rápidamente al cargar (y nunca bloquearla)
  useEffect(() => {
    if (!shouldMountPlayer) {
      setIframeReady(false);
      setCoverDismissed(false);
      return;
    }

    // Seguridad: incluso si onLoad tarda en red lenta, retirar portada tras 900ms para exponer el player
    const fallbackTimer = window.setTimeout(() => {
      setIframeReady(true);
    }, 900);

    return () => window.clearTimeout(fallbackTimer);
  }, [shouldMountPlayer, videoId]);

  useEffect(() => {
    if (!iframeReady) return;
    const unmountTimer = window.setTimeout(() => {
      setCoverDismissed(true);
    }, 220);
    return () => window.clearTimeout(unmountTimer);
  }, [iframeReady]);

  const hashParam = vimeoHash ? `&h=${encodeURIComponent(vimeoHash)}` : '';
  const iframeSrc =
    platform === 'vimeo'
      ? ambientLoop
        ? `https://player.vimeo.com/video/${encodeURIComponent(
            videoId
          )}?background=1&autoplay=1&muted=1&loop=1&playsinline=1&autopause=0${hashParam}`
        : `https://player.vimeo.com/video/${encodeURIComponent(
            videoId
          )}?playsinline=1&autoplay=1&muted=1&title=0&byline=0&portrait=0${hashParam}`
      : `https://www.tiktok.com/player/v1/${encodeURIComponent(
          videoId
        )}?autoplay=1&muted=1&controls=1&description=0&music_info=0&rel=0`;

  const showPoster = Boolean(resolvedPoster) && !posterFailed;

  return (
    <div
      className={`mobile-video-container ${
        isHorizontal ? 'is-horizontal aspect-video' : 'aspect-[9/16]'
      } relative block w-full overflow-hidden rounded-[4px] border border-white/10 bg-black`}
    >
      {/* Iframe NORMAL y VISIBLE (nunca oculto ni desplazado fuera del viewport) */}
      {shouldMountPlayer && (
        <iframe
          key={`mobile-${platform}-${videoId}`}
          src={iframeSrc}
          title={title}
          onLoad={() => setIframeReady(true)}
          className="mobile-video-player absolute inset-0 block w-full h-full border-0 opacity-100 visible pointer-events-auto"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; clipboard-write; web-share"
          allowFullScreen
          loading="eager"
        />
      )}

      {/* Portada táctil: visible antes de pulsar y con crossfade de 200ms al cargar el reproductor */}
      {(!shouldMountPlayer || !coverDismissed) && (
        <button
          type="button"
          onClick={shouldMountPlayer ? undefined : onPlay}
          aria-label={`Reproducir ${title}`}
          className={`absolute inset-0 z-10 w-full h-full block p-0 m-0 border-0 bg-black text-left transition-opacity duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
            shouldMountPlayer
              ? iframeReady
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100 pointer-events-none'
              : 'opacity-100 cursor-pointer'
          }`}
        >
          {showPoster && resolvedPoster ? (
            <img
              src={resolvedPoster}
              alt={title}
              width={isHorizontal ? 1280 : 720}
              height={isHorizontal ? 720 : 1280}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setPosterFailed(true)}
              className="w-full h-full object-cover block"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-full h-full bg-[#070707]"
            />
          )}

          {/* Scrim sutil solo para que el botón Play destaque sobre cualquier fotograma */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-black/20 pointer-events-none"
          />

          {/* Botón Play minimalista centrado (sin textos ni loaders) */}
          {!shouldMountPlayer && (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="w-14 h-14 rounded-full border border-white/40 bg-black/55 flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white translate-x-0.5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default MobileVideoCard;
