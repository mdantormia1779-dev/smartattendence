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
    Loader2,
    Briefcase,
    Building2,
    ShieldCheck,
    RefreshCw,
    UserCheck,
    UserX,
    CheckCircle
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatAttendanceTime } from "@/lib/datetime";

interface ActivityLog {
    id: string;
    name: string;
    employeeId: string;
    role: string;
    time: string;
    status: "Present" | "Late" | "On Leave" | "Absent" | "Half Day";
    method: string;
    avatar: string | null;
}

export default function ManagerDashboardPage() {
    // Manager Profile
    const [managerName, setManagerName] = useState("Manager");
    const [deptName, setDeptName] = useState("All Departments");
    const [branchName, setBranchName] = useState("Main Branch");

    // 100% Real API Metrics
    const [teamMembersCount, setTeamMembersCount] = useState<number>(0);
    const [presentCount, setPresentCount] = useState<number>(0);
    const [lateCount, setLateCount] = useState<number>(0);
    const [leaveCount, setLeaveCount] = useState<number>(0);
    
    // Live Streams & Pending Action Lists
    const [displayLogs, setDisplayLogs] = useState<ActivityLog[]>([]);
    const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
    const [pendingOvertimes, setPendingOvertimes] = useState<any[]>([]);
    const [activeShift, setActiveShift] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch Full Real Data from Backend APIs
    const fetchManagerDashboardData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // 1. Resolve logged-in manager details from session & DB
            let currentUserId = "";
            let currentOrgId = "";
            let managerDeptId = "";
            let managerBranchId = "";

            if (typeof window !== "undefined") {
                const rawUser = localStorage.getItem("user") || localStorage.getItem("user_info") || localStorage.getItem("userData");
                if (rawUser) {
                    try {
                        const parsed = JSON.parse(rawUser);
                        if (parsed.id || parsed.userId) currentUserId = parsed.id || parsed.userId;
                        if (parsed.organizationId) currentOrgId = parsed.organizationId;
                        if (parsed.name || parsed.fullName) setManagerName(parsed.name || parsed.fullName);
                        if (parsed.department || parsed.departmentName) setDeptName(parsed.department || parsed.departmentName);
                        if (parsed.branch || parsed.branchName) setBranchName(parsed.branch || parsed.branchName);
                        if (parsed.departmentId) managerDeptId = parsed.departmentId;
                        if (parsed.branchId) managerBranchId = parsed.branchId;
                    } catch {}
                }
            }

            // 2. Fetch all real domain data in parallel
            const [
                employeesRes,
                attendanceRes,
                leavesRes,
                overtimeRes,
                shiftsRes
            ] = await Promise.allSettled([
                api.employees.getAll(),
                api.attendance.getLogs(),
                api.leaves.getAll(),
                api.overtime.getAll(),
                api.shifts.getAll()
            ]);

            // Filter Team Employees
            let teamEmployees: any[] = [];
            if (employeesRes.status === "fulfilled" && employeesRes.value?.success && Array.isArray(employeesRes.value.data)) {
                teamEmployees = employeesRes.value.data;
                if (managerDeptId) {
                    const scoped = teamEmployees.filter((e) => e.departmentId === managerDeptId || e.department === deptName);
                    if (scoped.length > 0) teamEmployees = scoped;
                }
                setTeamMembersCount(teamEmployees.length);
                if (teamEmployees.length > 0 && teamEmployees[0].department && deptName === "All Departments") {
                    setDeptName(teamEmployees[0].department);
                }
            } else {
                setTeamMembersCount(0);
            }

            // Real Attendance Logs & Metrics
            if (attendanceRes.status === "fulfilled" && attendanceRes.value?.success && Array.isArray(attendanceRes.value.data)) {
                const allLogs = attendanceRes.value.data;
                
                // Count Today's Status
                const presents = allLogs.filter((a: any) => a.status === "PRESENT" && a.checkInTime);
                const lates = allLogs.filter((a: any) => a.status === "LATE");
                const onLeaves = allLogs.filter((a: any) => a.status === "ON_LEAVE");

                setPresentCount(presents.length);
                setLateCount(lates.length);
                setLeaveCount(onLeaves.length);

                // Format Only Active / Checked-in Activity
                const activePunches = allLogs.filter((log: any) => log.checkInTime || log.status === "PRESENT" || log.status === "LATE");

                const formatted: ActivityLog[] = activePunches.slice(0, 10).map((log: any) => {
                    const formattedTime = log.checkInTime ? formatAttendanceTime(log.checkInTime) : "—";

                    let methodText = "Verified";
                    if (log.verificationMethod === "FACE_RECOGNITION") methodText = "Face AI Biometric";
                    else if (log.verificationMethod === "GPS_GEOFENCE" || log.isGeofenceVerified) methodText = "GPS Geofence Verified";
                    else if (log.verificationMethod === "BIOMETRIC_DEVICE") methodText = "Biometric Machine";
                    else if (log.verificationMethod === "MANUAL_OVERRIDE") methodText = "Manual Entry";

                    let statusMapped: ActivityLog["status"] = "Present";
                    if (log.status === "LATE") statusMapped = "Late";
                    else if (log.status === "ON_LEAVE") statusMapped = "On Leave";
                    else if (log.status === "HALF_DAY") statusMapped = "Half Day";
                    else if (log.status === "ABSENT") statusMapped = "Absent";

                    return {
                        id: log.id,
                        name: log.employeeName || log.employeeId || "Staff Member",
                        employeeId: log.employeeId || "EMP",
                        role: log.department || deptName || "General",
                        time: formattedTime,
                        status: statusMapped,
                        method: methodText,
                        avatar: log.avatar || null,
                    };
                });

                setDisplayLogs(formatted);
            } else {
                setPresentCount(0);
                setLateCount(0);
                setLeaveCount(0);
                setDisplayLogs([]);
            }

            // Real Pending Leaves
            if (leavesRes.status === "fulfilled" && leavesRes.value?.success && Array.isArray(leavesRes.value.data)) {
                const pending = leavesRes.value.data.filter((l: any) => 
                    l.status === "PENDING" || l.managerApproval === "PENDING" || (l.managerStatus && l.managerStatus.includes("Pending"))
                );
                setPendingLeaves(pending);
            } else {
                setPendingLeaves([]);
            }

            // Real Pending Overtime Claims
            if (overtimeRes.status === "fulfilled" && overtimeRes.value?.success && Array.isArray(overtimeRes.value.data)) {
                const pendingOt = overtimeRes.value.data.filter((o: any) => 
                    o.status === "PENDING" || o.managerApproval === "PENDING_MANAGER" || (o.managerStatus && o.managerStatus.includes("Pending"))
                );
                setPendingOvertimes(pendingOt);
            } else {
                setPendingOvertimes([]);
            }

            // Real Active Shifts
            if (shiftsRes.status === "fulfilled" && shiftsRes.value?.success && Array.isArray(shiftsRes.value.data)) {
                if (shiftsRes.value.data.length > 0) {
                    const s = shiftsRes.value.data[0];
                    setActiveShift({
                        name: s.name || "Default Shift",
                        timing: `${s.startTime || "09:00 AM"} – ${s.endTime || "05:00 PM"}`,
                        assignedCount: s.activeEmployees || s.assignedCount || teamEmployees.length,
                    });
                } else {
                    setActiveShift(null);
                }
            } else {
                setActiveShift(null);
            }
        } catch (e) {
            console.error("Failed to load manager dashboard data:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchManagerDashboardData();
    }, []);

    // GSAP Animation Context on load
    useEffect(() => {
        if (!loading && containerRef.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".manager-card",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const getInitials = (name: string) => {
        if (!name) return "EM";
        const parts = name.trim().split(" ").filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const todayDateFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    if (loading) {
        return (
            <div className="flex-1 bg-[#FBFBFA] flex items-center justify-center min-h-[70vh]">
                <div className="flex flex-col items-center gap-3 text-neutral-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050]" />
                    <p className="text-xs font-semibold">Loading Live Team Operations...</p>
                </div>
            </div>
        );
    }

    const firstPendingLeave = pendingLeaves.length > 0 ? pendingLeaves[0] : null;
    const firstPendingOt = pendingOvertimes.length > 0 ? pendingOvertimes[0] : null;

    return (
        <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-neutral-800">
            {/* Top Welcome Card */}
            <div className="manager-card flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        {getGreeting()}, {managerName} <span className="inline-block animate-bounce">☕</span>
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Live attendance & operational status — {todayDateFormatted}</span>
                        <span className="text-neutral-300">|</span>
                        <span className="font-semibold text-[#00B050]">{branchName}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={() => fetchManagerDashboardData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh live metrics from database"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <Link
                        href="/manager/leaves"
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                    >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        {pendingLeaves.length} Pending Leaves
                    </Link>

                    <Link
                        href="/manager/attendance"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors"
                    >
                        <ScanFace className="w-4 h-4" />
                        Live Team Feed
                    </Link>
                </div>
            </div>

            {/* Real Team Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Team */}
                <div className="manager-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Assigned Team Members</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-black text-neutral-900 font-mono">{teamMembersCount} Staff</h3>
                        <span className="text-xs font-bold text-[#00B050] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 truncate max-w-[120px]">
                            {deptName}
                        </span>
                    </div>
                </div>

                {/* Present Today */}
                <div className="manager-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Present Today</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-black text-emerald-600 font-mono">{presentCount} Members</h3>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">Punctual</span>
                    </div>
                </div>

                {/* Late Arrivals */}
                <div className="manager-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Late Arrivals</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-black text-amber-600 font-mono">{lateCount} Members</h3>
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg font-bold">Shift Delay</span>
                    </div>
                </div>

                {/* On Approved Leave */}
                <div className="manager-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">On Approved Leave</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-black text-blue-600 font-mono">{leaveCount} Members</h3>
                        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg font-bold">Scheduled</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Today's Live Team Attendance Stream & Quick Action Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Check-In Stream */}
                <div className="manager-card lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Today's Team Check-In Activity</h2>
                            <p className="text-xs text-neutral-500">Live AI Face & GPS punch verification stream</p>
                        </div>
                        <Link
                            href="/manager/attendance"
                            className="text-xs font-bold text-[#00B050] hover:underline flex items-center gap-1"
                        >
                            View Full Board <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-neutral-100 text-xs">
                        {displayLogs.length === 0 ? (
                            <div className="py-12 text-center text-neutral-400 space-y-2">
                                <Clock className="w-10 h-10 mx-auto text-neutral-300" />
                                <p className="font-semibold text-neutral-600">No Check-in Activity Today Yet</p>
                                <p className="text-[11px] text-neutral-400">Team check-in logs will appear here live as employees punch in.</p>
                            </div>
                        ) : (
                            displayLogs.map((emp) => (
                                <div key={emp.id} className="py-3 flex items-center justify-between hover:bg-neutral-50/60 px-2 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        {emp.avatar ? (
                                            <img
                                                src={emp.avatar}
                                                alt={emp.name}
                                                className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100"
                                                onError={(e: any) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                                {getInitials(emp.name)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-neutral-900">{emp.name}</p>
                                            <span className="text-[11px] text-neutral-400 font-mono">{emp.employeeId} · {emp.role}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className="font-mono font-bold text-neutral-800">{emp.time}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                emp.status === "Present"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : emp.status === "Late"
                                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                    : emp.status === "Half Day"
                                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                            }`}>
                                                {emp.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">{emp.method}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Actions & Quick Links Card */}
                <div className="space-y-6">
                    {/* Pending Approvals Box */}
                    <div className="manager-card bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <h3 className="font-bold text-neutral-900 text-sm">Action Items Required</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {pendingLeaves.length + pendingOvertimes.length} Total Pending
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            {/* Leave Application Preview */}
                            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-amber-900">Leave Applications</span>
                                    <span className="text-[10px] font-semibold text-amber-700">
                                        {pendingLeaves.length} Pending
                                    </span>
                                </div>
                                <p className="text-neutral-600 text-[11px]">
                                    {firstPendingLeave
                                        ? `${firstPendingLeave.employeeName || "Staff"} applied for ${firstPendingLeave.type || firstPendingLeave.leaveType || "Leave"} (${firstPendingLeave.totalDays || 1} day${(firstPendingLeave.totalDays || 1) > 1 ? "s" : ""}).`
                                        : pendingLeaves.length === 0
                                        ? "All caught up. No pending leave requests."
                                        : "Review and approve pending team leave requests."}
                                </p>
                                <Link
                                    href="/manager/leaves"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00B050] hover:underline pt-1"
                                >
                                    Review & Approve Leaves <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Overtime Claim Preview */}
                            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/80 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-indigo-900">Overtime Claims</span>
                                    <span className="text-[10px] font-semibold text-indigo-700">
                                        {pendingOvertimes.length} Pending
                                    </span>
                                </div>
                                <p className="text-neutral-600 text-[11px]">
                                    {firstPendingOt
                                        ? `${firstPendingOt.employeeName || "Staff"} submitted ${firstPendingOt.claimedHours || (firstPendingOt.minutes ? (firstPendingOt.minutes / 60).toFixed(1) : "0")}h OT claim.`
                                        : pendingOvertimes.length === 0
                                        ? "All caught up. No pending overtime claims."
                                        : "Review extra shift & overtime hour submissions."}
                                </p>
                                <Link
                                    href="/manager/overtime"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00B050] hover:underline pt-1"
                                >
                                    Review Overtime Claims <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Today's Shift Roster Quick Widget */}
                    <div className="manager-card bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-neutral-900 text-sm">Active Shift Roster</h3>
                            <Link href="/manager/shifts" className="text-xs font-bold text-[#00B050] hover:underline">
                                Manage Roster
                            </Link>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between text-xs border border-neutral-100">
                            <div>
                                <span className="font-bold text-neutral-900">{activeShift?.name || "Standard Branch Shift"}</span>
                                <p className="text-[10px] text-neutral-500">{activeShift?.timing || "09:00 AM – 05:00 PM"}</p>
                            </div>
                            <span className="font-bold text-[#00B050] bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                                {activeShift?.assignedCount ?? teamMembersCount} Assigned
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
