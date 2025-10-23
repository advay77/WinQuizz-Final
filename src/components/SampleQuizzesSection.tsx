"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import MobileCardSlider from "./MobileCardSlider";
import {
  Brain,
  Trophy,
  Zap,
  Clock,
  Play,
  CheckCircle,
  X,
  ArrowLeft,
  Home,
  FileText,
} from "lucide-react";

// Types
interface Question {
  question_english: string;
  question_hindi: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_seconds: number;
  category: string;
  icon: "Brain" | "Zap" | "Trophy";
  color: string;
  questions_data: Question[];
}

interface Result {
  correct?: boolean;
  skipped?: boolean;
  points: number;
  bonusBreakdown: string[];
  correctAnswer?: number;
}

const SampleQuizzesSection: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [lastResult, setLastResult] = useState<Result | null>(null);

  const [demoQuizzes] = useState<Quiz[]>([
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
          options: [
            "A) H2O / एच2ओ",
            "B) CO2 / सीओ2",
            "C) O2 / ओ2",
            "D) NaCl / नैक्ल",
          ],
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
          options: [
            "A) INSAT / इनसैट",
            "B) IRS / आईआरएस",
            "C) EDUSAT / एडूसैट",
            "D) CARTOSAT / कार्टोसैट",
          ],
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
          options: [
            "A) Goa / गोवा",
            "B) Sikkim / सिक्किम",
            "C) Tripura / त्रिपुरा",
            "D) Mizoram / मिजोरम",
          ],
          correct: 0,
        },
        {
          question_english: "What is the capital of Karnataka?",
          question_hindi: "कर्नाटक की राजधानी क्या है?",
          options: [
            "A) Bengaluru / बेंगलुरु",
            "B) Mysuru / मैसूर",
            "C) Mangaluru / मंगलुरु",
            "D) Hubli / हुबली",
          ],
          correct: 0,
        },
        {
          question_english:
            "Which Indian festival is known as the festival of colors?",
          question_hindi: "कौन सा भारतीय त्योहार रंगों का त्योहार कहलाता है?",
          options: [
            "A) Holi / होली",
            "B) Diwali / दिवाली",
            "C) Dussehra / दशहरा",
            "D) Navratri / नवरात्रि",
          ],
          correct: 0,
        },
        {
          question_english: "Who is known as the 'Missile Man of India'?",
          question_hindi: "भारत के 'मिसाइल मैन' के रूप में किसे जाना जाता है?",
          options: [
            "A) A.P.J. Abdul Kalam / ए.पी.जे. अब्दुल कलाम",
            "B) Vikram Sarabhai / विक्रम साराभाई",
            "C) Homi Bhabha / होमी भाभा",
            "D) Satish Dhawan / सतीश धवन",
          ],
          correct: 0,
        },
      ],
    },
  ]);

  // Timer effect
  useEffect(() => {
    if (selectedQuiz && !answered && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleSkipQuestion(true);
    }
  }, [timeLeft, answered, quizCompleted, selectedQuiz]);

  // Handlers
  const startQuiz = (quiz: Quiz) => {
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

  const handleSkipQuestion = (isAutoSkip = false) => {
    if (answered || !selectedQuiz) return;

    setAnswered(true);
    setSelectedAnswer(-1);
    setLastResult({
      correct: false,
      skipped: true,
      points: -2,
      bonusBreakdown: ["Skipped: -2 points"],
      correctAnswer: selectedQuiz.questions_data[currentQuestion].correct,
    });

    setTimeout(() => nextQuestion(), 2000);
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

  const handleAnswerSubmit = () => {
    if (!selectedQuiz || answered || selectedAnswer === null) return;

    setAnswered(true);
    const isCorrect =
      selectedAnswer === selectedQuiz.questions_data[currentQuestion].correct;

    let points = 0;
    const bonusBreakdown: string[] = [];

    if (isCorrect) {
      points = 20 + timeLeft;
      bonusBreakdown.push(`Correct +${20}`, `Time Bonus +${timeLeft}`);

      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);

      if (newStreak >= 3) points += 10;
      if (newStreak >= 5) points += 20;
      if (newStreak >= 10) points += 50;
    } else {
      points = -4;
      bonusBreakdown.push("Wrong Answer: -4");
      setConsecutiveCorrect(0);
    }

    setScore((prev) => prev + points);
    setLastResult({
      correct: isCorrect,
      points,
      bonusBreakdown,
      correctAnswer: selectedQuiz.questions_data[currentQuestion].correct,
    });

    setTimeout(() => nextQuestion(), 3000);
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

  // Card Component
  const QuizCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const IconComponent =
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
          <CardTitle className="text-lg font-bold text-gray-900">
            {quiz.title}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <Badge variant="outline">{quiz.total_questions} Qs</Badge>
            <div className="flex justify-center text-sm text-gray-600 items-center">
              <Clock className="h-4 w-4 mr-1" />
              {quiz.duration_seconds < 60
                ? `${quiz.duration_seconds} sec`
                : `${Math.floor(quiz.duration_seconds / 60)} min`}
            </div>
            <div className="flex justify-center text-sm text-gray-600 items-center">
              <FileText className="h-4 w-4 mr-1" />
              {quiz.category}
            </div>
            <Button
              onClick={() => startQuiz(quiz)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" /> Try Demo Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render the quiz questions
  const renderQuizQuestion = () => {
    if (!selectedQuiz) return null;

    const currentQ = selectedQuiz.questions_data[currentQuestion];
    const IconComponent = selectedQuiz.icon === "Brain" ? Brain : selectedQuiz.icon === "Zap" ? Zap : Trophy;

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Quiz Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedQuiz.color} mr-3`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedQuiz.title}</h3>
              <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {selectedQuiz.total_questions}</p>
            </div>
          </div>
          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 text-gray-600 mr-1" />
            <span className="text-sm font-medium">{timeLeft}s</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h4 className="text-xl font-medium text-gray-900 mb-2">{currentQ.question_english}</h4>
          <p className="text-gray-600 mb-6">{currentQ.question_hindi}</p>
          
          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQ.correct;
              let optionClass = "w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors";
              
              if (answered) {
                if (isCorrect) {
                  optionClass += " bg-green-50 border-green-500";
                } else if (isSelected && !isCorrect) {
                  optionClass += " bg-red-50 border-red-500";
                }
              } else if (isSelected) {
                optionClass += " bg-red-50 border-red-500";
              }

              return (
                <button
                  key={index}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answered}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      !answered ? 'bg-gray-100' : isCorrect ? 'bg-green-100' : isSelected ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-left">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => handleSkipQuestion()}
            disabled={answered}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-2" /> Skip
          </Button>
          
          {!answered ? (
            <Button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              className="bg-red-600 hover:bg-red-700"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              className="bg-green-600 hover:bg-green-700"
            >
              {currentQuestion < selectedQuiz.total_questions - 1 ? 'Next Question' : 'See Results'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render quiz results
  const renderQuizResults = () => {
    if (!selectedQuiz) return null;
    
    const correctAnswers = selectedQuiz.questions_data.reduce((acc, q) => acc + (q.correct === 0 ? 1 : 0), 0);
    const percentage = Math.round((score / (selectedQuiz.total_questions * 20)) * 100);

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="h-12 w-12 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-gray-600 mb-8">You've completed the {selectedQuiz.title}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{selectedQuiz.total_questions}</p>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
            <p className="text-sm text-green-600">Correct</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
            <p className="text-sm text-blue-600">Score</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={resetQuiz}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Try Another Quiz
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              resetQuiz();
            }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {selectedQuiz ? (
          quizCompleted ? (
            renderQuizResults()
          ) : (
            renderQuizQuestion()
          )
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Try Our Demo Quizzes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the thrill of quiz competitions — no signup required!
              </p>
            </div>

            <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
              {demoQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>

            <div className="md:hidden mb-8">
              <MobileCardSlider showNavigation showDots autoSlide={true} slideInterval={3000}>
                {demoQuizzes.map((quiz) => (
                  <div key={quiz.id} className="px-2 py-4">
                    <QuizCard quiz={quiz} />
                  </div>
                ))}
              </MobileCardSlider>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SampleQuizzesSection;
