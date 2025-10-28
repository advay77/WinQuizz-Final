import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import {
  Clock,
  Users,
  Target,
  Timer,
  Coins,
  Award,
  TrendingUp,
  CheckCircle,
  Trophy,
  Star,
  Play,
} from 'lucide-react';

type Contest = {
  id: string;
  title: string;
  description: string;
  prize_pool: string;
  first_prize: string;
  enrolled_count: number;
  category: string;
  prizes: Record<string, string>; // e.g., { "1st": "iPhone", "2nd": "MacBook" }
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
  const [startingContest, setStartingContest] = useState<boolean>(false);

  useEffect(() => {
    if (!contestId) return;
    fetchContestDetails(contestId);
  }, [contestId]);

  const fetchContestDetails = async (id: string) => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/contests/${id}`);
      if (response.ok) {
        const data: Contest = await response.json();
        setContest(data);
      } else {
        setContest(null);
      }
    } catch (error) {
      console.error(error);
      setContest(null);
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
      alert(data.detail || 'Failed to start quiz session');
    }
  };

  const handleStartContest = async () => {
    setStartingContest(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert('Please log in to join contests');
        setStartingContest(false);
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
        alert('Insufficient wallet balance. Please add money to your wallet.');
        navigate('/wallet');
      } else {
        alert(joinData.detail || 'Failed to join contest');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to start contest. Please try again.');
    } finally {
      setStartingContest(false);
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
          <p className="text-gray-600">Contest not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Rest of your JSX remains same */}
    </div>
  );
};

export default ContestDetail;
