
import React, { useEffect, useRef, useState } from 'react';

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
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
