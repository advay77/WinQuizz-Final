import { useEffect, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ProgressiveRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export function ProgressiveReveal({ children, className = '', stagger = 0.1 }: ProgressiveRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = containerRef.current.querySelectorAll('.reveal-item');
    elements.forEach((el, index) => {
      (el as HTMLElement).style.animationDelay = `${index * stagger}s`;
      observer.observe(el);
    });

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
