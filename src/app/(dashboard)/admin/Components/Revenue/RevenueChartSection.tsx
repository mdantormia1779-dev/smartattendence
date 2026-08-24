"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

interface MonthlyRevenueItem {
  month: string;
  year: number;
  rawAmount: number;
  amount: string;
  height: string;
}

export default function RevenueChartSection() {
  const [chartData, setChartData] = useState<MonthlyRevenueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    let isMounted = true;
    const fetchRevenue = async () => {
      try {
        setIsLoading(true);
        const res = await api.reports.revenue();
        if (isMounted && res.success && res.data) {
          if (Array.isArray(res.data.chartData) && res.data.chartData.length > 0) {
            setChartData(res.data.chartData);
          }
          if (res.data.currentYear) {
            setCurrentYear(res.data.currentYear);
          }
        }
      } catch (err) {
        console.error("Failed to load revenue metrics", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRevenue();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayData: MonthlyRevenueItem[] =
    chartData.length > 0
      ? chartData
      : (() => {
          const now = new Date();
          const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const fallback: MonthlyRevenueItem[] = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            fallback.push({
              month: names[d.getMonth()],
              year: d.getFullYear(),
              rawAmount: 0,
              amount: "$0",
              height: "6%",
            });
          }
          return fallback;
        })();

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Revenue Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time monthly earnings performance for {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#00B050] rounded-xl text-xs font-semibold">
            <BarChart3 className="w-4 h-4" /> Live Metrics
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-[#00B050]" />
            <span>Loading live revenue...</span>
          </div>
        </div>
      ) : (
        <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-gray-100">
          {displayData.map((item, idx) => (
            <div key={`${item.month}-${idx}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div
                style={{ height: item.height }}
                className="w-full max-w-[48px] bg-gradient-to-t from-emerald-600 to-[#00B050] group-hover:brightness-110 rounded-t-xl transition-all duration-300 cursor-pointer relative shadow-xs"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-20">
                  {item.amount}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-gray-500">{item.month}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}