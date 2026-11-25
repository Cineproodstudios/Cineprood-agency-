export type VideoPlatform = 'vimeo' | 'tiktok';

export type ClientParticipationRole =
  | 'GRABACIÓN + EDICIÓN'
  | 'SOLO EDICIÓN'
  | 'GRABACIÓN';

export interface ClientSocialPost {
  id: string;
  platform: VideoPlatform;
  videoId: string;
  /** Hash opcional para vídeos de Vimeo no listados (parámetro h=) */
  vimeoHash?: string;
  /**
   * Portada manual opcional (p. ej. "/client-work/plasticosur-01.webp").
   * Si se especifica, siempre tiene prioridad sobre la miniatura automática de Vimeo.
   */
  thumbnail?: string;
  /** Miniatura oficial recuperada de Vimeo (respaldo automático en caché) */
  autoThumbnail?: string;
  /** Relación de aspecto del vídeo ('9:16' vertical por defecto, '16:9' horizontal) */
  aspectRatio?: '9:16' | '16:9';
}

export interface ClientSocialProfile {
  id: string;
  name: string;
  initials: string;
  role: ClientParticipationRole;
  /** Logo con fondo transparente (PNG/GIF) mostrado sobre la portada de la carpeta */
  logo?: string;
  /** Ajuste óptico opcional de anchura/altura del logo según su proporción */
  logoSizeClass?: string;
  /** Portada manual opcional para la tarjeta del cliente */
  coverThumbnail?: string;
  posts: ClientSocialPost[];
}

export const clients: ClientSocialProfile[] = [
  {
    id: 'naked-and-famous',
    name: 'NAKED&FAMOUS',
    initials: 'NF',
    role: 'GRABACIÓN + EDICIÓN',
    logo: 'https://i.postimg.cc/zvpLSKjQ/naked.gif',
    logoSizeClass: 'w-[68%] max-w-[220px] max-h-[54%]',
    posts: [
      {
        id: 'naked-01',
        platform: 'vimeo',
        videoId: '1248425237',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2228490115-67ebe4a6e1e8bfd945f922a286e443fddca7bcb15c7a88ef7058562e37b51912-d_640?region=us',
      },
    ],
  },
  {
    id: 'neotaberna-la-maura',
    name: 'NEOTABERNA LA MAURA',
    initials: 'LM',
    role: 'GRABACIÓN + EDICIÓN',
    logo: 'https://i.postimg.cc/MHRY5s4Y/LA-MAURA-LOGO-VERDE.png',
    logoSizeClass: 'w-[64%] max-w-[205px] max-h-[54%]',
    posts: [
      {
        id: 'la-maura-01',
        platform: 'vimeo',
        videoId: '1248424376',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2228490826-7e108811290a6a912c1ac7b7abe25c6ee8531e6d91a5547978b2ec3afe701e10-d_640?region=us',
      },
      {
        id: 'la-maura-02',
        platform: 'vimeo',
        videoId: '1248498356',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2228610308-9e86a54d1834c845fb58c1a5692050e4a8420d84cf16e77fd1edd479f9e78c36-d_640?region=us',
      },
    ],
  },
  {
    id: 'cervezas-gran-via',
    name: 'CERVEZAS GRAN VÍA',
    initials: 'GV',
    role: 'GRABACIÓN + EDICIÓN',
    logo: 'https://i.postimg.cc/43mVwLHg/3517849-Photoroom.png',
    logoSizeClass: 'w-[68%] max-w-[220px] max-h-[54%]',
    posts: [
      {
        id: 'gran-via-01',
        platform: 'vimeo',
        videoId: '1248422191',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2228489438-f700fd88ed4683b8a8df1e759a2ec24f7febd74ed3c4e203ee31083409fa3c72-d_640?region=us',
      },
    ],
  },
  {
    id: 'inciso',
    name: 'INCISO',
    initials: 'IN',
    role: 'SOLO EDICIÓN',
    logo: 'https://i.postimg.cc/MTn5MZmB/logo-inciso-blanco.png',
    logoSizeClass: 'w-[82%] max-w-[265px] max-h-[40%]',
    posts: [
      {
        id: 'inciso-01',
        platform: 'vimeo',
        videoId: '1250105608',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2230656438-ed2b57645fc53ec87c9116832143b91da0a0316829cf3f5b29aaed36d467e9dc-d_640?region=us',
      },
      {
        id: 'inciso-02',
        platform: 'vimeo',
        videoId: '1248422924',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2228483800-36416ffd6b915bf2c0d512e369a2d1cbf2ea1af0d93b7ab8c3e8536aa9ffb90e-d_640?region=us',
      },
    ],
  },
  {
    id: 'plasticosur',
    name: 'PLASTICOSUR',
    initials: 'P',
    role: 'SOLO EDICIÓN',
    logo: 'https://i.postimg.cc/5yvmgPGL/logo-plasticosur.png',
    logoSizeClass: 'w-[56%] max-w-[180px] max-h-[56%]',
    posts: [
      {
        id: 'plasticosur-01',
        platform: 'vimeo',
        videoId: '1248431319',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2228494412-6dfd07c451d59190646cec7274a0838f55a0ff9a14b578e3e3c122cb72453e82-d_640?region=us',
      },
      {
        id: 'plasticosur-02',
        platform: 'vimeo',
        videoId: '1248432016',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2228495497-20ed634ff1a5d811aeba567e29d1b947c1f66dd2286836847d0b9edd0c56cbc4-d_640?region=us',
      },
    ],
  },
  {
    id: 'la-espanola',
    name: 'LA ESPAÑOLA',
    initials: 'LE',
    role: 'GRABACIÓN',
    logo: 'https://i.postimg.cc/h49xC7vJ/b109541129c048cf8b4ad1c90650fc2f.png',
    logoSizeClass: 'w-[66%] max-w-[210px] max-h-[54%]',
    coverThumbnail:
      'https://i.postimg.cc/L5JyMfT6/Castanas-glaseadas-sobre-mesa-de-cocina.png',
    posts: [
      {
        id: 'la-espanola-01',
        platform: 'tiktok',
        videoId: '7705047010067385622',
      },
      {
        id: 'la-espanola-02',
        platform: 'tiktok',
        videoId: '7706518948036119831',
      },
      {
        id: 'la-espanola-03',
        platform: 'tiktok',
        videoId: '7703171584978095393',
      },
    ],
  },
  {
    id: 'maria-jose-logopeda',
    name: 'MariaJoseLogopeda',
    initials: 'MJ',
    role: 'GRABACIÓN + EDICIÓN',
    logo: 'https://i.postimg.cc/nrv0wzPN/cropped-logo-sin-fondo-e1685551950358.png',
    logoSizeClass: 'w-[76%] max-w-[245px] max-h-[48%]',
    posts: [
      {
        id: 'maria-jose-logopeda-01',
        platform: 'vimeo',
        videoId: '1250104315',
        aspectRatio: '16:9',
        autoThumbnail:
          'https://i.vimeocdn.com/video/2230654515-7454eba9f26fa58d320de30aebe17ac4dcab7b0b06ab99114a2fed53672d3c11-d_640?region=us',
      },
    ],
  },
];

// Caché en memoria para portadas recuperadas desde Vimeo oEmbed (evita peticiones repetidas)
const vimeoThumbnailCache = new Map<string, string | null>();
const vimeoThumbnailInFlight = new Map<string, Promise<string | null>>();

function getVimeoCacheKey(videoId: string, vimeoHash?: string): string {
  return vimeoHash ? `${videoId}:${vimeoHash}` : videoId;
}

for (const client of clients) {
  for (const post of client.posts) {
    if (post.platform === 'vimeo' && post.autoThumbnail) {
      vimeoThumbnailCache.set(
        getVimeoCacheKey(post.videoId, post.vimeoHash),
        post.autoThumbnail
      );
    }
  }
}

/**
 * Devuelve la portada inmediata de una publicación dando siempre prioridad
 * a `post.thumbnail` (manual) frente a la miniatura automática de Vimeo o TikTok.
 */
export function getPostInitialThumbnail(post: ClientSocialPost): string | null {
  if (post.thumbnail && post.thumbnail.trim().length > 0) {
    return post.thumbnail.trim();
  }
  if (post.autoThumbnail && post.autoThumbnail.trim().length > 0) {
    return post.autoThumbnail.trim();
  }
  if (post.platform === 'tiktok' && /^\d{8,24}$/.test(post.videoId)) {
    return `/api/tiktok-thumbnail/${post.videoId}`;
  }
  const cacheKey = getVimeoCacheKey(post.videoId, post.vimeoHash);
  if (post.platform === 'vimeo' && vimeoThumbnailCache.has(cacheKey)) {
    return vimeoThumbnailCache.get(cacheKey) ?? null;
  }
  return null;
}

/**
 * Recupera y guarda en caché la portada oficial de un vídeo de Vimeo vía oEmbed
 * (soporta IDs públicos y vídeos no listados con hash `h=`).
 */
export function resolveVimeoThumbnail(
  videoId: string,
  vimeoHash?: string
): Promise<string | null> {
  const cacheKey = getVimeoCacheKey(videoId, vimeoHash);
  if (vimeoThumbnailCache.has(cacheKey)) {
    return Promise.resolve(vimeoThumbnailCache.get(cacheKey) ?? null);
  }

  const pending = vimeoThumbnailInFlight.get(cacheKey);
  if (pending) {
    return pending;
  }

  const vimeoPageUrl = vimeoHash
    ? `https://vimeo.com/${videoId}/${vimeoHash}`
    : `https://vimeo.com/${videoId}`;

  const request = fetch(
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoPageUrl)}`
  )
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const url =
        typeof data?.thumbnail_url === 'string' && data.thumbnail_url.trim().length > 0
          ? data.thumbnail_url.trim()
          : null;
      vimeoThumbnailCache.set(cacheKey, url);
      return url;
    })
    .catch(() => {
      vimeoThumbnailCache.set(cacheKey, null);
      return null;
    })
    .finally(() => {
      vimeoThumbnailInFlight.delete(cacheKey);
    });

  vimeoThumbnailInFlight.set(cacheKey, request);
  return request;
}

export function getClientPrimaryThumbnail(client: ClientSocialProfile): string | null {
  if (client.coverThumbnail && client.coverThumbnail.trim().length > 0) {
    return client.coverThumbnail.trim();
  }
  for (const post of client.posts) {
    const thumb = getPostInitialThumbnail(post);
    if (thumb) return thumb;
  }
  return null;
}

export function formatPublicationCount(count: number): string {
  return count === 1 ? '1 publicación' : `${count} publicaciones`;
}
