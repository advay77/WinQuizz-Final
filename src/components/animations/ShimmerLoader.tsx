import React from 'react';
import { motion } from 'framer-motion';

interface ShimmerLoaderProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
  animated?: boolean;
}

const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = 'rounded-md',
  animated = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${height} ${width} ${rounded} ${className} bg-gray-200 overflow-hidden relative`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
        animate={
          animated
            ? { x: ['-100%', '100%'] }
            : {}
        }
        transition={
          animated
            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }
            : {}
        }
        style={{ backgroundSize: '200% 100%' }}
      />
      {/* Additional glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={
          animated
            ? { x: ['-100%', '100%'] }
            : {}
        }
        transition={
          animated
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
            : {}
        }
      />
    </motion.div>
  );
};

interface ShimmerCardProps {
  className?: string;
}

const ShimmerCard: React.FC<ShimmerCardProps> = ({ className = '' }) => {
  return (
    <div className={`p-6 border rounded-lg ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <ShimmerLoader height="h-10" width="w-10" className="rounded-full" />
          <ShimmerLoader height="h-4" width="w-24" />
        </div>
        <ShimmerLoader height="h-4" width="w-full" />
        <ShimmerLoader height="h-4" width="w-3/4" />
        <div className="flex space-x-2">
          <ShimmerLoader height="h-6" width="w-16" className="rounded-full" />
          <ShimmerLoader height="h-6" width="w-20" className="rounded-full" />
        </div>
      </div>
    </div>
  );
};

interface ShimmerMetricCardProps {
  className?: string;
}

const ShimmerMetricCard: React.FC<ShimmerMetricCardProps> = ({ className = '' }) => {
  return (
    <div className={`p-6 border rounded-lg ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <ShimmerLoader height="h-4" width="w-32" />
          <ShimmerLoader height="h-8" width="w-8" className="rounded-full" />
        </div>
        <ShimmerLoader height="h-8" width="w-20" />
        <ShimmerLoader height="h-3" width="w-24" />
      </div>
    </div>
  );
};

export default ShimmerLoader;
export { ShimmerCard, ShimmerMetricCard };
