"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Wallet,
  CheckCircle2,
  Clock,
  Play,
  CircleDot,
  Target,
  Award,
} from "lucide-react";

type Contest = {
  id: string;
  name: string;
  prizePool: number;
  entryFee: number;
  questions: number;
  duration: number;
  startsIn: string;
};

type UpcomingContest = {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  participants: string;
  time: string;
  status: string;
};

export default function Dashboard() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [upcomingContests, setUpcomingContests] = useState<UpcomingContest[]>([]);

  useEffect(() => {
    // TODO: Replace with Supabase fetch
    setContests([
      { id: "1", name: "Mega GK Contest", prizePool: 50000, entryFee: 180, questions: 10, duration: 5, startsIn: "02h 15m 07s" },
      { id: "2", name: "Tech Titans Quiz", prizePool: 30000, entryFee: 120, questions: 8, duration: 4, startsIn: "01h 45m 22s" },
      { id: "3", name: "Sports IQ Battle", prizePool: 20000, entryFee: 100, questions: 10, duration: 5, startsIn: "03h 05m 50s" },
      { id: "4", name: "Bollywood Mania", prizePool: 10000, entryFee: 80, questions: 8, duration: 4, startsIn: "00h 50m 32s" },
    ]);

    setUpcomingContests([
      { id: "u1", name: "Evening Knowledge Battle", entryFee: 100, prizePool: 25000, participants: "250/500", time: "6:00 PM Today", status: "Coming Soon" },
      { id: "u2", name: "Weekend Special Quiz", entryFee: 200, prizePool: 100000, participants: "145/1000", time: "Tomorrow 2:00 PM", status: "Coming Soon" },
      { id: "u3", name: "Monday Motivation Quiz", entryFee: 150, prizePool: 75000, participants: "89/750", time: "Monday 9:00 AM", status: "Coming Soon" },
    ]);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome, Rahul! 👋</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> KYC Verified
            </div>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span>Tickets: <span className="font-semibold text-gray-800">0</span></span>
              <Button size="sm" className="ml-1 bg-red-600 hover:bg-red-700">Buy Now</Button>
            </div>
          </div>
        </div>

        <Card className="w-full sm:w-80 lg:w-64 shadow-sm border rounded-lg">
          <CardHeader className="pb-2 flex flex-col items-center">
            <Wallet className="w-6 h-6 text-red-600 mb-1" />
            <CardTitle className="text-lg font-semibold">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">₹0</h2>
            <Button className="bg-green-600 hover:bg-green-700 w-full">Add Money</Button>
          </CardContent>
        </Card>
      </div>

      {/* Contest Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Contest List */}
        <div className="lg:col-span-2 space-y-6">
          {contests.map((contest) => (
            <Card key={contest.id} className="border border-red-100 bg-red-50 hover:shadow-md transition">
              <CardHeader className="pb-3 flex justify-between items-center">
                <Badge className="bg-red-600 hover:bg-red-700 text-white">LIVE CONTEST</Badge>
                <Trophy className="text-red-600 w-6 h-6" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">{contest.name}</h3>
                    <p className="text-gray-600 text-sm">Ultimate knowledge challenge</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-red-600">₹{contest.prizePool.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Prize Pool</p>
                  </div>
                </div>

                <div className="flex justify-around text-center my-4 flex-wrap">
                  <div className="min-w-[80px]">
                    <p className="text-gray-700 font-semibold">₹{contest.entryFee}</p>
                    <p className="text-gray-500 text-sm">Entry Fee</p>
                  </div>
                  <div className="min-w-[80px]">
                    <p className="text-gray-700 font-semibold">{contest.questions}</p>
                    <p className="text-gray-500 text-sm">Questions</p>
                  </div>
                  <div className="min-w-[80px]">
                    <p className="text-gray-700 font-semibold">{contest.duration}</p>
                    <p className="text-gray-500 text-sm">Minutes</p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>Starts in</span>
                    <span className="font-semibold text-black">{contest.startsIn}</span>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                    Buy Ticket & Join Contest
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Name:</strong> Rahul Sharma</p>
              <p><strong>Email:</strong> rahul@example.com</p>
              <p><strong>KYC:</strong> ✅ Verified</p>
              <p><strong>Tickets:</strong> 0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">No recent transactions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Contests */}
      <div className="mt-10">
        <Card className="p-4 sm:p-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Upcoming Contests</CardTitle>
            <p className="text-gray-600 text-sm">Get ready for these amazing challenges</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingContests.map((contest) => (
              <div key={contest.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <CircleDot className="text-blue-600 w-3 h-3" />
                    <h3 className="text-lg font-semibold">{contest.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ₹{contest.entryFee} entry | ₹{contest.prizePool.toLocaleString()} pool
                  </p>
                  <p className="text-xs text-gray-500">{contest.participants} participants</p>
                </div>
                <div className="text-left sm:text-right mt-3 sm:mt-0">
                  <p className="text-sm font-medium text-gray-800">{contest.time}</p>
                  <Badge variant="outline" className="mt-1 text-purple-700 border-purple-300">{contest.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* How To Participate */}
      <div className="mt-10">
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600 w-5 h-5" />
              <CardTitle className="text-lg font-bold">How To Participate</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Master the contest in 3 simple steps</p>
          </CardHeader>

          <CardContent className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <CircleDot className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold">Step 1: Add Funds</p>
              <p className="text-sm text-gray-500">Add money to your wallet securely for contest participation.</p>
            </div>
            <div>
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Step 2: Join Contest</p>
              <p className="text-sm text-gray-500">Choose from Sports, Entertainment, or Knowledge contests.</p>
            </div>
            <div>
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold">Step 3: Win Prizes</p>
              <p className="text-sm text-gray-500">Answer correctly and win cash & rewards instantly.</p>
            </div>
          </CardContent>

          <div className="flex justify-center mt-6">
            <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Play className="w-4 h-4" /> Try Demo Contest
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
