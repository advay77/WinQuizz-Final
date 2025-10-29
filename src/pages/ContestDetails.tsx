"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  Users,
  Clock,
  Star,
  Award,
  Gift,
  CheckCircle,
  XCircle,
  Zap,
  ArrowLeft,
} from "lucide-react";
import SampleQuizzesSection from "./SampleQuizzesSection";

export default function ContestDetails() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleBackToContest = () => {
    setQuizStarted(false);
    setSelectedQuiz(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#f9fafb] px-4 sm:px-6 lg:px-12 pt-28 pb-10 md:pt-32">
      {quizStarted ? (
        <div className="w-full max-w-4xl mx-auto">
          <Button variant="outline" onClick={handleBackToContest} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contest
          </Button>
          <SampleQuizzesSection onBack={handleBackToContest} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-red-600" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  Sports Quiz Championship
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Test your sports knowledge and win big in this amazing contest with
                real estate prizes.
              </p>
            </div>
            <Card className="mt-4 lg:mt-0 border border-gray-200 shadow-sm rounded-xl">
              <CardContent className="px-6 py-4 flex flex-col items-end">
                <p className="text-gray-600 text-sm">Total Prize Pool</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600">
                  ₹8,00,000
                </h2>
              </CardContent>
            </Card>
          </div>

          {/* First Prize */}
          <Card className="mb-6 border border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="text-red-600 w-5 h-5" />
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  🏆 First Prize
                </p>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                Residential Land Worth <span className="font-bold">₹5,00,000</span>
              </p>
            </CardContent>
          </Card>

          {/* Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Contest Overview */}
              <Card className="border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" /> Contest Overview
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center">
                      <Users className="text-blue-600 w-6 h-6 mx-auto mb-2" />
                      <p className="text-gray-700 font-medium text-sm">
                        324 Already Participated
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-center">
                      <Award className="text-green-600 w-6 h-6 mx-auto mb-2" />
                      <p className="text-gray-700 font-medium text-sm">
                        200 Total Winners
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg text-center">
                      <Clock className="text-purple-600 w-6 h-6 mx-auto mb-2" />
                      <p className="text-gray-700 font-medium text-sm">
                        10 Minutes Duration
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 mb-6">
                    <p>
                      <strong>Contest Category:</strong> Sports
                    </p>
                    <p>
                      <strong>Difficulty Level:</strong> Medium
                    </p>
                  </div>

                  <Button 
                    onClick={handleStartQuiz}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-sm sm:text-base"
                  >
                    Join Contest & Start Quiz
                  </Button>
                </CardContent>
              </Card>

              {/* Contest Rules & Scoring */}
              <Card className="border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-6">
                  {/* Contest Rules */}
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" /> Contest Rules & Scoring
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <p className="font-semibold text-gray-700 text-sm">
                          Contest Duration
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          10 minutes total
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                        <p className="font-semibold text-gray-700 text-sm">
                          Per Question
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          15 seconds each
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scoring System */}
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg mb-4">
                      ⚡ Scoring System
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                        <CheckCircle className="text-green-600 w-6 h-6 mx-auto mb-1" />
                        <p className="text-green-700 text-sm font-medium">
                          Right Answer <br /> +20 points
                        </p>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                        <XCircle className="text-red-600 w-6 h-6 mx-auto mb-1" />
                        <p className="text-red-700 text-sm font-medium">
                          Wrong Answer <br /> -4 points
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center">
                        <Zap className="text-yellow-600 w-6 h-6 mx-auto mb-1" />
                        <p className="text-yellow-700 text-sm font-medium">
                          Time Bonus <br /> Remaining seconds
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Consecutive Bonuses */}
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg mb-2">
                      🎯 Consecutive Correct Bonuses
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Earn extra points for consecutive correct answers!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Prize Breakup */}
            <div className="sticky top-32">
              <Card className="border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-yellow-500" /> Prize Breakup
                  </h2>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                      <span>1st 🥇</span>
                      <span>Residential Land Worth ₹5,00,000</span>
                    </li>
                    <li className="flex justify-between border border-gray-200 rounded-lg p-3">
                      <span>2nd 🥈</span>
                      <span>iPhone 15 Pro</span>
                    </li>
                    <li className="fle/x justify-between border border-gray-200 rounded-lg p-3">
                      <span>3rd 🥉</span>
                      <span>Apple Watch Ultra</span>
                    </li>
                    <li className="flex justify-between border border-gray-200 rounded-lg p-3">
                      <span>4th–10th 💰</span>
                      <span>Cash Prize ₹10,000</span>
                    </li>
                    <li className="flex justify-between border border-gray-200 rounded-lg p-3">
                      <span>11th–25th 💰</span>
                      <span>Cash Prize ₹5,000</span>
                    </li>
                    <li className="flex justify-between border border-gray-200 rounded-lg p-3">
                      <span>26th–50th 💰</span>
                      <span>Cash Prize ₹2,000</span>
                    </li>
                    <li className="flex justify-between border border-gray-200 rounded-lg p-3">
                      <span>51st–100th 🎁</span>
                      <span>Gift Vouchers</span>
                    </li>
                    <li className="flex justify-between border border-gray-200 rounded-lg p-3">
                      <span>101st–200th 🎟️</span>
                      <span>Entry Fee Refund</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}