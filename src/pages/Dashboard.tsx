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

interface Game {
  id: string;
  title: string;
  description: string;
  prize_amount: number;
  prize_description: string;
  total_questions: number;
  time_limit_minutes: number;
  entry_fee: number;
  status: string;
}

interface Progress {
  id: string;
  game_id: string;
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
  const [games, setGames] = useState<Game[]>([]);
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

      // Fetch games
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });

      if (gamesError) throw gamesError;
      setGames(gamesData || []);

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_game_progress")
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

  const getGameById = (gameId: string) => {
    return games.find(g => g.id === gameId);
  };

  const completedGames = progress.filter(p => p.status === "completed");
  const totalScore = completedGames.reduce((sum, p) => sum + p.score, 0);
  const averageScore = completedGames.length > 0
    ? Math.round(totalScore / completedGames.length)
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
            <h2 className="text-3xl font-bold mb-6">Demo Quizzes</h2>
            <p className="text-muted-foreground mb-6">Try these demo quizzes to understand how the platform works. No progress will be saved.</p>
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
            <h2 className="text-3xl font-bold mb-6">Live Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.filter(g => g.status === "active").map((game) => (
                <Card key={game.id} className="border-2 hover:border-primary transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prize:</span>
                        <span className="font-semibold text-primary">{game.prize_description}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-semibold">{game.total_questions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-semibold">{game.time_limit_minutes} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="font-semibold">₹{game.entry_fee}</span>
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/90 mt-2">
                        Play Now
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
              {games.filter(g => g.status === "upcoming").map((game) => (
                <Card key={game.id} className="border-2 hover:border-primary transition-all hover:shadow-lg opacity-75">
                  <CardHeader>
                    <CardTitle className="text-xl">{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prize:</span>
                        <span className="font-semibold text-primary">{game.prize_description}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-semibold">{game.total_questions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-semibold">{game.time_limit_minutes} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="font-semibold">₹{game.entry_fee}</span>
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
