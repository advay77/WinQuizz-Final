import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  offset?: number;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className = '',
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -speed * 100]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div style={{ y: springY }} className={className}>
      {children}
    </motion.div>
  );
};

interface ProgressiveRevealProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ProgressiveReveal: React.FC<ProgressiveRevealProps> = ({
  children,
  className = '',
  threshold = 0.1,
  stagger = 0.1,
  direction = 'up',
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'down': return { y: -50 };
      case 'left': return { x: 50 };
      case 'right': return { x: -50 };
      default: return { y: 50 };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: stagger, delayChildren: 0.1 },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, ...getInitialPosition(), scale: 0.95 },
            visible: {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

interface ScrollTriggerSectionProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInUp';
  delay?: number;
  duration?: number;
}

export const ScrollTriggerSection: React.FC<ScrollTriggerSectionProps> = ({
  children,
  className = '',
  animationType = 'fadeInUp',
  delay = 0,
  duration = 0.8,
}) => {
  const animations = {
    fadeInUp: { initial: { opacity: 0, y: 60, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
    fadeInLeft: { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 } },
    fadeInRight: { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 } },
    scaleIn: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 } },
    slideInUp: { initial: { opacity: 0, y: 100 }, animate: { opacity: 1, y: 0 } },
  };

  const animation = animations[animationType] || animations.fadeInUp;

  return (
    <motion.div
      initial={animation.initial}
      whileInView={animation.animate}
      viewport={{ once: true, amount: 0.2, margin: '-100px' }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface InfiniteScrollProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  speed = 20,
  direction = 'left',
  className = '',
}) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: direction === 'left' ? [0, -1000] : [-1000, 0] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {children}
        {children} {/* duplicate for seamless loop */}
      </motion.div>
    </div>
  );
};

interface CountUpOnScrollProps {
  start?: number;
  end: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const CountUpOnScroll: React.FC<CountUpOnScrollProps> = ({
  start = 0,
  end,
  duration = 2,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);

  const animateCount = () => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const range = end - start;
    const increment = range / (duration * 60);
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);
  };

  return (
    <motion.div
      whileInView={{ scale: [0.8, 1.1, 1] }}
      onViewportEnter={animateCount}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.div>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = '',
  amplitude = 20,
  duration = 3,
  delay = 0,
}) => {
  return (
    <motion.div
      animate={{ y: [-amplitude / 2, amplitude / 2, -amplitude / 2], rotate: [-2, 2, -2] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  delay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  className = '',
  showCursor = true,
  delay = 0,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursorState, setShowCursorState] = useState(showCursor);

  useEffect(() => {
    const startTypewriter = () => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          if (showCursor) {
            setTimeout(() => setShowCursorState(false), 1000);
          }
        }
      }, speed);
    };

    if (delay > 0) setTimeout(startTypewriter, delay);
    else startTypewriter();
  }, [text, speed, delay, showCursor]);

  return (
    <span className={className}>
      {displayText}
      {showCursorState && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  );
};
