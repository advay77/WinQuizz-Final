import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTime?: string;
  size?: 'normal' | 'large';
  showIcon?: boolean;
  circular?: boolean;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetTime = "2h 15m", 
  size = "normal",
  showIcon = true,
  circular = false 
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 2,
    minutes: 15,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const initialTotalSeconds = 2 * 3600 + 15 * 60 + 30; // Initial time
  const progress = (totalSeconds / initialTotalSeconds) * 100;

  const formatTime = (value: number): string => String(value).padStart(2, '0');

  if (circular) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg 
          className={`transform -rotate-90 ${size === "large" ? "w-20 h-20" : "w-16 h-16"}`} 
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#dc2626"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={283} // 2 * π * 45
            initial={{ strokeDashoffset: 0 }}
            animate={{ 
              strokeDashoffset: 283 - (283 * progress) / 100,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showIcon && <Clock className="h-4 w-4 text-red-600 mb-1" />}
          <motion.div 
            className={`font-bold text-red-600 ${size === "large" ? "text-sm" : "text-xs"}`}
            animate={{ 
              color: totalSeconds < 300 ? ["#dc2626", "#f59e0b", "#dc2626"] : "#dc2626"
            }}
            transition={{ duration: 1, repeat: totalSeconds < 300 ? Infinity : 0 }}
          >
            {timeLeft.hours > 0 && `${timeLeft.hours}h `}
            {formatTime(timeLeft.minutes)}m
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex items-center space-x-1"
      animate={{ 
        color: totalSeconds < 300 ? ["#059669", "#dc2626", "#059669"] : "#059669"
      }}
      transition={{ duration: 2, repeat: totalSeconds < 300 ? Infinity : 0 }}
    >
      {showIcon && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Clock className={`${size === "large" ? "h-5 w-5" : "h-4 w-4"} text-red-600`} />
        </motion.div>
      )}
      
      <motion.span 
        className={`font-bold ${size === "large" ? "text-lg" : "text-sm"}`}
        key={`${timeLeft.hours}-${timeLeft.minutes}-${timeLeft.seconds}`}
        initial={{ scale: 1.2, color: '#dc2626' }}
        animate={{ scale: 1, color: '#374151' }}
        transition={{ duration: 0.3 }}
      >
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s
      </motion.span>
    </motion.div>
  );
};

export default CountdownTimer;