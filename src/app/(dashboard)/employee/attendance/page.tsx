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
    ChevronRight
} from "lucide-react";

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

const augustLogs: AttendanceEntry[] = [
    { date: "Aug 18, 2026", day: "Tue", checkIn: "08:52 AM", checkOut: "--:--", workHours: "In Progress", overtime: "0h", status: "Present", verification: "Face (99.2%) + GPS" },
    { date: "Aug 17, 2026", day: "Mon", checkIn: "08:55 AM", checkOut: "05:14 PM", workHours: "8h 19m", overtime: "0h", status: "Present", verification: "Face (98.8%) + GPS" },
    { date: "Aug 16, 2026", day: "Sun", checkIn: "08:48 AM", checkOut: "08:48 PM", workHours: "12h 00m", overtime: "3.5h", status: "Present", verification: "Face (99.0%) + GPS" },
    { date: "Aug 15, 2026", day: "Sat", checkIn: "-", checkOut: "-", workHours: "-", overtime: "0h", status: "Holiday", verification: "National Mourning Day" },
    { date: "Aug 14, 2026", day: "Fri", checkIn: "-", checkOut: "-", workHours: "-", overtime: "0h", status: "Weekend", verification: "Weekly Off" },
    { date: "Aug 13, 2026", day: "Thu", checkIn: "08:59 AM", checkOut: "05:05 PM", workHours: "8h 06m", overtime: "0h", status: "Present", verification: "Face (98.5%) + GPS" },
    { date: "Aug 12, 2026", day: "Wed", checkIn: "08:50 AM", checkOut: "05:10 PM", workHours: "8h 20m", overtime: "0h", status: "Present", verification: "Face (99.4%) + GPS" },
    { date: "Aug 11, 2026", day: "Tue", checkIn: "08:54 AM", checkOut: "05:02 PM", workHours: "8h 08m", overtime: "0h", status: "Present", verification: "Face (98.9%) + GPS" },
    { date: "Aug 10, 2026", day: "Mon", checkIn: "08:51 AM", checkOut: "05:15 PM", workHours: "8h 24m", overtime: "0h", status: "Present", verification: "Face (99.1%) + GPS" },
];

export default function EmployeeAttendancePage() {
    const [selectedMonth, setSelectedMonth] = useState("August 2026");

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
                        <option value="August 2026">August 2026</option>
                        <option value="July 2026">July 2026</option>
                        <option value="June 2026">June 2026</option>
                    </select>

                    <button
                        onClick={() => alert("Personal monthly attendance sheet exported!")}
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
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">14 / 14 Days</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">100% Punctuality</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Late Arrivals</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">0 Times</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">No salary deductions</p>
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

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Clock In</th>
                                <th className="py-4 px-6">Clock Out</th>
                                <th className="py-4 px-6">Total Hours</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6">Verification Method</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {augustLogs.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-gray-900 text-xs">{item.date}</p>
                                        <span className="text-[11px] text-gray-400 font-semibold">{item.day}</span>
                                    </td>

                                    <td className="py-4 px-6 font-mono text-xs font-semibold text-[#00B050]">
                                        {item.checkIn}
                                    </td>

                                    <td className="py-4 px-6 font-mono text-xs text-gray-700">
                                        {item.checkOut}
                                    </td>

                                    <td className="py-4 px-6 font-mono text-xs font-bold text-gray-800">
                                        {item.workHours}
                                        {item.overtime !== "0h" && (
                                            <span className="ml-1.5 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                                +{item.overtime} OT
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                            item.status === "Present"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : item.status === "Holiday"
                                                ? "bg-pink-50 text-pink-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}>
                                            {item.status === "Present" && <CheckCircle2 className="w-3 h-3" />}
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-xs text-gray-500">
                                        {item.verification}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
