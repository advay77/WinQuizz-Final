"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";

// -------------------- SwipeableCard --------------------
interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  threshold?: number;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = "",
  threshold = 100,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;

    if (offset > threshold && onSwipeRight) {
      onSwipeRight();
      x.set(500);
    } else if (offset < -threshold && onSwipeLeft) {
      onSwipeLeft();
      x.set(-500);
    } else {
      x.set(0);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      className={`cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </motion.div>
  );
};

// -------------------- PullToRefresh --------------------
interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  refreshThreshold?: number;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  refreshThreshold = 80,
  className = "",
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, refreshThreshold], [0, 1]);

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
      y.set(0);
    } else {
      y.set(0);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y: pullProgress }}
        className="absolute top-0 left-0 right-0 flex justify-center py-2 z-10"
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
          className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"
        />
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        style={{ y }}
        onDragEnd={handleDragEnd}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

// -------------------- TouchFeedback --------------------
interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  feedbackColor?: string;
  scale?: number;
}

const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  className = "",
  feedbackColor = "rgba(220, 38, 38, 0.1)",
  scale = 0.95,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      whileTap={{
        scale,
        backgroundColor: feedbackColor,
        transition: { duration: 0.1 },
      }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setTimeout(() => setIsPressed(false), 150)}
      className={`transition-colors duration-150 rounded-lg ${
        isPressed ? "bg-opacity-20" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

// -------------------- BottomSheet --------------------
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: string | number;
  className?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  height = "60vh",
  className = "",
}) => {
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldClose = info.velocity.y > 500 || info.offset.y > 100;
    if (shouldClose) {
      onClose();
    } else {
      y.set(0);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          <motion.div
            ref={containerRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            style={{ y, height }}
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 ${className}`}
          >
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pb-4 h-full overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </>
  );
};

// -------------------- InfiniteScrollList --------------------
interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onLoadMore: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
}

const InfiniteScrollList = <T,>({
  items,
  renderItem,
  onLoadMore,
  hasMore = true,
  loading = false,
  className = "",
}: InfiniteScrollListProps<T>) => {
  const loadingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}

      {hasMore && (
        <div ref={loadingRef} className="py-4 text-center">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto"
            />
          ) : (
            <div className="text-gray-500">Scroll for more...</div>
          )}
        </div>
      )}
    </div>
  );
};
// -------------------- HapticButton --------------------
type HapticType = "light" | "medium" | "heavy" | "double";

interface HapticButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style'> {
  children: ReactNode;
  hapticType?: HapticType;
  className?: string;
}

const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  onClick,
  hapticType = "light",
  className = "",
  ...props
}) => {
  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      const patterns: Record<HapticType, number[]> = {
        light: [10],
        medium: [20],
        heavy: [30],
        double: [10, 10, 10],
      };
      navigator.vibrate(patterns[hapticType]);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic();
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={handleClick}
      className={`touch-manipulation ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// -------------------- Exports --------------------
export {
  SwipeableCard,
  PullToRefresh,
  TouchFeedback,
  BottomSheet,
  InfiniteScrollList,
  HapticButton,
};
