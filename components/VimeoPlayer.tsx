import React, { useState, useEffect, useRef } from 'react';

export interface VimeoPlayerProps {
  videoId: string;
  /** Hash opcional para vídeos de Vimeo no listados (parámetro h=) */
  vimeoHash?: string;
  title?: string;
  /**
   * "modal": reproducción completa con sonido, controles y pantalla completa.
   * "preview": reproducción embebida directa con background=1&autoplay=1&muted=1&loop=1&autopause=0.
   */
  mode?: 'modal' | 'preview';
  /** Solo relevante en mode="preview" */
  active?: boolean;
  /** Notifica cuando el iframe ha cargado y está listo para desvanecer el póster */
  onPlaying?: () => void;
}

export const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
  videoId,
  vimeoHash,
  title = 'Vídeo de Vimeo',
  mode = 'modal',
  active = true,
  onPlaying,
}) => {
  const onPlayingRef = useRef(onPlaying);
  const settleTimerRef = useRef<number | null>(null);
  onPlayingRef.current = onPlaying;

  const [isLoaded, setIsLoaded] = useState(false);

  const isPreview = mode === 'preview';
  const hashParam = vimeoHash ? `&h=${encodeURIComponent(vimeoHash)}` : '';

  const previewSrc = `https://player.vimeo.com/video/${encodeURIComponent(
    videoId
  )}?background=1&autoplay=1&muted=1&loop=1&autopause=0${hashParam}`;

  const modalSrc = `https://player.vimeo.com/video/${encodeURIComponent(
    videoId
  )}?autoplay=1&title=0&byline=0&portrait=0${hashParam}`;

  useEffect(() => {
    setIsLoaded(false);
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
  }, [videoId, vimeoHash, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    const safetyTimer = window.setTimeout(() => {
      setIsLoaded(true);
    }, 1800);
    return () => window.clearTimeout(safetyTimer);
  }, [videoId, vimeoHash, isPreview]);

  if (isPreview) {
    if (!active) {
      return null;
    }

    return (
      <iframe
        key={`vimeo-preview-${videoId}-${vimeoHash ?? ''}`}
        src={previewSrc}
        title={title}
        onLoad={() => {
          if (settleTimerRef.current !== null) {
            window.clearTimeout(settleTimerRef.current);
          }
          // Breve margen tras onLoad para evitar flash negro al revelar el vídeo sobre el póster
          settleTimerRef.current = window.setTimeout(() => {
            settleTimerRef.current = null;
            setIsLoaded(true);
            onPlayingRef.current?.();
          }, 160);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
        className="bg-black pointer-events-none block"
        allow="autoplay; fullscreen; picture-in-picture"
        loading="eager"
        tabIndex={-1}
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {!isLoaded && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 bg-[#050505] flex flex-col items-center justify-center gap-3 pointer-events-none"
        >
          <div className="w-7 h-7 border border-white/15 border-t-red-600 rounded-full animate-spin" />
          <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/45">
            Cargando vídeo
          </span>
        </div>
      )}

      <iframe
        key={`vimeo-modal-${videoId}-${vimeoHash ?? ''}`}
        src={modalSrc}
        title={title}
        onLoad={() => setIsLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
        className={`bg-black transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="eager"
      />
    </div>
  );
};

export const VimeoPost = VimeoPlayer;

export default VimeoPlayer;
