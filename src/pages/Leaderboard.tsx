import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, TrendingUp, Users, Target, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

interface QuizLeaderboardEntry {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
  rank: number;
  quizzes?: { title: string };
  profiles?: { full_name: string | null; email: string };
}

interface UserRanking {
  id: string;
  user_id: string;
  total_score: number;
  quizzes_completed: number;
  average_score: number;
  best_score: number;
  profiles?: { full_name: string | null; email: string };
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [quizLeaderboard, setQuizLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);

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
        // Group by quiz and assign ranks
        const groupedByQuiz: { [quizId: string]: QuizLeaderboardEntry[] } = {};
        quizData.forEach((entry: any, index) => {
          if (!groupedByQuiz[entry.quiz_id]) {
            groupedByQuiz[entry.quiz_id] = [];
          }
          groupedByQuiz[entry.quiz_id].push({
            ...entry,
            rank: groupedByQuiz[entry.quiz_id].length + 1
          });
        });

        // Flatten and set the leaderboard
        const flattenedLeaderboard = Object.values(groupedByQuiz).flat();
        setQuizLeaderboard(flattenedLeaderboard);
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
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank === 2) return "secondary";
    if (rank === 3) return "outline";
    return "outline";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-xl text-muted-foreground">See how you rank against other players</p>
          </div>

          <Tabs defaultValue="overall" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overall">Overall Rankings</TabsTrigger>
              <TabsTrigger value="quiz-specific">Quiz Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="overall">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Overall Player Rankings
                  </CardTitle>
                  <CardDescription>Top players based on average quiz performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userRankings.length === 0 ? (
                      <div className="text-center py-8">
                        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No rankings available yet</p>
                      </div>
                    ) : (
                      userRankings.map((user, index) => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getRankIcon(index + 1)}
                              <Badge variant={getRankBadgeVariant(index + 1)}>
                                #{index + 1}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-semibold">
                                {user.profiles?.full_name || user.profiles?.email || 'Anonymous'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.quizzes_completed} quizzes completed
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="font-bold text-lg">{user.average_score.toFixed(1)}%</div>
                                <div className="text-sm text-muted-foreground">Average</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-lg">{user.best_score}%</div>
                                <div className="text-sm text-muted-foreground">Best Score</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-lg">{user.total_score}</div>
                                <div className="text-sm text-muted-foreground">Total Points</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz-specific">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quiz-Specific Rankings
                  </CardTitle>
                  <CardDescription>See rankings for individual quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {quizLeaderboard.length === 0 ? (
                      <div className="text-center py-8">
                        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No quiz results available yet</p>
                      </div>
                    ) : (
                      // Group by quiz for display
                      Object.entries(
                        quizLeaderboard.reduce((acc, entry) => {
                          if (!acc[entry.quiz_id]) {
                            acc[entry.quiz_id] = [];
                          }
                          acc[entry.quiz_id].push(entry);
                          return acc;
                        }, {} as { [quizId: string]: QuizLeaderboardEntry[] })
                      ).map(([quizId, entries]) => {
                        const quiz = entries[0]?.quizzes;
                        return (
                          <Card key={quizId} className="border-l-4 border-l-primary">
                            <CardHeader>
                              <CardTitle className="text-lg">{quiz?.title || 'Unknown Quiz'}</CardTitle>
                              <CardDescription>
                                {entries.length} participants • Top performers
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {entries.slice(0, 10).map((entry) => (
                                  <div
                                    key={entry.id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-muted/30'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {getRankIcon(entry.rank)}
                                      <div>
                                        <p className="font-medium">
                                          {entry.profiles?.full_name || entry.profiles?.email || 'Anonymous'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {format(new Date(entry.completed_at), 'MMM d, yyyy h:mm a')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-lg">
                                        {entry.percentage.toFixed(1)}%
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {entry.score}/{entry.total_questions} correct
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {entries.length > 10 && (
                                  <div className="text-center text-sm text-muted-foreground">
                                    And {entries.length - 10} more participants...
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
