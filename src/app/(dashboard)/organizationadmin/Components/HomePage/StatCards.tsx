"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Users, Building2, CalendarDays, Clock, UserX, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export default function StatCards() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalBranches: 0,
    present: 0,
    onLeave: 0,
    late: 0,
    absent: 0,
    overtimeHours: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        // Direct zero-cache request to real analytics API
        const res = await fetch(`/api/analytics/organization?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.success || data.totalEmployees !== undefined) {
          const total = data.totalEmployees ?? 0;
          const pres = data.todayPresent ?? 0;
          const rate = total > 0 ? Number(((pres / total) * 100).toFixed(1)) : 0;

          setStats({
            totalEmployees: total,
            totalBranches: data.totalBranches ?? 0,
            present: pres,
            onLeave: data.todayOnLeave ?? 0,
            late: data.todayLate ?? 0,
            absent: data.todayAbsent ?? 0,
            overtimeHours: data.overtimeHours ?? 0,
            attendanceRate: rate,
          });
        }
      } catch (e) {
        console.error("Failed to load organization dashboard stats:", e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  useEffect(() => {
    if (!loading && cardRef.current) {
      gsap.fromTo(
        cardRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs h-28 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#10b981]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={cardRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Total Workforce */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Workforce</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-neutral-900">{stats.totalEmployees}</span>
            <span className="text-xs text-neutral-400 ml-1.5 font-medium">staff</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mt-3 pt-2.5 border-t border-neutral-100">
          <span>Active directory count</span>
        </div>
      </div>

      {/* Total Branches */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Branches</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-blue-600">{stats.totalBranches}</span>
            <span className="text-xs text-neutral-400 ml-1.5 font-medium">locations</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold mt-3 pt-2.5 border-t border-neutral-100">
          <span>Geo-fenced hubs</span>
        </div>
      </div>

      {/* Present Today */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Present Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10b981] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#10b981]">{stats.present}</span>
            <span className="text-xs text-neutral-400 ml-1.5 font-medium">/ {stats.totalEmployees}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#10b981] font-semibold mt-3 pt-2.5 border-t border-neutral-100">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{stats.attendanceRate}% turnout</span>
        </div>
      </div>

      {/* Late Today */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Late Arrivals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600">{stats.late}</span>
            <span className="text-xs text-neutral-400 ml-1.5 font-medium">clocked late</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold mt-3 pt-2.5 border-t border-neutral-100">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>After shift start</span>
        </div>
      </div>

      {/* On Leave */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">On Leave</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-indigo-600">{stats.onLeave}</span>
            <span className="text-xs text-neutral-400 ml-1.5 font-medium">approved</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mt-3 pt-2.5 border-t border-neutral-100">
          <span>Official leave slips</span>
        </div>
      </div>

      {/* Absent Today */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Absent Today</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-rose-600">{stats.absent}</span>
            <span className="text-xs text-neutral-400 ml-1.5 font-medium">unexcused</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium mt-3 pt-2.5 border-t border-neutral-100">
          <span>{stats.overtimeHours}h OT logged</span>
        </div>
      </div>
    </div>
  );
}