"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft } from 'lucide-react';
import { Progress } from "./ui/progress";


import {
  Clock,
  Target,
  Trophy,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Award,
  Timer,
  Flame,
  FastForward,
} from "lucide-react";

// ---------------- TYPES ----------------

interface Question {
  id: string;
  question_text_english: string;
  question_text_hindi?: string;
  options: string[];
  correct_answer: number;
  points?: number;
  explanation_english?: string;
}

interface QuizSession {
  id: string;
  contest_id: string;
  status: "active" | "completed";
  current_question?: number;
  score?: number;
  consecutive_correct?: number;
  total_questions?: number;
  questions: Question[];
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  prize?: string;
}

interface AnswerResult {
  correct: boolean;
  skipped?: boolean;
  pointsEarned?: number;
  correctAnswer?: number;
  explanation?: string;
}

// ---------------- COMPONENT ----------------

const QuizInterface: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalTimeLeft, setTotalTimeLeft] = useState(600);
  const [score, setScore] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- EFFECTS ----------------

  useEffect(() => {
    fetchQuizSession();
  }, [sessionId]);

  useEffect(() => {
    if (!answered && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!answered && timeLeft === 0) {
      handleSkipQuestion(true);
    }
  }, [timeLeft, answered, quizCompleted]);

  useEffect(() => {
    if (!quizCompleted && totalTimeLeft > 0) {
      const timer = setTimeout(() => setTotalTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (totalTimeLeft === 0) {
      finishQuiz();
    }
  }, [totalTimeLeft, quizCompleted]);

  // ---------------- FETCH FUNCTIONS ----------------

  const fetchQuizSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
      const token = localStorage.getItem("userToken");

      const response = await fetch(`${backendUrl}/api/quiz/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: QuizSession = await response.json();
        setSession(data);
        setQuestionIndex(data.current_question || 0);
        setScore(data.score || 0);
        setConsecutiveCorrect(data.consecutive_correct || 0);

        if (data.questions?.[data.current_question || 0]) {
          setCurrentQuestion(data.questions[data.current_question || 0]);
        }

        if (data.status === "completed") {
          setQuizCompleted(true);
          fetchLeaderboard();
        }
      } else {
        const err = await response.json();
        setError(err.detail || "Failed to load quiz session");
      }
    } catch (err) {
      console.error("Error fetching quiz session:", err);
      setError("Failed to load quiz session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
      const res = await fetch(`${backendUrl}/api/quiz/leaderboard/${session?.contest_id}`);
      if (res.ok) {
        const data: LeaderboardEntry[] = await res.json();
        if (data.length > 0) setLeaderboard(data);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // ---------------- HANDLERS ----------------

  const handleSkipQuestion = async (isAutoSkip = false) => {
    if (answered) return;

    setAnswered(true);
    setIsSkipped(true);
    setSelectedAnswer(-1);

    setLastAnswerResult({
      correct: false,
      skipped: true,
      correctAnswer: currentQuestion?.correct_answer,
    });

    setTimeout(() => nextQuestion(), 2000);
  };

  const handleAnswerSubmit = async (answerIndex: number, timeTaken: number) => {
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === currentQuestion?.correct_answer;
    let pointsEarned = 0;
    let newConsecutiveCorrect = consecutiveCorrect;

    if (isCorrect) {
      pointsEarned = (currentQuestion?.points || 10) + timeLeft;
      newConsecutiveCorrect += 1;

      if (newConsecutiveCorrect >= 3) pointsEarned += 10;
      if (newConsecutiveCorrect >= 5) pointsEarned += 20;
      if (newConsecutiveCorrect >= 10) pointsEarned += 50;

      setConsecutiveCorrect(newConsecutiveCorrect);
    } else {
      pointsEarned = -4;
      setConsecutiveCorrect(0);
    }

    const newScore = score + pointsEarned;
    setScore(newScore);

    setLastAnswerResult({
      correct: isCorrect,
      pointsEarned,
      correctAnswer: currentQuestion?.correct_answer,
      explanation: currentQuestion?.explanation_english,
    });

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
      const token = localStorage.getItem("userToken");

      await fetch(`${backendUrl}/api/quiz/answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion?.id,
          answer: answerIndex,
          time_taken: timeTaken,
          is_correct: isCorrect,
          points_earned: pointsEarned,
        }),
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
    }

    setTimeout(() => nextQuestion(), 3000);
  };

  const nextQuestion = () => {
    const nextIndex = questionIndex + 1;
    if (!session?.questions) return;

    if (nextIndex >= session.questions.length) {
      finishQuiz();
    } else {
      setQuestionIndex(nextIndex);
      setCurrentQuestion(session.questions[nextIndex]);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(15);
      setLastAnswerResult(null);
      setIsSkipped(false);
    }
  };

  const finishQuiz = async () => {
    setQuizCompleted(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
      const token = localStorage.getItem("userToken");

      await fetch(`${backendUrl}/api/quiz/session/${sessionId}/finish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          final_score: score,
          total_time: 600 - totalTimeLeft,
        }),
      });

      fetchLeaderboard();
    } catch (err) {
      console.error("Error finishing quiz:", err);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ---------------- UI RENDERING ----------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
          <h2 className="font-semibold text-lg mb-2 text-gray-800">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );

  if (!session || !currentQuestion)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <XCircle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
          <h2 className="font-semibold text-lg mb-2 text-gray-800">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz session could not be found.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );

  // ---------------- MAIN RETURN ----------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <div className="flex space-x-6 items-center">
            <div className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1">
              <Flame className="h-4 w-4" />
              <span className="font-bold text-sm">LIVE QUIZ</span>
            </div>
            <div className="text-sm text-gray-600">
              Question {questionIndex + 1} / {session.total_questions}
            </div>
            <div className="text-sm text-gray-600">Score: {score}</div>
          </div>

          <div className="flex space-x-6 text-right">
            <div>
              <div className="text-red-600 font-bold text-lg">{timeLeft}</div>
              <div className="text-xs text-gray-600">Question Timer</div>
            </div>
            <div>
              <div className="text-black font-bold text-lg">{formatTime(totalTimeLeft)}</div>
              <div className="text-xs text-gray-600">Total Time Left</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">{currentQuestion.question_text_english}</h2>
            {currentQuestion.question_text_hindi && (
              <p className="text-gray-700 mb-6">{currentQuestion.question_text_hindi}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((opt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={`h-16 text-left justify-start border-2 ${
                    selectedAnswer === i
                      ? "border-blue-500 bg-blue-50"
                      : lastAnswerResult && lastAnswerResult.correctAnswer === i
                      ? "border-green-500 bg-green-50"
                      : lastAnswerResult && selectedAnswer === i && !lastAnswerResult.correct
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => !answered && handleAnswerSubmit(i, 15 - timeLeft)}
                  disabled={answered}
                >
                  <span className="font-bold mr-3">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </Button>
              ))}
            </div>

            {!answered && (
              <div className="text-center">
                <Button
                  variant="outline"
                  className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 px-6 py-3"
                  onClick={() => handleSkipQuestion(false)}
                >
                  <FastForward className="h-4 w-4 mr-2" /> Skip Question (-2 pts)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizInterface;
