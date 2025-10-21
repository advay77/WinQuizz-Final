import React, { useState, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '../ui/button';

type Ripple = {
  x: number;
  y: number;
  size: number;
  id: number;
};

interface RippleButtonProps extends ButtonProps {
  children: React.ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  loading?: boolean;
  disabled?: boolean;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  ...props
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const rippleSize = Math.max(rect.width, rect.height) * 1.2;
    const x = event.clientX - rect.left - rippleSize / 2;
    const y = event.clientY - rect.top - rippleSize / 2;

    const newRipple: Ripple = { x, y, size: rippleSize, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 400);

    if (onClick) onClick(event);
  };

  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        duration: 0.1,
      }}
    >
      <Button
        {...props}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={`
          relative overflow-hidden transition-all duration-200 ease-out
          ${isPressed ? 'brightness-110 shadow-lg' : ''}
          ${loading ? 'cursor-wait' : ''}
          ${disabled ? 'cursor-not-allowed' : 'active:shadow-md'}
          ${className}
        `}
        onClick={createRipple}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/40 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.3 },
            }}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-current/10 rounded-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          </motion.div>
        )}

        <motion.span
          animate={{ opacity: loading ? 0.7 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </Button>
    </motion.div>
  );
};

export default RippleButton;
