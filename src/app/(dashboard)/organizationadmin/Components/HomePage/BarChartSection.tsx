"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Loader2 } from "lucide-react";

interface DayTrend {
  day: string;
  date: string;
  p: number;
  l: number;
  a: number;
}

export default function BarChartSection() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<DayTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrend() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/organization?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.success && data.weeklyTrend) {
          setWeeklyTrend(data.weeklyTrend);
        } else {
          // Generate 7 days fallback with 0s
          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const emptyTrend = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            emptyTrend.push({
              day: daysOfWeek[d.getDay()],
              date: d.toISOString().split("T")[0],
              p: 0,
              l: 0,
              a: 0,
            });
          }
          setWeeklyTrend(emptyTrend);
        }
      } catch (e) {
        console.error("Failed to load weekly trend:", e);
      } finally {
        setLoading(false);
      }
    }

    loadTrend();
  }, []);

  useEffect(() => {
    if (!loading && chartRef.current) {
      const bars = chartRef.current.querySelectorAll(".bar-item");
      if (bars.length > 0) {
        gsap.fromTo(
          bars,
          { scaleY: 0, transformOrigin: "bottom" },
          { scaleY: 1, duration: 0.6, stagger: 0.06, ease: "power2.out" }
        );
      }
    }
  }, [loading]);

  const maxVal = Math.max(
    ...weeklyTrend.map((w) => (w.p || 0) + (w.l || 0) + (w.a || 0)),
    1
  );

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Weekly Attendance Velocity</h3>
            <p className="text-xs text-neutral-500">Live attendance breakdown across last 7 calendar days</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Present
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Late
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span> Absent
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-56 flex items-center justify-center text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#10b981] mr-2" />
            <span className="text-xs">Computing attendance trend...</span>
          </div>
        ) : (
          <div ref={chartRef} className="h-56 flex items-end justify-between gap-3 md:gap-6 mt-6 px-2 border-b border-neutral-100 pb-2">
            {weeklyTrend.map((item, index) => {
              const total = (item.p || 0) + (item.l || 0) + (item.a || 0);
              const presentHeight = total > 0 ? ((item.p || 0) / maxVal) * 100 : 0;
              const lateHeight = total > 0 ? ((item.l || 0) / maxVal) * 100 : 0;
              const absentHeight = total > 0 ? ((item.a || 0) / maxVal) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg font-mono">
                    P: {item.p} | L: {item.l} | A: {item.a}
                  </div>

                  <div className="bar-item w-full max-w-[42px] bg-neutral-100/70 rounded-xl flex flex-col justify-end overflow-hidden h-44 p-0.5 space-y-0.5">
                    {absentHeight > 0 && (
                      <div style={{ height: `${Math.max(absentHeight, 4)}%` }} className="w-full bg-rose-300 rounded-sm"></div>
                    )}
                    {lateHeight > 0 && (
                      <div style={{ height: `${Math.max(lateHeight, 4)}%` }} className="w-full bg-amber-400 rounded-sm"></div>
                    )}
                    {presentHeight > 0 ? (
                      <div style={{ height: `${Math.max(presentHeight, 8)}%` }} className="w-full bg-[#10b981] rounded-md shadow-2xs"></div>
                    ) : total === 0 ? (
                      <div className="h-1.5 w-full bg-neutral-200 rounded-full mx-auto"></div>
                    ) : null}
                  </div>

                  <span className="text-[11px] font-bold text-neutral-500">{item.day}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}