"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Calendar as CalendarIcon, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Download, 
    Filter, 
    ScanFace, 
    MapPin,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

interface AttendanceEntry {
    date: string;
    day: string;
    checkIn: string;
    checkOut: string;
    workHours: string;
    overtime: string;
    status: "Present" | "Late" | "Weekend" | "Holiday" | "Leave";
    verification: string;
}

export default function EmployeeAttendancePage() {
    const [selectedMonth, setSelectedMonth] = useState("2026-08");
    const [logs, setLogs] = useState<AttendanceEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.attendance.getLogs({ employeeId: "EMP-1042" });
            if (res.success && Array.isArray(res.data)) {
                const mapped: AttendanceEntry[] = res.data.map((item: any) => {
                    const dt = new Date(item.date || Date.now());
                    const dayName = dt.toLocaleDateString("en-US", { weekday: "short" });
                    let formattedStatus: AttendanceEntry["status"] = "Present";
                    if (item.status === "LATE") formattedStatus = "Late";
                    else if (item.status === "ON_LEAVE") formattedStatus = "Leave";

                    return {
                        date: item.date,
                        day: dayName,
                        checkIn: item.checkInTime || "--:--",
                        checkOut: item.checkOutTime || "--:--",
                        workHours: item.workingHours ? `${item.workingHours}h` : "8h 15m",
                        overtime: item.overtimeHours ? `${item.overtimeHours}h` : "0h",
                        status: formattedStatus,
                        verification: item.verificationMethod === "FACE_RECOGNITION" ? "Face + GPS" : "GPS Geofence",
                    };
                });
                setLogs(mapped);
            }
        } catch (e) {
            console.error("Failed to load employee attendance logs", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [selectedMonth]);

    const presentCount = logs.filter(l => l.status === "Present").length;
    const lateCount = logs.filter(l => l.status === "Late").length;

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-[#00B050]" />
                        My Attendance History & Timesheet
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Monthly calendar, punch times, worked hours, and verification audit logs
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
                    >
                        <option value="2026-08">August 2026</option>
                        <option value="2026-07">July 2026</option>
                        <option value="2026-06">June 2026</option>
                    </select>

                    <button
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8," + 
                                ["Date,Day,CheckIn,CheckOut,WorkHours,Status", ...logs.map(l => `${l.date},${l.day},${l.checkIn},${l.checkOut},${l.workHours},${l.status}`)].join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `my_attendance_${selectedMonth}.csv`);
                            document.body.appendChild(link);
                            link.click();
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Present Days</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">{presentCount} Days</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Tracked attendance</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Late Arrivals</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{lateCount} Times</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Grace period active</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Worked Time</p>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-1">115.5 Hours</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Avg 8.25 hrs / day</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Overtime Accumulated</p>
                    <h3 className="text-2xl font-bold text-[#00B050] mt-1">3.5 Hours</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Eligible for 1.5x OT rate</p>
                </div>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading your monthly attendance...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold uppercase">
                                <tr>
                                    <th className="px-6 py-4">Date & Day</th>
                                    <th className="px-6 py-4">Check-In</th>
                                    <th className="px-6 py-4">Check-Out</th>
                                    <th className="px-6 py-4">Work Duration</th>
                                    <th className="px-6 py-4">Overtime</th>
                                    <th className="px-6 py-4">Verification</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No attendance records found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900">{row.date}</span>
                                                <span className="ml-2 text-gray-400">({row.day})</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{row.checkIn}</td>
                                            <td className="px-6 py-4 text-gray-600">{row.checkOut}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-700">{row.workHours}</td>
                                            <td className="px-6 py-4 text-[#00B050] font-bold">{row.overtime}</td>
                                            <td className="px-6 py-4 text-gray-500 flex items-center gap-1.5">
                                                <ScanFace className="w-3.5 h-3.5 text-gray-400" />
                                                {row.verification}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {row.status === "Present" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                                        <CheckCircle2 className="w-3 h-3" /> Present
                                                    </span>
                                                )}
                                                {row.status === "Late" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                                                        <Clock className="w-3 h-3" /> Late
                                                    </span>
                                                )}
                                                {row.status === "Leave" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                                                        Leave
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
