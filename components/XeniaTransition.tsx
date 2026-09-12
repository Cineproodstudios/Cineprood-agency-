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

  // Scrubbed Scroll with requestAnimationFrame & LERP damping
  // 380vh Virtual Track:
  // - High inertia & controlled heavy camera feel
  // - currentProgress += (targetProgress - currentProgress) * 0.045
  // - Normalizes wheel inputs to prevent accidental rapid skipping
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

    // Low-speed heavy camera damping:
    // currentProgress += (targetProgress - currentProgress) * 0.045
    // Provides controlled inertia without drifting endlessly
    const tick = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.00015) {
        const next = current + diff * 0.045;
        currentProgressRef.current = next;
        setCurrentProgress(next);

        // Climax point reached -> triggers the POP and enters Xenia!
        if (next >= 0.982 && target >= 0.982) {
          currentProgressRef.current = 1;
          setCurrentProgress(1);
          triggerPopAndEnter();
          return;
        }
      } else if (current !== target) {
        currentProgressRef.current = target;
        setCurrentProgress(target);

        if (target >= 0.982) {
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
  // STATE 1: CINEMATIC 6-ACT SUSPENSE PORTAL SEQUENCE (380vh track, camera locked 100dvh)
  //
  // Act 1 (0% - 30%): NORMALIDAD / ALGO CAMBIA
  //   - Almost nothing happens. Very subtle edge blur (<4px), faint spectral tint.
  //   - "Hablar con Xenia" remains completely readable and calm.
  //   - No Xenia revelation yet. Builds quiet anticipation.
  //
  // Act 2 (30% - 60%): ENTRADA Y FORMACIÓN
  //   - Letterbox bars gently slide in from 0vh up to 7vh.
  //   - Depth begins to expand; portal rings form.
  //   - "Hablar con Xenia" slowly dissolves.
  //   - Xenia only faintly hints in the deep background (<15% opacity).
  //
  // Act 3 (60% - 82%): PROFUNDIDAD Y TENSIÓN CRECIENTE
  //   - Optical tunnel closes around user; bars reach 9.5vh.
  //   - Rhythmic tension pauses: refraction expands, pauses, then pulses.
  //   - Chromatic separation increases (cyan/magenta split).
  //   - Xenia becomes recognizable as a silhouette, but heavily diffused.
  //
  // Act 4 (82% - 96%): CLÍMAX SOSTENIDO ("Estás a punto de atravesarlo")
  //   - Bars locked at 10.5vh. Heavy visual compression.
  //   - Intense optical energy, anamorphic horizon streak, lens bloom.
  //   - Sustained across multiple deliberate scroll wheel movements.
  //
  // Act 5 (96% - 100%): ACELERACIÓN FINAL & UMBRAL CRÍTICO
  //   - Rapid buildup in the last 4%: peak refraction, high chromatic split.
  //
  // Act 6 (100%): POP -> FLASH -> BARS RETRACT -> CALM & CLARITY
  // =========================================================================

  const p = currentProgress;

  // 1. Cinematic letterbox bars height (0vh -> 10.5vh)
  // Act 1 (0-30%): 0vh
  // Act 2 (30-60%): 0vh -> 7vh
  // Act 3 (60-82%): 7vh -> 9.5vh
  // Act 4 (82-100%): 9.5vh -> 10.5vh
  let barHeightVh = 0;
  if (p >= 0.28 && p < 0.60) {
    barHeightVh = ((p - 0.28) / 0.32) * 7.0;
  } else if (p >= 0.60 && p < 0.82) {
    barHeightVh = 7.0 + ((p - 0.60) / 0.22) * 2.5;
  } else if (p >= 0.82) {
    barHeightVh = 9.5 + ((p - 0.82) / 0.18) * 1.2; // Max ~10.7vh
  }

  // 2. Optical tunnel scales with differential parallax
  const portalTextScale = 1 + p * 0.08;
  const tunnelRingsScale = 1 + (p < 0.30 ? p * 0.10 : 0.03 + p * 0.25);
  const xeniaDepthScale = 0.92 + p * 0.09;

  // 3. Portal text "Hablar con Xenia" opacity
  // Stays strong during Act 1 (0-30%), fades gently in Act 2 (30-55%)
  const portalTextOpacity = p < 0.30 
    ? 1 
    : Math.max(0, 1 - (p - 0.30) / 0.25);

  // 4. Dynamic Blur with staged pauses:
  // Act 1 (0-30%): 0 -> 3px (almost imperceptible)
  // Act 2 (30-60%): 3px -> 12px
  // Act 3 (60-82%): 12px -> 20px (staged tension)
  // Act 4 (82-96%): 20px -> 28px
  // Act 5 (96-100%): 28px -> 36px
  let edgeBlurPx = 0;
  let centerBlurPx = 0;
  if (p >= 0.12 && p < 0.30) {
    edgeBlurPx = ((p - 0.12) / 0.18) * 3.5;
    centerBlurPx = ((p - 0.12) / 0.18) * 1.5;
  } else if (p >= 0.30 && p < 0.60) {
    edgeBlurPx = 3.5 + ((p - 0.30) / 0.30) * 10;
    centerBlurPx = 1.5 + ((p - 0.30) / 0.30) * 4.5;
  } else if (p >= 0.60 && p < 0.82) {
    edgeBlurPx = 13.5 + ((p - 0.60) / 0.22) * 9;
    centerBlurPx = 6.0 + ((p - 0.60) / 0.22) * 5.5;
  } else if (p >= 0.82) {
    const climaxFactor = Math.pow((p - 0.82) / 0.18, 2.2);
    edgeBlurPx = 22.5 + climaxFactor * 14;
    centerBlurPx = 11.5 + climaxFactor * 8.5;
  }

  // 5. Chromatic displacement / RGB offset with suspense plateaus
  let chromaticOffset = 0;
  if (p >= 0.32 && p < 0.60) {
    chromaticOffset = ((p - 0.32) / 0.28) * 3;
  } else if (p >= 0.60 && p < 0.82) {
    // Tension plateau: stays between 3px and 6px with subtle oscillation
    chromaticOffset = 3 + ((p - 0.60) / 0.22) * 3.5;
  } else if (p >= 0.82) {
    // Climax surge: climbs up to 16px
    chromaticOffset = 6.5 + Math.pow((p - 0.82) / 0.18, 2.4) * 10.5;
  }

  // 6. Prism / Caustic refractions intensity
  let prismIntensity = 0;
  if (p >= 0.15 && p < 0.30) {
    prismIntensity = ((p - 0.15) / 0.15) * 0.18; // Very subtle start
  } else if (p >= 0.30 && p < 0.60) {
    prismIntensity = 0.18 + ((p - 0.30) / 0.30) * 0.45;
  } else if (p >= 0.60 && p < 0.82) {
    // Subtle breathing pulse of light
    const pulse = Math.sin(p * 20) * 0.04;
    prismIntensity = 0.63 + ((p - 0.60) / 0.22) * 0.18 + pulse;
  } else if (p >= 0.82) {
    prismIntensity = 0.81 + Math.pow((p - 0.82) / 0.18, 2.0) * 0.19;
  }

  // 7. Bloom / Anamorphic core intensity (peaks strictly in Act 4 and 5)
  const bloomOpacity = p >= 0.78 ? Math.pow((p - 0.78) / 0.22, 2.8) * 0.85 : 0;

  // 8. Xenia emerging behind the optical tunnel:
  // Act 1 (0-30%): completely hidden (0)
  // Act 2 (30-60%): faint suggestion (0 -> 0.18)
  // Act 3 (60-82%): recognizable silhouette (0.18 -> 0.55)
  // Act 4 (82-96%): clear presence behind glass (0.55 -> 0.88)
  // Act 5 (96-100%): 0.88 -> 0.95 until POP cuts to 1.00
  let xeniaOpacity = 0;
  if (p >= 0.35 && p < 0.60) {
    xeniaOpacity = ((p - 0.35) / 0.25) * 0.18;
  } else if (p >= 0.60 && p < 0.82) {
    xeniaOpacity = 0.18 + ((p - 0.60) / 0.22) * 0.38;
  } else if (p >= 0.82) {
    xeniaOpacity = 0.56 + Math.pow((p - 0.82) / 0.18, 1.2) * 0.38;
  }

  // 9. Micro-vibration of camera in the deep climax (85% - 98%)
  const vibrationPx = p > 0.85 ? (Math.sin(p * 90) * Math.pow((p - 0.85) / 0.15, 2) * 1.2) : 0;

  return (
    <section
      ref={containerRef}
      id="xenia"
      className="relative h-[380vh] bg-white dark:bg-black text-black dark:text-white transition-colors duration-700"
    >
      <span id="agente" className="absolute top-0 opacity-0 pointer-events-none"></span>
      <span id="contacto" className="absolute top-0 opacity-0 pointer-events-none"></span>

      {/* 
        STICKY 100dvh VIEWPORT:
        Visual camera is completely locked in place.
        The user does not see the page moving down; they are traveling into a portal.
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
                Hablar con <span className="text-red-500">Xenia</span>
              </h2>
            )}

            <h2
              onClick={triggerPopAndEnter}
              className="relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none cursor-pointer select-none transition-colors hover:text-red-600 z-10"
            >
              Hablar con <span className="text-red-600">Xenia</span>
            </h2>
          </div>
        )}

        {/* ================================================================= */}
        {/* LAYER 2: OPTICAL TUNNEL & REFRACTION RINGS                        */}
        {/* Deforms from edges inward, creating depth and forward suction     */}
        {/* ================================================================= */}
        {prismIntensity > 0.01 && (
          <div
            className="absolute inset-0 pointer-events-none z-10 will-change-[opacity]"
            style={{ opacity: Math.min(1, prismIntensity) }}
          >
            {/* Spectral caustics film */}
            <div 
              className="absolute inset-0 prism-caustics-layer opacity-55 mix-blend-screen dark:mix-blend-screen" 
              style={{
                transform: `rotate(${p * 20}deg) scale(${1 + p * 0.16})`,
                filter: `hue-rotate(${p * 65}deg)`
              }}
            />

            {/* Radial Vignette Mask: Keeps center clear, pulls edges into deep portal */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(0,0,0,${0.15 + p * 0.35}) 85%),
                  radial-gradient(ellipse at top left, rgba(255, 0, 100, ${0.14 + prismIntensity * 0.28}), transparent 50%),
                  radial-gradient(ellipse at top right, rgba(0, 220, 255, ${0.14 + prismIntensity * 0.28}), transparent 50%),
                  radial-gradient(ellipse at bottom left, rgba(160, 40, 255, ${0.12 + prismIntensity * 0.24}), transparent 55%),
                  radial-gradient(ellipse at bottom right, rgba(255, 220, 80, ${0.10 + prismIntensity * 0.20}), transparent 50%)
                `
              }}
            />

            {/* Concentric Portal Tunnel Rings (Differential Parallax) */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `scale(${tunnelRingsScale})`
              }}
            >
              {/* Outer Ring */}
              <div 
                className="w-[92vw] max-w-6xl h-[72vh] rounded-full opacity-38 blur-[36px] border border-white/25 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, rgba(255,0,80,0.28) 0deg, rgba(0,220,255,0.28) 120deg, rgba(180,60,255,0.28) 240deg, rgba(255,0,80,0.28) 360deg)'
                }}
              />
              {/* Inner Portal Aperture Ring */}
              <div 
                className="absolute w-[55vw] max-w-3xl h-[45vh] rounded-full opacity-45 blur-[24px] border border-cyan-400/35 pointer-events-none"
                style={{
                  transform: `scale(${1 + p * 0.28})`,
                  background: 'radial-gradient(circle, rgba(0,220,255,0.18) 0%, rgba(255,0,80,0.12) 60%, transparent 80%)'
                }}
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* LAYER 3: CLIMAX BLOOM & HORIZONTAL ANAMORPHIC FLARE               */}
        {/* ================================================================= */}
        {bloomOpacity > 0.02 && (
          <div 
            className="absolute inset-0 pointer-events-none z-15 mix-blend-screen will-change-[opacity]"
            style={{ opacity: bloomOpacity }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.42) 0%, rgba(0, 220, 255, 0.28) 35%, rgba(255, 0, 80, 0.18) 65%, transparent 85%)'
              }}
            />
            {/* Horizon anamorphic streak line */}
            <div 
              className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 blur-[2px] opacity-85"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,220,255,0.85) 25%, rgba(255,255,255,1) 50%, rgba(255,0,80,0.85) 75%, transparent 100%)',
                transform: `scaleX(${0.5 + Math.pow(Math.max(0, (p - 0.78) / 0.22), 2) * 0.9}) scaleY(${1 + Math.pow(Math.max(0, (p - 0.78) / 0.22), 2) * 4})`
              }}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* LAYER 4: PROGRESSIVE FROSTED GLASS / RADIAL BLUR MASK             */}
        {/* ================================================================= */}
        {edgeBlurPx > 0.4 && (
          <div
            className="absolute inset-0 pointer-events-none z-20 backdrop-blur-sm will-change-[backdrop-filter]"
            style={{
              backdropFilter: `blur(${edgeBlurPx}px)`,
              WebkitBackdropFilter: `blur(${edgeBlurPx}px)`
            }}
          />
        )}

        {/* ================================================================= */}
        {/* LAYER 5: XENIA EMERGING FROM THE DEPTHS OF THE PORTAL             */}
        {/* Parallax depth: scales from 0.92 -> 1.01, clearing behind blur    */}
        {/* ================================================================= */}
        {xeniaOpacity > 0.005 && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center will-change-[opacity,transform,filter] pointer-events-none"
            style={{
              opacity: xeniaOpacity,
              transform: `scale(${xeniaDepthScale})`,
              filter: centerBlurPx > 0.4 ? `blur(${centerBlurPx * 0.45}px)` : 'none'
            }}
          >
            {/* Chromatic aberration clone for Xenia near climax */}
            {chromaticOffset > 2 && (
              <div 
                className="absolute inset-0 opacity-40 mix-blend-screen text-cyan-400 pointer-events-none"
                style={{
                  transform: `translate(${-chromaticOffset * 0.55}px, ${chromaticOffset * 0.28}px)`,
                  filter: `blur(${chromaticOffset * 0.35}px)`
                }}
              >
                <XeniaExperience isActive={false} opacity={xeniaOpacity * 0.5} onExit={handleExitXenia} />
              </div>
            )}
            <XeniaExperience isActive={false} opacity={xeniaOpacity} onExit={handleExitXenia} />
          </div>
        )}

        {/* Impact Flash Frame during the POP */}
        {showImpactFlash && (
          <div className="absolute inset-0 pointer-events-none z-50 animate-impact-flash bg-gradient-to-tr from-cyan-400/40 via-white/90 to-rose-500/40 mix-blend-overlay backdrop-blur-[3px]" />
        )}

      </div>
    </section>
  );
};

export default XeniaTransition;
