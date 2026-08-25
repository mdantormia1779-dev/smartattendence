"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Calendar, CheckCircle2, Clock, AlertCircle, ArrowUpRight, Loader2, Sparkles } from "lucide-react";

interface LeaveItem {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  badge: string;
}

interface HolidayItem {
  id: string;
  title: string;
  date: string;
  type: string;
}

export default function SideWidgets() {
  const widgetsRef = useRef<HTMLDivElement>(null);
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  // Fetch real leaves with zero-cache
  useEffect(() => {
    async function fetchLeaves() {
      try {
        setLoadingLeaves(true);
        const res = await fetch(`/api/leaves?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.success || Array.isArray(data)) {
          const rawList = Array.isArray(data) ? data : (data.data || []);
          const mapped: LeaveItem[] = rawList.slice(0, 3).map((l: any) => {
            const isApproved = l.status === "APPROVED";
            const isPending = l.status === "PENDING";
            const badge = isApproved
              ? "bg-emerald-50 text-[#10b981] border-emerald-200"
              : isPending
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-rose-50 text-rose-600 border-rose-200";

            return {
              id: l.id,
              name: l.employeeName || l.employee?.fullName || "Employee",
              type: `${l.type || "Casual"} Leave • ${l.days || 1}d`,
              date: l.startDate ? new Date(l.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Upcoming",
              status: (l.status || "PENDING").toLowerCase(),
              badge,
            };
          });
          setLeaves(mapped);
        }
      } catch (e) {
        console.error("Failed to load leaves for side widget", e);
      } finally {
        setLoadingLeaves(false);
      }
    }

    fetchLeaves();
  }, []);

  // Fetch real holidays with zero-cache
  useEffect(() => {
    async function fetchHolidays() {
      try {
        setLoadingHolidays(true);
        const res = await fetch(`/api/holidays?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.success || Array.isArray(data)) {
          const rawList = Array.isArray(data) ? data : (data.data || []);
          const mapped: HolidayItem[] = rawList.slice(0, 3).map((h: any) => {
            const d = h.date ? new Date(h.date) : new Date();
            const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return {
              id: h.id,
              title: h.name || h.title || "Public Holiday",
              date: dateFormatted,
              type: h.type || "National",
            };
          });
          setHolidays(mapped);
        }
      } catch (e) {
        console.error("Failed to load holidays for side widget", e);
      } finally {
        setLoadingHolidays(false);
      }
    }

    fetchHolidays();
  }, []);

  useEffect(() => {
    if (!loadingLeaves && !loadingHolidays && widgetsRef.current) {
      gsap.fromTo(
        widgetsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loadingLeaves, loadingHolidays]);

  return (
    <div ref={widgetsRef} className="space-y-6">
      {/* Leave Requests Widget */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Leave Requests</h3>
            <p className="text-xs text-neutral-500">Staff absence approvals</p>
          </div>
          <Link
            href="/organizationadmin/leaves"
            className="flex items-center gap-1 text-xs font-bold text-[#10b981] hover:text-emerald-700"
          >
            Manage <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingLeaves ? (
          <div className="py-8 flex items-center justify-center text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#10b981] mr-2" />
            <span className="text-xs">Loading requests...</span>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            <Calendar className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
            <p className="font-semibold text-neutral-700">No leave applications</p>
            <p className="text-[11px] text-neutral-400">All staff are accounted for.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="p-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{leave.name}</h4>
                  <p className="text-[11px] text-neutral-500 font-medium">{leave.type}</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{leave.date}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${leave.badge}`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Holidays Widget */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Upcoming Holidays</h3>
            <p className="text-xs text-neutral-500">Scheduled calendar breaks</p>
          </div>
          <Link
            href="/organizationadmin/holidays"
            className="flex items-center gap-1 text-xs font-bold text-[#10b981] hover:text-emerald-700"
          >
            Calendar <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingHolidays ? (
          <div className="py-8 flex items-center justify-center text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#10b981] mr-2" />
            <span className="text-xs">Loading holidays...</span>
          </div>
        ) : holidays.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            <Sparkles className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
            <p className="font-semibold text-neutral-700">No upcoming holidays scheduled</p>
            <p className="text-[11px] text-neutral-400">Add corporate or national holidays in Holiday Manager.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {holidays.map((holiday) => {
              const parts = holiday.date.split(" ");
              const month = parts[0] || "Holiday";
              const day = parts[1] || "";

              return (
                <div
                  key={holiday.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#10b981] flex flex-col items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-200/80 shadow-2xs">
                    <span className="uppercase text-[9px]">{month}</span>
                    <span className="text-xs font-extrabold">{day}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">{holiday.title}</h4>
                    <p className="text-[10px] text-neutral-400 font-medium">{holiday.type} observance</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}