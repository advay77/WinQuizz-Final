import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp } from "lucide-react";

type ProgressBarProps = {
  current?: number;
  target?: number;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: "red" | "blue" | "green" | "purple";
  size?: "small" | "normal" | "large";
};

const colorClasses = {
  red: { bg: "bg-red-50", fill: "bg-red-500", text: "text-red-600", border: "border-red-200" },
  blue: { bg: "bg-blue-50", fill: "bg-blue-500", text: "text-blue-600", border: "border-blue-200" },
  green: { bg: "bg-green-50", fill: "bg-green-500", text: "text-green-600", border: "border-green-200" },
  purple: { bg: "bg-purple-50", fill: "bg-purple-500", text: "text-purple-600", border: "border-purple-200" },
} as const;

const ProgressBar: React.FC<ProgressBarProps> = ({
  current = 1247,
  target = 5000,
  label = "Participants",
  showPercentage = true,
  animated = true,
  color = "red",
  size = "normal",
}) => {
  const [displayCurrent, setDisplayCurrent] = useState<number>(0);
  const [isIncreasing, setIsIncreasing] = useState<boolean>(false);

  const colors = colorClasses[color];
  const percentage = Math.min((current / target) * 100, 100);

  // Animate counter
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayCurrent(current), 500);
      return () => clearTimeout(timer);
    } else {
      setDisplayCurrent(current);
    }
  }, [current, animated]);

  // Simulate random live increase
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldIncrease = Math.random() > 0.7; // 30% chance
      if (shouldIncrease && current < target) {
        setIsIncreasing(true);
        setTimeout(() => setIsIncreasing(false), 500);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [current, target]);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className={`h-4 w-4 ${colors.text}`} />
          <span className={`text-sm font-medium ${colors.text}`}>{label}</span>

          <AnimatePresence>
            {isIncreasing && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center"
              >
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500 ml-1">+live</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showPercentage && (
          <motion.span
            className={`text-sm font-bold ${colors.text}`}
            key={percentage}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {percentage.toFixed(1)}%
          </motion.span>
        )}
      </div>

      {/* Progress Bar */}
      <div
        className={`relative ${colors.bg} rounded-full overflow-hidden border ${colors.border} ${
          size === "large" ? "h-4" : size === "small" ? "h-2" : "h-3"
        }`}
      >
        <motion.div
          className={`${colors.fill} h-full rounded-full relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeOut",
            delay: animated ? 0.3 : 0,
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
          />
        </motion.div>

        {/* Pulse effect when increasing */}
        <AnimatePresence>
          {isIncreasing && (
            <motion.div
              className={`absolute inset-0 ${colors.fill} rounded-full`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <motion.span
          key={displayCurrent}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="font-medium"
        >
          {displayCurrent.toLocaleString()}
        </motion.span>
        <span>/ {target.toLocaleString()}</span>
      </div>

      {/* Milestone celebrations */}
      <AnimatePresence>
        {percentage >= 25 && percentage < 26 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-center py-1 bg-yellow-50 border border-yellow-200 rounded text-yellow-700"
          >
            🎉 25% milestone reached!
          </motion.div>
        )}
        {percentage >= 50 && percentage < 51 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-center py-1 bg-blue-50 border border-blue-200 rounded text-blue-700"
          >
            🚀 Halfway there!
          </motion.div>
        )}
        {percentage >= 75 && percentage < 76 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-center py-1 bg-purple-50 border border-purple-200 rounded text-purple-700"
          >
            🔥 75% complete!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressBar;
