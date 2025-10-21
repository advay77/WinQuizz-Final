import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Navbar from './Navbar';
import {
  Clock,
  Users,
  Wallet,
  Target,
  Plus,
  Star,
  Timer,
  Coins,
  Award,
  Gift,
  ArrowRight,
  ArrowLeft,
  Play,
  CheckCircle,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Contest type
interface Contest {
  id: string;
  title: string;
  description?: string;
  prize_pool?: number | string;
  first_prize?: string;
  enrolled_count?: number;
  total_participants?: number;
  entry_fee?: number;
  max_participants?: number;
  start_datetime?: string;
}

const Dashboard: React.FC = () => {
  const [liveContests, setLiveContests] = useState<Contest[]>([]);
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningContest, setJoiningContest] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch contests
  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

      const [liveRes, upcomingRes] = await Promise.all([
        fetch(`${backendUrl}/api/contests/live`),
        fetch(`${backendUrl}/api/contests/upcoming`),
      ]);

      const liveData: Contest[] = liveRes.ok ? await liveRes.json() : [];
      const upcomingData: Contest[] = upcomingRes.ok ? await upcomingRes.json() : [];

      setLiveContests(liveData);
      setUpcomingContests(upcomingData);
    } catch (err) {
      console.error('Error fetching contests:', err);
      setLiveContests([]);
      setUpcomingContests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipateInContest = (contestId: string) => {
    setJoiningContest(contestId);
    navigate(`/contest/${contestId}`);
  };

 

  const handleTryDemo = () => {
    alert('Demo contest feature available on landing page!');
  };

  const handleRefreshContests = () => fetchContests();

  const stepColorMap: Record<string, string> = {
    blue: 'bg-blue-100 border-blue-200 text-blue-600',
    green: 'bg-green-100 border-green-200 text-green-600',
    purple: 'bg-purple-100 border-purple-200 text-purple-600',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Contests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">🔥 Live Contests</h2>
                <Button
                  onClick={handleRefreshContests}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
              </div>

              {liveContests.length > 0 ? (
                liveContests.map((contest) => {
                  const enrolled = contest.enrolled_count ?? 0;
                  const total = contest.total_participants ?? 1;
                  const highInterest = enrolled / total > 0.6;

                  return (
                    <Card key={contest.id} className="border border-gray-200 bg-white shadow-lg relative overflow-hidden">
                      <CardHeader className="pb-4 px-6 pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className="bg-red-600 text-white text-xs">🔥 LIVE</Badge>
                              {enrolled > 200 && <Badge className="bg-green-600 text-white text-xs">🎯 HIGH PARTICIPATION</Badge>}
                            </div>
                            <CardTitle className="text-xl text-gray-900 mb-1">{contest.title}</CardTitle>
                            <p className="text-gray-500 text-sm">{contest.description}</p>
                          </div>
                          <div className="text-right pl-4">
                            <div className="text-2xl font-bold text-red-600">
                              ₹{parseFloat((contest.prize_pool ?? 0).toString()).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Prize Pool</div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 px-6 pb-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-gray-600 mb-1">🏆 1st Prize</div>
                              <div className="text-lg font-bold text-gray-900">{contest.first_prize}</div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center space-x-2 text-sm ${highInterest ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                <Users className={`h-4 w-4 ${highInterest ? 'text-green-600' : ''}`} />
                                <span>{enrolled}/{total}</span>
                              </div>
                              <div className={`text-xs ${highInterest ? 'text-green-500' : 'text-gray-500'}`}>
                                {highInterest ? '✨ High Interest!' : 'Participated'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleParticipateInContest(contest.id)}
                          disabled={joiningContest === contest.id}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {joiningContest === contest.id ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Joining...</span>
                            </div>
                          ) : (
                            '🎯 Join Contest'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="border-2 border-gray-200 bg-gray-50 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-600">No Live Contests</h3>
                      <p className="text-sm text-gray-500">Check back later for exciting contests!</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading && (
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contests...</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Upcoming Contests */}
            {/* ...same logic, type-safe with optional chaining and defaults */}
            {/* How To Participate */}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Wallet Summary and Verification Status */}
            {/* Add your wallet and verification components here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard
