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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, LogOut, CheckCircle, XCircle, Eye, DollarSign, Plus, Edit, Trash2, BookOpen, BarChart3, Loader2, PlayCircle, StopCircle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";  
import { format } from "date-fns";

interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  role: string;
  wallet_balance: number;
  documents_verified: boolean;
  created_at: string | null;
}

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  difficulty: string;
  is_active: boolean;
  created_at: string;
}

interface KYCRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
  notes: string | null;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  payment_method: string;
  account_details: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total_questions: number;
  created_at: string;
  created_by: string;
}

interface UserQuizScore {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number | null;
  completed_at: string | null;
  created_at: string;
  profiles?: {
    email: string | null;
    full_name: string | null;
  };
  quizzes?: {
    title: string;
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [scores, setScores] = useState<UserQuizScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form state for adding/editing questions
  const [questionForm, setQuestionForm] = useState({
    category: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    explanation: '',
    difficulty: 'easy'
  });

  // Form state for creating quizzes
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    total_questions: 10,
    status: 'draft' as const
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

      // Check if user is admin
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

      setUser(user);
      setIsAdmin(true);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (questionsError) throw questionsError;
      setQuizQuestions(questionsData || []);

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!quizzesError) {
        setQuizzes(quizzesData || []);
      }

      // Fetch quiz scores
      const { data: scoresData, error: scoresError } = await supabase
        .from("user_quiz_scores")
        .select(`
          *,
          profiles(email, full_name),
          quizzes(title)
        `)
        .order("completed_at", { ascending: false });

      if (!scoresError) {
        setScores(scoresData || []);
      }

      // Fetch KYC requests (we'll need to create this table)
      // For now, we'll show empty state

      // Fetch withdrawal requests (we'll need to create this table)
      // For now, we'll show empty state

    } catch (error: any) {
      console.error("Error loading admin panel:", error);
      toast.error("Failed to load admin panel");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleAddQuestion = async () => {
    try {
      if (!questionForm.question || !questionForm.correct_answer) {
        toast.error("Please fill in all required fields");
        return;
      }

      const { error } = await supabase
        .from("quiz_questions")
        .insert([{
          category: questionForm.category,
          question: questionForm.question,
          option_a: questionForm.option_a,
          option_b: questionForm.option_b,
          option_c: questionForm.option_c,
          option_d: questionForm.option_d,
          correct_answer: questionForm.correct_answer,
          explanation: questionForm.explanation || null,
          difficulty: questionForm.difficulty,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast.success("Question added successfully");
      setShowAddQuestion(false);
      setQuestionForm({
        category: '',
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        explanation: '',
        difficulty: 'easy'
      });

      // Refresh questions
      checkAdminAccess();
    } catch (error: any) {
      toast.error("Failed to add question");
      console.error(error);
    }
  };

  const handleToggleQuestionStatus = async (questionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("quiz_questions")
        .update({ is_active: !currentStatus })
        .eq("id", questionId);

      if (error) throw error;

      toast.success(`Question ${!currentStatus ? 'activated' : 'deactivated'}`);
      checkAdminAccess();
    } catch (error: any) {
      toast.error("Failed to update question status");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast.success("Question deleted successfully");
      checkAdminAccess();
    } catch (error: any) {
      toast.error("Failed to delete question");
    }
  };

  const approveKYC = async (requestId: string) => {
    try {
      // KYC table not yet created - show placeholder functionality
      toast.info("KYC functionality will be available once the database table is created");
    } catch (error: any) {
      toast.error("Failed to approve KYC request");
    }
  };

  const rejectKYC = async (requestId: string) => {
    try {
      // KYC table not yet created - show placeholder functionality
      toast.info("KYC functionality will be available once the database table is created");
    } catch (error: any) {
      toast.error("Failed to reject KYC request");
    }
  };

  const processWithdrawal = async (requestId: string, action: "approve" | "reject") => {
    try {
      // Withdrawal table not yet created - show placeholder functionality
      toast.info("Withdrawal functionality will be available once the database table is created");
    } catch (error: any) {
      toast.error(`Failed to ${action} withdrawal request`);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categories: { [key: string]: string } = {
      'general_knowledge': 'General Knowledge',
      'science_tech': 'Science & Technology',
      'entertainment': 'Entertainment',
      'sports': 'Sports',
      'history': 'History',
      'geography': 'Geography',
      'arts': 'Arts',
      'business': 'Business'
    };
    return categories[category] || category;
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole } as any)
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const createQuiz = async () => {
    try {
      if (!quizForm.title.trim()) {
        toast.error('Please enter a quiz title');
        return;
      }

      const { data, error } = await supabase
        .from('quizzes')
        .insert([{
          ...quizForm,
          created_by: user?.id
        }] as any)
        .select()
        .single();

      if (error) throw error;

      setQuizzes([data, ...quizzes]);
      setQuizForm({
        title: '',
        description: '',
        total_questions: 10,
        status: 'draft'
      });
      setShowCreateQuiz(false);
      
      toast.success('Quiz created successfully');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    }
  };

  const updateQuizStatus = async (quizId: string, newStatus: Quiz['status']) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'active') {
        updateData.start_time = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('quizzes')
        .update(updateData as any)
        .eq('id', quizId);
      
      if (error) throw error;
      
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId ? { ...quiz, ...updateData } : quiz
      ));
      
      toast.success(`Quiz ${newStatus === 'active' ? 'started' : 'ended'} successfully`);
    } catch (error) {
      console.error('Error updating quiz status:', error);
      toast.error('Failed to update quiz status');
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
      
      if (error) throw error;
      
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      toast.success('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage users, quiz questions, KYC requests, and withdrawals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Users</p>
                  <p className="text-3xl font-bold">
                    {users?.filter(u => u.email_verified && u.phone_verified).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quiz Questions</p>
                  <p className="text-3xl font-bold">{quizQuestions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Eye className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending KYC</p>
                  <p className="text-3xl font-bold">{kycRequests?.filter(k => k.status === "pending").length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                  <p className="text-3xl font-bold">{withdrawalRequests?.filter(w => w.status === "pending").length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {users.filter(u => u.role === 'admin').length} admins
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {quizzes.filter(q => q.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {quizzes.length} total quizzes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scores.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {scores.filter(s => s.completed_at).length} completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scores.length > 0 
                      ? (scores.reduce((sum, score) => sum + (score.score / score.total_questions * 100), 0) / scores.length).toFixed(1) + '%'
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    across all quizzes
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scores.slice(0, 5).map((score) => (
                    <div key={score.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {score.profiles?.full_name || score.profiles?.email || 'Unknown user'} completed a quiz
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Scored {score.score}/{score.total_questions} ({((score.score / score.total_questions) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {score.completed_at ? format(new Date(score.completed_at), 'MMM d, yyyy h:mm a') : 'In progress'}
                      </p>
                    </div>
                  ))}
                  {scores.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity to display
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.full_name || 'No name'}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Select
                                value={user.role || 'user'}
                                onValueChange={(value) => updateUserRole(user.id, value)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.email_verified && user.phone_verified
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {user.email_verified && user.phone_verified
                                  ? 'Verified'
                                  : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.created_at
                                ? format(new Date(user.created_at), 'MMM d, yyyy')
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Quiz Management</h2>
                <p className="text-muted-foreground">
                  Create and manage quizzes
                </p>
              </div>
              <Dialog open={showCreateQuiz} onOpenChange={setShowCreateQuiz}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Quiz</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new quiz
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-title">Title</Label>
                      <Input 
                        id="quiz-title" 
                        placeholder="Enter quiz title" 
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                      />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="total-questions">Total Questions</Label>
                        <Input
                          id="total-questions"
                          type="number"
                          min="1"
                          value={quizForm.total_questions}
                          onChange={(e) => setQuizForm({...quizForm, total_questions: parseInt(e.target.value) || 10})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quiz-status">Status</Label>
                        <Select 
                          value={quizForm.status}
                          onValueChange={(value: 'draft' | 'active') => 
                            setQuizForm({...quizForm, status: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createQuiz}>Create Quiz</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.length > 0 ? (
                        quizzes.map((quiz) => (
                          <TableRow key={quiz.id}>
                            <TableCell className="font-medium">
                              {quiz.title}
                              <p className="text-sm text-muted-foreground">
                                {quiz.description || 'No description'}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  quiz.status === 'active'
                                    ? 'default'
                                    : quiz.status === 'completed'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {quiz.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{quiz.total_questions}</TableCell>
                            <TableCell>
                              {format(new Date(quiz.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {quiz.status === 'draft' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuizStatus(quiz.id, 'active')}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                              {quiz.status === 'active' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => updateQuizStatus(quiz.id, 'completed')}
                                >
                                  <StopCircle className="h-4 w-4 mr-1" />
                                  End
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteQuiz(quiz.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No quizzes found. Create your first quiz to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
                <CardDescription>
                  View and analyze quiz scores and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Correct</TableHead>
                        <TableHead>Time Taken</TableHead>
                        <TableHead>Completed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scores.length > 0 ? (
                        scores.map((score) => (
                          <TableRow key={score.id}>
                            <TableCell className="font-medium">
                              {score.profiles?.full_name || score.profiles?.email || 'Unknown user'}
                            </TableCell>
                            <TableCell>{score.quizzes?.title || 'Unknown quiz'}</TableCell>
                            <TableCell>
                              <Badge variant={score.score / score.total_questions >= 0.7 ? 'default' : 'secondary'}>
                                {score.score}/{score.total_questions} (
                                {((score.score / score.total_questions) * 100).toFixed(1)}%)
                              </Badge>
                            </TableCell>
                            <TableCell>{score.correct_answers}</TableCell>
                            <TableCell>
                              {score.time_taken_seconds
                                ? `${Math.floor(score.time_taken_seconds / 60)}m ${score.time_taken_seconds % 60}s`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {score.completed_at
                                ? format(new Date(score.completed_at), 'MMM d, yyyy h:mm a')
                                : 'In progress'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No quiz results available yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Quiz Questions Management</CardTitle>
                  <CardDescription>Add, edit, and manage quiz questions</CardDescription>
                </div>
                <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                      <DialogDescription>
                        Create a new quiz question with multiple choice options.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={questionForm.category} onValueChange={(value) => setQuestionForm({...questionForm, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general_knowledge">General Knowledge</SelectItem>
                            <SelectItem value="science_tech">Science & Technology</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="geography">Geography</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                          id="question"
                          value={questionForm.question}
                          onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                          placeholder="Enter the question"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="option_a">Option A</Label>
                          <Input
                            id="option_a"
                            value={questionForm.option_a}
                            onChange={(e) => setQuestionForm({...questionForm, option_a: e.target.value})}
                            placeholder="Option A"
                          />
                        </div>
                        <div>
                          <Label htmlFor="option_b">Option B</Label>
                          <Input
                            id="option_b"
                            value={questionForm.option_b}
                            onChange={(e) => setQuestionForm({...questionForm, option_b: e.target.value})}
                            placeholder="Option B"
                          />
                        </div>
                        <div>
                          <Label htmlFor="option_c">Option C</Label>
                          <Input
                            id="option_c"
                            value={questionForm.option_c}
                            onChange={(e) => setQuestionForm({...questionForm, option_c: e.target.value})}
                            placeholder="Option C"
                          />
                        </div>
                        <div>
                          <Label htmlFor="option_d">Option D</Label>
                          <Input
                            id="option_d"
                            value={questionForm.option_d}
                            onChange={(e) => setQuestionForm({...questionForm, option_d: e.target.value})}
                            placeholder="Option D"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="correct_answer">Correct Answer</Label>
                        <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({...questionForm, correct_answer: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A - {questionForm.option_a || 'Option A'}</SelectItem>
                            <SelectItem value="B">B - {questionForm.option_b || 'Option B'}</SelectItem>
                            <SelectItem value="C">C - {questionForm.option_c || 'Option C'}</SelectItem>
                            <SelectItem value="D">D - {questionForm.option_d || 'Option D'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="explanation">Explanation (Optional)</Label>
                        <Textarea
                          id="explanation"
                          value={questionForm.explanation}
                          onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                          placeholder="Explain why this is the correct answer"
                        />
                      </div>

                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={questionForm.difficulty} onValueChange={(value) => setQuestionForm({...questionForm, difficulty: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleAddQuestion} className="flex-1">
                          Add Question
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddQuestion(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizQuestions.map((question) => (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{getCategoryDisplayName(question.category)}</Badge>
                            <Badge variant={question.difficulty === 'easy' ? 'default' : question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant={question.is_active ? 'default' : 'secondary'}>
                              {question.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-2">{question.question}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div>A: {question.option_a}</div>
                            <div>B: {question.option_b}</div>
                            <div>C: {question.option_c}</div>
                            <div>D: {question.option_d}</div>
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Correct Answer: {question.correct_answer}
                          </div>
                          {question.explanation && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              {question.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant={question.is_active ? "destructive" : "default"}
                            onClick={() => handleToggleQuestionStatus(question.id, question.is_active)}
                          >
                            {question.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {quizQuestions.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Questions Yet</h3>
                      <p className="text-muted-foreground mb-4">Start by adding your first quiz question.</p>
                      <Button onClick={() => setShowAddQuestion(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Question
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>View all registered users and their verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.full_name || "Unnamed User"}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={user.email_verified ? "default" : "secondary"}>
                          {user.email_verified ? "Email Verified" : "Email Pending"}
                        </Badge>
                        <Badge variant={user.phone_verified ? "default" : "secondary"}>
                          {user.phone_verified ? "Phone Verified" : "Phone Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Requests</CardTitle>
                <CardDescription>Review and approve user KYC submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {kycRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No KYC Requests</h3>
                    <p className="text-muted-foreground">KYC requests will appear here when users submit them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kycRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">KYC Request #{request.id.slice(0, 8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={request.status === "pending" ? "secondary" : request.status === "approved" ? "default" : "destructive"}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm mb-4">Document Type: {request.document_type}</p>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button onClick={() => approveKYC(request.id)} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button onClick={() => rejectKYC(request.id)} variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Process user withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Withdrawal Requests</h3>
                    <p className="text-muted-foreground">Withdrawal requests will appear here when users request them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">Withdrawal Request #{request.id.slice(0, 8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested: {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={request.status === "pending" ? "secondary" : request.status === "processed" ? "default" : "destructive"}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium">Amount</p>
                            <p className="text-lg font-bold">₹{request.amount}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Payment Method</p>
                            <p className="text-sm">{request.payment_method}</p>
                          </div>
                        </div>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button onClick={() => processWithdrawal(request.id, "approve")} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button onClick={() => processWithdrawal(request.id, "reject")} variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
