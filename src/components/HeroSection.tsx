"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "./animations/AnimatedCounter";
import RippleButton from "./animations/RippleButton";
import ParticleBackground from "./animations/ParticleBackground";
import PrizeShowcase from "./animations/PrizeShowcase";
import ConfettiEffect, { SparkleEffect } from "./animations/ConfettiEffect";
import { FadeInUp } from "./animations/PageTransition";
import { Trophy, Star, Target } from "lucide-react";

interface Stats {
  users: number;
  contests: number;
  prizes: number;
  participants: number;
}

interface HeroSectionProps {
  participants: number;
  contests: number;
  prizes: number;
  onLoginClick: () => void;
  onHowItWorksClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ participants, contests, prizes, onLoginClick, onHowItWorksClick }) => {
  const [stats] = useState<Stats>({
    users: participants,
    contests,
    prizes,
    participants,
  });

  return (
    <section className="relative w-full bg-gradient-to-br from-red-50 to-red-100 py-20 hero-pattern overflow-hidden">
      <ParticleBackground count={15} />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Heading */}
          <FadeInUp delay={0.2}>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                WinQuizz –
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                className="text-red-600 block"
              >
                Participate Smartly. Test your knowledge.
              </motion.span>
            </motion.h1>
          </FadeInUp>

          {/* Subheading */}
          <FadeInUp delay={0.4}>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              India's first ultimate skill-based contest platform. Compete in fun quizzes and win amazing prizes.
            </p>
          </FadeInUp>

          {/* Action Buttons */}
          <FadeInUp delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <RippleButton
                onClick={onLoginClick}
                size="lg"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg font-semibold rounded-lg whitespace-nowrap"
              >
                <Target className="h-5 w-5 mr-2 inline-block align-left" />
                Login
              </RippleButton>

              <RippleButton
                onClick={onHowItWorksClick}
                variant="outline"
                size="lg"
                className="flex items justify-center border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg"
              >
                How It Works
              </RippleButton>
            </div>
          </FadeInUp>

          {/* Stats */}
          <FadeInUp delay={0.8}>
            <div className="grid grid-cols-3 gap-8 mb-12">
              <SparkleEffect count={2} color="red">
                <div className="text-center cursor-pointer">
                  <div className="text-3xl font-bold text-red-600">
                    <AnimatedCounter value={stats.participants} suffix="+" delay={500} />
                  </div>
                  <div className="text-gray-600">Participants</div>
                </div>
              </SparkleEffect>

              <SparkleEffect count={2} color="blue">
                <div className="text-center cursor-pointer">
                  <div className="text-3xl font-bold text-red-600">
                    <AnimatedCounter value={stats.contests} suffix="+" delay={800} />
                  </div>
                  <div className="text-gray-600">Quizzes</div>
                </div>
              </SparkleEffect>

              <SparkleEffect count={2} color="green">
                <div className="text-center cursor-pointer">
                  <div className="text-3xl font-bold text-red-600">
                    <AnimatedCounter
                      value={Math.round(stats.prizes / 100000)}
                      prefix="₹"
                      suffix="L+"
                      delay={1100}
                    />
                  </div>
                  <div className="text-gray-600">Prizes Won</div>
                </div>
              </SparkleEffect>
            </div>
          </FadeInUp>

          {/* Prize Showcase */}
          <FadeInUp delay={1}>
            <div className="mb-8 text-center">
              <motion.div
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                ✨ EXCITING PRIZES AWAIT ✨
              </motion.div>

              <motion.p
                className="text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your dream prize is just one perfect quiz away! 🎯
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
              className="relative max-w-2xl mx-auto"
            >
              <ConfettiEffect trigger="hover" duration={2000}>
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-pink-400/20 to-red-400/20 rounded-3xl blur-xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <PrizeShowcase className="w-full relative z-10" />
                </div>
              </ConfettiEffect>
            </motion.div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
