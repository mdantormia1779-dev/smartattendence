"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    BarChart3, 
    FileSpreadsheet, 
    Printer, 
    Calendar, 
    Users, 
    Clock, 
    CheckCircle2, 
    TrendingUp, 
    FileText, 
    Loader2,
    RefreshCw,
    Search,
    X,
    Sparkles,
    UserCheck,
    AlertCircle,
    Building2,
    ArrowUpRight,
    Award
} from "lucide-react";
import { api } from "@/lib/api-client";

interface EmployeePerformance {
    id: string;
    name: string;
    code: string;
    avatar: string | null;
    designation: string;
    department: string;
    totalDaysPresent: number;
    totalDaysLate: number;
    totalDaysAbsent: number;
    overtimeHours: number;
    leavesConsumed: number;
    punctualityRate: number; // percentage
    performanceRating: "Top Performer" | "Good Standing" | "Needs Attention";
}

export default function ManagerReportsPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("ALL");
    const [managerName, setManagerName] = useState("Operations Manager");
    const [deptName, setDeptName] = useState("Operations");
    const [branchName, setBranchName] = useState("Main Branch");
    const [companyName, setCompanyName] = useState("Smart Attendance System");

    const [summaryStats, setSummaryStats] = useState({
        totalStaff: 0,
        punctualityScore: "100%",
        totalOvertimeHours: "0.0h",
        leavesConsumed: "0 Days",
        avgDailyPresent: "0",
    });

    const [leaderboard, setLeaderboard] = useState<EmployeePerformance[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchReports = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            // Load manager info from session
            if (typeof window !== "undefined") {
                const rawUser = localStorage.getItem("user");
                if (rawUser) {
                    try {
                        const parsed = JSON.parse(rawUser);
                        if (parsed.name || parsed.fullName) setManagerName(parsed.name || parsed.fullName);
                        if (parsed.department || parsed.departmentName) setDeptName(parsed.department || parsed.departmentName);
                        if (parsed.branch || parsed.branchName) setBranchName(parsed.branch || parsed.branchName);
                        if (parsed.companyName || parsed.organizationName) setCompanyName(parsed.companyName || parsed.organizationName);
                    } catch {}
                }
            }

            const [attRes, empRes, leavesRes, otRes] = await Promise.allSettled([
                api.attendance.getLogs(),
                api.employees.getAll(),
                api.leaves.getAll(),
                api.overtime.getAll(),
            ]);

            // 1. Raw Employees
            let rawEmployees: any[] = [];
            if (empRes.status === "fulfilled" && empRes.value?.success) {
                if (Array.isArray(empRes.value.data)) {
                    rawEmployees = empRes.value.data;
                } else if (empRes.value.data && Array.isArray(empRes.value.data.items)) {
                    rawEmployees = empRes.value.data.items;
                } else if (Array.isArray((empRes.value as any).items)) {
                    rawEmployees = (empRes.value as any).items;
                }
            }

            // 2. Attendance Logs
            let attendanceLogs: any[] = [];
            if (attRes.status === "fulfilled" && attRes.value?.success && Array.isArray(attRes.value.data)) {
                attendanceLogs = attRes.value.data;
            }

            // 3. Approved Leaves
            let approvedLeaves: any[] = [];
            if (leavesRes.status === "fulfilled" && leavesRes.value?.success && Array.isArray(leavesRes.value.data)) {
                approvedLeaves = leavesRes.value.data.filter((l: any) => 
                    l.status === "APPROVED" || l.managerApproval === "APPROVED" || l.adminApproval === "APPROVED"
                );
            }

            // 4. Approved Overtime
            let approvedOT: any[] = [];
            if (otRes.status === "fulfilled" && otRes.value?.success && Array.isArray(otRes.value.data)) {
                approvedOT = otRes.value.data.filter((o: any) => 
                    o.status === "APPROVED" || o.managerApproval === "APPROVED" || o.adminApproval === "APPROVED"
                );
            }

            // Global Metrics
            let totalOTHours = 0;
            approvedOT.forEach((o: any) => {
                totalOTHours += Number(o.hours || o.claimedHours || 0);
            });

            let totalLeaveDays = 0;
            approvedLeaves.forEach((l: any) => {
                totalLeaveDays += Number(l.daysCount || l.totalDays || 1);
            });

            const onTimeCount = attendanceLogs.filter((a: any) => {
                const st = (a.status || "").toUpperCase();
                return st === "PRESENT" && (!a.lateMinutes || a.lateMinutes === 0);
            }).length;

            const totalValidLogs = attendanceLogs.filter((a: any) => {
                const st = (a.status || "").toUpperCase();
                return st === "PRESENT" || st === "LATE";
            }).length;

            const overallPunctuality = totalValidLogs > 0 
                ? `${((onTimeCount / totalValidLogs) * 100).toFixed(1)}%` 
                : "100%";

            // Individual Employee Performance
            if (rawEmployees.length > 0) {
                const mapped: EmployeePerformance[] = rawEmployees.map((emp: any, idx: number) => {
                    const empFullName = emp.fullName || emp.name || `Staff Member #${idx + 1}`;
                    const empCode = emp.employeeCode || emp.code || emp.id || `EMP-${1000 + idx}`;

                    // Employee attendance logs
                    const empLogs = attendanceLogs.filter((a: any) => {
                        if (!a) return false;
                        if (a.employeeId && (a.employeeId === emp.id || a.employeeId === empCode)) return true;
                        if (a.employeeCode && (a.employeeCode === empCode || a.employeeCode === emp.id)) return true;
                        if (a.employee?.id && a.employee.id === emp.id) return true;
                        if (a.employeeName && empFullName && a.employeeName.trim().toLowerCase() === empFullName.trim().toLowerCase()) return true;
                        return false;
                    });

                    const presentDays = empLogs.filter((a: any) => {
                        const st = (a.status || "").toUpperCase();
                        return st === "PRESENT" || (a.checkInTime && a.checkInTime !== "-");
                    }).length;

                    const lateDays = empLogs.filter((a: any) => {
                        const st = (a.status || "").toUpperCase();
                        return st === "LATE" || (a.lateMinutes && a.lateMinutes > 0);
                    }).length;

                    const absentDays = empLogs.filter((a: any) => {
                        const st = (a.status || "").toUpperCase();
                        return st === "ABSENT" || st === "NOT_PUNCHED";
                    }).length;

                    // Employee Overtime
                    let empOTHours = 0;
                    approvedOT.forEach((o: any) => {
                        if (o.employeeId === emp.id || o.employeeId === empCode || (o.employee?.id && o.employee.id === emp.id)) {
                            empOTHours += Number(o.hours || o.claimedHours || 0);
                        }
                    });

                    // Employee Leaves
                    let empLeaves = 0;
                    approvedLeaves.forEach((l: any) => {
                        if (l.employeeId === emp.id || l.employeeId === empCode || (l.employee?.id && l.employee.id === emp.id)) {
                            empLeaves += Number(l.daysCount || l.totalDays || 1);
                        }
                    });

                    // Punctuality rate
                    let rate = 100;
                    const loggedDays = presentDays + lateDays + absentDays;
                    if (loggedDays > 0) {
                        rate = Math.round(((presentDays + lateDays * 0.8) / loggedDays) * 100);
                        if (rate > 100) rate = 100;
                    }

                    let rating: EmployeePerformance["performanceRating"] = "Top Performer";
                    if (rate >= 90 && lateDays <= 1) {
                        rating = "Top Performer";
                    } else if (rate >= 75) {
                        rating = "Good Standing";
                    } else {
                        rating = "Needs Attention";
                    }

                    return {
                        id: emp.id || `emp-${idx}`,
                        name: empFullName,
                        code: empCode,
                        avatar: emp.profilePicture || emp.avatarUrl || emp.avatar || null,
                        designation: emp.designation || emp.role || "Team Staff",
                        department: emp.departments?.name || emp.department?.name || emp.department || deptName || "Operations",
                        totalDaysPresent: presentDays,
                        totalDaysLate: lateDays,
                        totalDaysAbsent: absentDays,
                        overtimeHours: empOTHours,
                        leavesConsumed: empLeaves,
                        punctualityRate: rate,
                        performanceRating: rating,
                    };
                });

                mapped.sort((a, b) => b.punctualityRate - a.punctualityRate);
                setLeaderboard(mapped);

                setSummaryStats({
                    totalStaff: rawEmployees.length,
                    punctualityScore: overallPunctuality,
                    totalOvertimeHours: `${totalOTHours.toFixed(1)} Hours`,
                    leavesConsumed: `${totalLeaveDays} Days`,
                    avgDailyPresent: `${mapped.filter(m => m.totalDaysPresent > 0).length}`,
                });
            } else {
                setLeaderboard([]);
            }
        } catch (e) {
            console.error("Failed to load manager performance reports:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".stat-box",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [summaryStats, loading]);

    const handleExportCSV = () => {
        const headers = "Employee Name,Employee Code,Designation,Department,Present Days,Late Days,Absent Days,Overtime Hours,Leaves Consumed,Compliance Rate,Performance Rating\n";
        const rows = leaderboard
            .map(
                (e) =>
                    `"${e.name}","${e.code}","${e.designation}","${e.department}",${e.totalDaysPresent},${e.totalDaysLate},${e.totalDaysAbsent},${e.overtimeHours},${e.leavesConsumed},"${e.punctualityRate}%","${e.performanceRating}"`
            )
            .join("\n");

        const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `manager_team_performance_report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    const filteredLeaderboard = leaderboard.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFilter = true;
        if (selectedFilter === "TOP") matchesFilter = item.performanceRating === "Top Performer";
        else if (selectedFilter === "GOOD") matchesFilter = item.performanceRating === "Good Standing";
        else if (selectedFilter === "ATTENTION") matchesFilter = item.performanceRating === "Needs Attention";

        return matchesSearch && matchesFilter;
    });

    const getInitials = (name: string) => {
        if (!name) return "EM";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-[#00B050]" />
                        Team Attendance & Performance Reports
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Punctuality metrics, overtime records & leave analytics computed from live database records
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => fetchReports(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh live report analytics"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export CSV
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        title="Print or Save PDF"
                    >
                        <Printer className="w-4 h-4 text-neutral-500" />
                        Print
                    </button>
                </div>
            </div>

            {/* Metrics */}
            {loading ? (
                <div className="flex items-center justify-center py-16 text-neutral-400 bg-white rounded-2xl border border-neutral-200/80 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00B050]" />
                    <span className="text-xs font-semibold">Aggregating live team metrics from database...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-box bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Team Punctuality</p>
                        <div className="flex items-baseline justify-between mt-1">
                            <h3 className="text-2xl font-bold text-emerald-600 font-mono">{summaryStats.punctualityScore}</h3>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                                Live Score
                            </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">On-time check-in compliance</p>
                    </div>

                    <div className="stat-box bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Approved Overtime</p>
                        <div className="flex items-baseline justify-between mt-1">
                            <h3 className="text-2xl font-bold text-indigo-600 font-mono">{summaryStats.totalOvertimeHours}</h3>
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                                Approved
                            </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Total verified extra duty</p>
                    </div>

                    <div className="stat-box bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Leaves Consumed</p>
                        <div className="flex items-baseline justify-between mt-1">
                            <h3 className="text-2xl font-bold text-amber-600 font-mono">{summaryStats.leavesConsumed}</h3>
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                                Authorized
                            </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Approved leave quota days</p>
                    </div>

                    <div className="stat-box bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Assigned Staff</p>
                        <div className="flex items-baseline justify-between mt-1">
                            <h3 className="text-2xl font-bold text-neutral-900 font-mono">{summaryStats.totalStaff} Members</h3>
                            <span className="text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full font-bold">
                                Active
                            </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Direct reports in {deptName}</p>
                    </div>
                </div>
            )}

            {/* Performance Leaderboard Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#00B050]" />
                            Individual Team Attendance & Performance
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">Ranked by overall punctuality and compliance scores</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative w-full sm:w-60">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8.5 pr-8 py-1.5 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All Ratings ({leaderboard.length})</option>
                            <option value="TOP">Top Performers</option>
                            <option value="GOOD">Good Standing</option>
                            <option value="ATTENTION">Needs Attention</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="py-3.5 px-6">Rank & Employee</th>
                                <th className="py-3.5 px-6">Punches Logged</th>
                                <th className="py-3.5 px-6">Overtime Delivered</th>
                                <th className="py-3.5 px-6">Leaves Taken</th>
                                <th className="py-3.5 px-6 text-center">Compliance Rate</th>
                                <th className="py-3.5 px-6 text-right">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 font-medium">
                            {filteredLeaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-neutral-400">
                                        {searchQuery 
                                            ? `No employees matching "${searchQuery}".` 
                                            : "No employee attendance records to aggregate."}
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaderboard.map((emp, i) => (
                                    <tr key={emp.id} className="hover:bg-neutral-50/60 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                                    i === 0 
                                                        ? "bg-amber-100 text-amber-800" 
                                                        : i === 1 
                                                        ? "bg-neutral-200 text-neutral-700" 
                                                        : i === 2 
                                                        ? "bg-amber-50 text-amber-700" 
                                                        : "text-neutral-400"
                                                }`}>
                                                    {i + 1}
                                                </span>
                                                {emp.avatar ? (
                                                    <img
                                                        src={emp.avatar}
                                                        alt={emp.name}
                                                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-200"
                                                        onError={(e: any) => {
                                                            e.target.style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                                        {getInitials(emp.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-neutral-900 leading-tight">{emp.name}</p>
                                                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{emp.code} · {emp.designation}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-neutral-800">{emp.totalDaysPresent} Days Present</p>
                                                <p className="text-[10px] text-neutral-400">
                                                    {emp.totalDaysLate > 0 ? `${emp.totalDaysLate} late arrivals` : "0 late arrivals"}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 font-mono font-bold text-neutral-800">
                                            {emp.overtimeHours > 0 ? (
                                                <span className="text-indigo-600">+{emp.overtimeHours.toFixed(1)} hrs</span>
                                            ) : (
                                                <span className="text-neutral-400">—</span>
                                            )}
                                        </td>

                                        <td className="py-4 px-6 font-mono font-bold text-neutral-800">
                                            {emp.leavesConsumed > 0 ? (
                                                <span className="text-amber-600">{emp.leavesConsumed} days</span>
                                            ) : (
                                                <span className="text-neutral-400">0 days</span>
                                            )}
                                        </td>

                                        <td className="py-4 px-6 text-center">
                                            <div className="inline-flex items-center gap-1.5">
                                                <span className="font-bold text-sm text-[#00B050] font-mono">{emp.punctualityRate}%</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 text-right">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                emp.performanceRating === "Top Performer"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : emp.performanceRating === "Good Standing"
                                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                            }`}>
                                                {emp.performanceRating}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
