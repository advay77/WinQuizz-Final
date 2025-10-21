import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  rotate?: number;
  className?: string;
}

export function ScaleOnHover({ 
  children, 
  scale = 1.1, 
  rotate = 0,
  className = '' 
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ 
        scale,
        rotate,
        transition: { duration: 0.3 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
