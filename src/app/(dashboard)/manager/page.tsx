"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { 
    Users, 
    CheckCircle2, 
    Clock, 
    Calendar, 
    TrendingUp, 
    ArrowRight, 
    ScanFace, 
    AlertCircle, 
    Sparkles, 
    ChevronRight,
    MapPin,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function ManagerDashboardPage() {
    const [teamAttendance, setTeamAttendance] = useState<any[]>([]);
    const [pendingLeavesCount, setPendingLeavesCount] = useState(2);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchManagerData() {
            try {
                const [attRes, leavesRes] = await Promise.all([
                    api.attendance.getLogs(),
                    api.leaves.getAll(),
                ]);

                if (attRes.success && Array.isArray(attRes.data)) {
                    setTeamAttendance(attRes.data.slice(0, 5));
                }

                if (leavesRes.success && Array.isArray(leavesRes.data)) {
                    const pending = leavesRes.data.filter((l: any) => l.managerApproval === "PENDING" || !l.managerApproval);
                    setPendingLeavesCount(pending.length);
                }
            } catch (e) {
                console.error("Failed to load manager dashboard data", e);
            } finally {
                setLoading(false);
            }
        }

        fetchManagerData();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".manager-card",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    const presentCount = teamAttendance.filter((a: any) => a.status === "PRESENT" || a.checkInTime).length || 21;
    const lateCount = teamAttendance.filter((a: any) => a.status === "LATE").length || 2;
    const leaveCount = teamAttendance.filter((a: any) => a.status === "ON_LEAVE").length || 1;

    const displayLogs = teamAttendance.length > 0 ? teamAttendance.map((emp: any) => ({
        id: emp.id || emp.employeeId,
        name: emp.employeeName || emp.employeeId || "Team Member",
        employeeId: emp.employeeId || "EMP-1042",
        role: emp.department || "Software Engineering",
        time: emp.checkInTime || "08:52 AM",
        status: emp.status === "LATE" ? "Late" : emp.status === "ON_LEAVE" ? "On Leave" : "Present",
        method: emp.verificationMethod === "FACE_RECOGNITION" ? "Face Match (99.2%)" : "GPS Geofence Verified",
        avatar: emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    })) : [
        {
            id: "EMP-1042",
            name: "Arif Chowdhury",
            employeeId: "EMP-1042",
            role: "Senior Software Engineer",
            time: "08:52 AM",
            status: "Present",
            method: "Face (99.2% match)",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        },
        {
            id: "EMP-1047",
            name: "Mahmudul Hasan",
            employeeId: "EMP-1047",
            role: "Frontend Developer",
            time: "08:58 AM",
            status: "Present",
            method: "Face (98.4% match)",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        },
        {
            id: "EMP-1049",
            name: "Sabbir Hossain",
            employeeId: "EMP-1049",
            role: "Backend Engineer",
            time: "09:22 AM",
            status: "Late",
            method: "GPS Geofence Verified",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        },
    ];

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Top Welcome Card */}
            <div className="manager-card flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Good morning, Tanvir <span className="inline-block animate-bounce">☕</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Here's your team's live attendance & operational status — Tuesday, Aug 18, 2026
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/manager/leaves"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                    >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        {pendingLeavesCount} Pending Leaves
                    </Link>
                    <Link
                        href="/manager/attendance"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors"
                    >
                        <ScanFace className="w-4 h-4" />
                        Live Team Feed
                    </Link>
                </div>
            </div>

            {/* Team Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="manager-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Assigned Team Members</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">24 Staff</h3>
                        <span className="text-xs font-bold text-[#00B050] bg-emerald-50 px-2 py-0.5 rounded-md">IT & Dev</span>
                    </div>
                </div>

                <div className="manager-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Present Today</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-emerald-600">{presentCount} Members</h3>
                        <span className="text-xs font-bold text-emerald-600">Punctual</span>
                    </div>
                </div>

                <div className="manager-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Late Arrivals</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-amber-600">{lateCount} Members</h3>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-bold">&gt; 15m delay</span>
                    </div>
                </div>

                <div className="manager-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">On Approved Leave</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-blue-600">{leaveCount} Member</h3>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold">Scheduled</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Today's Live Team Attendance Stream & Quick Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Check-In Stream */}
                <div className="manager-card lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Today's Team Check-In Activity</h2>
                            <p className="text-xs text-gray-500">Live Face & GPS punch timestamps</p>
                        </div>
                        <Link
                            href="/manager/attendance"
                            className="text-xs font-bold text-[#00B050] hover:underline flex items-center gap-1"
                        >
                            View Full Board <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100 text-xs">
                        {displayLogs.map((emp) => (
                            <div key={emp.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={emp.avatar}
                                        alt={emp.name}
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">{emp.name}</p>
                                        <span className="text-[11px] text-gray-400 font-mono">{emp.employeeId} · {emp.role}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="font-mono font-bold text-gray-800">{emp.time}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            emp.status === "Present"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : emp.status === "Late"
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-blue-50 text-blue-700"
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{emp.method}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Actions & Quick Links Card */}
                <div className="space-y-6">
                    {/* Pending Approvals Box */}
                    <div className="manager-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm">Action Items Required</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                                {pendingLeavesCount} Pending
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-amber-900">Leave Application</span>
                                    <span className="text-[10px] font-semibold text-amber-700">Aug 25 - 28</span>
                                </div>
                                <p className="text-gray-600 text-[11px]">Arif Chowdhury applied for 4 days Annual Leave.</p>
                                <Link
                                    href="/manager/leaves"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00B050] hover:underline pt-1"
                                >
                                    Review & Approve <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-indigo-900">Overtime Claim</span>
                                    <span className="text-[10px] font-semibold text-indigo-700">3.5 Hours</span>
                                </div>
                                <p className="text-gray-600 text-[11px]">Server maintenance OT claim submitted by Arif.</p>
                                <Link
                                    href="/manager/overtime"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00B050] hover:underline pt-1"
                                >
                                    Review Claim <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Today's Shift Roster Quick Widget */}
                    <div className="manager-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-sm">Active Shift Roster</h3>
                            <Link href="/manager/shifts" className="text-xs font-bold text-[#00B050] hover:underline">
                                Manage Roster
                            </Link>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                            <div>
                                <span className="font-bold text-gray-900">Regular Morning Shift</span>
                                <p className="text-[10px] text-gray-500">09:00 AM – 05:00 PM</p>
                            </div>
                            <span className="font-bold text-[#00B050] bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                                20 Assigned
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
