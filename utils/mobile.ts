import { useEffect, useState } from 'react';
import { ClientSocialProfile, getPostInitialThumbnail } from '../data/clientWork';

export const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

export function getIsMobileViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function isTouchOnlyDevice(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/**
 * React hook that tracks whether the viewport matches mobile (<= 768px).
 * Desktop (> 768px) always resolves to false so desktop layout & behavior remain untouched.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => getIsMobileViewport());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile;
}

// Deduplicated browser-side image preloader
const preloadedImages = new Set<string>();

export function preloadImageUrl(url?: string | null): void {
  if (typeof window === 'undefined' || !url) return;
  const trimmed = url.trim();
  if (!trimmed || preloadedImages.has(trimmed)) return;
  preloadedImages.add(trimmed);

  const img = new Image();
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer';
  img.src = trimmed;
}

// Deduplicated preconnect injector for external video/image hosts
const preconnectedOrigins = new Set<string>();

export function warmPreconnect(origin: string): void {
  if (typeof document === 'undefined' || !origin || preconnectedOrigins.has(origin)) {
    return;
  }
  preconnectedOrigins.add(origin);

  const existing = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

// Deduplicated player URL prefetch so tapping a video inside a client profile opens faster
const prefetchedPlayerUrls = new Set<string>();

export function prefetchClientResources(client: ClientSocialProfile): void {
  if (typeof window === 'undefined') return;

  if (client.logo) preloadImageUrl(client.logo);
  if (client.coverThumbnail) preloadImageUrl(client.coverThumbnail);

  let hasVimeo = false;
  let hasTikTok = false;

  for (const post of client.posts) {
    const thumb = getPostInitialThumbnail(post);
    if (thumb) preloadImageUrl(thumb);

    if (post.platform === 'vimeo') {
      hasVimeo = true;
    } else if (post.platform === 'tiktok') {
      hasTikTok = true;
    }
  }

  if (hasVimeo) {
    warmPreconnect('https://player.vimeo.com');
    warmPreconnect('https://i.vimeocdn.com');
    warmPreconnect('https://f.vimeocdn.com');
  }
  if (hasTikTok) {
    warmPreconnect('https://www.tiktok.com');
  }

  // Prefetch embed documents lightly in background without autoplaying or consuming scroll frames
  if (typeof document !== 'undefined') {
    for (const post of client.posts) {
      const embedUrl =
        post.platform === 'vimeo'
          ? `https://player.vimeo.com/video/${encodeURIComponent(post.videoId)}?autoplay=1&title=0&byline=0&portrait=0${
              post.vimeoHash ? `&h=${encodeURIComponent(post.vimeoHash)}` : ''
            }`
          : `https://www.tiktok.com/player/v1/${encodeURIComponent(
              post.videoId
            )}?description=0&music_info=0&rel=0&autoplay=1&controls=1`;

      if (!prefetchedPlayerUrls.has(embedUrl)) {
        prefetchedPlayerUrls.add(embedUrl);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'document';
        link.href = embedUrl;
        document.head.appendChild(link);
      }
    }
  }
}
