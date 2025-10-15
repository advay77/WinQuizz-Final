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
import { Users, Shield, Plus, Edit, Save, X, Clock, Coins, Calendar, Trash2, Trophy } from "lucide-react";
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
  prize_first?: number;
  prize_second?: number;
  prize_third?: number;
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
  const [userRankings, setUserRankings] = useState<any[]>([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState<any[]>([]);

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit_minutes: 15,
    entry_fee: 0,
    start_date: '',
    end_date: '',
    max_participants: null as number | null,
    prize_first: 0,
    prize_second: 0,
    prize_third: 0,
    questions: [{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '' }]
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
        status: 'active'
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
          status: 'active',
          prize_first: quizForm.prize_first,
          prize_second: quizForm.prize_second,
          prize_third: quizForm.prize_third
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
        prize_first: 0,
        prize_second: 0,
        prize_third: 0,
        questions: [{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '' }]
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
      // Fetch quiz-specific leaderboard
      const { data: quizData } = await supabase
        .from("quiz_leaderboard")
        .select(`
          *,
          quizzes(title),
          profiles(full_name, email)
        `)
        .order("percentage", { ascending: false })
        .order("completed_at", { ascending: true });

      if (quizData) {
        setQuizLeaderboard(quizData);
      }

      // Fetch overall user rankings
      const { data: userData } = await supabase
        .from("user_rankings")
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order("average_score", { ascending: false })
        .order("quizzes_completed", { ascending: false });

      if (userData) {
        setUserRankings(userData);
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      toast.error("Failed to load leaderboard");
    }
  };

  const updateUserScore = async (userId: string, quizId: string, newScore: number) => {
    try {
      const { error } = await supabase
        .from("user_quiz_scores")
        // @ts-ignore - Supabase typing issue with update operations
        .update({ score: newScore })
        .eq("user_id", userId)
        .eq("quiz_id", quizId);

      if (error) {
        console.error("Error updating score:", error);
        toast.error("Failed to update score");
        return;
      }

      toast.success("Score updated successfully");
      setEditingScore(null);
      await fetchUsersWithScores(); // Refresh the users list
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error("Failed to update score");
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

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage users, scores, and create quizzes</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users & Scores</TabsTrigger>
            <TabsTrigger value="quizzes">Create Quizzes</TabsTrigger>
            <TabsTrigger value="manage-quizzes">Manage Quizzes</TabsTrigger>
            <TabsTrigger value="quiz-results">Quiz Results</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

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
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{user.full_name || user.email}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Wallet: <span className="font-semibold text-green-600">{user.wallet_balance} coins</span>
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
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Quiz</DialogTitle>
                      <DialogDescription>
                        Fill in the quiz details and add questions
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Quiz Details */}
                      <div className="grid grid-cols-2 gap-4">
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

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entry-fee">Entry Fee (Coins)</Label>
                          <Input
                            id="entry-fee"
                            type="number"
                            min="0"
                            value={quizForm.entry_fee}
                            onChange={(e) => setQuizForm({...quizForm, entry_fee: parseInt(e.target.value) || 0})}
                          />
                          <p className="text-xs text-muted-foreground">Set to 0 for free quiz</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prize-first">1st Prize (Coins)</Label>
                          <Input
                            id="prize-first"
                            type="number"
                            min="0"
                            value={quizForm.prize_first}
                            onChange={(e) => setQuizForm({...quizForm, prize_first: parseInt(e.target.value) || 0})}
                          />
                          <p className="text-xs text-muted-foreground">Prize for 1st place</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prize-second">2nd Prize (Coins)</Label>
                          <Input
                            id="prize-second"
                            type="number"
                            min="0"
                            value={quizForm.prize_second}
                            onChange={(e) => setQuizForm({...quizForm, prize_second: parseInt(e.target.value) || 0})}
                          />
                          <p className="text-xs text-muted-foreground">Prize for 2nd place</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prize-third">3rd Prize (Coins)</Label>
                          <Input
                            id="prize-third"
                            type="number"
                            min="0"
                            value={quizForm.prize_third}
                            onChange={(e) => setQuizForm({...quizForm, prize_third: parseInt(e.target.value) || 0})}
                          />
                          <p className="text-xs text-muted-foreground">Prize for 3rd place</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-participants">Max Participants</Label>
                          <Input
                            id="max-participants"
                            type="number"
                            min="1"
                            placeholder="Unlimited"
                            value={quizForm.max_participants || ''}
                            onChange={(e) => setQuizForm({...quizForm, max_participants: e.target.value ? parseInt(e.target.value) : null})}
                          />
                          <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
                        </div>
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

                              <div className="grid grid-cols-2 gap-4">
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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          <p className="text-muted-foreground mt-1">{quiz.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{quiz.time_limit_minutes} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              <span>{quiz.entry_fee === 0 ? 'Free' : `${quiz.entry_fee} Coins`}</span>
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
                          {(quiz.prize_first || quiz.prize_second || quiz.prize_third) && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">Prizes</span>
                              </div>
                              <div className="flex gap-4 text-xs">
                                {quiz.prize_first > 0 && (
                                  <div className="text-center">
                                    <div className="font-bold text-yellow-700">🥇 {quiz.prize_first}</div>
                                    <div className="text-yellow-600">1st Place</div>
                                  </div>
                                )}
                                {quiz.prize_second > 0 && (
                                  <div className="text-center">
                                    <div className="font-bold text-yellow-700">🥈 {quiz.prize_second}</div>
                                    <div className="text-yellow-600">2nd Place</div>
                                  </div>
                                )}
                                {quiz.prize_third > 0 && (
                                  <div className="text-center">
                                    <div className="font-bold text-yellow-700">🥉 {quiz.prize_third}</div>
                                    <div className="text-yellow-600">3rd Place</div>
                                  </div>
                                )}
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
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-muted-foreground">{quiz.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
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
                          onClick={() => {/* TODO: Show quiz results modal */}}
                        >
                          View Results
                        </Button>
                      </div>

                      {/* Prize Information */}
                      {(quiz.prize_first || quiz.prize_second || quiz.prize_third) && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Prize Pool</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            {quiz.prize_first > 0 && (
                              <div className="text-center">
                                <div className="font-bold text-yellow-700">🥇 {quiz.prize_first} coins</div>
                                <div className="text-yellow-600">1st Place</div>
                              </div>
                            )}
                            {quiz.prize_second > 0 && (
                              <div className="text-center">
                                <div className="font-bold text-yellow-700">🥈 {quiz.prize_second} coins</div>
                                <div className="text-yellow-600">2nd Place</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        Total Prize Pool: <span className="font-semibold text-green-600">
                          {(quiz.prize_first || 0) + (quiz.prize_second || 0) + (quiz.prize_third || 0)} coins
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Quiz Performers</CardTitle>
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
                                  <div>
                                    <p className="font-medium">
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
                      <CardHeader>
                        <CardTitle>Recent Quiz Results</CardTitle>
                        <CardDescription>Latest completed quizzes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {quizLeaderboard.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No quiz results yet</p>
                          ) : (
                            quizLeaderboard.slice(0, 10).map((entry) => (
                              <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium">{entry.quizzes?.title || 'Unknown Quiz'}</p>
                                  <p className="text-sm text-muted-foreground">
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{userRankings.length}</div>
                          <div className="text-sm text-muted-foreground">Total Players</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {quizLeaderboard.reduce((sum, entry) => sum + entry.total_questions, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Questions Answered</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(quizLeaderboard.reduce((sum, entry) => sum + entry.percentage, 0) / Math.max(quizLeaderboard.length, 1))}%
                          </div>
                          <div className="text-sm text-muted-foreground">Average Score</div>
                        </div>
                        <div className="text-center">
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
    </div>
  );
}

export default Admin;
