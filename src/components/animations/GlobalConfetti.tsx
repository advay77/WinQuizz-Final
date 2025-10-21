"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

interface WindowDimensions {
  width: number;
  height: number;
}

interface ClickPosition {
  x: number;
  y: number;
}

const GlobalConfetti: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: 0,
    height: 0,
  });
  const [clickPosition, setClickPosition] = useState<ClickPosition>({
    x: 0,
    y: 0,
  });
  const [confettiKey, setConfettiKey] = useState<number>(0);

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const handleLandingPageClick = (e: MouseEvent) => {
      const isLandingPage = window.location.pathname === "/";
      if (!isLandingPage) return;

      const excludedElements = [
        ".card",
        ".Card",
        "[data-card]",
        ".button",
        ".btn",
        "button",
        ".slider",
        ".MobileCardSlider",
        ".prize-card",
        ".PrizeCard",
        ".nav",
        ".navigation",
        "nav",
        ".modal",
        ".dropdown",
        ".menu",
        "a[href]",
        "[role='button']",
      ];

      const target = e.target as HTMLElement;
      const isExcluded = excludedElements.some((selector) =>
        target.closest(selector)
      );
      if (isExcluded) return;
      if (showConfetti) return;

      setClickPosition({ x: e.clientX, y: e.clientY });
      setShowConfetti(true);
      setConfettiKey((prev) => prev + 1);

      setTimeout(() => setShowConfetti(false), 2500);
    };

    document.addEventListener("click", handleLandingPageClick);
    return () => document.removeEventListener("click", handleLandingPageClick);
  }, [showConfetti]);

  return (
    <>
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            key={confettiKey}
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={100}
            gravity={0.3}
            wind={0.01}
            initialVelocityX={3}
            initialVelocityY={12}
            confettiSource={{
              x: clickPosition.x,
              y: clickPosition.y,
              w: 8,
              h: 8,
            }}
            colors={[
              "#FF6B6B",
              "#4ECDC4",
              "#45B7D1",
              "#96CEB4",
              "#FFEAA7",
              "#DDA0DD",
              "#FFD93D",
              "#FF8A80",
            ]}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfetti && (
          <>
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360) / 8;
              const distance = 40 + Math.random() * 30;
              const endX =
                clickPosition.x +
                Math.cos((angle * Math.PI) / 180) * distance;
              const endY =
                clickPosition.y +
                Math.sin((angle * Math.PI) / 180) * distance;

              return (
                <motion.div
                  key={`sparkle-${confettiKey}-${i}`}
                  className="fixed pointer-events-none z-[9998]"
                  style={{
                    left: clickPosition.x,
                    top: clickPosition.y,
                  }}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: endX - clickPosition.x,
                    y: endY - clickPosition.y,
                    opacity: [1, 1, 0],
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i % 4 === 0
                        ? "bg-red-400"
                        : i % 4 === 1
                        ? "bg-yellow-400"
                        : i % 4 === 2
                        ? "bg-blue-400"
                        : "bg-green-400"
                    } shadow-lg`}
                  />
                </motion.div>
              );
            })}

            <motion.div
              className="fixed pointer-events-none z-[9998]"
              style={{
                left: clickPosition.x - 12,
                top: clickPosition.y - 12,
              }}
              initial={{
                scale: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                scale: [0, 1.2, 0],
                rotate: [0, 180],
                opacity: [1, 1, 0],
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <div className="w-6 h-6 text-2xl">🎉</div>
            </motion.div>

            {["🏆", "💰", "🎁"].map((icon, i) => {
              const angle = i * 120 + Math.random() * 20;
              const distance = 60 + Math.random() * 20;
              const endX =
                clickPosition.x +
                Math.cos((angle * Math.PI) / 180) * distance;
              const endY =
                clickPosition.y +
                Math.sin((angle * Math.PI) / 180) * distance;

              return (
                <motion.div
                  key={`icon-${confettiKey}-${i}`}
                  className="fixed pointer-events-none z-[9998] text-xl"
                  style={{
                    left: clickPosition.x,
                    top: clickPosition.y,
                  }}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1,
                    rotate: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0.6, 0],
                    x: endX - clickPosition.x,
                    y: endY - clickPosition.y,
                    opacity: [1, 1, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: i * 0.15,
                  }}
                >
                  {icon}
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalConfetti;
