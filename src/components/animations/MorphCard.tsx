"use client";

import React, { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";

interface MorphCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  hoverRotate?: number;
  glowColor?: string;
  interactive?: boolean;
  loading?: boolean;
}

const MorphCard: React.FC<MorphCardProps> = ({
  children,
  className = "",
  hoverScale = 1.03,
  hoverRotate = 1,
  glowColor = "rgba(220,38,38,0.15)",
  interactive = true,
  loading = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={
        interactive
          ? {
              scale: hoverScale,
              rotateY: hoverRotate,
              z: 50,
            }
          : {}
      }
      whileTap={interactive ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        layout: { duration: 0.3 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="transform-gpu perspective-1000"
    >
      <Card
        {...props}
        className={`
          relative transition-all duration-500 ease-out
          ${interactive ? "cursor-pointer" : ""}
          ${isHovered ? "shadow-xl border-red-200 shadow-red-500/10" : "shadow-md"}
          hover:shadow-2xl hover:border-red-300
          ${loading ? "animate-pulse" : ""}
          ${className}
        `}
        style={{
          boxShadow: isHovered ? `0 25px 50px ${glowColor}` : undefined,
          transform: isHovered ? "translateY(-4px)" : "translateY(0px)",
        }}
      >
        {/* Subtle gradient overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent rounded-xl pointer-events-none"
        />

        {/* Enhanced shimmer effect for loading */}
        {loading && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}

        <div className="relative z-10">{children}</div>
      </Card>
    </motion.div>
  );
};

export default MorphCard;
