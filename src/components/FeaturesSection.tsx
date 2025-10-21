'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileCardSlider from './MobileCardSlider';
import { FadeInUp } from './animations/PageTransition';

interface Feature {
  title: string;
  description: string;
  badge?: string;
}

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <Card className="border-2 border-gray-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <motion.div
            className="bg-green-100 p-2 rounded-full"
            whileHover={{
              backgroundColor: '#bbf7d0',
              scale: 1.1,
              rotate: 10,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CheckCircle className="h-6 w-6 text-green-600" />
          </motion.div>
          <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3">{feature.description}</p>
        {feature.badge && (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200" variant="secondary">
            {feature.badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const FeaturesSection: React.FC = () => {
  const features: Feature[] = [
    {
      title: 'KYC Registration',
      description: 'Secure Aadhaar/PAN verification with OTP authentication',
      badge: 'Secure',
    },
    {
      title: 'Secure Payments',
      description: 'PCI-DSS compliant payment gateway with GST invoicing',
      badge: 'Trusted',
    },
    {
      title: 'Real Contest Participation',
      description: 'Timed GK & puzzle challenges with live leaderboards',
      badge: 'Live',
    },
    {
      title: 'Multi-channel Notifications',
      description: 'SMS, Email, and App push notifications for updates',
      badge: 'Instant',
    },
    {
      title: 'Public Leaderboard',
      description: 'Top 50 public rankings with transparent scoring system',
      badge: 'Transparent',
    },
    {
      title: 'Quick Refunds',
      description: 'Automated refund processing within 7 working days',
      badge: 'Fast',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Platform Features
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Everything you need for a secure and exciting contest experience
            </motion.p>
          </div>
        </FadeInUp>

        <MobileCardSlider
          showNavigation
          showDots
          autoSlide
          slideInterval={5000}
          enableManualSlide
          className="gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </MobileCardSlider>
      </div>
    </section>
  );
};

export default FeaturesSection;
