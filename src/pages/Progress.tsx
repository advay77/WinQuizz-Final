import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, LogOut, TrendingUp, Target, Clock, Award, ArrowLeft } from "lucide-react";
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

const Progress = () => {
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

      // Fetch progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_game_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (progressError) throw progressError;
      setProgress(progressData || []);

    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getGameById = (gameId: string) => {
    return games.find(game => game.id === gameId);
  };

  const getTotalScore = () => {
    return progress.reduce((total, prog) => total + prog.score, 0);
  };

  const getAverageScore = () => {
    if (progress.length === 0) return 0;
    return Math.round(getTotalScore() / progress.length);
  };

  const getCompletedGames = () => {
    return progress.filter(prog => prog.status === "completed").length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">WinQuizz</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Games</p>
                  <p className="text-2xl font-bold">{progress.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{getCompletedGames()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{getAverageScore()}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Score</p>
                  <p className="text-2xl font-bold">{getTotalScore()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Progress */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Your Game History</h2>
          {progress.length > 0 ? (
            <div className="space-y-4">
              {progress.map((prog) => {
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
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Games Played Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start playing quizzes to see your progress here!
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Browse Quizzes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
