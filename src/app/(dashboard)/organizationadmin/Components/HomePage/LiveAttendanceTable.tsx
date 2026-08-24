"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { MapPin, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

interface AttendanceRow {
  name: string;
  dept: string;
  time: string;
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
        const res = await api.attendance.getLogs({ limit: 5 });
        if (res.success && Array.isArray(res.data)) {
          const mapped: AttendanceRow[] = res.data.map((l: any) => {
            const isPresent = l.status === "PRESENT";
            const isLate = l.status === "LATE";
            const color = isPresent
              ? "bg-emerald-50 text-[#00B050]"
              : isLate
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600";

            return {
              name: l.employeeName || l.employeeId,
              dept: l.department || "General",
              time: l.checkInTime || "--",
              method: l.verificationMethod === "FACE_RECOGNITION" ? "Face + GPS" : "GPS Geofence",
              status: l.status.toLowerCase(),
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
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
      }
    }
  }, [loading, logs]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">Live Attendance</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-[#00B050] text-[10px] font-bold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B050] animate-pulse"></span> Live
          </span>
        </div>
        <a href="/organizationadmin/attendance" className="text-xs font-bold text-[#00B050] hover:underline">
          View all
        </a>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#00B050]" />
            <span>Loading live attendance...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-semibold">Employee</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Check-in</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody ref={tableRef} className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No attendance records for today yet.
                  </td>
                </tr>
              ) : (
                logs.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#00B050]/10 text-[#00B050] flex items-center justify-center font-bold text-[10px]">
                        {row.name.charAt(0)}
                      </div>
                      {row.name}
                    </td>
                    <td className="py-3 text-gray-500 font-medium">{row.dept}</td>
                    <td className="py-3 text-gray-700 font-semibold">{row.time}</td>
                    <td className="py-3 text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" /> {row.method}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}