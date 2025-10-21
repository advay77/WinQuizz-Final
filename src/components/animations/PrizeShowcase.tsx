import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Watch,
  Laptop,
  Car,
  FileText,
  Play,
  Pause,
} from 'lucide-react';

type Prize = {
  icon: React.ElementType;
  name: string;
  value: string;
  color: string;
  bgColor: string;
  image: string;
  category: string;
};

type PrizeShowcaseProps = {
  className?: string;
  autoPlayInterval?: number;
};

const PRIZES: Prize[] = [
  {
    icon: Car,
    name: 'Brand New Car',
    value: 'Worth up to ₹15,00,000',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
    category: 'Car',
  },
  {
    icon: Smartphone,
    name: 'Latest Smartphone',
    value: 'Worth up to ₹1,50,000',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    image:
      'https://images.unsplash.com/photo-1727093493864-0bcbd16c7e6d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBzbWFydHBob25lfGVufDB8fHx8MTc1NzgzNTQ3Nnww&ixlib=rb-4.1.0&q=85',
    category: 'Smartphone',
  },
  {
    icon: Watch,
    name: 'Premium Smartwatch',
    value: 'Worth up to ₹1,00,000',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    image: 'https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12',
    category: 'Smartwatch',
  },
  {
    icon: Laptop,
    name: 'High-End Laptop',
    value: 'Worth up to ₹2,50,000',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    image:
      'https://images.unsplash.com/photo-1754928864131-21917af96dfd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsYXB0b3B8ZW58MHx8fHwxNzU3ODM1NTA5fDA&ixlib=rb-4.1.0&q=85',
    category: 'Laptop',
  },
  {
    icon: FileText,
    name: 'Digital Certificate',
    value: 'Participation Certificate',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    image: '/images/certificate.svg',
    category: 'Certificate',
  },
];

const PrizeShowcase: React.FC<PrizeShowcaseProps> = ({
  className = '',
  autoPlayInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedImagesRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Preload images
  useEffect(() => {
    PRIZES.forEach((prize) => {
      const img = new Image();
      img.src = prize.image;
      img.onload = () => {
        loadedImagesRef.current += 1;
        if (loadedImagesRef.current >= PRIZES.length) setImagesLoaded(true);
      };
    });
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (isPaused || !imagesLoaded) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PRIZES.length);
    }, autoPlayInterval);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, imagesLoaded, autoPlayInterval]);

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  const currentPrize = PRIZES[currentIndex];
  const Icon = currentPrize.icon;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="space-y-4"
        >
          <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl">
            {!imagesLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-3xl">
                <span className="text-gray-500">Loading...</span>
              </div>
            )}

            <img
              src={currentPrize.image}
              alt={currentPrize.name}
              className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
                imagesLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg">
              {currentPrize.category}
            </div>

            {/* Prize Value */}
            <div className="absolute bottom-4 right-4 bg-red-600 rounded-lg px-4 py-2 shadow-lg">
              <span className="text-white font-bold text-sm sm:text-base">
                {currentPrize.value}
              </span>
            </div>

            {/* Prize Icon */}
            <div
              className={`absolute bottom-4 left-4 bg-gradient-to-br ${currentPrize.color} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg`}
            >
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>

            {/* Prize Name */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {currentPrize.name}
              </h3>
            </div>

            {/* Play/Pause Button */}
            <div className="absolute top-4 right-4 z-20">
              <motion.button
                onClick={() => setIsPaused((prev) => !prev)}
                className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
              >
                {isPaused ? <Play className="h-4 w-4 text-gray-700" /> : <Pause className="h-4 w-4 text-gray-700" />}
              </motion.button>
            </div>
          </div>

          {/* Dot Navigation */}
          <div className="flex items-center justify-center space-x-3 pt-6">
            {PRIZES.map((_, idx) => (
              <button
                key={idx}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-10 h-3 bg-red-600'
                    : 'w-3 h-3 bg-gray-400 hover:bg-gray-600'
                }`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to ${PRIZES[idx].name}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PrizeShowcase;
