import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalConfetti from "./components/animations/GlobalConfetti";
import FeaturesSection from "./components/FeaturesSection";
import HeroSection from "./components/HeroSection";
import SampleQuizzesSection from "./components/SampleQuizzesSection";
import TrustSection from "./components/TrustSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CTASection from "./components/CTASection";
import HowItWorks from "./components/HowItWorks";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Progress from "./pages/Progress";
import Withdrawal from "./pages/Withdrawal";
import LiveContest from "./pages/LiveContest";
import Wallet from "./pages/Wallet";
import KYC from "./pages/KYC";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";

const HomePage: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="w-full">
        <HeroSection 
          participants={1000}
          contests={50}
          prizes={10000}
          onLoginClick={() => window.location.href = '/auth'}
          onHowItWorksClick={() => scrollToSection('how-it-works')}
        />
      </div>
      
      <div className="w-full">
        <HowItWorks />
      </div>
      
      <section id="features" className="w-full py-16 md:py-24 bg-muted/20">
        <div className="w-full">
          <FeaturesSection />
        </div>
      </section>
      
      <div id="sample-quizzes" className="w-full py-16 md:py-24">
        <div className="w-full">
          <SampleQuizzesSection />
        </div>
      </div>
      
      <div className="w-full">
        <TrustSection />
      </div>
      <div className="w-full">
        <TestimonialsSection />
      </div>
      <div className="w-full">
        <CTASection />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <GlobalConfetti />
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            {/* Main landing page */}
            <Route path="/" element={<HomePage />} />

            {/* Authentication */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify" element={<Verify />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/contest" element={<LiveContest />} />
            <Route path="/kyc" element={<KYC />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />

            {/* 404 Not Found */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
