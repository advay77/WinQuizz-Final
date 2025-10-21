"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Star, Quote } from "lucide-react";
import MobileCardSlider from "./MobileCardSlider";

// Type definitions
interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => (
  <Card className="border-2 border-gray-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg h-full">
    <CardHeader>
      <div className="flex items-center space-x-4">
        <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
          {testimonial.avatar}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
          <p className="text-sm text-gray-600">{testimonial.location}</p>
        </div>
      </div>
      <div className="flex space-x-1 mt-2">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
      </div>
    </CardHeader>
    <CardContent>
      <Quote className="h-6 w-6 text-gray-300 mb-2" />
      <p className="text-gray-700 italic">"{testimonial.text}"</p>
    </CardContent>
  </Card>
);

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Rahul Sharma",
      location: "Mumbai",
      text: "Won my first smartwatch in just my third attempt! The questions are challenging but fair.",
      rating: 5,
      avatar: "RS",
    },
    {
      name: "Priya Patel",
      location: "Delhi",
      text: "Love the transparency! You can see exactly how scoring works. Very trustworthy platform.",
      rating: 5,
      avatar: "PP",
    },
    {
      name: "Amit Kumar",
      location: "Bangalore",
      text: "Fast payouts and great customer service. Already recommended to my friends!",
      rating: 5,
      avatar: "AK",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Participants Say
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied winners
          </p>
        </div>

        <MobileCardSlider
          showNavigation
          showDots
          autoSlide
          slideInterval={4000}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="px-2 py-4">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </MobileCardSlider>
      </div>
    </section>
  );
};

export default TestimonialsSection;
