"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { MapPin, Loader2, ArrowUpRight, Clock, CheckCircle2, AlertTriangle, ScanFace } from "lucide-react";
import { api } from "@/lib/api-client";

interface AttendanceRow {
  id: string;
  name: string;
  dept: string;
  punchIn: string;
  punchOut: string;
  method: string;
  status: string;
  color: string;
}

export default function LiveAttendanceTable() {
  const [logs, setLogs] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        setLoading(true);
        const res = await api.attendance.getLogs({ limit: 6 });
        
        if (res.success && Array.isArray(res.data)) {
          const mapped: AttendanceRow[] = res.data.slice(0, 6).map((l: any) => {
            const statusUpper = (l.status || "").toUpperCase();
            const isPresent = statusUpper === "PRESENT";
            const isLate = statusUpper === "LATE";
            const color = isPresent
              ? "bg-emerald-50 text-[#10b981] border-emerald-200"
              : isLate
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-rose-50 text-rose-600 border-rose-200";

            return {
              id: l.id || Math.random().toString(),
              name: l.employeeName || l.employeeId || "Staff Member",
              dept: l.department || "Operations",
              punchIn: l.checkInTime || "--",
              punchOut: l.checkOutTime || "—",
              method: l.verificationMethod === "FACE_RECOGNITION" ? "Face AI + GPS" : (l.verificationMethod || "GPS Geofence"),
              status: (l.status || "PRESENT").toLowerCase(),
              color,
            };
          });
          setLogs(mapped);
        }
      } catch (e) {
        console.error("Failed to load live attendance", e);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, []);

  useEffect(() => {
    if (!loading && tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tr");
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
        );
      }
    }
  }, [loading]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Today's Live Punch Stream</h3>
            <p className="text-xs text-neutral-500">Real-time Punch In & Punch Out stream across all branches</p>
          </div>
          <Link
            href="/organizationadmin/attendance"
            className="flex items-center gap-1 text-xs font-bold text-[#10b981] hover:text-emerald-700 transition-colors"
          >
            View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#10b981] mr-2" />
            <span className="text-xs">Streaming real-time punches...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-400 space-y-2">
            <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-1" />
            <p className="font-semibold text-neutral-700">No punches recorded for today yet</p>
            <p className="text-[11px] text-neutral-400">When employees Punch In / Out, events will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar mt-4">
            <table className="w-full min-w-[620px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Employee</th>
                  <th className="pb-3 px-3">Department</th>
                  <th className="pb-3 px-3">Punch In</th>
                  <th className="pb-3 px-3">Punch Out</th>
                  <th className="pb-3 px-3">Verification</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody ref={tableRef} className="divide-y divide-neutral-100 text-xs">
                {logs.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-neutral-900">{row.name}</div>
                    </td>
                    <td className="py-3.5 px-3 text-neutral-600 font-medium">
                      {row.dept}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                      {row.punchIn}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-neutral-600">
                      {row.punchOut}
                    </td>
                    <td className="py-3.5 px-3 text-neutral-500">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded-md text-[11px] font-medium text-neutral-700">
                        <ScanFace className="w-3 h-3 text-[#10b981]" />
                        {row.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}