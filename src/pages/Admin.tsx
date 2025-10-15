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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Shield, LogOut, CheckCircle, XCircle, Eye, DollarSign, Plus, Edit, Trash2, BookOpen, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";

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

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

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
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">Quiz Questions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="kyc">KYC Requests</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

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
