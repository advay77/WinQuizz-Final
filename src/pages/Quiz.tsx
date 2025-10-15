import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Trophy, CheckCircle, XCircle, ArrowLeft, ArrowRight, Coins, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { getQuizById, Question, QuizData } from "@/lib/questions";

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

interface DatabaseQuestion {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  is_active: boolean;
}

interface DatabaseQuiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  entry_fee: number;
  start_time: string;
  end_time: string;
  total_questions: number;
  max_participants: number | null;
  current_participants: number;
  status: string;
  created_at: string;
  created_by: string;
  quiz_questions?: DatabaseQuestion[];
}

interface UserWallet {
  coins: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadQuiz(quizId);
    }
  }, [quizId]);

  const loadQuiz = async (id: string) => {
    try {
      // First, try to get it as a demo quiz
      const demoQuiz = getQuizById(id);
      if (demoQuiz) {
        setQuiz(demoQuiz);
        setTimeLeft(demoQuiz.timeLimit * 60);
        return;
      }

      // If not a demo quiz, try to fetch from database
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_questions(*)
        `)
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (quizError || !quizData) {
        toast.error("Quiz not found");
        navigate("/dashboard");
        return;
      }

      // Transform database quiz to QuizData format
      const dbQuiz = quizData as DatabaseQuiz;
      const databaseQuiz: QuizData = {
        id: dbQuiz.id,
        title: dbQuiz.title,
        description: dbQuiz.description,
        timeLimit: dbQuiz.time_limit_minutes,
        difficulty: 'medium', // Default difficulty for database quizzes
        questions: dbQuiz.quiz_questions?.map((q, index) => ({
          id: q.id,
          question: q.question,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correct_answer),
          explanation: `Answer: ${q.correct_answer}`
        })) || []
      };

      setQuiz(databaseQuiz);
      setTimeLeft(dbQuiz.time_limit_minutes * 60);
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast.error("Failed to load quiz");
      navigate("/dashboard");
    }
  };

  const checkWalletBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to take this quiz");
        return false;
      }

      // For demo quizzes, always allow (they're free)
      if (getQuizById(quizId || '')) {
        return true;
      }

      // For database quizzes, check wallet balance
      const { data: walletData } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (!walletData) {
        toast.error("Wallet not found. Please contact support.");
        return false;
      }

      // Set wallet with correct structure
      const walletBalance = (walletData as { wallet_balance: number }).wallet_balance || 0;
      setUserWallet({ coins: walletBalance });

      // For free quizzes (entry_fee = 0), allow access
      if (quiz && 'entry_fee' in quiz && (quiz as any).entry_fee === 0) {
        return true;
      }

      // Check if user has enough coins
      if (walletBalance < (quiz as any)?.entry_fee) {
        toast.error(`Insufficient coins! You need ${(quiz as any)?.entry_fee} coins but only have ${walletBalance}.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      toast.error("Failed to check wallet balance");
      return false;
    }
  };

  const deductQuizCoins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // For demo quizzes, no deduction needed
      if (getQuizById(quizId || '')) {
        return true;
      }

      // Get current wallet balance
      const { data: currentWallet } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (!currentWallet) {
        toast.error("Wallet not found");
        return false;
      }

      // Deduct coins directly from wallet
      const entryFee = (quiz as any)?.entry_fee || 0;
      const newBalance = (currentWallet as { wallet_balance: number }).wallet_balance - entryFee;

      const { error: updateError } = await supabase
        .from("profiles")
        // @ts-ignore - TypeScript doesn't recognize wallet_balance field
        .update({
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error deducting coins:", updateError);
        toast.error("Failed to process payment");
        return false;
      }

      // Update local wallet state
      if (userWallet) {
        setUserWallet({ coins: newBalance });
      }

      return true;
    } catch (error) {
      console.error("Error deducting coins:", error);
      toast.error("Failed to process payment");
      return false;
    }
  };

  const saveQuizResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For demo quizzes, don't save to database
      if (getQuizById(quizId || '')) {
        return;
      }

      const score = calculateScore();
      const correctAnswers = answers.filter(a => a.isCorrect).length;

      // Save to user_quiz_scores table (existing table)
      const { error: scoreError } = await supabase
        .from("user_quiz_scores")
        // @ts-ignore - TypeScript doesn't recognize table structure
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score: correctAnswers,
          total_questions: quiz!.questions.length,
          completed_at: new Date().toISOString()
        });

      if (scoreError) {
        console.error("Error saving quiz score:", scoreError);
      }

      // The leaderboard will be automatically updated by the database trigger
      // that we created in CREATE_LEADERBOARD_SYSTEM.sql

    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const startQuiz = async () => {
    setCheckingBalance(true);

    try {
      // Check wallet balance first
      const hasBalance = await checkWalletBalance();
      if (!hasBalance) {
        setCheckingBalance(false);
        return;
      }

      // Deduct coins if it's a paid quiz
      if (quiz && 'entry_fee' in quiz && (quiz as any).entry_fee > 0) {
        const deducted = await deductQuizCoins();
        if (!deducted) {
          setCheckingBalance(false);
          return;
        }
        toast.success(`Paid ${(quiz as any).entry_fee} coins to start the quiz!`);
      }

      setQuizStarted(true);
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast.error("Failed to start quiz");
    } finally {
      setCheckingBalance(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleQuizComplete();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    const currentQuestion = quiz!.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    };

    setAnswers(prev => [...prev, result]);

    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    setShowResults(true);

    // Save quiz results to database for leaderboard
    await saveQuizResults();

    toast.success("Quiz completed!");
  };

  const calculateScore = () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / quiz!.questions.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">{quiz.title}</CardTitle>
                <CardDescription className="text-lg">{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">{quiz.questions.length}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">{quiz.timeLimit}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary capitalize">{quiz.difficulty}</div>
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                  </div>
                </div>

                {/* Wallet Balance Display for Database Quizzes */}
                {!getQuizById(quizId || '') && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-800">Entry Fee Required</h3>
                    </div>
                    {userWallet ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-700">
                          Your Balance: <span className="font-bold">{userWallet.coins} coins</span>
                        </span>
                        <span className="text-sm text-yellow-700">
                          Quiz Fee: <span className="font-bold">{(quiz as any)?.entry_fee || 0} coins</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Checking wallet balance...</span>
                      </div>
                    )}
                    {(quiz as any)?.entry_fee > 0 && userWallet && userWallet.coins < (quiz as any)?.entry_fee && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ Insufficient coins! You need {(quiz as any)?.entry_fee} coins but only have {userWallet.coins}.
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Quiz Instructions:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Answer all questions to complete the quiz</li>
                    <li>• You have {quiz.timeLimit} minutes to finish</li>
                    {!getQuizById(quizId || '') && <li>• Entry fee will be deducted from your wallet</li>}
                    <li>• You can review your answers at the end</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button onClick={startQuiz} className="flex-1">
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const correctAnswers = answers.filter(a => a.isCorrect).length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Quiz Results</CardTitle>
                <CardDescription>{quiz.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                  <p className="text-xl text-muted-foreground mt-2">
                    {correctAnswers} out of {quiz.questions.length} correct
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                      <div className="text-sm text-muted-foreground">Correct</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">{quiz.questions.length - correctAnswers}</div>
                      <div className="text-sm text-muted-foreground">Incorrect</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {formatTime(quiz.timeLimit * 60 - timeLeft)}
                      </div>
                      <div className="text-sm text-muted-foreground">Time Taken</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Question Review</h3>
                  {quiz.questions.map((question, index) => {
                    const userAnswer = answers.find(a => a.questionId === question.id);
                    const isCorrect = userAnswer?.isCorrect;

                    return (
                      <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-2">{question.question}</p>
                              <div className="space-y-1">
                                {question.options.map((option, optionIndex) => {
                                  let optionClass = "text-sm p-2 rounded ";
                                  if (optionIndex === question.correctAnswer) {
                                    optionClass += "bg-green-100 text-green-800 font-medium";
                                  } else if (optionIndex === userAnswer?.selectedAnswer && !isCorrect) {
                                    optionClass += "bg-red-100 text-red-800";
                                  } else {
                                    optionClass += "text-muted-foreground";
                                  }

                                  return (
                                    <div key={optionIndex} className={optionClass}>
                                      {option}
                                      {optionIndex === question.correctAnswer && " ✓"}
                                      {optionIndex === userAnswer?.selectedAnswer && !isCorrect && " ✗"}
                                    </div>
                                  );
                                })}
                              </div>
                              {question.explanation && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button onClick={() => navigate(`/quiz/${quizId}`)} className="flex-1">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5" />
                  {formatTime(timeLeft)}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                  Exit Quiz
                </Button>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => handleAnswerSelect(parseInt(value))}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setSelectedAnswer(null);
                    }
                  }}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleNext}>
                  {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
