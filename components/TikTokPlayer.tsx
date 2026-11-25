import React, { useState, useEffect, useRef } from 'react';

export interface TikTokPlayerProps {
  videoId: string;
  title?: string;
  /**
   * "modal": reproducción completa con sonido, controles y fullscreen.
   * "preview": reproducción automática silenciada en bucle dentro de la preview flotante.
   */
  mode?: 'modal' | 'preview';
  /** Solo relevante en mode="preview": pausa y reinicia al segundo 0 al pasar a false */
  active?: boolean;
  /** Notifica cuando el reproductor preview está listo para mostrarse */
  onPlaying?: () => void;
}

export const TikTokPlayer: React.FC<TikTokPlayerProps> = ({
  videoId,
  title = 'Vídeo de TikTok',
  mode = 'modal',
  active = true,
  onPlaying,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onPlayingRef = useRef(onPlaying);
  const activeRef = useRef(active);
  onPlayingRef.current = onPlaying;
  activeRef.current = active;

  const [isLoaded, setIsLoaded] = useState(false);

  const isPreview = mode === 'preview';

  const postPlayerCommand = (type: string, value?: number) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage(
        {
          type,
          ...(value !== undefined ? { value } : {}),
          'x-tiktok-player': true,
        },
        '*'
      );
    } catch {
      // Ignorar si el iframe ya se desmontó
    }
  };

  useEffect(() => {
    setIsLoaded(false);
    const safetyTimer = window.setTimeout(() => {
      setIsLoaded(true);
      if (isPreview && activeRef.current) {
        postPlayerCommand('mute');
        postPlayerCommand('play');
        onPlayingRef.current?.();
      }
    }, isPreview ? 1100 : 2000);
    return () => window.clearTimeout(safetyTimer);
  }, [videoId, isPreview]);

  // Escuchar evento onPlayerReady de TikTok Embed Player v1 para asegurar mute + play automático
  useEffect(() => {
    if (!isPreview) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object' || !data['x-tiktok-player']) return;

      if (data.type === 'onPlayerReady') {
        if (activeRef.current) {
          postPlayerCommand('mute');
          postPlayerCommand('play');
          onPlayingRef.current?.();
        }
      } else if (data.type === 'onStateChange' && data.value === 1) {
        if (activeRef.current) {
          onPlayingRef.current?.();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      postPlayerCommand('pause');
      postPlayerCommand('seekTo', 0);
    };
  }, [isPreview, videoId]);

  useEffect(() => {
    if (!isPreview) return;
    if (active) {
      postPlayerCommand('mute');
      postPlayerCommand('play');
    } else {
      postPlayerCommand('pause');
      postPlayerCommand('seekTo', 0);
    }
  }, [active, isPreview]);

  const playerSrc = isPreview
    ? `https://www.tiktok.com/player/v1/${encodeURIComponent(
        videoId
      )}?description=0&music_info=0&rel=0&autoplay=1&muted=1&controls=0&loop=1`
    : `https://www.tiktok.com/player/v1/${encodeURIComponent(
        videoId
      )}?description=0&music_info=0&rel=0&autoplay=1&controls=1`;

  return (
    <div
      className={`relative w-full h-full bg-black overflow-hidden ${
        isPreview ? 'pointer-events-none' : ''
      }`}
    >
      {!isPreview && !isLoaded && (
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
        ref={iframeRef}
        key={`${mode}-${videoId}`}
        src={playerSrc}
        title={title}
        onLoad={() => {
          setIsLoaded(true);
          if (isPreview && activeRef.current) {
            postPlayerCommand('mute');
            postPlayerCommand('play');
            window.setTimeout(() => {
              if (activeRef.current) {
                onPlayingRef.current?.();
              }
            }, 220);
          }
        }}
        className={`w-full h-full border-0 bg-black transition-opacity duration-300 ease-out ${
          isLoaded || isPreview ? 'opacity-100' : 'opacity-0'
        }`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen={!isPreview}
        tabIndex={isPreview ? -1 : 0}
        loading="eager"
      />
    </div>
  );
};

export default TikTokPlayer;
