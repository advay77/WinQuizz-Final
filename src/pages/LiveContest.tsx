"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target } from "lucide-react";

export default function LiveContest() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="w-full min-h-screen bg-[#f9fafb] flex flex-col px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 pb-6 sm:pt-28 sm:pb-8 md:pt-32 md:pb-10">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8 text-left">
        <h1 className="text-2xl xs:text-2.5xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          My Contest
        </h1>
        <p className="text-gray-600 mt-1 xs:mt-1.5 text-sm xs:text-[15px] sm:text-base">
         Track your contest participation and performance
        </p>
      </div>

      {/* Tabs - Left Aligned */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6 sm:mb-8"
      >
        <TabsList className="bg-transparent flex flex-nowrap xs:flex-wrap justify-start gap-1.5 xs:gap-2 sm:gap-3 overflow-x-auto pb-1 px-0.5 -mx-0.5">
          {["all", "live", "completed"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`flex-shrink-0 px-3 xs:px-4 py-1.5 xs:py-2 rounded-md border text-xs xs:text-sm sm:text-[15px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
              }`}
            >
              {tab === "all"
                ? "All Contests"
                : tab === "live"
                ? "Live Now"
                : "Completed"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Empty State - Dynamic Content */}
      <Card className="w-full flex flex-col justify-center items-center text-center bg-red-600 text-white py-12 sm:py-16 md:py-20 px-4 xs:px-6">
        <CardContent className="flex flex-col items-center space-y-3 xs:space-y-4 sm:space-y-5 w-full">
          <div className="p-3 xs:p-3.5 bg-red-500/20 rounded-full">
            <Target className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 text-white/90 transition-transform hover:scale-105" />
          </div>
          <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold text-white mt-1">
            {activeTab === 'all' 
              ? 'No contests yet'
              : activeTab === 'live' 
                ? 'No ongoing contests'
                : 'No completed contests'
            }
          </h2>
          <p className="text-white/90 text-sm xs:text-[15px] sm:text-base max-w-xs sm:max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'Join your first contest to get started!'
              : activeTab === 'live'
                ? 'You don\'t have any ongoing contests.'
                : 'You don\'t have any completed contests.'
            }
          </p>
          <Button 
            variant="outline"
            className="mt-1 bg-white text-red-600 hover:bg-white/90 hover:text-red-700 px-5 py-2 rounded-lg text-sm sm:text-base transition-colors duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            size="lg"
            onClick={() => {
              // You can add navigation to browse contests here if needed
              // navigate('/browse-contests');
            }}
          >
            Browse Contests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
