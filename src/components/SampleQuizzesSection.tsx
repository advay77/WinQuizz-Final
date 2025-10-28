"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import MobileCardSlider from "./MobileCardSlider";
import {
  Brain,
  Trophy,
  Zap,
  Clock,
  Star,
  Play,
  CheckCircle,
  X,
  Award,
  ArrowLeft,
  Home,
  Users,
  FileText,
} from "lucide-react";

/**
 * Type definitions
 */
type Question = {
  question_english: string;
  question_hindi: string;
  options: string[];
  correct: number;
};

type DemoQuiz = {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_seconds: number;
  category: string;
  icon: "Brain" | "Zap" | "Trophy" | string;
  color: string;
  questions_data: Question[];
};

type LastResult = {
  correct?: boolean;
  skipped?: boolean;
  points: number;
  bonusBreakdown: string[];
  correctAnswer: number;
};

const SampleQuizzesSection: React.FC = () => {
  // states
  const [selectedQuiz, setSelectedQuiz] = useState<DemoQuiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [answered, setAnswered] = useState<boolean>(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [loading] = useState<boolean>(false);

  // Hardcoded demo quizzes with multi-language questions
  const [demoQuizzes] = useState<DemoQuiz[]>([
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
  ]);

  // Timer effect for demo quiz
  useEffect(() => {
    if (selectedQuiz && !answered && !quizCompleted && timeLeft > 0) {
      const timer = window.setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered && selectedQuiz) {
      // Auto skip when time runs out
      handleSkipQuestion(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, answered, quizCompleted, selectedQuiz]);

  const startQuiz = (quiz: DemoQuiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(15);
    setAnswered(false);
    setConsecutiveCorrect(0);
    setLastResult(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = () => {
    if (answered || selectedAnswer === null || !selectedQuiz) return;

    setAnswered(true);
    // const timeTaken = 15 - timeLeft; // unused but kept for parity
    const isCorrect = selectedAnswer === selectedQuiz.questions_data[currentQuestion].correct;

    let points = 0;
    const bonusBreakdown: string[] = [];

    if (isCorrect) {
      // Base points for correct answer
      points = 20;
      bonusBreakdown.push("Correct Answer: +20");

      // Time bonus
      points += timeLeft;
      bonusBreakdown.push(`Time Bonus: +${timeLeft}`);

      // Streak bonus
      const newConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCorrect);

      if (newConsecutiveCorrect >= 3) {
        points += 10;
        bonusBreakdown.push("3+ Streak: +10");
      }
      if (newConsecutiveCorrect >= 5) {
        points += 20;
        bonusBreakdown.push("5+ Streak: +20");
      }
      if (newConsecutiveCorrect >= 10) {
        points += 50;
        bonusBreakdown.push("10+ Streak: +50");
      }
    } else {
      // Wrong answer penalty
      points = -4;
      bonusBreakdown.push("Wrong Answer: -4");
      setConsecutiveCorrect(0);
    }

    const newScore = score + points;
    setScore(newScore);

    setLastResult({
      correct: isCorrect,
      points,
      bonusBreakdown,
      correctAnswer: selectedQuiz.questions_data[currentQuestion].correct,
    });

    // Move to next question after delay
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleSkipQuestion = (isAutoSkip = false) => {
    if (!selectedQuiz) return;
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(-1);

    setLastResult({
      correct: false,
      skipped: true,
      points: -2,
      bonusBreakdown: ["Skipped: -2 points"],
      correctAnswer: selectedQuiz.questions_data[currentQuestion].correct,
    });

    // Move to next question after delay
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (!selectedQuiz) return;
    const nextIndex = currentQuestion + 1;

    if (nextIndex >= selectedQuiz.total_questions) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(15);
      setLastResult(null);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(15);
    setAnswered(false);
    setConsecutiveCorrect(0);
    setLastResult(null);
  };

  // QuizCard component (typed)
  const QuizCard: React.FC<{ quiz: DemoQuiz }> = ({ quiz }) => {
    const IconComponent: React.ComponentType<any> =
      quiz.icon === "Brain" ? Brain : quiz.icon === "Zap" ? Zap : Trophy;

    return (
      <Card className="h-full bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3 text-center">
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-r ${quiz.color} flex items-center justify-center`}
            >
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-lg font-bold text-gray-900 text-center">
            {quiz.title}
          </CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">{quiz.description}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-xs" />
              <Badge variant="outline" className="text-xs">
                {quiz.total_questions} Qs
              </Badge>
            </div>

            <div className="flex items-center justify-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {quiz.duration_seconds < 60
                ? `${quiz.duration_seconds} sec`
                : `${Math.floor(quiz.duration_seconds / 60)} min`}
            </div>

            <div className="flex items-center justify-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-1" />
              {quiz.category}
            </div>

            <Button
              onClick={() => startQuiz(quiz)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              Try Demo Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // modal: quizCompleted view or active question UI
  if (selectedQuiz) {
    if (quizCompleted) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Quiz Completed!</CardTitle>
                <p className="text-gray-600 mt-2">Great job! Here's how you performed:</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-red-600 text-center">{score} Points</div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">{consecutiveCorrect}</div>
                    <div className="text-xs text-gray-600">Best Streak</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">{selectedQuiz.total_questions}</div>
                    <div className="text-xs text-gray-600">Questions</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Performance Breakdown:</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Correct answers earn base points + time bonus</div>
                    <div>• Streak bonuses for consecutive correct answers</div>
                    <div>• Wrong answers result in point deduction</div>
                    <div>• Skipped questions: -2 points</div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={resetQuiz} variant="outline" className="flex-1 text-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Try Another
                  </Button>
                  <Button
                    onClick={() => {
                      resetQuiz();
                      window.dispatchEvent(new Event("auth-trigger"));
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-sm"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Join Platform
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedQuiz.title}</CardTitle>
                  <p className="text-gray-600 text-sm">
                    Question {currentQuestion + 1} of {selectedQuiz.total_questions}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {timeLeft}s
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-1" />
                    {score} pts
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-base font-medium text-gray-900">
                  {selectedQuiz.questions_data[currentQuestion].question_english}
                </div>
                <p className="text-gray-600 text-sm">
                  {selectedQuiz.questions_data[currentQuestion].question_hindi}
                </p>

                <div className="grid gap-2">
                  {selectedQuiz.questions_data[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      className={`h-auto p-3 text-left justify-start text-sm ${
                        lastResult && lastResult.correctAnswer === index
                          ? "bg-green-100 border-green-500 text-green-800"
                          : lastResult && selectedAnswer === index && !lastResult.correct
                          ? "bg-red-100 border-red-500 text-red-800"
                          : ""
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={answered}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>

                {lastResult && (
                  <div
                    className={`p-4 rounded-lg ${
                      lastResult.correct ? "bg-green-50 border border-green-200" : lastResult.skipped ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {lastResult.correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : lastResult.skipped ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <span
                        className={`font-medium ${
                          lastResult.correct ? "text-green-800" : lastResult.skipped ? "text-yellow-800" : "text-red-800"
                        }`}
                      >
                        {lastResult.correct ? "Correct!" : lastResult.skipped ? "Skipped" : "Incorrect"}
                      </span>
                      <span className={`font-bold ${lastResult.points > 0 ? "text-green-600" : "text-red-600"}`}>
                        {lastResult.points > 0 ? "+" : ""}
                        {lastResult.points} pts
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {lastResult.bonusBreakdown.map((breakdown, index) => (
                        <div key={index}>{breakdown}</div>
                      ))}
                    </div>
                  </div>
                )}

                {!answered && (
                  <div className="flex space-x-3">
                    <Button onClick={handleAnswerSubmit} disabled={selectedAnswer === null} className="flex-1 bg-red-600 hover:bg-red-700">
                      Submit Answer
                    </Button>
                    <Button onClick={() => handleSkipQuestion(false)} variant="outline" className="text-gray-600">
                      Skip
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default page - listing demos
  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Try Our Demo Quizzes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the thrill of quiz competitions with our interactive demo. No registration required!
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
          {demoQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>

        {/* Mobile Slider */}
        <div className="md:hidden mb-8">
          <MobileCardSlider showNavigation={true} showDots={true} autoSlide={false}>
            {demoQuizzes.map((quiz) => (
              <div key={quiz.id} className="px-2 py-4">
                <QuizCard quiz={quiz} />
              </div>
            ))}
          </MobileCardSlider>
        </div>
      </div>
    </section>
  );
};

export default SampleQuizzesSection;
