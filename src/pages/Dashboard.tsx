import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, LogOut, TrendingUp, Target, Clock, Award, BarChart3 } from "lucide-react";
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
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  entry_fee: number;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  current_participants: number;
  total_questions: number;
  status: string;
}

interface Progress {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  status: string;
  completed_at: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if session is still valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Check if profile exists and both email and phone are verified
      if (!profileData) {
        toast.error("Profile not found. Please contact support.");
        navigate("/auth");
        return;
      }

      if (!(profileData as Profile).email_verified || !(profileData as Profile).phone_verified) {
        toast.error("Please verify both email and phone to access the dashboard");
        navigate("/verify");
        return;
      }

      setProfile(profileData);

      // Fetch quizzes
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_participants(count)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (quizzesData) {
        // Transform the data to include current_participants count
        const transformedQuizzes = quizzesData.map((quiz: any) => ({
          ...quiz,
          current_participants: (quiz.quiz_participants as any)?.[0]?.count || 0
        }));
        setQuizzes(transformedQuizzes);
      }

      // Fetch user progress for quizzes
      const { data: progressData, error: progressError } = await supabase
        .from("user_quiz_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (progressError) throw progressError;
      setProgress(progressData || []);

    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getQuizById = (quizId: string) => {
    return quizzes.find(q => q.id === quizId);
  };

  const completedQuizzes = progress.filter(p => p.status === "completed");
  const totalScore = completedQuizzes.reduce((sum, p) => sum + p.score, 0);
  const averageScore = completedQuizzes.length > 0
    ? Math.round(totalScore / completedQuizzes.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-20"> {/* Added pt-20 to account for navbar */}
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || profile?.email?.split("@")[0] || "Player"}!
          </h1>
          <p className="text-xl text-muted-foreground">Ready to test your skills and win big?</p>
        </div>

        {/* Main Content - Removed Sidebar */}
        <div className="mb-8">
          {/* Demo Quizzes Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Demo Quizzes (Free Practice)</h2>
            <p className="text-muted-foreground mb-6">Try these demo quizzes to understand how the platform works. No coins required and no progress saved.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Demo Quiz 1 */}
              <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">General Knowledge Demo</CardTitle>
                  <CardDescription>Test your basic knowledge with this demo quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-semibold">10</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time Limit:</span>
                      <span className="font-semibold">1 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-semibold">Easy</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 mt-2"
                      onClick={() => navigate('/quiz/general-knowledge')}
                    >
                      Try Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Quiz 2 */}
              <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">Science & Technology Demo</CardTitle>
                  <CardDescription>Explore science questions in demo mode</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-semibold">15</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time Limit:</span>
                      <span className="font-semibold">1 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-semibold">Medium</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 mt-2"
                      onClick={() => navigate('/quiz/science-tech')}
                    >
                      Try Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Quiz 3 */}
              <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">Entertainment Demo</CardTitle>
                  <CardDescription>Movies, music, and pop culture questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time Limit:</span>
                      <span className="font-semibold">1 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-semibold">Easy</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 mt-2"
                      onClick={() => navigate('/quiz/entertainment')}
                    >
                      Try Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Live Quizzes Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Live Quizzes (Coin Required)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.filter(q => q.status === "active").map((quiz) => (
                <Card key={quiz.id} className="border-2 hover:border-primary transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-semibold">{quiz.current_participants}/{quiz.max_participants || '∞'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-semibold">{quiz.total_questions || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-semibold">{quiz.time_limit_minutes} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="font-semibold text-yellow-600">🪙 {quiz.entry_fee} Coins</span>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 mt-2"
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                        disabled={quiz.max_participants !== null && quiz.current_participants >= quiz.max_participants}
                      >
                        {quiz.max_participants !== null && quiz.current_participants >= quiz.max_participants ? 'Full' : 'Play Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Quizzes Section */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Upcoming Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.filter(q => q.status === "draft").map((quiz) => (
                <Card key={quiz.id} className="border-2 hover:border-primary transition-all hover:shadow-lg opacity-75">
                  <CardHeader>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-semibold">{quiz.current_participants}/{quiz.max_participants || '∞'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-semibold">{quiz.total_questions || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-semibold">{quiz.time_limit_minutes} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="font-semibold text-yellow-600">🪙 {quiz.entry_fee} Coins</span>
                      </div>
                      <Button className="w-full bg-muted hover:bg-muted/90 mt-2" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
