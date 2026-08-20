"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import RevenueStatsCard from "../Components/Revenue/RevenueStatsCard";
import RevenueChartSection from "../Components/Revenue/RevenueChartSection";
import RecentTransactionsTable from "../Components/Revenue/RecentTransactionsTable";

export default function RevenuePage() {
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-header opacity-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Revenue Analytics</h1>
          <p className="text-sm text-neutral-500 mt-1">Detailed financial metrics, MRR growth, and payment earnings</p>
        </div>
      </div>

      {/* Component 1: Stats Summary Cards */}
      <RevenueStatsCard totalRevenue="$48,250" monthlyGrowth="+14.2%" activeSubscriptions={142} />

      {/* Component 2: Visual Growth Chart */}
      <RevenueChartSection />

      {/* Component 3: Recent Transactions Table */}
      <RecentTransactionsTable />
    </div>
  );
}