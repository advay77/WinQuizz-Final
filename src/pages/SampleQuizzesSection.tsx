"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Trophy,
  Zap,
  Clock as ClockIcon,
  Play,
  CheckCircle,
  X,
  Target,
} from "lucide-react";

/**
 * SampleQuizzesSection.tsx
 * - Single-file demo quizzes UI (TypeScript + React)
 * - Per-question 15s timer, auto-skip on 0 (skipped = -2)
 * - Submit locks the options; correct = green, wrong = red
 * - Scoring + streak logic preserved from your spec:
 *     Base correct: +20, time bonus = remaining seconds,
 *     streak bonuses at 3,5,10, wrong = -4, skip = -2
 * - Shows both current streak and best streak in final result modal
 * - Responsive layout
 */

/* ----------------------------- Types ------------------------------ */
type Question = {
  question_english: string;
  question_hindi?: string;
  options: string[];
  correct: number; // index
};

type DemoQuiz = {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_seconds: number;
  category: string;
  icon: "Brain" | "Zap" | "Trophy";
  color: string; // tailwind gradient classes
  questions_data: Question[];
};

type LastResult = {
  correct: boolean;
  skipped?: boolean;
  points: number;
  bonusBreakdown: string[];
  correctAnswer: number;
};

/* ---------------------------- Demo Data --------------------------- */
const demoQuizzesData: DemoQuiz[] = [
  {
    id: "demo-1",
    title: "General Knowledge Challenge",
    description: "Test your GK with bilingual questions!",
    total_questions: 5,
    duration_seconds: 60,
    category: "General Knowledge",
    icon: "Brain",
    color: "from-purple-500 to-purple-600",
    questions_data: [
      {
        question_english: "Which city is the capital of Maharashtra?",
        question_hindi: "महाराष्ट्र की राजधानी कौन सा शहर है?",
        options: [
          "A) Mumbai / मुंबई",
          "B) Pune / पुणे",
          "C) Nagpur / नागपुर",
          "D) Nashik / नाशिक",
        ],
        correct: 0,
      },
      {
        question_english: "What is the largest desert in the world?",
        question_hindi: "दुनिया का सबसे बड़ा रेगिस्तान कौन सा है?",
        options: [
          "A) Sahara / सहारा",
          "B) Gobi / गोबी",
          "C) Antarctic Desert / अंटार्कटिक रेगिस्तान",
          "D) Thar / थार",
        ],
        correct: 2,
      },
      {
        question_english: "What is the national bird of India?",
        question_hindi: "भारत का राष्ट्रीय पक्षी क्या है?",
        options: [
          "A) Peacock / मोर",
          "B) Sparrow / गौरैया",
          "C) Parrot / तोता",
          "D) Eagle / चील",
        ],
        correct: 0,
      },
      {
        question_english: "Who was the first Indian to win a Nobel Prize?",
        question_hindi: "नोबेल पुरस्कार जीतने वाले पहले भारतीय कौन थे?",
        options: [
          "A) Rabindranath Tagore / रवींद्रनाथ टैगोर",
          "B) C.V. Raman / सी.वी. रमन",
          "C) Amartya Sen / अमर्त्य सेन",
          "D) Mother Teresa / मदर टेरेसा",
        ],
        correct: 0,
      },
      {
        question_english: "What is the chemical symbol for water?",
        question_hindi: "पानी का रासायनिक प्रतीक क्या है?",
        options: ["A) H2O / एच2ओ", "B) CO2 / सीओ2", "C) O2 / ओ2", "D) NaCl / नैक्ल"],
        correct: 0,
      },
    ],
  },
  {
    id: "demo-2",
    title: "Advanced Knowledge Quiz",
    description: "Challenge yourself with harder questions!",
    total_questions: 4,
    duration_seconds: 120,
    category: "Advanced Knowledge",
    icon: "Zap",
    color: "from-green-500 to-green-600",
    questions_data: [
      {
        question_english:
          "What is the name of the process by which water moves through a plant?",
        question_hindi:
          "पौधे के माध्यम से पानी की गति की प्रक्रिया का नाम क्या है?",
        options: [
          "A) Respiration / श्वसन",
          "B) Transpiration / वाष्पोत्सर्जन",
          "C) Photosynthesis / प्रकाश संश्लेषण",
          "D) Osmosis / परासरण",
        ],
        correct: 1,
      },
      {
        question_english:
          "Who is credited with developing the theory of relativity?",
        question_hindi:
          "सापेक्षता के सिद्धांत को विकसित करने का श्रेय किसे दिया जाता है?",
        options: [
          "A) Albert Einstein / अल्बर्ट आइंस्टीन",
          "B) Isaac Newton / आइज़क न्यूटन",
          "C) Galileo Galilei / गैलीलियो गैलिली",
          "D) Stephen Hawking / स्टीफन हॉकिंग",
        ],
        correct: 0,
      },
      {
        question_english: "Who discovered the neutron?",
        question_hindi: "न्यूट्रॉन की खोज किसने की?",
        options: [
          "A) Ernest Rutherford / अर्नेस्ट रदरफोर्ड",
          "B) James Chadwick / जेम्स चैडविक",
          "C) Niels Bohr / नील्स बोहर",
          "D) Enrico Fermi / एनरिको फर्मी",
        ],
        correct: 1,
      },
      {
        question_english:
          "What is the name of the Indian satellite series used for communication?",
        question_hindi:
          "संचार के लिए उपयोग की जाने वाली भारतीय उपग्रह श्रृंखला का नाम क्या है?",
        options: ["A) INSAT / इनसैट", "B) IRS / आईआरएस", "C) EDUSAT / एडूसैट", "D) CARTOSAT / कार्टोसैट"],
        correct: 0,
      },
    ],
  },
  {
    id: "demo-3",
    title: "Mixed Knowledge Special",
    description: "Variety questions from different topics!",
    total_questions: 4,
    duration_seconds: 90,
    category: "Mixed Topics",
    icon: "Trophy",
    color: "from-red-500 to-red-600",
    questions_data: [
      {
        question_english: "Which is the smallest state in India by area?",
        question_hindi: "भारत का क्षेत्रफल के अनुसार सबसे छोटा राज्य कौन सा है?",
        options: ["A) Goa / गोवा", "B) Sikkim / सिक्किम", "C) Tripura / त्रिपुरा", "D) Mizoram / मिजोरम"],
        correct: 0,
      },
      {
        question_english: "What is the capital of Karnataka?",
        question_hindi: "कर्नाटक की राजधानी क्या है?",
        options: ["A) Bengaluru / बेंगलुरु", "B) Mysuru / मैसूर", "C) Mangaluru / मंगलुरु", "D) Hubli / हुबली"],
        correct: 0,
      },
      {
        question_english: "Which Indian festival is known as the festival of colors?",
        question_hindi: "कौन सा भारतीय त्योहार रंगों का त्योहार कहलाता है?",
        options: ["A) Holi / होली", "B) Diwali / दिवाली", "C) Dussehra / दशहरा", "D) Navratri / नवरात्रि"],
        correct: 0,
      },
      {
        question_english: "Who is known as the 'Missile Man of India'?",
        question_hindi: "भारत के 'मिसाइल मैन' के रूप में किसे जाना जाता है?",
        options: ["A) A.P.J. Abdul Kalam / ए.पी.जे. अब्दुल कलाम", "B) Vikram Sarabhai / विक्रम साराभाई", "C) Homi Bhabha / होमी भाभा", "D) Satish Dhawan / सतीश धवन"],
        correct: 0,
      },
    ],
  },
];

/* -------------------------- Component ----------------------------- */
export default function SampleQuizzesSection(): JSX.Element {
  // quizzes list (demo)
  const [demoQuizzes] = useState<DemoQuiz[]>(demoQuizzesData);

  // quiz control states
  const [selectedQuiz, setSelectedQuiz] = useState<DemoQuiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(0); // total seconds left
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  // compute total quiz seconds when starting a quiz
  useEffect(() => {
    if (selectedQuiz) {
      setTotalTimeLeft(selectedQuiz.questions_data.length * 15);
    } else {
      setTotalTimeLeft(0);
    }
  }, [selectedQuiz]);

  // per-question & total timer effect
  useEffect(() => {
    if (!selectedQuiz || quizCompleted) return;

    if (!answered && timeLeft > 0) {
      const t = setTimeout(() => {
        setTimeLeft((p) => p - 1);
        setTotalTimeLeft((p) => (p > 0 ? p - 1 : 0));
      }, 1000);
      return () => clearTimeout(t);
    }

    // auto-skip when time hits zero and not answered
    if (timeLeft === 0 && !answered) {
      handleSkipQuestion(true);
    }
  }, [selectedQuiz, timeLeft, answered, quizCompleted]);

  // helpers
  const currentQ = selectedQuiz?.questions_data[currentQuestion] ?? null;
  const progressPercent = useMemo(() => {
    if (!selectedQuiz) return 0;
    const total = selectedQuiz.questions_data.length;
    const done = currentQuestion;
    return Math.round((done / total) * 100);
  }, [selectedQuiz, currentQuestion]);

  // start a quiz
  const startQuiz = (quiz: DemoQuiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setQuizCompleted(false);
    setScore(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setLastResult(null);
    setTimeLeft(15);
    setTotalTimeLeft(quiz.questions_data.length * 15);
    setShowOverlay(true);
    if (typeof document !== "undefined") document.body.style.overflow = "hidden";
  };

  // close overlay and reset body scroll
  const closeOverlay = () => {
    setShowOverlay(false);
    setSelectedQuiz(null);
    if (typeof document !== "undefined") document.body.style.overflow = "";
  };

  // select an answer (doesn't submit)
  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
  };

  // submit answer
  const handleAnswerSubmit = () => {
    if (answered || selectedAnswer === null || !selectedQuiz) return;

    setAnswered(true);

    const isCorrect = selectedAnswer === currentQ!.correct;

    let points = 0;
    const bonusBreakdown: string[] = [];

    if (isCorrect) {
      points = 20;
      bonusBreakdown.push("Correct Answer: +20");

      // time bonus
      points += timeLeft;
      bonusBreakdown.push(`Time Bonus: +${timeLeft}`);

      // streak handling
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      if (newStreak >= 3) {
        points += 10;
        bonusBreakdown.push("3+ Streak: +10");
      }
      if (newStreak >= 5) {
        points += 20;
        bonusBreakdown.push("5+ Streak: +20");
      }
      if (newStreak >= 10) {
        points += 50;
        bonusBreakdown.push("10+ Streak: +50");
      }
    } else {
      // wrong answer
      points = -4;
      bonusBreakdown.push("Wrong Answer: -4");
      setCurrentStreak(0);
    }

    setScore((s) => s + points);

    setLastResult({
      correct: isCorrect,
      points,
      bonusBreakdown,
      correctAnswer: currentQ!.correct,
    });

    // after short delay go to next question
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  // skip (manual or auto)
  const handleSkipQuestion = (isAutoSkip = false) => {
    if (answered || !selectedQuiz) return;

    setAnswered(true);
    setSelectedAnswer(-1);

    setLastResult({
      correct: false,
      skipped: true,
      points: -2,
      bonusBreakdown: ["Skipped: -2 points"],
      correctAnswer: currentQ!.correct,
    });

    // update score & reset streak
    setScore((s) => s - 2);
    setCurrentStreak(0);

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // go to next question or finish
  const nextQuestion = () => {
    if (!selectedQuiz) return;
    const nextIndex = currentQuestion + 1;
    if (nextIndex >= selectedQuiz.questions_data.length) {
      setQuizCompleted(true);
      // unlock scroll
      if (typeof document !== "undefined") document.body.style.overflow = "";
    } else {
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(null);
      setAnswered(false);
      setLastResult(null);
      setTimeLeft(15);
    }
  };

  // reset quiz (close or restart)
  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(15);
    setCurrentStreak(0);
    setBestStreak(0);
    setLastResult(null);
    setTotalTimeLeft(0);
    setShowOverlay(false);
    if (typeof document !== "undefined") document.body.style.overflow = "";
  };

  // returns CSS classes for option button based on state
  const optionClass = (index: number) => {
    if (!lastResult) {
      // not answered yet -> highlight selected
      if (selectedAnswer === index) {
        return "border-gray-300 bg-white ring-1 ring-red-200";
      }
      return "border-gray-200 bg-white";
    }

    // answered -> show correct/incorrect states
    if (lastResult.correct) {
      // correct answer -> green
      if (lastResult.correctAnswer === index) {
        return "bg-green-50 border-green-200 text-green-900";
      }
      // others greyed
      return "bg-white border-gray-200 text-gray-800 opacity-70";
    } else {
      // skipped -> highlight correct in green, others neutral
      if (lastResult.skipped) {
        if (lastResult.correctAnswer === index) {
          return "bg-green-50 border-green-200 text-green-900";
        }
        return "bg-white border-gray-200 text-gray-800 opacity-70";
      }

      // user answered wrong -> show user's wrong (red) and correct (green)
      if (lastResult.correctAnswer === index) {
        return "bg-green-50 border-green-200 text-green-900";
      }
      if (selectedAnswer === index && !lastResult.correct) {
        return "bg-red-50 border-red-200 text-red-900";
      }
      return "bg-white border-gray-200 text-gray-800 opacity-70";
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Try Our Demo Quizzes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the thrill of quiz competitions with our interactive demo. No registration required!
          </p>
        </div>

        {/* Cards grid (responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoQuizzes.map((quiz) => {
            const IconComp = quiz.icon === "Brain" ? Brain : quiz.icon === "Zap" ? Zap : Trophy;
            return (
              <Card key={quiz.id} className="h-full shadow-sm hover:shadow-lg transition">
                <CardHeader className="text-center pt-6 pb-2">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${quiz.color} flex items-center justify-center mb-3`}>
                    <IconComp className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{quiz.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">{quiz.description}</p>
                </CardHeader>
                <CardContent className="pt-2 pb-6 px-6">
                  <div className="flex justify-between items-center mb-3">
                    <Badge className="text-xs">{quiz.total_questions} Qs</Badge>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{quiz.duration_seconds < 60 ? `${quiz.duration_seconds}s` : `${Math.floor(quiz.duration_seconds / 60)}m`}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => startQuiz(quiz)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo Quiz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ---------- Overlay Quiz UI ---------- */}
      {showOverlay && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          {/* top header */}
          <div className="px-4 md:px-12 py-4 border-b">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-600 text-sm text-white font-semibold">
                    🔥 DEMO QUIZ
                  </span>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      Question {currentQuestion + 1} of {selectedQuiz.questions_data.length}
                    </div>
                    <div className="text-sm text-gray-500">Score: {score} points</div>
                  </div>
                </div>
              </div>

              {/* timers on right */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-extrabold text-red-600">{String(timeLeft).padStart(2, "0")}</div>
                  <div className="text-xs text-gray-500">Question Timer</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-extrabold text-gray-900">{String(totalTimeLeft).padStart(2, "0")}</div>
                  <div className="text-xs text-gray-500">Total Time Left</div>
                </div>
              </div>
            </div>

            {/* progress bar */}
            <div className="max-w-7xl mx-auto mt-3 px-0">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-red-600 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* content */}
          <div className="flex-1 overflow-auto p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
              {/* question card */}
              <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex-1 pr-0 md:pr-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{currentQ?.question_english}</h3>
                    {currentQ?.question_hindi && <p className="text-gray-600 mb-6">{currentQ.question_hindi}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQ?.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={answered}
                          className={`text-left p-4 rounded-lg border ${optionClass(idx)} transition-colors w-full`}
                          style={{ minHeight: 64 }}
                          aria-pressed={selectedAnswer === idx}
                        >
                          <div className="flex items-start gap-3">
                            <div className="font-medium text-sm">{String.fromCharCode(65 + idx)}.</div>
                            <div className="text-sm">{opt.replace(/^[A-Z]\)\s*/, "")}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* action buttons */}
                    <div className="flex justify-center mt-8">
                      {!answered ? (
                        <>
                          <Button
                            onClick={handleAnswerSubmit}
                            disabled={selectedAnswer === null}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 mr-4"
                          >
                            Submit Answer
                          </Button>
                          <Button
                            onClick={() => handleSkipQuestion(false)}
                            variant="outline"
                            className="px-6 py-3"
                          >
                            Skip Question (-2 points)
                          </Button>
                        </>
                      ) : (
                        <div className="w-full">
                          {/* feedback / result panel */}
                          <div className={`mt-6 p-4 rounded-lg ${lastResult?.correct ? "bg-green-50 border border-green-200" : lastResult?.skipped ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}>
                            <div className="flex items-center gap-3">
                              {lastResult?.correct ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : lastResult?.skipped ? (
                                <ClockIcon className="w-6 h-6 text-yellow-600" />
                              ) : (
                                <X className="w-6 h-6 text-red-600" />
                              )}
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {lastResult?.correct ? "Correct!" : lastResult?.skipped ? "Skipped" : "Incorrect"}
                                </div>
                                <div className="text-sm text-gray-700 mt-1">
                                  Points: {lastResult?.points > 0 ? "+" : ""}{lastResult?.points}
                                </div>
                              </div>
                            </div>
                            {lastResult?.bonusBreakdown && (
                              <div className="mt-3 text-sm text-gray-700">
                                {lastResult.bonusBreakdown.map((b, i) => (
                                  <div key={i}>• {b}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* right strip with big timer (visual like screenshot) */}
                  <div className="w-full md:w-36 flex flex-col items-center">
                    <div className="text-5xl md:text-6xl font-extrabold text-red-600">{timeLeft}</div>
                    <div className="text-sm text-gray-500">seconds</div>

                    {/* streak */}
                    <div className="mt-8 text-center">
                      <div className="text-sm text-gray-500">Streak</div>
                      <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* bottom controls: Next / Exit */}
              <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <Button variant="ghost" onClick={closeOverlay} className="text-gray-700">
                    Exit Quiz
                  </Button>
                </div>

                <div className="text-sm text-gray-600 text-center">
                  <div>Question timer: <span className="font-semibold text-red-600">{timeLeft}s</span></div>
                  <div>Total time left: <span className="font-semibold">{totalTimeLeft}s</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* footer results modal when completed */}
          {quizCompleted && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-3" />
                  <h2 className="text-3xl font-bold">Quiz Completed!</h2>
                  <p className="text-lg mt-2">Great job! Here are your results.</p>
                </div>

                {/* Stats Section */}
                <div className="p-6 md:p-10 grid md:grid-cols-2 gap-6">
                  {/* Left: Your Performance */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-700">{score}</div>
                        <div className="text-sm text-gray-600">Total Score</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-700">-</div>
                        <div className="text-sm text-gray-600">Your Rank</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-700">{bestStreak}</div>
                        <div className="text-sm text-gray-600">Best Streak</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-700">{currentStreak}</div>
                        <div className="text-sm text-gray-600">Final Streak</div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">
                        Show Full Leaderboard
                      </Button>
                    </div>
                  </div>

                  {/* Right: Contest Stats */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Contest Stats</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex justify-between">
                        <span>Total Participants</span>
                        <span className="font-semibold text-gray-900">10</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Average Score</span>
                        <span className="font-semibold text-gray-900">247</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Highest Score</span>
                        <span className="font-semibold text-green-600">285</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      resetQuiz();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 font-semibold"
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      resetQuiz();
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold"
                  >
                    My Contests
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
