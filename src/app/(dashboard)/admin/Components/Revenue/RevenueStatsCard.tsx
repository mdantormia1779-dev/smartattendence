"use client";

import React from "react";
import { DollarSign, TrendingUp, Users, CreditCard, Loader2 } from "lucide-react";

interface StatsProps {
  totalRevenue?: string;
  monthlyGrowth?: string;
  activeSubscriptions?: number;
  mrr?: string;
  pendingPayouts?: string;
  pendingCount?: number;
  loading?: boolean;
}

export default function RevenueStatsCard({
  totalRevenue = "৳0",
  monthlyGrowth = "+0.0%",
  activeSubscriptions = 0,
  mrr = "৳0",
  pendingPayouts = "৳0",
  pendingCount = 0,
  loading = false,
}: StatsProps) {
  const isGrowthPositive = !monthlyGrowth.startsWith("-");

  const stats = [
    {
      title: "Total Platform Revenue",
      value: totalRevenue,
      change: `${monthlyGrowth} vs last month`,
      isPositive: isGrowthPositive,
      icon: DollarSign,
      color: "bg-emerald-50 text-[#10b981]",
    },
    {
      title: "Monthly Recurring (MRR)",
      value: mrr,
      change: "Real monthly run rate",
      isPositive: true,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toLocaleString(),
      change: "Live enterprise tenants",
      isPositive: true,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Verifications",
      value: pendingPayouts,
      change: `${pendingCount} verification${pendingCount === 1 ? "" : "s"} awaiting`,
      isPositive: pendingCount === 0,
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
            className="animate-card bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs hover:border-[#10b981]/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  {stat.title}
                </span>
                <h3 className="text-2xl font-extrabold text-neutral-900 mt-1 tracking-tight">
                  {loading ? (
                    <span className="inline-flex items-center gap-1 text-sm text-neutral-400 font-normal">
                      <Loader2 className="w-4 h-4 animate-spin text-[#10b981]" /> Loading...
                    </span>
                  ) : (
                    stat.value
                  )}
                </h3>
              </div>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${stat.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
              <span className={`text-xs font-semibold ${stat.isPositive ? "text-[#10b981]" : "text-amber-600"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}