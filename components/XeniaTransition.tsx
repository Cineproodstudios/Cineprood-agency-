import React, { useEffect, useRef, useState, useCallback } from 'react';
import XeniaExperience from './XeniaExperience';

interface XeniaTransitionProps {
  hasEnteredXenia?: boolean;
  onEnterXenia?: () => void;
  onExitXenia?: () => void;
}

export const XeniaTransition: React.FC<XeniaTransitionProps> = ({
  hasEnteredXenia: propHasEnteredXenia,
  onEnterXenia,
  onExitXenia,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localEntered, setLocalEntered] = useState(false);
  const hasEnteredXenia = propHasEnteredXenia !== undefined ? propHasEnteredXenia : localEntered;

  // Real-time smoothed portal progress (0 -> 1)
  const [currentProgress, setCurrentProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Optical portal states
  const [isPopping, setIsPopping] = useState(false);
  const [showImpactFlash, setShowImpactFlash] = useState(false);
  const [isOvershooting, setIsOvershooting] = useState(false);
  const [isRetractingBars, setIsRetractingBars] = useState(false);

  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const isTransitioningRef = useRef(false);

  // Final POP revelation:
  // 1. POP cut (aberrations, blur, prism -> 0)
  // 2. Impact flash frame (~120ms)
  // 3. Xenia revealed crystal-clear
  // 4. Letterbox bars smoothly retract (300-500ms)
  // 5. Complete transition lock
  const triggerPopAndEnter = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Stop rAF loop immediately
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setIsPopping(true);
    setShowImpactFlash(true);

    // 120ms: POP cut occurs
    setTimeout(() => {
      setShowImpactFlash(false);
      setIsOvershooting(true);
      setLocalEntered(true);
      targetProgressRef.current = 1;
      currentProgressRef.current = 1;
      setCurrentProgress(1);

      if (onEnterXenia) {
        onEnterXenia();
      }

      // Settle window scroll exactly at top of Xenia section
      if (containerRef.current) {
        const targetTop = containerRef.current.offsetTop;
        window.scrollTo({
          top: targetTop,
          behavior: 'instant',
        });
      }

      // Start retracting bars right after the POP cut
      setIsRetractingBars(true);
    }, 120);

    // 520ms: Bars have fully retracted, camera overshoot finished
    setTimeout(() => {
      setIsOvershooting(false);
      setIsPopping(false);
      setIsRetractingBars(false);
      isTransitioningRef.current = false;
    }, 560);
  }, [onEnterXenia]);

  // Intentional Exit: Return to the web
  const handleExitXenia = useCallback(() => {
    setLocalEntered(false);
    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
    setCurrentProgress(0);
    setIsPopping(false);
    setShowImpactFlash(false);
    setIsOvershooting(false);
    setIsRetractingBars(false);

    if (onExitXenia) {
      onExitXenia();
    }

    const prevSection = document.getElementById('redes');
    if (prevSection) {
      prevSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onExitXenia]);

  // Navbar or direct hash navigation (#xenia)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#xenia' || window.location.hash === '#agente') {
        triggerPopAndEnter();
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('enter-xenia', triggerPopAndEnter);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('enter-xenia', triggerPopAndEnter);
    };
  }, [triggerPopAndEnter]);

  // Reduced motion preference detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Scrubbed Scroll with requestAnimationFrame & responsive damping
  // Fast and punchy ~150vh Virtual Track:
  // - High responsiveness with subtle damping (factor 0.16)
  // - Only a few clear wheel movements needed to traverse the portal
  // - Visual camera is 100dvh sticky locked
  useEffect(() => {
    if (hasEnteredXenia || isPopping) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // Measure target progress purely from the physical scroll position of containerRef
    const updateTargetFromScroll = () => {
      if (hasEnteredXenia || isTransitioningRef.current || isPopping) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      if (scrollableDistance <= 0) return;

      // 0 when section enters sticky viewport, 1 when scrolled to the end of track
      const rawProgress = -rect.top / scrollableDistance;
      const clamped = Math.max(0, Math.min(1, rawProgress));
      targetProgressRef.current = clamped;
    };

    // Agile camera damping:
    // currentProgress += (targetProgress - currentProgress) * 0.16
    // Feels direct, crisp and immediate without jerky steps
    const tick = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0005) {
        const next = current + diff * 0.16;
        currentProgressRef.current = next;
        setCurrentProgress(next);

        // Climax point reached (>= 94%) -> triggers the POP and enters Xenia!
        if (next >= 0.94 && target >= 0.92) {
          currentProgressRef.current = 1;
          setCurrentProgress(1);
          triggerPopAndEnter();
          return;
        }
      } else if (current !== target) {
        currentProgressRef.current = target;
        setCurrentProgress(target);

        if (target >= 0.92) {
          currentProgressRef.current = 1;
          setCurrentProgress(1);
          triggerPopAndEnter();
          return;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', updateTargetFromScroll, { passive: true });
    updateTargetFromScroll();
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateTargetFromScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [hasEnteredXenia, isPopping, triggerPopAndEnter]);

  // Reduced motion fallback
  if (isReducedMotion) {
    return (
      <section id="xenia" className="relative min-h-[100dvh] bg-white dark:bg-black">
        <span id="agente" className="absolute -top-20 opacity-0 pointer-events-none"></span>
        <span id="contacto" className="absolute -top-20 opacity-0 pointer-events-none"></span>
        <XeniaExperience isActive={true} onExit={handleExitXenia} />
      </section>
    );
  }

  // =========================================================================
  // STATE 2: hasEnteredXenia === true (After the POP & Retraction)
  // Xenia is completely calm, clear, minimal, and stable in 100dvh.
  // =========================================================================
  if (hasEnteredXenia) {
    return (
      <section
        ref={containerRef}
        id="xenia"
        className={`relative min-h-[100dvh] h-[100dvh] w-full bg-white dark:bg-black text-black dark:text-white transition-colors duration-700 overflow-hidden ${
          isOvershooting ? 'animate-xenia-overshoot' : ''
        }`}
      >
        <span id="agente" className="absolute top-0 opacity-0 pointer-events-none"></span>
        <span id="contacto" className="absolute top-0 opacity-0 pointer-events-none"></span>

        {/* Impact Flash Frame: Brief high-exposure optical pulse (~120ms) */}
        {showImpactFlash && (
          <div className="absolute inset-0 pointer-events-none z-50 animate-impact-flash bg-gradient-to-tr from-cyan-400/40 via-white/90 to-rose-500/40 mix-blend-overlay backdrop-blur-[2px]" />
        )}

        {/* Retracting Letterbox Bars (after POP: 10vh -> 0vh in ~500ms) */}
        {isRetractingBars && (
          <>
            <div className="fixed top-0 left-0 right-0 h-[10vh] bg-black z-40 pointer-events-none animate-letterbox-retract-top" />
            <div className="fixed bottom-0 left-0 right-0 h-[10vh] bg-black z-40 pointer-events-none animate-letterbox-retract-bottom" />
          </>
        )}

        <XeniaExperience isActive={true} opacity={1} onExit={handleExitXenia} />
      </section>
    );
  }

  // =========================================================================
  // STATE 1: ACCELERATED CINEMATIC PORTAL SEQUENCE (~150vh, camera locked 100dvh)
  //
  // Fase 1 (0% - 20%): ARRANQUE INMEDIATO
  //   - Comienza de inmediato sin demoras: pequeño blur, ligera refracción,
  //   - Comienzan a deslizarse las barras cinematográficas (0vh -> 5vh).
  //
  // Fase 2 (20% - 60%): ENTRADA Y PROFUNDIDAD EN EL PORTAL
  //   - Distorsión visible, refracción cáustica, túnel óptico, zoom sutil.
  //   - Xenia empieza a revelarse claramente detrás.
  //   - Barras continúan hasta 8.5vh.
  //
  // Fase 3 (60% - 90%): INTENSIDAD CRECIENTE Y ATRAVESAR
  //   - Mayor distorsión y efecto prismático.
  //   - Barras completas (10vh). Sensación contundente de atravesar el portal.
  //
  // Fase 4 (90% - 100%): CLÍMAX BREVE & POP
  //   - Distorsión fuerte durante muy poco tiempo.
  //   - POP instantáneo: flash -> desaparece distorsión -> Xenia nítida -> barras se retiran.
  // =========================================================================

  const p = currentProgress;

  // 1. Cinematic letterbox bars height (0vh -> 10.5vh)
  // 0% - 20%: 0vh -> 5vh
  // 20% - 60%: 5vh -> 8.5vh
  // 60% - 100%: 8.5vh -> 10.5vh
  let barHeightVh = 0;
  if (p > 0.02 && p < 0.20) {
    barHeightVh = ((p - 0.02) / 0.18) * 5.0;
  } else if (p >= 0.20 && p < 0.60) {
    barHeightVh = 5.0 + ((p - 0.20) / 0.40) * 3.5;
  } else if (p >= 0.60) {
    barHeightVh = 8.5 + ((p - 0.60) / 0.40) * 2.0;
  }

  // 2. Optical tunnel scales with punchy parallax
  const portalTextScale = 1 + p * 0.14;
  const tunnelRingsScale = 1 + p * 0.38;
  const xeniaDepthScale = 0.90 + p * 0.11;

  // 3. Portal text "Hablar con Xenia" opacity (desvanece con agilidad en 0% - 40%)
  const portalTextOpacity = p < 0.05 
    ? 1 
    : Math.max(0, 1 - (p - 0.05) / 0.35);

  // 4. Dynamic Blur:
  // 0% - 20%: 0 -> 4px
  // 20% - 60%: 4px -> 16px
  // 60% - 90%: 16px -> 26px
  // 90% - 100%: 26px -> 34px breve
  let edgeBlurPx = 0;
  let centerBlurPx = 0;
  if (p < 0.20) {
    const f = p / 0.20;
    edgeBlurPx = f * 4.5;
    centerBlurPx = f * 2.5;
  } else if (p >= 0.20 && p < 0.60) {
    const f = (p - 0.20) / 0.40;
    edgeBlurPx = 4.5 + f * 12.0;
    centerBlurPx = 2.5 + f * 7.0;
  } else if (p >= 0.60 && p < 0.90) {
    const f = (p - 0.60) / 0.30;
    edgeBlurPx = 16.5 + f * 10.0;
    centerBlurPx = 9.5 + f * 6.5;
  } else {
    const f = (p - 0.90) / 0.10;
    edgeBlurPx = 26.5 + f * 7.5;
    centerBlurPx = 16.0 + f * 4.5;
  }

  // 5. Chromatic displacement / RGB offset
  // 0% - 20%: 0 -> 2px
  // 20% - 60%: 2px -> 6px
  // 60% - 90%: 6px -> 12px
  // 90% - 100%: 12px -> 16px (pico breve)
  let chromaticOffset = 0;
  if (p < 0.20) {
    chromaticOffset = (p / 0.20) * 2.2;
  } else if (p >= 0.20 && p < 0.60) {
    chromaticOffset = 2.2 + ((p - 0.20) / 0.40) * 4.2;
  } else if (p >= 0.60 && p < 0.90) {
    chromaticOffset = 6.4 + ((p - 0.60) / 0.30) * 5.8;
  } else {
    chromaticOffset = 12.2 + ((p - 0.90) / 0.10) * 4.0;
  }

  // 6. Prism / Caustic refractions intensity
  let prismIntensity = 0;
  if (p < 0.20) {
    prismIntensity = (p / 0.20) * 0.25;
  } else if (p >= 0.20 && p < 0.60) {
    prismIntensity = 0.25 + ((p - 0.20) / 0.40) * 0.45;
  } else if (p >= 0.60 && p < 0.90) {
    prismIntensity = 0.70 + ((p - 0.60) / 0.30) * 0.22;
  } else {
    prismIntensity = 0.92 + ((p - 0.90) / 0.10) * 0.08;
  }

  // 7. Bloom / Anamorphic streak (entra con fuerza en 60% - 90%)
  const bloomOpacity = p >= 0.55 ? Math.min(1, Math.pow((p - 0.55) / 0.35, 1.8) * 0.95) : 0;

  // 8. Xenia emerging behind the optical tunnel:
  // 0% - 20%: 0 -> 0.08
  // 20% - 60%: 0.08 -> 0.55 (claramente visible)
  // 60% - 90%: 0.55 -> 0.90
  // 90% - 100%: 0.90 -> 0.98 hasta el POP definitivo (1.00)
  let xeniaOpacity = 0;
  if (p < 0.20) {
    xeniaOpacity = (p / 0.20) * 0.08;
  } else if (p >= 0.20 && p < 0.60) {
    xeniaOpacity = 0.08 + ((p - 0.20) / 0.40) * 0.47;
  } else if (p >= 0.60 && p < 0.90) {
    xeniaOpacity = 0.55 + ((p - 0.60) / 0.30) * 0.35;
  } else {
    xeniaOpacity = 0.90 + ((p - 0.90) / 0.10) * 0.08;
  }

  // 9. Micro-vibration of camera in the deep climax (80% - 98%)
  const vibrationPx = p > 0.80 ? (Math.sin(p * 70) * Math.pow((p - 0.80) / 0.20, 1.6) * 1.4) : 0;

  return (
    <section
      ref={containerRef}
      id="xenia"
      className="relative h-[150vh] bg-white dark:bg-black text-black dark:text-white transition-colors duration-700"
    >
      <span id="agente" className="absolute top-0 opacity-0 pointer-events-none"></span>
      <span id="contacto" className="absolute top-0 opacity-0 pointer-events-none"></span>

      {/* 
        STICKY 100dvh VIEWPORT:
        Visual camera is completely locked in place.
        The user travels into the portal with high-impact, short-distance scroll.
      */}
      <div 
        className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center will-change-transform select-none"
        style={{
          transform: vibrationPx !== 0 ? `translate(${vibrationPx}px, ${-vibrationPx * 0.5}px)` : 'none'
        }}
      >
        {/* ================================================================= */}
        {/* CINEMATIC LETTERBOX BARS (Top & Bottom, strictly black & clean)   */}
        {/* ================================================================= */}
        {barHeightVh > 0.05 && (
          <>
            <div 
              className="absolute top-0 left-0 right-0 bg-black z-40 pointer-events-none will-change-[height] shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
              style={{ height: `${barHeightVh}vh` }}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 bg-black z-40 pointer-events-none will-change-[height] shadow-[0_-4px_25px_rgba(0,0,0,0.8)]"
              style={{ height: `${barHeightVh}vh` }}
            />
          </>
        )}

        {/* ================================================================= */}
        {/* LAYER 1: "Hablar con Xenia" - Central Threshold Entry              */}
        {/* ================================================================= */}
        {portalTextOpacity > 0.005 && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-[transform,opacity,filter] ${
              portalTextOpacity > 0.15 ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              opacity: portalTextOpacity,
              transform: `scale(${portalTextScale})`,
              filter: centerBlurPx > 0.4 ? `blur(${centerBlurPx * 0.65}px) contrast(${100 - prismIntensity * 10}%)` : 'none',
            }}
          >
            {/* Chromatic aberration clones */}
            {chromaticOffset > 1 && (
              <h2
                aria-hidden="true"
                className="absolute text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none select-none pointer-events-none text-cyan-400 opacity-60 mix-blend-screen"
                style={{
                  transform: `translate(${-chromaticOffset}px, ${chromaticOffset * 0.5}px)`,
                  filter: `blur(${chromaticOffset * 0.35}px)`
                }}
              >
                Hablar con <span className="text-cyan-500">Xenia</span>
              </h2>
            )}
            {chromaticOffset > 1 && (
              <h2
                aria-hidden="true"
                className="absolute text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none select-none pointer-events-none text-rose-500 opacity-60 mix-blend-screen"
                style={{
                  transform: `translate(${chromaticOffset}px, ${-chromaticOffset * 0.5}px)`,
                  filter: `blur(${chromaticOffset * 0.35}px)`
                }}
              >
                Hablar con <span className="text-rose-500">Xenia</span>
              </h2>
            )}

            {/* Main Portal Title */}
            <h2 className="relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none">
              Hablar con <span className="text-red-600">Xenia</span>
            </h2>
            
            <p className="mt-4 text-xs md:text-sm font-mono tracking-[0.25em] uppercase opacity-40">
              [ AGENTE AUDIOVISUAL INTELIGENTE ]
            </p>

            <div 
              onClick={triggerPopAndEnter}
              className="mt-8 px-6 py-2.5 rounded-full border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 backdrop-blur-md text-[11px] font-mono tracking-widest uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer group"
            >
              <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                Iniciar conversación ↓
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* LAYER 2: XENIA EXPERIENCE EMERGENCE                               */}
        {/* ================================================================= */}
        <div
          className="absolute inset-0 w-full h-full will-change-[transform,opacity,filter]"
          style={{
            opacity: xeniaOpacity,
            transform: `scale(${xeniaDepthScale})`,
            filter: edgeBlurPx > 0.4 ? `blur(${edgeBlurPx}px)` : 'none',
          }}
        >
          <XeniaExperience 
            isActive={p > 0.60} 
            opacity={xeniaOpacity} 
            onExit={handleExitXenia} 
          />
        </div>

        {/* ================================================================= */}
        {/* LAYER 3: CONCENTRIC OPTICAL TUNNEL RINGS                           */}
        {/* ================================================================= */}
        {p > 0.05 && p < 0.98 && (
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20"
            style={{
              transform: `scale(${tunnelRingsScale})`,
              opacity: prismIntensity,
            }}
          >
            {/* Outer chromatic ring */}
            <div 
              className="absolute w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full border border-cyan-500/20 prism-edge-refraction"
              style={{
                transform: `scale(${1 + p * 0.15})`,
                filter: `blur(${1 + p * 2}px)`
              }}
            />
            {/* Mid ring */}
            <div 
              className="absolute w-[60vw] h-[60vw] max-w-[680px] max-h-[680px] rounded-full border border-rose-500/25 prism-edge-refraction"
              style={{
                transform: `scale(${1 + p * 0.28})`,
                filter: `blur(${0.5 + p * 1.5}px)`
              }}
            />
            {/* Core aperture ring */}
            <div 
              className="absolute w-[38vw] h-[38vw] max-w-[420px] max-h-[420px] rounded-full border border-white/30"
              style={{
                transform: `scale(${1 + p * 0.42})`
              }}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* LAYER 4: SPECTRAL CAUSTICS & PRISM DISPERSION                      */}
        {/* ================================================================= */}
        {prismIntensity > 0.02 && p < 0.98 && (
          <div 
            className="absolute inset-0 pointer-events-none z-25 prism-caustics-layer mix-blend-color-dodge transition-opacity duration-150"
            style={{
              opacity: prismIntensity * 0.85
            }}
          />
        )}

        {/* ================================================================= */}
        {/* LAYER 5: ANAMORPHIC HORIZON STREAK & LENS BLOOM (Climax peak)     */}
        {/* ================================================================= */}
        {bloomOpacity > 0.02 && (
          <div 
            className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center mix-blend-screen transition-opacity duration-100"
            style={{ opacity: bloomOpacity }}
          >
            {/* Horizontal anamorphic flare beam */}
            <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent blur-[1px]" />
            <div className="absolute w-full h-[14px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[4px]" />
            {/* Central energy glare */}
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-400/30 via-white/60 to-rose-400/30 blur-2xl" />
          </div>
        )}

        {/* ================================================================= */}
        {/* LAYER 6: IMPACT FLASH FRAME (~120ms optical discharge)             */}
        {/* ================================================================= */}
        {showImpactFlash && (
          <div className="absolute inset-0 pointer-events-none z-50 animate-impact-flash bg-gradient-to-tr from-cyan-400/50 via-white/95 to-rose-500/50 mix-blend-overlay backdrop-blur-[3px]" />
        )}
      </div>
    </section>
  );
};

export default XeniaTransition;
