"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { 
    Clock, 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    DollarSign, 
    ScanFace, 
    MapPin, 
    ArrowRight, 
    Bell, 
    Sparkles, 
    FileText,
    CalendarCheck,
    Building2,
    ShieldCheck
} from "lucide-react";

export default function EmployeeDashboardPage() {
    const [currentTime, setCurrentTime] = useState<string>("");
    const [currentDate, setCurrentDate] = useState<string>("");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".emp-card",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Top Smart Clock-In Card */}
            <div className="emp-card bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-[#00B050]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00B050]/20 text-[#00B050] border border-[#00B050]/30">
                            <span className="w-2 h-2 rounded-full bg-[#00B050] animate-ping" />
                            Live Attendance Ready
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-mono text-white">
                            {currentTime || "08:52:14 AM"}
                        </h1>
                        <p className="text-xs text-gray-400">
                            {currentDate || "Tuesday, August 18, 2026"} · Head Office – Dhaka
                        </p>
                    </div>

                    {/* Clock In / Out Action Widget */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-left">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Today's Shift</span>
                            <p className="text-sm font-bold text-white mt-0.5">09:00 AM – 05:00 PM</p>
                            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Checked In at 08:52 AM
                            </p>
                        </div>

                        <Link
                            href="/employee/checkin"
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#00B050] hover:bg-[#009b46] text-white font-bold text-sm shadow-lg shadow-[#00B050]/30 transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                        >
                            <ScanFace className="w-5 h-5" />
                            Open AI Punch Screen
                        </Link>
                    </div>
                </div>
            </div>

            {/* Monthly Attendance KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="emp-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Present Days (Aug)</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-emerald-600">14 Days</h3>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">100%</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">0 Absent recorded</p>
                </div>

                <div className="emp-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Late Arrivals</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">0 Times</h3>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">Perfect</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Within 15m grace period</p>
                </div>

                <div className="emp-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Leave Balance</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-blue-600">38 Days</h3>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold">Available</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Casual (6), Sick (12), Annual (20)</p>
                </div>

                <div className="emp-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Approved Overtime</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-indigo-600">3.5 Hours</h3>
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">+৳3,117</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Added to next payslip</p>
                </div>
            </div>

            {/* Quick Actions & Recent Payslip Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Attendance Activity */}
                <div className="emp-card lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Recent Attendance Logs</h2>
                            <p className="text-xs text-gray-500">Your verified clock-in & clock-out timestamps</p>
                        </div>
                        <Link href="/employee/attendance" className="text-xs font-bold text-[#00B050] hover:underline flex items-center gap-1">
                            View Calendar <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100 text-xs">
                        {[
                            { date: "Today (Aug 18, 2026)", in: "08:52 AM", out: "--:--", hours: "Working...", status: "Present", score: "99.2% Face" },
                            { date: "Yesterday (Aug 17, 2026)", in: "08:55 AM", out: "05:14 PM", hours: "8h 19m", status: "Present", score: "98.8% Face" },
                            { date: "Sunday (Aug 16, 2026)", in: "08:48 AM", out: "08:48 PM", hours: "12h 00m (3.5h OT)", status: "Present", score: "99.0% Face" },
                            { date: "Thursday (Aug 13, 2026)", in: "08:59 AM", out: "05:05 PM", hours: "8h 06m", status: "Present", score: "98.5% Face" },
                        ].map((row, i) => (
                            <div key={i} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">{row.date}</p>
                                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                        In: <span className="text-[#00B050] font-semibold">{row.in}</span> · Out: {row.out}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                        {row.status}
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{row.hours} · {row.score}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Quick Links & Payslip Snippet */}
                <div className="space-y-6">
                    {/* Latest Payslip Quick Box */}
                    <div className="emp-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Latest Payslip</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Disbursed</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">July 2026 Net Salary</span>
                            <h3 className="text-2xl font-bold text-gray-900 font-mono mt-0.5">৳87,617.18</h3>
                        </div>
                        <Link
                            href="/employee/salary"
                            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <FileText className="w-4 h-4 text-[#00B050]" />
                            View Detailed Breakdown
                        </Link>
                    </div>

                    {/* Quick Leave Application Link */}
                    <div className="emp-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6 space-y-3">
                        <h3 className="font-bold text-gray-900 text-sm">Need Time Off?</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Apply for Casual, Sick, or Annual vacation leaves directly with automated manager routing.
                        </p>
                        <Link
                            href="/employee/leaves"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-sm transition-transform hover:scale-105"
                        >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Apply for Leave
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
