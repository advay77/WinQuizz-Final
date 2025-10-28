"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, ArrowDownToLine, Gift } from "lucide-react";

export default function Wallet() {
  const [activeTab, setActiveTab] = useState("overview");

  // Placeholder amounts (replace with Supabase values)
  const totalBalance = 1750;
  const unutilizedAmount = 1500;
  const bonusCash = 250;

  return (
    <div className="w-full min-h-screen bg-[#f9fafb] pt-24 pb-10 px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Top Summary Cards */}
      {/* Top Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6 max-w-7xl mx-auto">
        {/* Total Balance */}
        <Card className="bg-red-50 border border-red-100 shadow-sm rounded-xl">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-red-700 font-semibold">Total Balance</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                ₹{totalBalance.toFixed(2)}
              </h2>
            </div>
            <div className="mt-4 sm:mt-0 bg-red-100 rounded-full p-3">
              <WalletIcon size={24} color="#dc2626" />
            </div>
          </CardContent>
        </Card>

        {/* Unutilized Amount */}
        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Unutilized Amount</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                ₹{unutilizedAmount.toFixed(2)}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Withdrawable</p>
            </div>
            <div className="mt-4 sm:mt-0 bg-gray-100 rounded-full p-3">
              <ArrowDownToLine className="text-green-600 w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Bonus Cash */}
        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Bonus Cash</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                ₹{bonusCash.toFixed(2)}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Non-withdrawable</p>
            </div>
            <div className="mt-4 sm:mt-0 bg-gray-100 rounded-full p-3">
              <Gift className="text-yellow-600 w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium">
          + Add Money
        </Button>
        <Button variant="outline" className="border-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium">
          ↑ Withdraw
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-7xl mx-auto">
        <TabsList className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 border-b border-gray-200 bg-transparent mb-6 overflow-x-auto pb-1">
          {["overview", "transactions", "withdrawals"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`pb-2 text-sm sm:text-base font-medium ${
                activeTab === tab
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <Card className="rounded-xl border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month Deposits</span>
                    <span className="text-green-600 font-medium">₹0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month Withdrawals</span>
                    <span className="text-red-600 font-medium">₹0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contest Winnings</span>
                    <span className="text-blue-600 font-medium">₹0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="rounded-xl border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Payment Methods</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: '💳', name: 'Credit/Debit Cards' },
                    { icon: '🏦', name: 'Net Banking' },
                    { icon: '📱', name: 'UPI & Wallets' }
                  ].map((method, index) => (
                    <div 
                      key={index}
                      className="border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="text-lg">{method.icon}</span>
                      <span className="whitespace-nowrap">{method.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions & Withdrawals (Placeholder) */}
        <TabsContent value="transactions" className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <p className="text-gray-500 text-sm">No transactions yet.</p>
          </div>
        </TabsContent>
        <TabsContent value="withdrawals" className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
            <p className="text-gray-500 text-sm">No withdrawals yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
