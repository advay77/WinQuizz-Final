"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className = "",
  stagger = 0.1,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: stagger },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  distance?: number;
  duration?: number;
}

const FadeInUp: React.FC<FadeInUpProps> = ({
  children,
  delay = 0,
  className = "",
  threshold = 0.1,
  distance = 40,
  duration = 0.8,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: threshold, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        scale: { duration: duration * 0.6 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  className?: string;
  tapScale?: number;
  rotate?: number;
  springConfig?: {
    stiffness?: number;
    damping?: number;
  };
}

const ScaleOnHover: React.FC<ScaleOnHoverProps> = ({
  children,
  scale = 1.05,
  className = "",
  tapScale = 0.95,
  rotate = 0,
  springConfig = { stiffness: 400, damping: 25 },
}) => {
  return (
    <motion.div
      whileHover={{
        scale,
        rotate,
        transition: { ...springConfig, duration: 0.2 },
      }}
      whileTap={{ scale: tapScale }}
      transition={{ type: "spring", ...springConfig }}
      className={`${className} transform-gpu cursor-pointer`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
export { StaggeredList, FadeInUp, ScaleOnHover };
