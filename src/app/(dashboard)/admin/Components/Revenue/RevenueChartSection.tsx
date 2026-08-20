"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function RevenueChartSection() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dummyHeights = ["40%", "55%", "48%", "70%", "85%", "65%", "90%", "75%", "80%", "95%", "88%", "100%"];

  return (
    <div className="animate-section opacity-0 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Revenue Overview</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Monthly earnings growth performance for the year 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#10b981] rounded-xl text-xs font-semibold">
            <BarChart3 className="w-4 h-4" /> Live Metrics
          </span>
        </div>
      </div>

      {/* Simulated Chart Bars */}
      <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-neutral-100">
        {months.map((month, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <div
              style={{ height: dummyHeights[idx] }}
              className="w-full bg-emerald-100 group-hover:bg-[#10b981] rounded-t-lg transition-all duration-300 cursor-pointer relative"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {dummyHeights[idx]} Target
              </div>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">{month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}