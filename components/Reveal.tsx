
import React, { useEffect, useRef, useState } from 'react';
import { getIsMobileViewport } from '../utils/mobile';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  // Added onClick to allow the component to handle click events
  onClick?: () => void;
}

const Reveal: React.FC<RevealProps> = ({ children, className = "", delay = 0, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isMobile = getIsMobileViewport();
    const effectiveDelay = isMobile ? Math.min(delay, 60) : delay;
    let timer: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (effectiveDelay <= 0) {
            setIsVisible(true);
          } else {
            timer = window.setTimeout(() => setIsVisible(true), effectiveDelay);
          }
          observer.unobserve(entry.target);
        }
      },
      isMobile
        ? { threshold: 0.01, rootMargin: '200px 0px' }
        : { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`${className} reveal-hidden ${isVisible ? 'reveal-visible' : ''}`}
      // Applied the onClick handler to the container div
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Reveal;
