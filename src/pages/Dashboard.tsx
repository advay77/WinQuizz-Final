"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  email_verified: boolean;
  phone_verified: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  entry_fee: number;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  current_participants: number;
  total_questions: number;
  status: string;
}

interface Progress {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  status: string;
  completed_at: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroSlides = [
    {
      title: "Win Exciting Prizes!",
      description: "Test your knowledge and win up to 10,000 coins in daily quizzes.",
      image: "/hero1.jpg",
      buttonText: "Play Now",
    },
    {
      title: "Daily Challenges",
      description: "New quizzes added daily. Never run out of challenges!",
      image: "/hero2.jpg",
      buttonText: "View Challenges",
    },
    {
      title: "Compete with Friends",
      description: "Challenge your friends and see who scores the highest!",
      image: "/hero3.jpg",
      buttonText: "Invite Friends",
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPaused, heroSlides.length]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
          navigate("/auth");
        return;
      }

      setUser(user);

      // fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData) {
        toast.error("Profile not found. Please contact support.");
          navigate("/auth");
        return;
      }

      if (
        !(profileData as Profile).email_verified ||
        !(profileData as Profile).phone_verified
      ) {
        toast.error("Please verify both email and phone to access the dashboard");
          navigate("/verify");
        return;
      }

      setProfile(profileData);

      // fetch quizzes
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select(`*, quiz_participants(count)`)
        .order("created_at", { ascending: false });

      if (quizzesData) {
        const transformed = quizzesData.map((quiz: any) => ({
          ...quiz,
          current_participants: quiz.quiz_participants?.[0]?.count || 0,
        }));
        setQuizzes(transformed);
      }

      // fetch progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_quiz_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (progressError) throw progressError;
      setProgress(progressData || []);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
      navigate("/");
  };

  const completedQuizzes = progress.filter((p) => p.status === "completed");
  const totalScore = completedQuizzes.reduce((sum, p) => sum + p.score, 0);
  const averageScore =
    completedQuizzes.length > 0
      ? Math.round(totalScore / completedQuizzes.length)
      : 0;

  // Demo quizzes data
  const demoQuizzes = [
    {
      title: "General Knowledge Demo",
      desc: "Test your basic knowledge",
      q: 10,
      diff: "Easy",
      route: "/quiz/general-knowledge",
    },
    {
      title: "Science & Technology Demo",
      desc: "Explore science and tech",
      q: 15,
      diff: "Medium",
      route: "/quiz/science-tech",
    },
    {
      title: "Entertainment Demo",
      desc: "Movies, music & pop culture",
      q: 12,
      diff: "Easy",
      route: "/quiz/entertainment",
    },
    {
      title: "History Challenge",
      desc: "Test your history knowledge",
      q: 15,
      diff: "Medium",
      route: "/quiz/history",
    },
    {
      title: "Sports Trivia",
      desc: "For the sports enthusiasts",
      q: 12,
      diff: "Easy",
      route: "/quiz/sports",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Hero Section */}
        <div className="relative mb-12 rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-64 md:h-96 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-primary/90 to-primary/70 p-8 text-white"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="max-w-2xl text-center">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    {heroSlides[currentSlide].title}
                  </h1>
                  <p className="text-lg md:text-xl mb-6">
                    {heroSlides[currentSlide].description}
                  </p>
                  <Button className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg">
                    {heroSlides[currentSlide].buttonText}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all ${
                    currentSlide === index ? 'bg-white w-8' : 'bg-white/50 w-3'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {" "}
            {profile?.full_name ||
              profile?.email?.split("@")[0] ||
              "Player"}
            !
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready to test your skills and win big?
          </p>
        </div>

        {/* Demo Quizzes */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Demo Quizzes (Free Practice)</h2>
          <p className="text-muted-foreground mb-6">
            Try these demo quizzes to understand how the platform works. No coins required and no progress saved.
          </p>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoQuizzes.map((demo, i) => (
              <Card
                key={i}
                className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{demo.title}</CardTitle>
                  <CardDescription>{demo.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-semibold">{demo.q}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Limit:</span>
                      <span className="font-semibold">1 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-semibold">{demo.diff}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 mt-2"
                      onClick={() => navigate(demo.route)}
                    >
                      Try Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Quizzes */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Live Quizzes (Coin Required)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes
              .filter((q) => q.status === "active")
              .map((quiz) => (
                <Card
                  key={quiz.id}
                  className="border-2 hover:border-primary transition-all hover:shadow-lg"
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-semibold">
                          {quiz.current_participants}/{quiz.max_participants || "∞"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-semibold">{quiz.total_questions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-semibold">{quiz.time_limit_minutes} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="font-semibold text-yellow-600">
                          🪙 {quiz.entry_fee} Coins
                        </span>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 mt-2"
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                        disabled={
                          quiz.max_participants !== null &&
                          quiz.current_participants >= quiz.max_participants
                        }
                      >
                        {quiz.max_participants !== null &&
                        quiz.current_participants >= quiz.max_participants
                          ? "Full"
                          : "Play Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Upcoming Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes
              .filter((q) => q.status === "draft")
              .map((quiz) => (
                <Card
                  key={quiz.id}
                  className="border-2 hover:border-primary transition-all hover:shadow-lg opacity-75"
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-semibold">
                          {quiz.current_participants}/{quiz.max_participants || "∞"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-semibold">{quiz.total_questions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-semibold">{quiz.time_limit_minutes} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="font-semibold text-yellow-600">
                          🪙 {quiz.entry_fee} Coins
                        </span>
                      </div>
                      <Button className="w-full bg-muted hover:bg-muted/90 mt-2" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
