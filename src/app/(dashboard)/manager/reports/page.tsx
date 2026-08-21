"use client";

import React, { useState } from "react";
import { 
    BarChart3, 
    Download, 
    Calendar, 
    Users, 
    Clock, 
    CheckCircle2, 
    TrendingUp, 
    FileText,
    FileSpreadsheet
} from "lucide-react";

export default function ManagerReportsPage() {
    const [timeRange, setTimeRange] = useState("This Month (Aug 2026)");

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-[#00B050]" />
                        Team Attendance & Performance Reports
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Punctuality metrics, average clock-in timings & leave trends for IT & Engineering Team
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => alert("Team summary PDF report generated!")}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-rose-500" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Team Punctuality Score</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-emerald-600">97.2%</h3>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">Excellent</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Avg 08:53 AM arrival</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Overtime Delivered</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-indigo-600">18.5 Hours</h3>
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">Aug 2026</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Critical releases & sprint deadlines</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Leaves Consumed</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-amber-600">6 Days</h3>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-bold">Planned</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Across 4 team members</p>
                </div>
            </div>

            {/* Performance Leaderboard Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900">Individual Attendance Performance</h3>
                <div className="divide-y divide-gray-100 text-xs">
                    {[
                        { name: "Arif Chowdhury", id: "EMP-1042", rate: "100% (22/22 days)", ot: "3.5h OT", status: "Perfect" },
                        { name: "Farhana Islam", id: "EMP-1051", rate: "97% (21/22 days)", ot: "0h OT", status: "Good" },
                        { name: "Mahmudul Hasan", id: "EMP-1047", rate: "94% (20/22 days)", ot: "2.0h OT", status: "Good" },
                        { name: "Sabbir Hossain", id: "EMP-1049", rate: "91% (19/22 days)", ot: "0h OT", status: "Average" },
                    ].map((emp) => (
                        <div key={emp.id} className="py-3 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900">{emp.name}</p>
                                <span className="text-[10px] text-gray-400 font-mono">{emp.id}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-[#00B050]">{emp.rate}</span>
                                <p className="text-[10px] text-gray-500">{emp.ot}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
