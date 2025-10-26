"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Shield,
  Users,
  Lock,
  FileText,
  Eye,
  Zap,
  LucideIcon,
} from "lucide-react";
import MobileCardSlider from "./MobileCardSlider";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const TrustSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: Shield,
      title: "Knowledge-Based Only",
      description: "No luck involved - pure skill and knowledge testing platform",
    },
    {
      icon: Users,
      title: "Fraud Prevention",
      description: "Advanced duplicate detection and device tracking systems",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "PCI-DSS certified payment processing with encryption",
    },
    {
      icon: FileText,
      title: "GST Compliant",
      description: "Fully registered with GST and TDS compliance",
    },
    {
      icon: Eye,
      title: "2FA Security",
      description:
        "Two-factor authentication for admin access and bot protection",
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description:
        "Live contest monitoring and automated fair participation detection",
    },
  ];

  return (
    <>
      {/* Why Choose WinQuizz (Trust & Security Section) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose WinQuizz
            </h2>
            <p className="text-xl text-gray-600">
              Your safety and fair play are our top priorities
            </p>
          </div>

          <MobileCardSlider
            showNavigation={false}
            showDots={true}
            autoSlide={true}
            slideInterval={3000}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg group text-center h-full"
                >
                  <CardHeader>
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                      <Icon className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </MobileCardSlider>

          {/* Compliance Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
              🛡️ GST Registered
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
              🔒 PCI-DSS Compliant
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm">
              ⚡ 100% Skill-Based
            </Badge>
            <Badge className="bg-orange-100 text-orange-800 px-4 py-2 text-sm">
              📜 RNG Certified
            </Badge>
          </div>
        </div>
      </section>

      {/* Legal & Compliance Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Legal & Compliance
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Eligibility & Rules
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Age:</strong> 18+ Indian residents only</li>
                <li>• <strong>KYC:</strong> Valid Aadhaar/PAN required</li>
                <li>• <strong>Fair Play:</strong> One account per person</li>
                <li>• <strong>Skill-based:</strong> No luck or chance involved</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tax & Refunds
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>GST:</strong> 18% on all contest tickets</li>
                <li>• <strong>TDS:</strong> 30% on prizes above ₹10,000</li>
                <li>• <strong>Refunds:</strong> Processed within 7 working days</li>
                <li>• <strong>Invoice:</strong> Digital GST receipts provided</li>
              </ul>
            </div>
          </div>

          {/* Responsible Gaming Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Responsible Gaming:</strong> Play responsibly. Set limits and
              know when to stop. If you feel you have a gambling problem, please
              seek help. This is a skill-based platform, not gambling.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default TrustSection;
