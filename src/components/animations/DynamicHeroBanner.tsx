"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Watch,
  Car,
  Trophy,
  Play,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import ConfettiEffect, { SparkleEffect } from "./ConfettiEffect";

interface Slide {
  id: number;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  emoji: string;
}

interface DynamicHeroBannerProps {
  onRegisterClick?: () => void;
}

const slides: Slide[] = [
  {
    id: 1,
    icon: Smartphone,
    title: "Win a Smartphone",
    subtitle: "Latest Smartphone",
    value: "₹1,34,900",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description:
      "Answer 10 questions correctly and win the latest smartphone!",
    emoji: "📱",
  },
  {
    id: 2,
    icon: Watch,
    title: "Win a Smartwatch",
    subtitle: "Apple Watch Ultra",
    value: "₹89,900",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    description: "Perfect score gets you this premium smartwatch!",
    emoji: "⌚",
  },
  {
    id: 3,
    icon: Car,
    title: "Win Big Rewards – Even Cars!",
    subtitle: "Maruti Swift",
    value: "₹6,49,000",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    description: "Top performers can win a brand new car!",
    emoji: "🚗",
  },
  {
    id: 4,
    icon: Trophy,
    title: "Grand Prize Winner",
    subtitle: "Ultimate Champion",
    value: "₹10,00,000",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    description: "Be the ultimate quiz champion and win the grand prize!",
    emoji: "🏆",
  },
];

const DynamicHeroBanner: React.FC<DynamicHeroBannerProps> = ({
  onRegisterClick,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div className="relative">
      <div
        className={`${currentSlideData.bgColor} rounded-2xl shadow-2xl p-8 relative overflow-hidden transition-colors duration-500`}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 2px, transparent 2px)`,
            backgroundSize: "30px 30px",
          }}
        />

        {/* Live Indicator */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(239, 68, 68, 0.7)",
              "0 0 0 10px rgba(239, 68, 68, 0)",
              "0 0 0 0 rgba(239, 68, 68, 0.7)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold"
        >
          LIVE CONTEST
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Icon with Animation */}
            <SparkleEffect count={6} color="yellow">
              <motion.div
                className={`bg-gradient-to-br ${currentSlideData.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -10, 10, 0],
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                }}
                transition={{
                  rotate: { duration: 0.5 },
                  scale: { type: "spring", stiffness: 300 },
                }}
              >
                <IconComponent className="h-10 w-10 text-white" />
              </motion.div>
            </SparkleEffect>

            {/* Title with Emoji */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-4"
            >
              <div className="text-4xl mb-2">{currentSlideData.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {currentSlideData.title}
              </h3>
              <p
                className={`text-lg font-semibold ${currentSlideData.textColor}`}
              >
                {currentSlideData.subtitle}
              </p>
            </motion.div>

            {/* Prize Value with Confetti Effect */}
            <ConfettiEffect trigger="hover" duration={2000}>
              <motion.div
                className="text-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <motion.span
                  className={`inline-block text-3xl font-bold bg-gradient-to-r ${currentSlideData.color} bg-clip-text text-transparent`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Worth {currentSlideData.value}
                </motion.span>
              </motion.div>
            </ConfettiEffect>

            {/* Description */}
            <motion.p
              className="text-gray-600 text-center mb-6 text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentSlideData.description}
            </motion.p>

            {/* Action Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <Button
                onClick={onRegisterClick}
                className={`bg-gradient-to-r ${currentSlideData.color} hover:shadow-lg text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center mx-auto`}
              >
                <Play className="h-4 w-4 mr-2" />
                Enter Contest
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? currentSlideData.textColor.replace("text-", "bg-")
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Auto-play Control */}
        <motion.button
          className="absolute bottom-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setIsPlaying(!isPlaying)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle autoplay"
        >
          {isPlaying ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Play className="h-4 w-4" />
            </motion.div>
          ) : (
            <div className="w-4 h-4 bg-gray-400 rounded-sm" />
          )}
        </motion.button>

        {/* Slide Counter */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-medium">
          {currentSlide + 1} / {slides.length}
        </div>

        {/* Floating Elements */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`float-${i}`}
            className={`absolute w-2 h-2 ${currentSlideData.textColor.replace(
              "text-",
              "bg-"
            )} rounded-full`}
            style={{
              left: `${20 + i * 25}%`,
              top: `${15 + i * 30}%`,
            }}
            animate={{
              y: [-5, -15, -5],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicHeroBanner;
