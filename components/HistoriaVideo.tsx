import React, { useEffect, useRef, useState, useCallback } from 'react';
import Player from '@vimeo/player';

// Vimeo video ID
const VIMEO_ID = 1227803563;
const HOLD_DURATION_MS = 5000;

// Circumference for r=14 SVG circle: 2 * PI * 14 ~= 87.96
const CIRCLE_RADIUS = 14;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

interface HistoriaVideoProps {
  onVideoActiveChange?: (isActive: boolean) => void;
}

const HistoriaVideo: React.FC<HistoriaVideoProps> = ({ onVideoActiveChange }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  // Video ready status
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 5-second lock states
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

  // Initialize Vimeo Player with preloading while still on hero
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

  // Trigger the 5-second retention sequence
  const startHoldSequence = useCallback(() => {
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
  }, []);

  // Prevent downward scrolling during the 5s retention period while keeping position rock-solid
  useEffect(() => {
    // Block downward wheel
    const handleWheel = (e: WheelEvent) => {
      if (isHoldingRef.current && !canContinueRef.current) {
        // Only block downward scroll (deltaY > 0)
        if (e.deltaY > 0) {
          e.preventDefault();
        }
      }
    };

    // Block downward touch drag
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isHoldingRef.current && !canContinueRef.current) {
        const touchCurrentY = e.touches[0].clientY;
        const deltaY = touchStartY - touchCurrentY;
        // Swiping up on screen means scrolling DOWN
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
  }, []);

  // IntersectionObserver:
  // - When entering section (45-50% visible):
  //     1. Notify parent to hide Navbar
  //     2. Restart video at 0:00
  //     3. Enable sound & play
  //     4. Snap/center section to 100dvh
  //     5. Trigger 5-second cinematic hold
  // - When leaving (< 20% visible):
  //     1. Notify parent to restore Navbar
  //     2. Silence and pause video
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    let isSectionActive = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const player = playerRef.current;
          if (!player) return;

          // When approximately 45-50% of the video is visible
          if (entry.intersectionRatio >= 0.45) {
            if (!isSectionActive) {
              isSectionActive = true;
              onVideoActiveChange?.(true);

              // 1. Restart from 0:00
              // 2. Unmute and set volume to 1
              // 3. Play video with sound
              player.setCurrentTime(0)
                .catch(() => {})
                .then(() => player.setMuted(false))
                .then(() => player.setVolume(1))
                .then(() => player.play())
                .catch(() => {
                  player.play().catch(() => {});
                });

              // 4. Start the 5-second hold & snap position
              startHoldSequence();
            }
          } else if (entry.intersectionRatio < 0.20) {
            // User scrolled away from video (back to Hero or down to Modos)
            if (isSectionActive) {
              isSectionActive = false;
              onVideoActiveChange?.(false);
              
              // Silence immediately
              player.setVolume(0).catch(() => {});
              player.setMuted(true).catch(() => {});
              player.pause().catch(() => {});

              // Reset hold trigger for subsequent real re-entries
              hasEverTriggeredRef.current = false;
            }
          }
        });
      },
      {
        threshold: [0.0, 0.2, 0.45, 0.65, 0.8, 1.0],
      }
    );

    observer.observe(sectionEl);

    // Audio policy fallback on first user gesture
    const handleFirstGesture = () => {
      if (isSectionActive && playerRef.current) {
        playerRef.current.setMuted(false).catch(() => {});
        playerRef.current.setVolume(1).catch(() => {});
      }
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [startHoldSequence, onVideoActiveChange]);

  // SVG stroke calculation for circular progress ring
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - holdProgress);

  return (
    <section 
      ref={sectionRef}
      id="historia"
      className="relative w-full h-[100dvh] min-h-[100dvh] bg-black overflow-hidden z-10 select-none flex flex-col items-center justify-center !scroll-mt-0"
    >
      {/* Anchor for nav compatibility */}
      <span id="origen" className="absolute top-0 opacity-0 pointer-events-none" />

      {/* 
        CENTRAL CINEMATIC VIEWPORT (100dvh):
        - Video is centered both vertically and horizontally in the viewport.
        - Absolute protagonist of the screen.
        - Zero cut-off, zero awkward margins above or below.
      */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        
        {/* Vimeo native wrapper */}
        <div 
          ref={containerRef}
          className="vimeo-native-wrapper absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        />

        {/* Cinematic black mask during initial preload frame */}
        <div 
          className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-700 ease-in-out z-10 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* 
          MINIMALIST CINEMATIC BOTTOM INDICATOR:
          - Elevated from bottom: bottom-[64px] sm:bottom-[72px] md:bottom-[80px]
          - Circular progress indicator filling over 0s -> 5s (stroke-dashoffset)
          - Subtle down arrow inside
          - Discreet text: "Seguir hacia abajo"
          - Micro-bounce & opacity pulse when 5s finishes, inviting the user to continue
        */}
        <div 
          onClick={canContinue ? handleScrollToNext : undefined}
          className={`absolute bottom-16 sm:bottom-20 md:bottom-22 lg:bottom-24 inset-x-0 mx-auto w-fit flex flex-col items-center justify-center gap-2.5 z-20 transition-all duration-700 select-none ${
            canContinue ? 'cursor-pointer group opacity-90 hover:opacity-100' : 'cursor-default opacity-60'
          }`}
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
                canContinue ? 'animate-bounce-subtle group-hover:translate-y-0.5' : 'opacity-70'
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
              canContinue 
                ? 'text-white/90 group-hover:text-white font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]' 
                : 'text-white/40'
            }`}
          >
            Seguir hacia abajo
          </span>
        </div>
      </div>
    </section>
  );
};

export default HistoriaVideo;
