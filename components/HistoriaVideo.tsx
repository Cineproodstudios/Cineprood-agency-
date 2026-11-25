import React, { useEffect, useRef, useState, useCallback } from 'react';
import Player from '@vimeo/player';
import { useIsMobile } from '../utils/mobile';

// Vimeo video ID & official cached poster frame
const VIMEO_ID = 1227803563;
const VIMEO_POSTER_URL =
  'https://i.vimeocdn.com/video/2202112574-b137d3ff718037444a71e317a9a4bca8df666ab6986b2d157c8041bd49764b88-d_1280?region=us';
const HOLD_DURATION_MS = 5000;

// Circumference for r=14 SVG circle: 2 * PI * 14 ~= 87.96
const CIRCLE_RADIUS = 14;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

interface HistoriaVideoProps {
  onVideoActiveChange?: (isActive: boolean) => void;
}

const HistoriaVideo: React.FC<HistoriaVideoProps> = ({ onVideoActiveChange }) => {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  // Video ready status
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 5-second lock states (desktop only)
  const [isHolding, setIsHolding] = useState(false);
  const [canContinue, setCanContinue] = useState(true);
  const [holdProgress, setHoldProgress] = useState(0); // 0 -> 1 over 5s

  const isHoldingRef = useRef(false);
  const canContinueRef = useRef(true);
  const hasEverTriggeredRef = useRef(false);
  const lockedScrollYRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const holdRafIdRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Vimeo Player (preloaded proactively while approaching on mobile, immediately on desktop)
  useEffect(() => {
    if (!containerRef.current) return;

    const player = new Player(containerRef.current, {
      id: VIMEO_ID,
      background: true,
      autoplay: true,
      loop: true,
      muted: true,
      autopause: false,
      playsinline: true,
      dnt: true,
      transparent: false,
    });

    playerRef.current = player;

    player.on('loaded', () => {
      setIsVideoLoaded(true);
      player.setMuted(true).catch(() => {});
      player.setVolume(0).catch(() => {});
    });

    player.on('play', () => {
      setIsVideoLoaded(true);
    });

    const fallbackTimer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 1500);

    return () => {
      clearTimeout(fallbackTimer);
      player.destroy().catch(() => {});
    };
  }, []);

  // Smooth scroll handler to next section when user clicks the "Seguir hacia abajo" indicator
  const handleScrollToNext = useCallback(() => {
    const nextSection = document.getElementById('modos');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Trigger the 5-second retention sequence (DESKTOP ONLY — mobile never locks scroll)
  const startHoldSequence = useCallback(() => {
    if (isMobile) return;
    // Prevent duplicate triggers
    if (isHoldingRef.current || hasEverTriggeredRef.current) return;
    
    hasEverTriggeredRef.current = true;
    isHoldingRef.current = true;
    canContinueRef.current = false;
    setIsHolding(true);
    setCanContinue(false);
    setHoldProgress(0);

    // Centrar con precisión absoluta la sección de 100dvh en pantalla
    if (sectionRef.current) {
      const targetTop = sectionRef.current.offsetTop;
      lockedScrollYRef.current = targetTop;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    }

    // Start progress animation frame (0 to 1 over 5000ms)
    holdStartTimeRef.current = performance.now();

    const animateProgress = (now: number) => {
      if (!holdStartTimeRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      const p = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(p);

      if (p < 1) {
        holdRafIdRef.current = requestAnimationFrame(animateProgress);
      } else {
        // Complete the 5s hold
        isHoldingRef.current = false;
        canContinueRef.current = true;
        lockedScrollYRef.current = null;
        setIsHolding(false);
        setCanContinue(true);
        setHoldProgress(1);
      }
    };

    holdRafIdRef.current = requestAnimationFrame(animateProgress);

    // Safety timeout to ensure release at exactly 5000ms
    holdTimeoutRef.current = setTimeout(() => {
      if (!canContinueRef.current) {
        isHoldingRef.current = false;
        canContinueRef.current = true;
        lockedScrollYRef.current = null;
        setIsHolding(false);
        setCanContinue(true);
        setHoldProgress(1);
      }
    }, HOLD_DURATION_MS);
  }, [isMobile]);

  // Prevent downward scrolling during the 5s retention period (DESKTOP ONLY)
  useEffect(() => {
    if (isMobile) {
      // Ensure mobile is always unlocked and native touch scrolling is never intercepted
      isHoldingRef.current = false;
      canContinueRef.current = true;
      lockedScrollYRef.current = null;
      setIsHolding(false);
      setCanContinue(true);
      setHoldProgress(1);
      return;
    }

    // Block downward wheel
    const handleWheel = (e: WheelEvent) => {
      if (isHoldingRef.current && !canContinueRef.current) {
        if (e.deltaY > 0) {
          e.preventDefault();
        }
      }
    };

    // Block downward touch drag (only on non-mobile viewports with touch support)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isHoldingRef.current && !canContinueRef.current) {
        const touchCurrentY = e.touches[0].clientY;
        const deltaY = touchStartY - touchCurrentY;
        if (deltaY > 0) {
          e.preventDefault();
        }
      }
    };

    // Block downward keyboard navigation (Space, ArrowDown, PageDown)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHoldingRef.current && !canContinueRef.current) {
        if (
          e.key === 'ArrowDown' ||
          e.key === 'PageDown' ||
          (e.key === ' ' && !e.shiftKey)
        ) {
          e.preventDefault();
        }
      }
    };

    // Lock window scroll position so down scrolling doesn't leak into next section
    const handleScrollLock = () => {
      if (isHoldingRef.current && !canContinueRef.current && lockedScrollYRef.current !== null) {
        if (window.scrollY > lockedScrollYRef.current + 2) {
          window.scrollTo({
            top: lockedScrollYRef.current,
            behavior: 'instant' as ScrollBehavior,
          });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('scroll', handleScrollLock, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollLock);
      if (holdRafIdRef.current) cancelAnimationFrame(holdRafIdRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, [isMobile]);

  // IntersectionObserver:
  // - Desktop: exact original 45% enter + unmute + 5s hold sequence.
  // - Mobile: smooth playback without blocking scroll or hijacking position.
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    let isSectionActive = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const player = playerRef.current;
          if (!player) return;

          const enterRatio = isMobile ? 0.35 : 0.45;
          const leaveRatio = isMobile ? 0.12 : 0.20;

          if (entry.intersectionRatio >= enterRatio) {
            if (!isSectionActive) {
              isSectionActive = true;
              onVideoActiveChange?.(!isMobile);

              if (isMobile) {
                // On mobile keep inline muted playback fluid (never fight iOS autoplay policy or block scroll)
                player.play().catch(() => {});
              } else {
                player.setCurrentTime(0)
                  .catch(() => {})
                  .then(() => player.setMuted(false))
                  .then(() => player.setVolume(1))
                  .then(() => player.play())
                  .catch(() => {
                    player.play().catch(() => {});
                  });

                startHoldSequence();
              }
            }
          } else if (entry.intersectionRatio < leaveRatio) {
            if (isSectionActive) {
              isSectionActive = false;
              onVideoActiveChange?.(false);
              
              player.setVolume(0).catch(() => {});
              player.setMuted(true).catch(() => {});
              player.pause().catch(() => {});

              hasEverTriggeredRef.current = false;
            }
          }
        });
      },
      {
        threshold: [0.0, 0.12, 0.2, 0.35, 0.45, 0.65, 0.8, 1.0],
      }
    );

    observer.observe(sectionEl);

    // Audio policy fallback on first user gesture (desktop only; mobile stays seamless)
    const handleFirstGesture = () => {
      if (!isMobile && isSectionActive && playerRef.current) {
        playerRef.current.setMuted(false).catch(() => {});
        playerRef.current.setVolume(1).catch(() => {});
      }
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [startHoldSequence, onVideoActiveChange, isMobile]);

  // SVG stroke calculation for circular progress ring
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - (isMobile ? 1 : holdProgress));

  return (
    <section 
      ref={sectionRef}
      id="historia"
      className="relative w-full md:h-[100dvh] min-h-[76dvh] md:min-h-[100dvh] bg-black overflow-hidden z-10 select-none flex flex-col items-center justify-center !scroll-mt-0"
    >
      {/* Anchor for nav compatibility */}
      <span id="origen" className="absolute top-0 opacity-0 pointer-events-none" />

      {/* 
        CENTRAL CINEMATIC VIEWPORT:
        - Desktop: Full bleed 100dvh cinematic coverage (unchanged).
        - Mobile: Full 16:9 frame visible with zero cut-off / object-fit contain and zero scroll lock.
      */}
      <div className="video-stage relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        
        {/* Vimeo native wrapper */}
        <div 
          ref={containerRef}
          className="vimeo-native-wrapper pointer-events-none"
        />

        {/* Instant poster frame on mobile / cinematic black mask on desktop while Vimeo buffers */}
        <div 
          className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-500 md:duration-700 ease-in-out z-10 flex items-center justify-center ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <img
            src={VIMEO_POSTER_URL}
            alt="Presentación Cineprood"
            width={1280}
            height={720}
            decoding="async"
            referrerPolicy="no-referrer"
            className="md:hidden w-full aspect-video object-contain"
          />
        </div>

        {/* 
          MINIMALIST CINEMATIC BOTTOM INDICATOR:
          - Desktop: bottom-22 lg:bottom-24 with 5s circular hold ring.
          - Mobile: always clickable (44px+ touch area), zero lock.
        */}
        <button 
          type="button"
          onClick={canContinue || isMobile ? handleScrollToNext : undefined}
          className={`absolute bottom-5 sm:bottom-16 md:bottom-22 lg:bottom-24 inset-x-0 mx-auto w-fit min-h-[44px] px-4 flex flex-col items-center justify-center gap-2 z-20 transition-all duration-500 md:duration-700 select-none ${
            canContinue || isMobile ? 'cursor-pointer group opacity-90 hover:opacity-100' : 'cursor-default opacity-60'
          }`}
          aria-label="Seguir hacia abajo"
        >
          {/* Circular Progress Ring with Down Arrow */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg 
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 36 36"
            >
              {/* Subtle background track */}
              <circle
                cx="18"
                cy="18"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="1.5"
              />
              {/* Progress stroke filling over 5s */}
              <circle
                cx="18"
                cy="18"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-100 ease-linear"
              />
            </svg>

            {/* Down Arrow inside circle */}
            <svg 
              className={`absolute w-3.5 h-3.5 text-white transition-transform duration-500 ease-out ${
                canContinue || isMobile ? 'animate-bounce-subtle group-hover:translate-y-0.5' : 'opacity-70'
              }`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Discreet Text with breathing room */}
          <span 
            className={`text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase transition-all duration-500 ${
              canContinue || isMobile
                ? 'text-white/90 group-hover:text-white font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]' 
                : 'text-white/40'
            }`}
          >
            Seguir hacia abajo
          </span>
        </button>
      </div>
    </section>
  );
};

export default HistoriaVideo;
