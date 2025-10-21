'use client';

import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileCardSliderProps {
  children: React.ReactNode;
  className?: string;
  showNavigation?: boolean;
  showDots?: boolean;
  autoSlide?: boolean;
  slideInterval?: number;
  breakpoint?: number;
  enableManualSlide?: boolean;
}

const MobileCardSlider: React.FC<MobileCardSliderProps> = ({
  children,
  className = '',
  showNavigation = true,
  showDots = true,
  autoSlide = true,
  slideInterval = 5000,
  breakpoint = 768,
  enableManualSlide = true,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  // Determine mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  // Auto-slide logic
  useEffect(() => {
    if (!autoSlide || !isMobile || totalSlides <= 1 || isPaused) return;

    const startAutoSlide = () => {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, slideInterval);
    };

    startAutoSlide();

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [autoSlide, slideInterval, totalSlides, isMobile, isPaused]);

  // Touch events
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!enableManualSlide) return;
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!enableManualSlide) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!enableManualSlide) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      diff > 0 ? nextSlide() : prevSlide();
    }

    // Resume auto-slide after delay
    setTimeout(() => setIsPaused(false), 3000);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  const goToSlide = (index: number) => {
    setIsPaused(true);
    setCurrentSlide(index);
    setTimeout(() => setIsPaused(false), 3000);
  };

  // Desktop/grid view
  if (!isMobile) {
    return (
      <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    );
  }

  // Mobile slider view
  return (
    <div className="relative w-full">
      <div
        ref={sliderRef}
        className="overflow-hidden w-full touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className="w-full flex-shrink-0 px-4"
              style={{ minWidth: '100%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {slide}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      {showNavigation && totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 border-gray-300 hover:bg-white z-10 shadow-md hidden md:flex"
            onClick={() => {
              setIsPaused(true);
              prevSlide();
              setTimeout(() => setIsPaused(false), 3000);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 border-gray-300 hover:bg-white z-10 shadow-md hidden md:flex"
            onClick={() => {
              setIsPaused(true);
              nextSlide();
              setTimeout(() => setIsPaused(false), 3000);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && totalSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                currentSlide === index
                  ? 'bg-red-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      <div className="text-center mt-2 text-sm text-gray-500">
        {currentSlide + 1} / {totalSlides}
      </div>
    </div>
  );
};

export default MobileCardSlider;
