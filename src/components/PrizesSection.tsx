"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Trophy,
  Award,
  Gift,
  Coins,
  FileText,
  Sparkles,
  Star,
} from "lucide-react";
import MobileCardSlider from "./MobileCardSlider";

type Prize = {
  rank: string;
  reward: string;
  description: string;
  value?: string;
};

const PrizesSection: React.FC = () => {
  const getPrizeIcon = (rank: string) => {
    if (rank === "1st") return Trophy;
    if (rank.includes("2nd-10th")) return Award;
    if (rank.includes("11th-50th")) return Gift;
    if (rank.includes("51st-200th")) return Coins;
    return FileText;
  };

  const getPrizeTheme = (rank: string) => {
    if (rank === "1st") {
      return {
        cardBg: "bg-gradient-to-br from-yellow-50 to-amber-50",
        border: "border-yellow-300 hover:border-yellow-400",
        iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
        textColor: "text-yellow-800",
        badgeStyle: "bg-yellow-100 text-yellow-800 border-yellow-300",
        shadow: "hover:shadow-xl hover:shadow-yellow-100/50",
      };
    }
    if (rank.includes("2nd-10th")) {
      return {
        cardBg: "bg-gradient-to-br from-gray-50 to-slate-50",
        border: "border-gray-300 hover:border-gray-400",
        iconBg: "bg-gradient-to-br from-gray-400 to-slate-500",
        textColor: "text-gray-800",
        badgeStyle: "bg-gray-100 text-gray-800 border-gray-300",
        shadow: "hover:shadow-xl hover:shadow-gray-100/50",
      };
    }
    if (rank.includes("11th-50th")) {
      return {
        cardBg: "bg-gradient-to-br from-orange-50 to-amber-50",
        border: "border-orange-300 hover:border-orange-400",
        iconBg: "bg-gradient-to-br from-orange-400 to-amber-500",
        textColor: "text-orange-800",
        badgeStyle: "bg-orange-100 text-orange-800 border-orange-300",
        shadow: "hover:shadow-xl hover:shadow-orange-100/50",
      };
    }
    if (rank.includes("51st-200th")) {
      return {
        cardBg: "bg-gradient-to-br from-green-50 to-emerald-50",
        border: "border-green-300 hover:border-green-400",
        iconBg: "bg-gradient-to-br from-green-400 to-emerald-500",
        textColor: "text-green-800",
        badgeStyle: "bg-green-100 text-green-800 border-green-300",
        shadow: "hover:shadow-xl hover:shadow-green-100/50",
      };
    }
    return {
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-300 hover:border-blue-400",
      iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
      textColor: "text-blue-800",
      badgeStyle: "bg-blue-100 text-blue-800 border-blue-300",
      shadow: "hover:shadow-xl hover:shadow-blue-100/50",
    };
  };

  const PrizeCard: React.FC<{ prize: Prize; index: number }> = ({
    prize,
    index,
  }) => {
    const IconComponent = getPrizeIcon(prize.rank);
    const theme = getPrizeTheme(prize.rank);

    return (
      <Card
        className={`
          ${theme.cardBg} ${theme.border} ${theme.shadow}
          relative overflow-visible transition-all duration-300 ease-out
          transform hover:-translate-y-1 
          border-2 h-full group
          ${prize.rank === "1st" ? "ring-2 ring-yellow-400/50" : ""}
        `}
        data-card="prize"
      >
        {prize.rank === "1st" && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg border-2 border-yellow-500 whitespace-nowrap">
              👑 GRAND PRIZE 👑
            </div>
          </div>
        )}

        <CardHeader className="text-center pt-12 pb-4">
          <div
            className={`
              ${theme.iconBg}
              w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 
              shadow-lg transition-transform duration-300 group-hover:scale-110
            `}
          >
            <IconComponent className="h-8 w-8 text-white" />
          </div>

          <CardTitle className={`text-lg font-bold ${theme.textColor} mb-2`}>
            {prize.rank} Prize
          </CardTitle>

          {prize.rank === "1st" && (
            <Badge className={`${theme.badgeStyle} mx-auto shadow-sm border`}>
              🏆 Worth Lakhs!
            </Badge>
          )}
          {prize.rank.includes("2nd-10th") && (
            <Badge className={`${theme.badgeStyle} mx-auto shadow-sm border`}>
              ⭐ Premium Rewards
            </Badge>
          )}
          {prize.rank.includes("11th-50th") && (
            <Badge className={`${theme.badgeStyle} mx-auto shadow-sm border`}>
              💰 Double Money
            </Badge>
          )}
        </CardHeader>

        <CardContent className="text-center px-6 pb-8">
          <div className="text-2xl font-bold mb-3 text-red-600">
            {prize.reward}
          </div>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {prize.description}
          </p>
          {prize.value && (
            <div
              className={`
                text-sm font-medium ${theme.textColor} 
                bg-white/80 rounded-lg py-2 px-3 
                border border-white/50 shadow-sm
              `}
            >
              Value: <span className="font-bold">{prize.value}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const prizes: Prize[] = [
    {
      rank: "1st",
      reward: "Residential Plot",
      description: "Prime location residential plot worth lakhs",
      value: "₹25,00,000+",
    },
    {
      rank: "2nd-10th",
      reward: "Smartwatches",
      description: "Premium branded smartwatches for top performers",
      value: "₹15,000 each",
    },
    {
      rank: "11th-50th",
      reward: "Double Refund",
      description: "Get back double your entry fee (₹360)",
      value: "₹360",
    },
    {
      rank: "51st-200th",
      reward: "Entry Fee Refund",
      description: "Full entry fee refund (₹180)",
      value: "₹180",
    },
    {
      rank: "All Participants",
      reward: "Digital Certificate",
      description:
        "Official participation certificate with score details and achievements",
      value: "Complimentary",
    },
  ];

  return (
    <section
      id="prizes"
      className="py-20 bg-gradient-to-br from-red-50/30 via-white to-orange-50/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <Sparkles className="w-4 h-4" />
            AMAZING REWARDS
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Exciting{" "}
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Prizes
            </span>{" "}
            Await!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Win incredible rewards based on your performance. The better you
            score, the bigger your prize!
          </p>
        </div>

        <div className="mt-12 pt-8 pb-8">
          <MobileCardSlider
            showNavigation={true}
            showDots={true}
            autoSlide={false}
          >
            {prizes.map((prize, index) => (
              <div key={index} className="px-2 py-6">
                <PrizeCard prize={prize} index={index} />
              </div>
            ))}
          </MobileCardSlider>
        </div>

        <div className="text-center mt-16">
          <div className="bg-red-50 rounded-xl p-8 max-w-3xl mx-auto border border-red-100 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-red-600" />
              <h3 className="text-xl font-bold text-red-800">
                💡 Pro Winning Strategy
              </h3>
              <Trophy className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-red-700 text-lg leading-relaxed mb-4">
              <strong>Perfect Score + Fastest Time = Guaranteed Win!</strong>
              <br />
              Practice your General Knowledge and sharpen your puzzle-solving
              speed. Every second counts in WinQuizz!
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-red-600">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" /> Speed Matters
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" /> Accuracy Counts
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" /> Practice Pays
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrizesSection;
