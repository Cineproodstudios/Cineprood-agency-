import React, { useState, useRef, useEffect, useCallback } from 'react';
import Reveal from './Reveal';
import ClientProfile from './ClientProfile';
import SocialVideoModal from './SocialVideoModal';
import FloatingPreviewPortal, {
  ActiveFloatingPreview,
  PreviewOriginRect,
} from './FloatingPreviewPortal';
import {
  clients,
  ClientSocialPost,
  ClientSocialProfile,
  getClientPrimaryThumbnail,
  formatPublicationCount,
} from '../data/clientWork';

const PREVIEW_CLOSE_TOLERANCE_MS = 150;

interface ClientProfileCardProps {
  client: ClientSocialProfile;
  index: number;
  onSelect: (client: ClientSocialProfile) => void;
}

const ClientProfileCard: React.FC<ClientProfileCardProps> = ({
  client,
  index,
  onSelect,
}) => {
  const primaryThumb = getClientPrimaryThumbnail(client);
  const [coverFailed, setCoverFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const showThumb = Boolean(primaryThumb) && !coverFailed;
  const showLogo = Boolean(client.logo) && !logoFailed;
  const pubCount = formatPublicationCount(client.posts.length);
  const logoSizeClass =
    client.logoSizeClass ?? 'w-[68%] max-w-[220px] max-h-[54%]';

  return (
    <Reveal delay={(index % 3) * 60}>
      <button
        type="button"
        onClick={() => onSelect(client)}
        aria-label={`Abrir perfil de ${client.name} — ${pubCount}`}
        className="client-card group relative block w-full text-left aspect-[9/16] overflow-hidden rounded-[2px] bg-[#070707] border border-black/10 dark:border-white/10 hover:border-white/30 cursor-pointer select-none transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-600"
      >
        {/* 1. Portada de fondo (9:16, siempre protagonista en hover) */}
        {showThumb && primaryThumb ? (
          <img
            src={primaryThumb}
            alt={`Portada de ${client.name}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setCoverFailed(true)}
            className="client-cover absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="client-cover absolute inset-0"
            style={{
              backgroundColor: '#070707',
              backgroundImage: [
                'radial-gradient(circle at 72% 24%, rgba(255, 255, 255, 0.08) 0%, transparent 52%)',
                'radial-gradient(circle at 22% 80%, rgba(220, 38, 38, 0.08) 0%, transparent 48%)',
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 14px)',
              ].join(', '),
            }}
          />
        )}

        {/* 2. Capa overlay sutil para destacar el logo transparente sobre la portada */}
        <div
          aria-hidden="true"
          className="client-overlay absolute inset-0 pointer-events-none"
        />

        {/* Scrim inferior medido para garantizar legibilidad del nombre del cliente */}
        <div
          aria-hidden="true"
          className="client-meta-scrim absolute inset-0 pointer-events-none"
        />

        {/* Flecha discreta superior derecha */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 pointer-events-none">
          <span
            aria-hidden="true"
            className="client-arrow inline-block text-white/55 text-sm"
          >
            →
          </span>
        </div>

        {/* 3. Logo transparente centrado ligeramente por encima del medio (sin cajas ni fondos) */}
        <div className="client-logo-wrap absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-6 pb-14 sm:pb-16 pointer-events-none">
          {showLogo && client.logo ? (
            <img
              src={client.logo}
              alt={`Logo de ${client.name}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setLogoFailed(true)}
              className={`client-logo h-auto object-contain bg-transparent ${logoSizeClass}`}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex flex-col items-center justify-center text-center"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.14em] uppercase text-white/90 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
                {client.initials}
              </span>
              <span className="mt-2 w-8 h-[1px] bg-white/40" />
            </div>
          )}
        </div>

        {/* 4. Identidad del cliente abajo */}
        <div className="client-meta absolute inset-x-0 bottom-0 p-4 sm:p-6 z-20 pointer-events-none">
          <div className="client-meta-inner">
            <h3 className="text-base sm:text-xl md:text-2xl font-black tracking-tight uppercase text-white leading-[1.08] text-balance break-words drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              {client.name}
            </h3>

            <div className="mt-2 space-y-0.5">
              <p className="text-[11px] font-mono tracking-[0.14em] text-white/80 tabular-nums">
                {pubCount}
              </p>
              <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.22em] uppercase text-white/60">
                {client.role}
              </p>
            </div>
          </div>
        </div>
      </button>
    </Reveal>
  );
};

export interface ClientSocialHubProps {
  onVideoActiveChange?: (active: boolean) => void;
}

export const ClientSocialHub: React.FC<ClientSocialHubProps> = ({
  onVideoActiveChange,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const closeDelayTimerRef = useRef<number | null>(null);
  const closeUnmountTimerRef = useRef<number | null>(null);
  const isPreviewClosingRef = useRef(false);

  const [selectedClient, setSelectedClient] = useState<ClientSocialProfile | null>(null);
  const [activePreview, setActivePreview] = useState<ActiveFloatingPreview | null>(null);
  const activePreviewRef = useRef<ActiveFloatingPreview | null>(null);
  activePreviewRef.current = activePreview;
  const [isPreviewClosing, setIsPreviewClosing] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);
  const activePostIndexRef = useRef<number | null>(null);
  activePostIndexRef.current = activePostIndex;
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const handleImmediateClosePreview = useCallback(
    (postId?: string) => {
      const current = activePreviewRef.current;
      if (postId && current && current.post.id !== postId) return;
      clearPreviewTimers();
      isPreviewClosingRef.current = false;
      setIsPreviewClosing(false);
      setActivePreview(null);
    },
    [clearPreviewTimers]
  );

  const handleCancelPreviewClose = useCallback(() => {
    clearPreviewTimers();
    if (isPreviewClosingRef.current) {
      isPreviewClosingRef.current = false;
      setIsPreviewClosing(false);
    }
  }, [clearPreviewTimers]);

  const handleSchedulePreviewClose = useCallback((postId?: string) => {
    if (
      closeDelayTimerRef.current !== null ||
      closeUnmountTimerRef.current !== null ||
      isPreviewClosingRef.current
    ) {
      return;
    }

    closeDelayTimerRef.current = window.setTimeout(() => {
      closeDelayTimerRef.current = null;
      const current = activePreviewRef.current;
      if (!current) return;
      if (postId && current.post.id !== postId) return;

      // Pausar + reiniciar vídeo al segundo 0 inmediatamente y cerrar con animación suave
      isPreviewClosingRef.current = true;
      setIsPreviewClosing(true);

      const reduced =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Desmontar completamente el iframe y el Portal al finalizar la transición
      closeUnmountTimerRef.current = window.setTimeout(() => {
        closeUnmountTimerRef.current = null;
        isPreviewClosingRef.current = false;
        setIsPreviewClosing(false);
        setActivePreview(null);
      }, reduced ? 120 : 340);
    }, PREVIEW_CLOSE_TOLERANCE_MS);
  }, []);

  const handleSchedulePortalClose = useCallback(() => {
    handleSchedulePreviewClose();
  }, [handleSchedulePreviewClose]);

  const handleImmediatePortalClose = useCallback(() => {
    handleImmediateClosePreview();
  }, [handleImmediateClosePreview]);

  const handleOpenPreview = useCallback(
    (
      post: ClientSocialPost,
      postIndex: number,
      originRect: PreviewOriginRect,
      thumbnail: string | null,
      source: 'mouse' | 'keyboard'
    ) => {
      if (!selectedClient || activePostIndexRef.current !== null) return;
      clearPreviewTimers();
      isPreviewClosingRef.current = false;
      setIsPreviewClosing(false);
      setActivePreview({
        client: selectedClient,
        post,
        postIndex,
        originRect,
        thumbnail,
        source,
      });
    },
    [selectedClient, clearPreviewTimers]
  );

  useEffect(() => {
    onVideoActiveChange?.(activePostIndex !== null);
    return () => {
      onVideoActiveChange?.(false);
    };
  }, [activePostIndex, onVideoActiveChange]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      clearPreviewTimers();
    };
  }, [clearPreviewTimers]);

  useEffect(() => {
    if (!activePreview) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleImmediateClosePreview();
      }
    };

    const handleDocumentMouseLeave = () => {
      handleSchedulePreviewClose();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleImmediatePortalClose);
    document.documentElement.addEventListener('mouseleave', handleDocumentMouseLeave);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleImmediatePortalClose);
      document.documentElement.removeEventListener('mouseleave', handleDocumentMouseLeave);
    };
  }, [activePreview, handleImmediateClosePreview, handleImmediatePortalClose, handleSchedulePreviewClose]);

  const handleOpenPost = useCallback(
    (postIndex: number) => {
      // Cerrar y desmontar inmediatamente la preview flotante antes de abrir el modal con sonido
      handleImmediateClosePreview();
      setActivePostIndex(postIndex);
    },
    [handleImmediateClosePreview]
  );

  const transitionToClient = (nextClient: ClientSocialProfile | null) => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    handleImmediateClosePreview();
    setActivePostIndex(null);
    setIsTransitioning(true);

    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      setSelectedClient(nextClient);
      setIsTransitioning(false);

      if (sectionRef.current) {
        const top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
        if (Math.abs(window.scrollY - top) > 90) {
          window.scrollTo({ top: Math.max(0, top - 32), behavior: 'smooth' });
        }
      }
    }, 180);
  };

  return (
    <section
      ref={sectionRef}
      id="trabajo-clientes"
      className={`py-24 md:py-36 transition-colors duration-500 ${
        selectedClient
          ? 'px-4 sm:px-8 md:px-20 bg-black text-white'
          : 'px-4 sm:px-8 md:px-20 bg-white dark:bg-black text-black dark:text-white'
      }`}
      aria-label="Trabajo para clientes"
    >
      <div
        className={`max-w-6xl mx-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isTransitioning
            ? 'opacity-0 translate-y-2 scale-[0.99]'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {!selectedClient ? (
          /* PANTALLA PRINCIPAL — SELECTOR DE PERFILES DE CLIENTES */
          <div>
            <Reveal>
              <header className="mb-12 sm:mb-16 md:mb-20 max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-balance">
                  TRABAJO PARA CLIENTES
                </h2>
                <p className="mt-4 text-sm md:text-base font-light tracking-wide text-black/60 dark:text-white/60">
                  Perfiles y piezas audiovisuales creadas para marcas.
                </p>
              </header>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-10">
              {clients.map((client, index) => (
                <ClientProfileCard
                  key={client.id}
                  client={client}
                  index={index}
                  onSelect={(picked) => transitionToClient(picked)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* PERFIL INTERNO DEL CLIENTE */
          <ClientProfile
            client={selectedClient}
            activePreviewId={activePreview?.post.id ?? null}
            onOpenPreview={handleOpenPreview}
            onCancelPreviewClose={handleCancelPreviewClose}
            onSchedulePreviewClose={handleSchedulePreviewClose}
            onImmediateClosePreview={handleImmediateClosePreview}
            onBack={() => transitionToClient(null)}
            onOpenPost={handleOpenPost}
          />
        )}
      </div>

      {/* PREVIEW FLOTANTE AMPLIADA CON BLUR GAUSSIANO INDEPENDIENTE */}
      {activePreview && activePostIndex === null && (
        <FloatingPreviewPortal
          preview={activePreview}
          isClosing={isPreviewClosing}
          onCancelClose={handleCancelPreviewClose}
          onScheduleClose={handleSchedulePortalClose}
          onImmediateClose={handleImmediatePortalClose}
          onOpenFullModal={() => handleOpenPost(activePreview.postIndex)}
        />
      )}

      {/* MODAL DE REPRODUCCIÓN COMPLETA CON SONIDO Y CONTROLES */}
      {selectedClient && activePostIndex !== null && (
        <SocialVideoModal
          client={selectedClient}
          activeIndex={activePostIndex}
          onChangeIndex={setActivePostIndex}
          onClose={() => setActivePostIndex(null)}
        />
      )}
    </section>
  );
};

export default ClientSocialHub;
