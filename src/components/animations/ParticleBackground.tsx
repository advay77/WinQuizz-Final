"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface ParticleBackgroundProps {
  count?: number;
  className?: string;
}

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  count = 20,
  className = "",
}) => {
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? "bg-red-400/20" : "bg-orange-400/20",
    }));
  }, [count]);

  // Use window height safely for SSR
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 1000;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${particle.color}`}
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [-100, -windowHeight - 100],
            rotate: [0, 360],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
