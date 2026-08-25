"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Loader2 } from "lucide-react";

export default function PieChartSection() {
  const pieRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    late: 0,
    absent: 0,
    turnout: 0,
  });

  useEffect(() => {
    async function loadStats() {
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

        if (json.success && data.totalEmployees !== undefined) {
          const total = data.totalEmployees ?? 0;
          const present = data.todayPresent ?? 0;
          const late = data.todayLate ?? 0;
          const absent = data.todayAbsent ?? 0;
          const turnout = total > 0 ? Math.round((present / total) * 100) : 0;

          setStats({
            totalEmployees: total,
            present,
            late,
            absent,
            turnout,
          });
        }
      } catch (e) {
        console.error("Failed to load pie stats", e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  useEffect(() => {
    if (!loading && pieRef.current) {
      gsap.fromTo(
        pieRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }
      );
    }
  }, [loading]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-neutral-900">Today's Attendance Ratio</h3>
        <p className="text-xs text-neutral-500">
          {stats.totalEmployees > 0 ? `Out of ${stats.totalEmployees} registered employees` : "No employees registered"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#10b981] mr-2" />
          <span className="text-xs">Calculating ratio...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-6">
          <div
            ref={pieRef}
            className="relative w-36 h-36 rounded-full border-8 border-neutral-100 flex items-center justify-center shadow-inner"
          >
            {/* SVG Donut Circle Representation */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#10b981] transition-all duration-700 ease-out"
                strokeDasharray={`${stats.turnout}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="text-center z-10">
              <span className="text-2xl font-extrabold text-neutral-900">{stats.turnout}%</span>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Present</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5 text-xs font-semibold pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between text-neutral-600">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> On Time (Present)
          </span>
          <span className="font-bold text-neutral-900">{stats.present}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Late Arrivals
          </span>
          <span className="font-bold text-neutral-900">{stats.late}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Absent
          </span>
          <span className="font-bold text-neutral-900">{stats.absent}</span>
        </div>
      </div>
    </div>
  );
}