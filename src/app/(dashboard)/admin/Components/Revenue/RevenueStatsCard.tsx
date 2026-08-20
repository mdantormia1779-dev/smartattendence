"use client";

import React from "react";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

interface StatsProps {
  totalRevenue: string;
  monthlyGrowth: string;
  activeSubscriptions: number;
}

export default function RevenueStatsCard({ totalRevenue, activeSubscriptions }: StatsProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      change: "+14.2% from last month",
      isPositive: true,
      icon: DollarSign,
      color: "bg-emerald-50 text-[#10b981]",
    },
    {
      title: "Monthly Recurring (MRR)",
      value: "$12,450",
      change: "+8.1% growth",
      isPositive: true,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toString(),
      change: "+12 new today",
      isPositive: true,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Payouts",
      value: "$1,840",
      change: "Requires review",
      isPositive: false,
      icon: CreditCard,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="animate-card opacity-0 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm hover:border-[#10b981]/40 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold text-neutral-400">{stat.title}</span>
                <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <span className={`text-xs font-semibold ${stat.isPositive ? "text-[#10b981]" : "text-amber-600"}`}>
              {stat.change}
            </span>
          </div>
        );
      })}
    </div>
  );
}