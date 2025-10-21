import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Target,
  Trophy,
  Users,
  Clock,
  Play,
  CheckCircle,
  Timer,
  Award,
  Home,
  Smartphone,
  Watch,
  Gift,
  DollarSign,
  Star,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

type Prize = {
  id: string;
  prize_type: 'cash' | 'item' | 'land' | 'voucher' | string;
  rank_from: number;
  rank_to: number;
  prize_description: string;
  prize_value: number;
};

type Contest = {
  id: string;
  title: string;
  description: string;
  prize_pool: string | number;
  first_prize: string;
  enrolled_count: number;
  category_name: string;
  duration_seconds: number;
  prizes?: Prize[];
};

type QuizSessionResponse = {
  session_id: string;
  detail?: string;
};

const ContestDetail: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [joiningContest, setJoiningContest] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contestId) fetchContestDetails(contestId);
  }, [contestId]);

  const fetchContestDetails = async (id: string) => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/contests/${id}`);
      if (response.ok) {
        const data: Contest = await response.json();
        setContest(data);
      } else {
        toast({ title: 'Error', description: 'Failed to load contest details', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error fetching contest details:', error);
      toast({ title: 'Error', description: 'Failed to load contest details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const startQuizSession = async (contestId: string, token: string) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    const res = await fetch(`${backendUrl}/api/quiz/session/start?contest_id=${contestId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data: QuizSessionResponse = await res.json();
    if (res.ok && data.session_id) {
      navigate(`/quiz/${data.session_id}`);
    } else {
      toast({ title: 'Error', description: data.detail || 'Failed to start quiz session', variant: 'destructive' });
    }
  };

  const handleJoinContest = async () => {
    setJoiningContest(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please log in to join contests', variant: 'destructive' });
        setJoiningContest(false);
        return;
      }
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const joinRes = await fetch(`${backendUrl}/api/contests/${contestId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const joinData: { detail?: string } = await joinRes.json();

      if (joinRes.ok || joinData.detail === 'You have already joined this contest') {
        await startQuizSession(contestId!, token);
      } else if (joinData.detail === 'Insufficient wallet balance') {
        toast({ title: 'Insufficient Balance', description: 'Add money to wallet to join', variant: 'destructive' });
        navigate('/wallet');
      } else {
        toast({ title: 'Error', description: joinData.detail || 'Failed to join contest', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error joining contest:', error);
      toast({ title: 'Error', description: 'Failed to join contest. Please try again.', variant: 'destructive' });
    } finally {
      setJoiningContest(false);
    }
  };

  const getPrizeIcon = (prizeType: Prize['prize_type']) => {
    switch (prizeType) {
      case 'cash': return DollarSign;
      case 'item': return Smartphone;
      case 'land': return Home;
      case 'voucher': return Gift;
      default: return Trophy;
    }
  };

  const getPrizeColor = (prizeType: Prize['prize_type']) => {
    switch (prizeType) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'item': return 'bg-blue-100 text-blue-800';
      case 'land': return 'bg-purple-100 text-purple-800';
      case 'voucher': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest details...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contest Not Found</h3>
          <p className="text-gray-600 mb-4">The contest you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-red-600 hover:bg-red-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your full JSX structure remains the same */}
    </div>
  );
};

export default ContestDetail;
