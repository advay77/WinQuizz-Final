import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, LogOut, TrendingUp, Target, Clock, Award } from "lucide-react";
import { toast } from "sonner";
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

      setUser(user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      // Check if both email and phone are verified
      if (!profileData.email_verified || !profileData.phone_verified) {
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
      {/* Header */}
      <header className="bg-background/95 backdrop-blur border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">WinQuizz</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || profile?.email?.split("@")[0] || "Player"}!
          </h1>
          <p className="text-xl text-muted-foreground">Ready to test your skills and win big?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Games Played</p>
                  <p className="text-3xl font-bold">{progress.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{completedGames.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-3xl font-bold">{averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold">
                    {progress.filter(p => p.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Games */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Available Games</h2>
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

        {/* Recent Progress */}
        {progress.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Your Recent Games</h2>
            <div className="space-y-4">
              {progress.slice(0, 5).map((prog) => {
                const game = getGameById(prog.game_id);
                if (!game) return null;

                return (
                  <Card key={prog.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="font-bold text-lg">{game.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prog.status === "completed" 
                              ? `Completed on ${new Date(prog.completed_at!).toLocaleDateString()}`
                              : "In Progress"}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{prog.score}%</p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{prog.correct_answers}/{prog.total_questions}</p>
                            <p className="text-xs text-muted-foreground">Correct</p>
                          </div>
                          {prog.time_taken_seconds && (
                            <div className="text-center">
                              <p className="text-2xl font-bold">{Math.floor(prog.time_taken_seconds / 60)}m</p>
                              <p className="text-xs text-muted-foreground">Time</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
