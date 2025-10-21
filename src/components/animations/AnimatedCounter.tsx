import React, { useState, useEffect } from 'react';
import { motion, Variants, Transition } from 'framer-motion';

type EasingType = 'easeOut' | 'easeIn' | 'easeInOut' | 'bounce';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  delay?: number;
  easing?: EasingType;
}

type EasingFunction = (t: number) => number;

interface EasingFunctions {
  [key: string]: EasingFunction;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 2500, 
  suffix = '', 
  prefix = '', 
  className = '',
  delay = 0,
  easing = 'easeOut'
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const easingFunctions: EasingFunctions = {
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeIn: (t) => t * t * t,
    easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    bounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const easeFn = easingFunctions[easing] || easingFunctions.easeOut;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeFn(progress);
        
        const currentValue = Math.floor(easedProgress * value);
        setCount(currentValue);
        
        if (progress < 1) {
          let animationFrameId = requestAnimationFrame(animate);
        } else {
          setCount(value);
          setIsComplete(true);
        }
      };
      
      let animationFrameId = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationFrameId);
        clearTimeout(timer);
      };
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, duration, delay, isVisible, easing]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      onViewportEnter={() => setIsVisible(true)}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 0.6, 
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`tabular-nums font-bold relative ${className}`}
    >
      <motion.span
        animate={isComplete ? {
          scale: [1, 1.1, 1],
          color: ['currentColor', '#dc2626', 'currentColor']
        } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {prefix}{count.toLocaleString()}{suffix}
      </motion.span>
      
      {/* Subtle glow effect when complete */}
      {isComplete && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute inset-0 text-red-500 blur-sm pointer-events-none"
        >
          {prefix}{count.toLocaleString()}{suffix}
        </motion.span>
      )}
    </motion.span>
  );
};

export default AnimatedCounter;