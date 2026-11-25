import React from 'react';
import SocialPostGrid from './SocialPostGrid';
import {
  ClientSocialPost,
  ClientSocialProfile,
  formatPublicationCount,
} from '../data/clientWork';
import { PreviewOriginRect } from './FloatingPreviewPortal';
import { prefetchClientResources } from '../utils/mobile';

export interface ClientProfileProps {
  client: ClientSocialProfile;
  activePreviewId: string | null;
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
  onBack: () => void;
  onOpenPost: (postIndex: number) => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({
  client,
  activePreviewId,
  onOpenPreview,
  onCancelPreviewClose,
  onSchedulePreviewClose,
  onImmediateClosePreview,
  onBack,
  onOpenPost,
}) => {
  const [logoFailed, setLogoFailed] = React.useState(false);
  const pubCount = formatPublicationCount(client.posts.length);
  const showLogo = Boolean(client.logo) && !logoFailed;

  React.useEffect(() => {
    setLogoFailed(false);
    prefetchClientResources(client);
  }, [client]);

  return (
    <div>
      {/* Navegación superior interna */}
      <div className="mb-5 md:mb-12">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-3 min-h-[48px] md:min-h-[44px] px-3 -ml-3 md:px-0 md:ml-0 py-2 text-[11px] font-mono tracking-[0.28em] uppercase text-white/75 md:text-white/60 hover:text-red-500 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-red-600 whitespace-nowrap"
        >
          <span aria-hidden="true">←</span>
          <span>VOLVER</span>
        </button>
      </div>

      {/* Cabecera de perfil social con identidad transparente del cliente */}
      <header className="pb-7 md:pb-12 mb-7 md:mb-14 border-b border-white/10">
        <div className="flex items-center gap-5 sm:gap-7">
          {showLogo && client.logo ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0 bg-transparent">
              <img
                src={client.logo}
                alt={`Logo de ${client.name}`}
                referrerPolicy="no-referrer"
                decoding="async"
                onError={() => setLogoFailed(true)}
                className="max-w-full max-h-full w-auto h-auto object-contain bg-transparent"
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20 bg-[#080808] flex items-center justify-center shrink-0"
            >
              <span className="text-base sm:text-xl font-black tracking-[0.12em] uppercase text-white">
                {client.initials}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-white text-balance">
              {client.name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono tracking-[0.24em] uppercase">
              <span className="text-white/80 tabular-nums">{pubCount}</span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span className="text-white/50">{client.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Feed audiovisual del cliente */}
      <SocialPostGrid
        client={client}
        activePreviewId={activePreviewId}
        onOpenPreview={onOpenPreview}
        onCancelPreviewClose={onCancelPreviewClose}
        onSchedulePreviewClose={onSchedulePreviewClose}
        onImmediateClosePreview={onImmediateClosePreview}
        onOpenPost={onOpenPost}
      />
    </div>
  );
};

export default ClientProfile;
