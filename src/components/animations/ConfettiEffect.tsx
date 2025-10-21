import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface ConfettiEffectProps {
  children: ReactNode;
  trigger?: 'hover' | 'click';
  duration?: number;
}

interface WindowDimensions {
  width: number;
  height: number;
}

interface SparkleEffectProps {
  children: ReactNode;
  count?: number;
  color?: keyof typeof colorClasses;
}

interface CoinSparkleProps {
  children: ReactNode;
  prizeAmount: number | string;
}

const colorClasses = {
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  purple: 'bg-purple-400',
  pink: 'bg-pink-400'
} as const;

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ 
  children, 
  trigger = "hover", 
  duration = 3000 
}) => {
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [showConfetti, duration]);

  const handleTrigger = (): void => {
    setShowConfetti(true);
  };

  const triggerProps = trigger === "hover" 
    ? { onMouseEnter: handleTrigger }
    : { onClick: handleTrigger };

  return (
    <div className="relative" {...triggerProps}>
      {children}
      
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
            colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFD93D']}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      {/* Custom Sparkle Effects */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ 
                  scale: 0, 
                  rotate: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 0], 
                  rotate: 360,
                  opacity: [0, 1, 0],
                  y: [-20, -40, -60],
                  x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0 
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${
                    i % 4 === 0 ? 'bg-yellow-400' :
                    i % 4 === 1 ? 'bg-red-400' :
                    i % 4 === 2 ? 'bg-blue-400' :
                    'bg-green-400'
                  }`}
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sparkle component for subtle effects
export const SparkleEffect: React.FC<SparkleEffectProps> = ({ 
  children, 
  count = 5, 
  color = "yellow" 
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(count)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  left: `${20 + (i * 60 / count)}%`,
                  top: `${10 + (i * 80 / count)}%`,
                }}
                initial={{ 
                  scale: 0, 
                  rotate: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 0], 
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0],
                  y: [0, -15, -30]
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0 
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${colorClasses[color]}`} />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Coin sparkle effect specifically for prize amounts
export const CoinSparkle: React.FC<CoinSparkleProps> = ({ 
  children, 
  prizeAmount 
}) => {
  const [showSparkles, setShowSparkles] = useState<boolean>(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowSparkles(true)}
      onMouseLeave={() => setShowSparkles(false)}
    >
      {children}
      
      <AnimatePresence>
        {showSparkles && (
          <>
            {/* Coin symbols floating around the text */}
            {['₹', '💰', '🪙', '💎'].map((symbol, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none text-yellow-500 text-lg font-bold"
                style={{
                  left: `${-10 + i * 30}%`,
                  top: `${-20 + (i % 2) * 40}%`,
                }}
                initial={{ 
                  scale: 0, 
                  rotate: -180,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 1, 0], 
                  rotate: [0, 360],
                  opacity: [0, 1, 1, 0],
                  y: [0, -20, -40, -60]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              >
                {symbol}
              </motion.div>
            ))}
            
            {/* Golden sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ 
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 0], 
                  opacity: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                <div className="w-1 h-1 bg-yellow-400 rounded-full shadow-lg" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiEffect;