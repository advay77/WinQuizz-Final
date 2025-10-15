import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Plus, Edit, Save, X, Clock, Coins, Calendar, Trash2, Trophy, Upload, FileText, CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

interface UserWithScores {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  wallet_balance: number;
  scores: {
    quiz_id: string;
    quiz_title: string;
    score: number;
    total_questions: number;
    completed_at: string;
  }[];
}

interface Prize {
  position: number;
  prize_name: string;
  prize_value?: number; // For coin prizes, can be null for physical prizes
  prize_description: string;
}

interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface QuizFormData {
  title: string;
  description: string;
  time_limit_minutes: number;
  entry_fee: number;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  questions: Question[];
  prizes: Prize[];
}

interface Quiz {
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
  created_by: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  quiz_participants?: { count: number }[];
  prizes: Prize[];
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  wallet_balance: number;
}

interface UserQuizScore {
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quizzes?: { title: string } | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithScores[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [editingScore, setEditingScore] = useState<{ userId: string; quizId: string; newScore: string } | null>(null);
  const [selectedQuizResults, setSelectedQuizResults] = useState<any[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [userRankings, setUserRankings] = useState<any[]>([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState<any[]>([]);
  const [kycDocuments, setKycDocuments] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);

  // Quiz form state
  const [quizForm, setQuizForm] = useState<QuizFormData>({
    title: '',
    description: '',
    time_limit_minutes: 15,
    entry_fee: 0,
    start_date: '',
    end_date: '',
    max_participants: null,
    questions: [
      {
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: ''
      }
    ],
    prizes: [
      {
        position: 1,
        prize_name: '1st Place',
        prize_value: 100,
        prize_description: 'Winner takes all'
      }
    ]
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profileData || (profileData as any).role !== 'admin') {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      await fetchUsersWithScores();
      await fetchQuizzes();
      await fetchLeaderboardData();
      await fetchKycDocuments();
      await fetchWithdrawalRequests();
    } catch (error: any) {
      console.error("Error loading admin panel:", error);
      toast.error("Failed to load admin panel");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersWithScores = async () => {
    try {
      // Fetch all users with their wallet balance
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!usersData) return;

      // Fetch scores for each user
      const usersWithScores: UserWithScores[] = [];

      for (const user of usersData as Profile[]) {
        const { data: scoresData } = await supabase
          .from("user_quiz_scores")
          .select(`
            quiz_id,
            score,
            total_questions,
            completed_at,
            quizzes(title)
          `)
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false });

        usersWithScores.push({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          wallet_balance: user.wallet_balance || 100,
          scores: (scoresData as UserQuizScore[])?.map(score => ({
            quiz_id: score.quiz_id,
            quiz_title: score.quizzes?.title || 'Unknown Quiz',
            score: score.score,
            total_questions: score.total_questions,
            completed_at: score.completed_at
          })) || []
        });
      }

      setUsers(usersWithScores);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_participants(count)
        `)
        .order("created_at", { ascending: false });

      // Transform the data to include current_participants count
      const transformedQuizzes: Quiz[] = (quizzesData || []).map((quiz: any) => ({
        ...quiz,
        current_participants: (quiz.quiz_participants as { count: number }[])?.[0]?.count || 0
      }));

      setQuizzes(transformedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      // First, delete all questions associated with this quiz
      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("quiz_id", quizId);

      if (questionsError) {
        console.error("Error deleting quiz questions:", questionsError);
        toast.error("Failed to delete quiz questions");
        return;
      }

      // Delete the quiz itself
      const { error: quizError } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (quizError) {
        console.error("Error deleting quiz:", quizError);
        toast.error("Failed to delete quiz");
        return;
      }

      toast.success("Quiz deleted successfully");
      await fetchQuizzes(); // Refresh the quiz list
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '' }]
    });
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const addPrize = () => {
    const nextPosition = quizForm.prizes.length > 0 ? Math.max(...quizForm.prizes.map(p => p.position)) + 1 : 1;
    setQuizForm({
      ...quizForm,
      prizes: [
        ...quizForm.prizes,
        {
          position: nextPosition,
          prize_name: `${nextPosition}${nextPosition === 1 ? 'st' : nextPosition === 2 ? 'nd' : nextPosition === 3 ? 'rd' : 'th'} Place`,
          prize_value: 50,
          prize_description: ''
        }
      ]
    });
  };

  const removePrize = (index: number) => {
    if (quizForm.prizes.length > 1) {
      setQuizForm({
        ...quizForm,
        prizes: quizForm.prizes.filter((_, i) => i !== index)
      });
    }
  };

  const updatePrize = (index: number, field: keyof Prize, value: string | number) => {
    const updatedPrizes = [...quizForm.prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setQuizForm({ ...quizForm, prizes: updatedPrizes });
  };

  const createQuiz = async () => {
    try {
      console.log("Starting quiz creation...");

      if (!quizForm.title.trim()) {
        toast.error("Please enter a quiz title");
        return;
      }

      if (quizForm.questions.length === 0) {
        toast.error("Please add at least one question");
        return;
      }

      if (!quizForm.start_date || !quizForm.end_date) {
        toast.error("Please set start and end dates");
        return;
      }

      // Validate that end date is after start date
      if (new Date(quizForm.end_date) <= new Date(quizForm.start_date)) {
        toast.error("End date must be after start date");
        return;
      }

      // Validate questions have content
      for (let i = 0; i < quizForm.questions.length; i++) {
        const q = quizForm.questions[i];
        if (!q.question.trim() || !q.option_a.trim() || !q.option_b.trim() ||
            !q.option_c.trim() || !q.option_d.trim() || !q.correct_answer.trim()) {
          toast.error(`Please fill in all fields for Question ${i + 1}`);
          return;
        }
      }

      console.log("Validation passed, creating user auth check...");

      // Create the quiz
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User auth data:", user);

      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Check if user is admin
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("User profile:", profileData);

      if (!profileData || (profileData as any).role !== 'admin') {
        toast.error("Admin privileges required");
        return;
      }

      console.log("Creating quiz with data:", {
        title: quizForm.title,
        description: quizForm.description,
        time_limit_minutes: quizForm.time_limit_minutes,
        entry_fee: quizForm.entry_fee,
        start_time: quizForm.start_date,
        end_time: quizForm.end_date,
        total_questions: quizForm.questions.length,
        max_participants: quizForm.max_participants,
        created_by: user.id,
        status: 'active',
        prizes: quizForm.prizes
      });

      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        // @ts-ignore - Supabase client typing issue
        .insert([{
          title: quizForm.title,
          description: quizForm.description,
          time_limit_minutes: quizForm.time_limit_minutes,
          entry_fee: quizForm.entry_fee,
          start_time: quizForm.start_date,
          end_time: quizForm.end_date,
          total_questions: quizForm.questions.length,
          max_participants: quizForm.max_participants,
          current_participants: 0,
          created_by: user.id,
          status: 'active'
        }])
        .select()
        .single();

      if (quizError) {
        console.error("Quiz creation error:", quizError);
        throw quizError;
      }

      if (!quizData) {
        throw new Error("Failed to create quiz - no data returned");
      }

      const quizId = quizData?.id || '';
      if (!quizId) {
        throw new Error("Quiz ID not found in response");
      }

      console.log("Quiz created successfully:", quizData);

      // Add questions to quiz_questions table
      if (quizForm.questions.length > 0) {
        console.log("Adding questions...");
        const questionsData = quizForm.questions.map(q => ({
          quiz_id: quizId,
          category: 'general_knowledge',
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          is_active: true
        }));

        console.log("Questions data:", questionsData);

        const { error: questionsError } = await supabase
          .from("quiz_questions")
          // @ts-ignore - Supabase client typing issue
          .insert(questionsData);

        if (questionsError) {
          console.error("Questions creation error:", questionsError);
          throw questionsError;
        }

        console.log("Questions added successfully");
      }

      toast.success("Quiz created successfully");
      setShowCreateQuiz(false);
      setQuizForm({
        title: '',
        description: '',
        time_limit_minutes: 15,
        entry_fee: 0,
        start_date: '',
        end_date: '',
        max_participants: null,
        questions: [{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '' }],
        prizes: [
          {
            position: 1,
            prize_name: '1st Place',
            prize_value: 100,
            prize_description: 'Winner takes all'
          }
        ]
      });

      await fetchQuizzes();
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error(`Failed to create quiz: ${error.message || 'Unknown error'}`);
    }
  };
  const fetchLeaderboardData = async () => {
    try {
      // Temporarily disable leaderboard queries until tables are created
      // const { data: quizData } = await supabase
      //   .from("quiz_leaderboard")
      //   .select(`
      //     *,
      //     quizzes(title),
      //     profiles(full_name, email)
      //   `)
      //   .order("percentage", { ascending: false })
      //   .order("completed_at", { ascending: true });

      // if (quizData) {
      //   setQuizLeaderboard(quizData);
      // }

      // const { data: userData } = await supabase
      //   .from("user_rankings")
      //   .select(`
      //     *,
      //     profiles(full_name, email)
      //   `)
      //   .order("average_score", { ascending: false })
      //   .order("quizzes_completed", { ascending: false });

      // if (userData) {
      //   setUserRankings(userData);
      // }

      // For now, set empty arrays until leaderboard tables are created
      setQuizLeaderboard([]);
      setUserRankings([]);

    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      toast.error("Failed to load leaderboard");
    }
  };

  const fetchQuizResults = async (quiz: Quiz) => {
    try {
      setSelectedQuiz(quiz);

      // Temporarily disable quiz results query until tables are properly set up
      // const { data: resultsData } = await supabase
      //   .from("quiz_leaderboard")
      //   .select(`
      //     *,
      //     profiles(full_name, email)
      //   `)
      //   .eq("quiz_id", quiz.id)
      //   .order("percentage", { ascending: false })
      //   .order("completed_at", { ascending: true });

      // if (resultsData) {
      //   setSelectedQuizResults(resultsData);
      //   setShowQuizResults(true);
      // }

      // For now, set empty results until leaderboard tables are created
      setSelectedQuizResults([]);
      setShowQuizResults(true);

    } catch (error) {
      console.error("Error fetching quiz results:", error);
      toast.error("Failed to load quiz results");
    }
  };

  const fetchKycDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setKycDocuments(data || []);
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      toast.error("Failed to load KYC documents");
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setWithdrawalRequests(data || []);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      toast.error("Failed to load withdrawal requests");
    }
  };

  const reviewWithdrawalRequest = async (requestId: string, status: 'approved' | 'rejected' | 'completed', adminNotes?: string) => {
    try {
      const updateData: any = {
        status,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from("withdrawal_requests")
        // @ts-ignore - Supabase typing issue
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      toast.success(`Withdrawal request ${status} successfully`);
      await fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error reviewing withdrawal request:", error);
      toast.error("Failed to review withdrawal request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const reviewKycDocument = async (documentId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from("kyc_documents")
        // @ts-ignore - Supabase typing issue
        .update({
          status,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", documentId);

      if (error) throw error;

      toast.success(`KYC document ${status} successfully`);
      await fetchKycDocuments();
    } catch (error) {
      console.error("Error reviewing KYC document:", error);
      toast.error("Failed to review KYC document");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-20 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">Manage users, scores, and create quizzes</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              <TabsTrigger value="users" className="text-xs sm:text-sm whitespace-nowrap">Users & Scores</TabsTrigger>
              <TabsTrigger value="quizzes" className="text-xs sm:text-sm whitespace-nowrap">Create Quizzes</TabsTrigger>
              <TabsTrigger value="manage-quizzes" className="text-xs sm:text-sm whitespace-nowrap">Manage Quizzes</TabsTrigger>
              <TabsTrigger value="quiz-results" className="text-xs sm:text-sm whitespace-nowrap">Quiz Results</TabsTrigger>
              <TabsTrigger value="kyc" className="text-xs sm:text-sm whitespace-nowrap">KYC Review</TabsTrigger>
              <TabsTrigger value="withdrawals" className="text-xs sm:text-sm whitespace-nowrap">Withdrawals</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs sm:text-sm whitespace-nowrap">Leaderboard</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users & Scores</CardTitle>
                <CardDescription>View and modify user quiz scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">{user.full_name || user.email}</h3>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                            {user.role}
                          </Badge>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-sm text-muted-foreground">
                            Wallet: <span className="font-semibold text-green-600">₹{user.wallet_balance?.toFixed(2) || '0.00'}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.scores.length} quiz attempts
                          </p>
                          <p className="text-sm font-medium">
                            Avg Score: {user.scores.length > 0
                              ? (user.scores.reduce((sum, score) =>
                                  sum + (score.score / score.total_questions * 100), 0) / user.scores.length).toFixed(1) + '%'
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {user.scores.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Quiz Scores:</h4>
                          {user.scores.map((score, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded">
                              <div>
                                <p className="font-medium">{score.quiz_title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Completed: {format(new Date(score.completed_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                              {editingScore?.userId === user.id && editingScore?.quizId === score.quiz_id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={score.total_questions}
                                    value={editingScore.newScore}
                                    onChange={(e) => setEditingScore({
                                      ...editingScore,
                                      newScore: e.target.value
                                    })}
                                    className="w-20"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => updateUserScore(user.id, score.quiz_id, parseInt(editingScore.newScore))}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingScore(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">
                                    {score.score}/{score.total_questions}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingScore({
                                      userId: user.id,
                                      quizId: score.quiz_id,
                                      newScore: score.score.toString()
                                    })}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No quiz attempts yet</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Create New Quiz</CardTitle>
                <CardDescription>Set up quizzes with questions, time limits, and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showCreateQuiz} onOpenChange={setShowCreateQuiz}>
                  <DialogTrigger asChild>
                    <Button className="mb-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quiz
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-xl">Create New Quiz</DialogTitle>
                      <DialogDescription>
                        Fill in the quiz details and add questions
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Quiz Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiz-title">Quiz Title</Label>
                          <Input
                            id="quiz-title"
                            placeholder="Enter quiz title"
                            value={quizForm.title}
                            onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                          <Input
                            id="time-limit"
                            type="number"
                            min="1"
                            value={quizForm.time_limit_minutes}
                            onChange={(e) => setQuizForm({...quizForm, time_limit_minutes: parseInt(e.target.value) || 15})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quiz-description">Description</Label>
                        <Textarea
                          id="quiz-description"
                          placeholder="Enter quiz description"
                          rows={3}
                          value={quizForm.description}
                          onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                        />
                      </div>

                      {/* Prizes Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Prizes</h3>
                          <Button variant="outline" onClick={addPrize}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Prize
                          </Button>
                        </div>

                        {quizForm.prizes.map((prize, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Prize {prize.position}</h4>
                                {quizForm.prizes.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removePrize(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Prize Name</Label>
                                  <Input
                                    placeholder="e.g., 1st Place, Laptop, Winner"
                                    value={prize.prize_name}
                                    onChange={(e) => updatePrize(index, 'prize_name', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Prize Type</Label>
                                  <select
                                    className="w-full p-2 border rounded-md"
                                    value={prize.prize_value ? 'coins' : 'physical'}
                                    onChange={(e) => {
                                      if (e.target.value === 'coins') {
                                        updatePrize(index, 'prize_value', 50);
                                      } else {
                                        updatePrize(index, 'prize_value', undefined);
                                      }
                                    }}
                                  >
                                    <option value="coins">Coins</option>
                                    <option value="physical">Physical Prize</option>
                                  </select>
                                </div>
                              </div>

                              {prize.prize_value !== undefined ? (
                                <div className="space-y-2">
                                  <Label>Coin Value</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="Enter coin amount"
                                    value={prize.prize_value}
                                    onChange={(e) => updatePrize(index, 'prize_value', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label>Prize Description</Label>
                                  <Input
                                    placeholder="e.g., MacBook Pro, iPhone, Gift Card"
                                    value={prize.prize_description}
                                    onChange={(e) => updatePrize(index, 'prize_description', e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Questions */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Questions</h3>
                          <Button variant="outline" onClick={addQuestion}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                          </Button>
                        </div>

                        {quizForm.questions.map((question, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Question {index + 1}</h4>
                                {quizForm.questions.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeQuestion(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label>Question</Label>
                                <Textarea
                                  placeholder="Enter your question"
                                  value={question.question}
                                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Option A</Label>
                                  <Input
                                    placeholder="Option A"
                                    value={question.option_a}
                                    onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Option B</Label>
                                  <Input
                                    placeholder="Option B"
                                    value={question.option_b}
                                    onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Option C</Label>
                                  <Input
                                    placeholder="Option C"
                                    value={question.option_c}
                                    onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Option D</Label>
                                  <Input
                                    placeholder="Option D"
                                    value={question.option_d}
                                    onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Correct Answer (A, B, C, or D)</Label>
                                <Input
                                  placeholder="Enter A, B, C, or D"
                                  value={question.correct_answer}
                                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value.toUpperCase())}
                                  maxLength={1}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={createQuiz}>Create Quiz</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Manage Existing Quizzes</CardTitle>
                <CardDescription>View and manage all quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between">
                        <div className="flex-1 mb-4 sm:mb-0 min-w-0">
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          <p className="text-muted-foreground mt-1">{quiz.description}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{quiz.time_limit_minutes} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              <span>{quiz.entry_fee === 0 ? 'Free' : `₹${quiz.entry_fee}`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{quiz.current_participants}/{quiz.max_participants || '∞'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(quiz.created_at), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                          {/* Prize Information */}
                          {quiz.prizes && quiz.prizes.length > 0 && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">Prizes</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                {quiz.prizes.map((prize, index) => (
                                  <div key={index} className="text-center">
                                    <div className="font-bold text-yellow-700">
                                      {prize.prize_value !== undefined ? `💰 ${prize.prize_value} coins` : `🎁 ${prize.prize_description}`}
                                    </div>
                                    <div className="text-yellow-600">{prize.prize_name}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteQuiz(quiz.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {quizzes.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No quizzes created yet. Create your first quiz above!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz-results">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results & Rankings</CardTitle>
                <CardDescription>View and modify quiz results and prize distributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                        <div className="mb-2 sm:mb-0">
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-muted-foreground">{quiz.description}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm">
                            <Badge variant={quiz.status === 'active' ? 'default' : 'secondary'}>
                              {quiz.status}
                            </Badge>
                            <span className="text-muted-foreground">
                              {format(new Date(quiz.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchQuizResults(quiz)}
                        >
                          View Results
                        </Button>
                      </div>

                      {/* Prize Information */}
                      {quiz.prizes && quiz.prizes.length > 0 && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Prize Pool</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                            {quiz.prizes.map((prize, index) => (
                              <div key={index} className="text-center">
                                <div className="font-bold text-yellow-700">
                                  {prize.prize_value !== undefined ? `${prize.prize_value} coins` : prize.prize_description}
                                </div>
                                <div className="text-yellow-600">{prize.prize_name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        Total Prizes: <span className="font-semibold text-green-600">
                          {quiz.prizes ? quiz.prizes.length : 0} positions
                        </span>
                      </div>
                    </div>
                  ))}

                  {quizzes.length === 0 && (
                    <div className="text-center py-8">
                      <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No quizzes with results yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Document Review</CardTitle>
                <CardDescription>Review and approve user KYC verification documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* KYC Documents List */}
                  <div className="space-y-4">
                    {kycDocuments.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No KYC documents to review</p>
                      </div>
                    ) : (
                      kycDocuments.map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold capitalize">
                                  {doc.document_type.replace('_', ' ')}
                                </h3>
                                <Badge className={`${getStatusColor(doc.status)}`}>
                                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                User ID: {doc.user_id}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {format(new Date(doc.submitted_at), 'MMM d, yyyy h:mm a')}
                              </p>
                              {doc.document_number && (
                                <p className="text-sm text-muted-foreground">
                                  Document Number: {doc.document_number}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Document Images */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-sm font-medium">Front Photo</Label>
                              <div className="mt-2 border rounded-lg p-2 bg-muted/50">
                                <img
                                  src={doc.front_photo_url}
                                  alt="Front ID"
                                  className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() => window.open(doc.front_photo_url, '_blank')}
                                />
                              </div>
                            </div>
                            {doc.back_photo_url && (
                              <div>
                                <Label className="text-sm font-medium">Back Photo</Label>
                                <div className="mt-2 border rounded-lg p-2 bg-muted/50">
                                  <img
                                    src={doc.back_photo_url}
                                    alt="Back ID"
                                    className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(doc.back_photo_url, '_blank')}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Review Actions - Only for pending documents */}
                          {doc.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t">
                              <Button
                                onClick={() => reviewKycDocument(doc.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => reviewKycDocument(doc.id, 'rejected')}
                                variant="destructive"
                                className="flex-1 sm:flex-none"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {/* Admin Notes */}
                          {doc.admin_notes && (
                            <div className="mt-4 p-3 bg-muted rounded-md">
                              <p className="text-sm font-medium">Admin Notes:</p>
                              <p className="text-sm text-muted-foreground">{doc.admin_notes}</p>
                              {doc.reviewed_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reviewed: {format(new Date(doc.reviewed_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Review and process user withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Withdrawal Requests List */}
                  <div className="space-y-4">
                    {withdrawalRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No withdrawal requests to review</p>
                      </div>
                    ) : (
                      withdrawalRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">₹{request.amount.toFixed(2)}</h3>
                                <Badge className={`${getStatusColor(request.status)}`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                User ID: {request.user_id}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                Payment Method: {request.payment_method.replace('_', ' ').toUpperCase()}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                Payment Details: {request.payment_details}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Requested: {format(new Date(request.requested_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>

                          {/* Review Actions - Only for pending requests */}
                          {request.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t">
                              <Button
                                onClick={() => reviewWithdrawalRequest(request.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => reviewWithdrawalRequest(request.id, 'rejected')}
                                variant="destructive"
                                className="flex-1 sm:flex-none"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {/* Admin Notes */}
                          {request.admin_notes && (
                            <div className="mt-4 p-3 bg-muted rounded-md">
                              <p className="text-sm font-medium">Admin Notes:</p>
                              <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                              {request.reviewed_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reviewed: {format(new Date(request.reviewed_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              )}
                            </div>
                          )}

                          {request.status === 'approved' && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800">
                                This withdrawal request has been approved. Please process the payment manually.
                              </p>
                              <Button
                                onClick={() => reviewWithdrawalRequest(request.id, 'completed')}
                                className="mt-2 bg-blue-600 hover:bg-blue-700"
                                size="sm"
                              >
                                Mark as Completed
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Leaderboard Management
                </CardTitle>
                <CardDescription>View and manage quiz leaderboards and rankings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <Button onClick={() => navigate("/leaderboard")}>
                      <Trophy className="h-4 w-4 mr-2" />
                      View Public Leaderboard
                    </Button>
                    <Button variant="outline" onClick={fetchLeaderboardData}>
                      Refresh Data
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Top Quiz Performers</CardTitle>
                        <CardDescription>Users with highest average scores</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userRankings.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No rankings available yet</p>
                          ) : (
                            userRankings.slice(0, 10).map((user, index) => (
                              <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                    index === 2 ? 'bg-amber-100 text-amber-800' :
                                    'bg-muted text-muted-foreground'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">
                                      {user.profiles?.full_name || user.profiles?.email || 'Anonymous'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {user.quizzes_completed} quizzes
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{user.average_score.toFixed(1)}%</div>
                                  <div className="text-sm text-muted-foreground">Avg Score</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Recent Quiz Results</CardTitle>
                        <CardDescription>Latest completed quizzes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {quizLeaderboard.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No quiz results yet</p>
                          ) : (
                            quizLeaderboard.slice(0, 10).map((entry) => (
                              <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{entry.quizzes?.title || 'Unknown Quiz'}</p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {entry.profiles?.full_name || entry.profiles?.email || 'Anonymous'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{entry.percentage.toFixed(1)}%</div>
                                  <div className="text-sm text-muted-foreground">
                                    {entry.score}/{entry.total_questions}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Leaderboard Statistics</CardTitle>
                      <CardDescription>Overview of quiz performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4">
                          <div className="text-2xl font-bold text-primary">{userRankings.length}</div>
                          <div className="text-sm text-muted-foreground">Total Players</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {quizLeaderboard.reduce((sum, entry) => sum + entry.total_questions, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Questions Answered</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(quizLeaderboard.reduce((sum, entry) => sum + entry.percentage, 0) / Math.max(quizLeaderboard.length, 1))}%
                          </div>
                          <div className="text-sm text-muted-foreground">Average Score</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-2xl font-bold text-purple-600">
                            {new Set(quizLeaderboard.map(entry => entry.quiz_id)).size}
                          </div>
                          <div className="text-sm text-muted-foreground">Active Quizzes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quiz Results Modal */}
      <Dialog open={showQuizResults} onOpenChange={setShowQuizResults}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">
              Quiz Results: {selectedQuiz?.title}
            </DialogTitle>
            <DialogDescription>
              View all participants and their scores for this quiz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedQuizResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No results available for this quiz yet
              </p>
            ) : (
              <div className="space-y-3">
                {selectedQuizResults.map((result, index) => (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-amber-100 text-amber-800' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {result.profiles?.full_name || result.profiles?.email || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completed: {format(new Date(result.completed_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {result.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.score}/{result.total_questions} correct
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowQuizResults(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Admin;
