"use client";

import React, { useState, useEffect, ReactNode, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------
// ✅ EnhancedNavLink Component
// ---------------------------

interface EnhancedNavLinkProps {
  children: ReactNode;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  isActive?: boolean;
  className?: string;
}

const EnhancedNavLink: React.FC<EnhancedNavLinkProps> = ({
  children,
  href,
  onClick,
  isActive = false,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={href}
      onClick={onClick}
      className={`
        relative text-gray-700 hover:text-red-600 transition-colors duration-300
        ${isActive ? "text-red-600" : ""}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}

      {/* Enhanced underline animation */}
      <motion.div
        className="absolute -bottom-1 left-0 h-0.5 bg-red-600 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered || isActive ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ width: "100%" }}
      />

      {/* Subtle glow effect on hover */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-md bg-red-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  );
};

// ---------------------------
// ✅ EnhancedMobileMenu Component
// ---------------------------

interface EnhancedMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const EnhancedMobileMenu: React.FC<EnhancedMobileMenuProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
              staggerChildren: 0.1,
            }}
            className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50 md:hidden"
          >
            <div className="py-4 px-4 space-y-2 max-h-screen overflow-y-auto">
              {React.Children.map(children, (child, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="transform-gpu"
                >
                  {child}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ---------------------------
// ✅ EnhancedMobileMenuItem Component
// ---------------------------

interface EnhancedMobileMenuItemProps {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const EnhancedMobileMenuItem: React.FC<EnhancedMobileMenuItemProps> = ({
  children,
  onClick,
  className = "",
}) => {
  return (
    <motion.button
      className={`
        text-left text-gray-700 hover:text-red-600 transition-colors duration-200
        py-3 px-4 rounded-lg hover:bg-red-50 w-full relative overflow-hidden
        ${className}
      `}
      onClick={onClick}
      whileHover={{ x: 4, backgroundColor: "rgba(254, 242, 242, 1)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Subtle slide-in background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100"
        initial={{ x: "-100%" }}
        whileHover={{ x: "0%" }}
        transition={{ duration: 0.3 }}
      />

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// ---------------------------
// ✅ StickyHeader Component
// ---------------------------

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
  children,
  className = "",
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white shadow-sm"
        }
        ${className}
      `}
      animate={{
        y: isScrolled ? 0 : 0,
        backgroundColor: isScrolled
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(255, 255, 255, 1)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.header>
  );
};

// ---------------------------
// ✅ Exports
// ---------------------------

export {
  EnhancedNavLink,
  EnhancedMobileMenu,
  EnhancedMobileMenuItem,
  StickyHeader,
};
