"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { RefreshCw, TrendingUp } from "lucide-react";
import RevenueStatsCard from "../Components/Revenue/RevenueStatsCard";
import RevenueChartSection from "../Components/Revenue/RevenueChartSection";
import RecentTransactionsTable from "../Components/Revenue/RecentTransactionsTable";
import { api } from "@/lib/api-client";

interface RevenueData {
  totalRevenue: number;
  formattedTotalRevenue: string;
  mrr: number;
  formattedMrr: string;
  arr: number;
  formattedArr: string;
  monthlyGrowth: string;
  activeSubscriptions: number;
  pendingPayouts: number;
  formattedPendingPayouts: string;
  pendingPayoutsCount: number;
}

export default function RevenuePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenueMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.reports.revenue();
      if (res.success && res.data) {
        setRevenueData(res.data);
      }
    } catch (err) {
      console.error("Failed to load revenue metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueMetrics();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo(
        ".animate-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }
      );

      // Stats Cards Stagger Animation
      gsap.fromTo(
        ".animate-card",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.2 }
      );

      // Chart & Table Section Animation
      gsap.fromTo(
        ".animate-section",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.15, delay: 0.4 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-6 md:p-10 text-neutral-800 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-header gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-[#10b981]" /> Revenue Analytics
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time financial metrics, Monthly Recurring Revenue (MRR), and subscription transactions
          </p>
        </div>

        <button
          onClick={fetchRevenueMetrics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#10b981]" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Component 1: Stats Summary Cards */}
      <RevenueStatsCard 
        totalRevenue={revenueData?.formattedTotalRevenue || "৳0"}
        monthlyGrowth={revenueData?.monthlyGrowth || "+0.0%"}
        activeSubscriptions={revenueData?.activeSubscriptions || 0}
        mrr={revenueData?.formattedMrr || "৳0"}
        pendingPayouts={revenueData?.formattedPendingPayouts || "৳0"}
        pendingCount={revenueData?.pendingPayoutsCount || 0}
        loading={loading}
      />

      {/* Component 2: Visual Growth Chart */}
      <RevenueChartSection />

      {/* Component 3: Recent Transactions Table */}
      <RecentTransactionsTable />
    </div>
  );
}