"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    BarChart3, 
    Download, 
    Calendar, 
    Filter, 
    Users, 
    Clock, 
    DollarSign, 
    Building2, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight,
    FileSpreadsheet,
    FileText,
    CheckCircle2
} from "lucide-react";

export default function OrganizationReportsPage() {
    const [reportTab, setReportTab] = useState<"attendance" | "employees" | "payroll" | "leaves">("attendance");
    const [timeRange, setTimeRange] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Monthly");
    const [selectedBranch, setSelectedBranch] = useState("All Branches");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".report-content",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [reportTab, timeRange, selectedBranch]);

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-[#00B050]" />
                        Reports & Enterprise Analytics
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Comprehensive intelligence for attendance compliance, punctuality, payroll expenditure & leave quotas
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => alert("📊 Full audit report PDF generated and downloaded!")}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-rose-500" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => alert("📈 Raw dataset Excel spreadsheet downloaded!")}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Filter & Range Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Report Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                    {[
                        { id: "attendance", label: "Attendance Reports", icon: Clock },
                        { id: "employees", label: "Employee Punctuality", icon: Users },
                        { id: "payroll", label: "Payroll Expenditure", icon: DollarSign },
                        { id: "leaves", label: "Leave Utilization", icon: Calendar },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setReportTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    reportTab === tab.id
                                        ? "bg-[#00B050] text-white shadow-xs"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Period:</span>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(["Daily", "Weekly", "Monthly", "Yearly"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                    timeRange === range
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Dynamic Report Content */}
            <div className="report-content space-y-6">
                {/* 1. Attendance Report View */}
                {reportTab === "attendance" && (
                    <div className="space-y-6">
                        {/* Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Average Attendance Rate</p>
                                <div className="flex items-baseline justify-between mt-2">
                                    <h3 className="text-2xl font-bold text-emerald-600">96.4%</h3>
                                    <span className="text-xs font-bold text-emerald-600 flex items-center">
                                        <ArrowUpRight className="w-3.5 h-3.5" /> +1.8%
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Compared to previous period</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Average Clock-In Time</p>
                                <div className="flex items-baseline justify-between mt-2">
                                    <h3 className="text-2xl font-bold text-gray-900">08:54 AM</h3>
                                    <span className="text-xs font-bold text-[#00B050] bg-emerald-50 px-2 py-0.5 rounded-md">
                                        On Time
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">6 mins before 09:00 AM shift</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Total Late Instances</p>
                                <div className="flex items-baseline justify-between mt-2">
                                    <h3 className="text-2xl font-bold text-amber-600">38 Times</h3>
                                    <span className="text-xs font-bold text-emerald-600 flex items-center">
                                        <ArrowDownRight className="w-3.5 h-3.5" /> -12%
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Reduced after grace policy</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Face & GPS Compliance</p>
                                <div className="flex items-baseline justify-between mt-2">
                                    <h3 className="text-2xl font-bold text-indigo-600">99.8%</h3>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                        Verified
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Anti-spoofing protected</p>
                            </div>
                        </div>

                        {/* Attendance Trends Chart Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Attendance Distribution Trends</h3>
                                    <p className="text-xs text-gray-500">Daily breakdown of Present, Late, and Leave counts</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-emerald-600">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Present (92%)
                                    </span>
                                    <span className="flex items-center gap-1.5 text-amber-600">
                                        <span className="w-3 h-3 rounded-full bg-amber-500"></span> Late (5%)
                                    </span>
                                    <span className="flex items-center gap-1.5 text-rose-600">
                                        <span className="w-3 h-3 rounded-full bg-rose-500"></span> Absent (3%)
                                    </span>
                                </div>
                            </div>

                            {/* Visual Simulated Bar Chart */}
                            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                                {[
                                    { day: "Aug 01", present: 95, late: 3, absent: 2 },
                                    { day: "Aug 04", present: 92, late: 5, absent: 3 },
                                    { day: "Aug 07", present: 98, late: 1, absent: 1 },
                                    { day: "Aug 10", present: 94, late: 4, absent: 2 },
                                    { day: "Aug 13", present: 91, late: 6, absent: 3 },
                                    { day: "Aug 16", present: 96, late: 2, absent: 2 },
                                    { day: "Aug 18", present: 97, late: 2, absent: 1 },
                                ].map((item) => (
                                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full max-w-[48px] bg-gray-100 rounded-xl overflow-hidden flex flex-col-reverse h-36">
                                            <div style={{ height: `${item.present}%` }} className="bg-[#00B050] transition-all group-hover:bg-[#009b46]" />
                                            <div style={{ height: `${item.late}%` }} className="bg-amber-400" />
                                            <div style={{ height: `${item.absent}%` }} className="bg-rose-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 font-mono">{item.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Employee Punctuality Report */}
                {reportTab === "employees" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Employee Punctuality & Performance Leaderboard</h3>
                                <p className="text-xs text-gray-500">Top punctual employees & frequent late arrival statistics</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Punctual Heroes */}
                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Top 100% Punctual Stars
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { name: "Arif Chowdhury", id: "EMP-1042", dept: "IT", score: "100% (22/22 days)" },
                                        { name: "Nusrat Jahan", id: "EMP-1043", dept: "Accounts", score: "100% (22/22 days)" },
                                        { name: "Sabrina Noor", id: "EMP-1045", dept: "HR", score: "98% (21/22 days)" },
                                    ].map((emp) => (
                                        <div key={emp.id} className="p-2.5 bg-white rounded-xl flex items-center justify-between text-xs">
                                            <div>
                                                <p className="font-bold text-gray-900">{emp.name}</p>
                                                <span className="text-[10px] text-gray-400 font-mono">{emp.id} · {emp.dept}</span>
                                            </div>
                                            <span className="text-xs font-bold text-[#00B050]">{emp.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Frequent Lates Alert */}
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
                                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    Late Instances Watchlist
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { name: "Tanvir Ahmed", id: "EMP-1044", dept: "Marketing", lates: "4 times", avgDelay: "+24 mins" },
                                        { name: "Mahmudul Hasan", id: "EMP-1047", dept: "IT", lates: "3 times", avgDelay: "+18 mins" },
                                    ].map((emp) => (
                                        <div key={emp.id} className="p-2.5 bg-white rounded-xl flex items-center justify-between text-xs">
                                            <div>
                                                <p className="font-bold text-gray-900">{emp.name}</p>
                                                <span className="text-[10px] text-gray-400 font-mono">{emp.id} · {emp.dept}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-amber-600">{emp.lates}</span>
                                                <p className="text-[10px] text-gray-400 font-mono">avg {emp.avgDelay}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Payroll Expenditure Report */}
                {reportTab === "payroll" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Monthly Payroll Expenditure Breakdown</h3>
                                <p className="text-xs text-gray-500">Distribution of Basic Salaries, Overtime, and Allowances</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs font-semibold text-gray-500">Total Basic Base Pay</span>
                                <h4 className="text-xl font-bold text-gray-900 mt-1 font-mono">৳212,000.00</h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">Fixed monthly liability</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs font-semibold text-gray-500">Total Allowances</span>
                                <h4 className="text-xl font-bold text-indigo-600 mt-1 font-mono">৳138,000.00</h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">House, Medical, Transport, Food</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs font-semibold text-gray-500">Total Overtime Disbursed</span>
                                <h4 className="text-xl font-bold text-[#00B050] mt-1 font-mono">৳8,429.68</h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">Formula multiplier payout</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Leave Utilization Report */}
                {reportTab === "leaves" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Leave Quota Consumption by Department</h3>
                                <p className="text-xs text-gray-500">Analysis of Casual, Sick, and Annual leave claims</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-4 border border-gray-100 rounded-2xl space-y-2">
                                <span className="font-bold text-gray-800">IT Department</span>
                                <div className="space-y-1 text-gray-600">
                                    <div className="flex justify-between"><span>Casual Leaves:</span> <span className="font-bold">4 / 10 used</span></div>
                                    <div className="flex justify-between"><span>Sick Leaves:</span> <span className="font-bold">2 / 14 used</span></div>
                                    <div className="flex justify-between"><span>Annual Leaves:</span> <span className="font-bold">8 / 20 used</span></div>
                                </div>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-2xl space-y-2">
                                <span className="font-bold text-gray-800">Accounts & Finance</span>
                                <div className="space-y-1 text-gray-600">
                                    <div className="flex justify-between"><span>Casual Leaves:</span> <span className="font-bold">2 / 10 used</span></div>
                                    <div className="flex justify-between"><span>Sick Leaves:</span> <span className="font-bold">3 / 14 used</span></div>
                                    <div className="flex justify-between"><span>Annual Leaves:</span> <span className="font-bold">0 / 20 used</span></div>
                                </div>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-2xl space-y-2">
                                <span className="font-bold text-gray-800">Marketing & Sales</span>
                                <div className="space-y-1 text-gray-600">
                                    <div className="flex justify-between"><span>Casual Leaves:</span> <span className="font-bold">5 / 10 used</span></div>
                                    <div className="flex justify-between"><span>Sick Leaves:</span> <span className="font-bold">1 / 14 used</span></div>
                                    <div className="flex justify-between"><span>Annual Leaves:</span> <span className="font-bold">2 / 20 used</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
