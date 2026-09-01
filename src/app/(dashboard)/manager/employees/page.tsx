"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import gsap from "gsap";
import { useSearchParams } from "next/navigation";
import { 
    Users, 
    Search, 
    Phone, 
    Mail, 
    CheckCircle2, 
    Clock, 
    Calendar, 
    X,
    ShieldCheck,
    Loader2,
    RefreshCw,
    UserX,
    CalendarCheck,
    XCircle,
    Building2,
    MapPin
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatAttendanceTime } from "@/lib/datetime";

interface TeamMember {
    id: string;
    name: string;
    employeeId: string;
    avatar: string | null;
    designation: string;
    department: string;
    branch: string;
    shift: string;
    phone: string;
    email: string;
    attendanceRate: number; // percentage
    todayStatus: "Present" | "Late" | "On Leave" | "Absent";
    checkInTime: string | null;
    checkOutTime: string | null;
    joiningDate: string;
    faceRegistered: boolean;
}

function ManagerTeamContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [team, setTeam] = useState<TeamMember[]>([]);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deptName, setDeptName] = useState("Operations");
    const [branchName, setBranchName] = useState("Main Branch");

    const containerRef = useRef<HTMLDivElement>(null);

    // Sync search query from URL parameter if provided
    useEffect(() => {
        if (initialSearch) {
            setSearchQuery(initialSearch);
        }
    }, [initialSearch]);

    // 1. Fetch Real Team Data from Backend APIs
    const fetchTeamData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            // Load logged in manager details from session
            if (typeof window !== "undefined") {
                const rawUser = localStorage.getItem("user");
                if (rawUser) {
                    try {
                        const parsed = JSON.parse(rawUser);
                        if (parsed.department || parsed.departmentName) setDeptName(parsed.department || parsed.departmentName);
                        if (parsed.branch || parsed.branchName) setBranchName(parsed.branch || parsed.branchName);
                    } catch {}
                }
            }

            const [employeesRes, attendanceRes, leavesRes, shiftsRes] = await Promise.allSettled([
                api.employees.getAll(),
                api.attendance.getLogs(),
                api.leaves.getAll(),
                api.shifts.getAll(),
            ]);

            // Map shifts
            let shiftsMap: Record<string, string> = {};
            if (shiftsRes.status === "fulfilled" && shiftsRes.value?.success && Array.isArray(shiftsRes.value.data)) {
                shiftsRes.value.data.forEach((s: any) => {
                    shiftsMap[s.id] = s.name || s.title || "Standard Shift";
                });
            }

            // Map today's approved leaves
            let todayLeavesMap: Record<string, boolean> = {};
            if (leavesRes.status === "fulfilled" && leavesRes.value?.success && Array.isArray(leavesRes.value.data)) {
                const today = new Date().toISOString().split("T")[0];
                leavesRes.value.data.forEach((l: any) => {
                    const isApproved = l.status === "APPROVED" || l.managerApproval === "APPROVED" || l.adminApproval === "APPROVED";
                    if (isApproved) {
                        const start = l.startDate ? String(l.startDate).split("T")[0] : "";
                        const end = l.endDate ? String(l.endDate).split("T")[0] : "";
                        if ((!start || start <= today) && (!end || end >= today)) {
                            if (l.employeeId) todayLeavesMap[l.employeeId] = true;
                            if (l.employee?.id) todayLeavesMap[l.employee.id] = true;
                            if (l.employee?.employeeCode) todayLeavesMap[l.employee.employeeCode] = true;
                        }
                    }
                });
            }

            // Map attendance logs
            let attendanceLogs: any[] = [];
            if (attendanceRes.status === "fulfilled" && attendanceRes.value?.success && Array.isArray(attendanceRes.value.data)) {
                attendanceLogs = attendanceRes.value.data;
            }

            // Extract raw employee items correctly (handling both array and paginated response objects)
            let rawEmployees: any[] = [];
            if (employeesRes.status === "fulfilled" && employeesRes.value?.success) {
                if (Array.isArray(employeesRes.value.data)) {
                    rawEmployees = employeesRes.value.data;
                } else if (employeesRes.value.data && Array.isArray(employeesRes.value.data.items)) {
                    rawEmployees = employeesRes.value.data.items;
                } else if (Array.isArray((employeesRes.value as any).items)) {
                    rawEmployees = (employeesRes.value as any).items;
                }
            }

            if (rawEmployees.length > 0) {
                const mapped: TeamMember[] = rawEmployees.map((emp: any, idx: number) => {
                    const empCode = emp.employeeCode || emp.code || emp.id || `EMP-${1000 + idx}`;
                    const empFullName = emp.fullName || emp.name || `Staff Member #${idx + 1}`;

                    // Match today's attendance log with multi-field fallback
                    const log = attendanceLogs.find((a: any) => {
                        if (!a) return false;
                        if (a.employeeId && (a.employeeId === emp.id || a.employeeId === empCode)) return true;
                        if (a.employeeCode && (a.employeeCode === empCode || a.employeeCode === emp.id)) return true;
                        if (a.employee?.id && a.employee.id === emp.id) return true;
                        if (a.employee?.employeeCode && a.employee.employeeCode === empCode) return true;
                        if (a.employeeName && empFullName && a.employeeName.trim().toLowerCase() === empFullName.trim().toLowerCase()) return true;
                        return false;
                    });

                    // Determine accurate Today Status: Present vs Late vs On Leave vs Absent
                    let status: "Present" | "Late" | "On Leave" | "Absent" = "Absent";
                    let checkIn: string | null = null;
                    let checkOut: string | null = null;

                    const isOnLeave = Boolean(
                        todayLeavesMap[emp.id] || 
                        todayLeavesMap[empCode] || 
                        (log && (log.status === "ON_LEAVE" || log.status === "On Leave"))
                    );

                    if (isOnLeave) {
                        status = "On Leave";
                    } else if (log) {
                        const rawStatus = (log.status || "").toUpperCase();
                        checkIn = log.checkInTime && log.checkInTime !== "-" && log.checkInTime !== "--" ? formatAttendanceTime(log.checkInTime) : null;
                        checkOut = log.checkOutTime && log.checkOutTime !== "-" && log.checkOutTime !== "--" ? formatAttendanceTime(log.checkOutTime) : null;

                        if (rawStatus === "LATE") {
                            status = "Late";
                        } else if (rawStatus === "PRESENT" || rawStatus === "HALF_DAY" || checkIn) {
                            status = "Present";
                        } else if (rawStatus === "ON_LEAVE") {
                            status = "On Leave";
                        } else {
                            status = "Absent";
                        }
                    }

                    // Calculate real attendance rate based on history if available
                    const empLogs = attendanceLogs.filter((a: any) => 
                        a.employeeId === emp.id || 
                        a.employeeId === empCode ||
                        (a.employeeName && empFullName && a.employeeName.trim().toLowerCase() === empFullName.trim().toLowerCase())
                    );

                    let rate = 100;
                    if (empLogs.length > 1) {
                        const presents = empLogs.filter((a: any) => {
                            const st = (a.status || "").toUpperCase();
                            return st === "PRESENT" || st === "LATE" || (a.checkInTime && a.checkInTime !== "-");
                        }).length;
                        rate = Math.round((presents / empLogs.length) * 100);
                    } else {
                        rate = status === "Present" ? 100 : status === "Late" ? 85 : status === "On Leave" ? 100 : 0;
                    }

                    let joinDateStr = "N/A";
                    if (emp.joiningDate || emp.createdAt) {
                        try {
                            joinDateStr = new Date(emp.joiningDate || emp.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            });
                        } catch {}
                    }

                    return {
                        id: emp.id || `emp-${idx}`,
                        name: empFullName,
                        employeeId: empCode,
                        avatar: emp.profilePicture || emp.avatarUrl || emp.avatar || null,
                        designation: emp.designation || emp.role || "Team Staff",
                        department: emp.departments?.name || emp.department?.name || emp.departmentName || emp.department || deptName || "Operations",
                        branch: emp.branches?.name || emp.branch?.name || emp.branchName || emp.branch || branchName || "Main Branch",
                        shift: emp.shift?.name || emp.shiftName || (emp.shiftId ? shiftsMap[emp.shiftId] : null) || "Standard Shift (09:00 - 05:00)",
                        phone: emp.phone || emp.mobile || emp.phoneNumber || "N/A",
                        email: emp.email || "N/A",
                        attendanceRate: rate,
                        todayStatus: status,
                        checkInTime: checkIn,
                        checkOutTime: checkOut,
                        joiningDate: joinDateStr,
                        faceRegistered: Boolean(emp.faceEnrolled || emp.hasFaceRegistration || emp.faceVector || emp.faceRegistered),
                    };
                });

                setTeam(mapped);
            } else {
                setTeam([]);
            }
        } catch (e) {
            console.error("Failed to fetch real team members:", e);
            setTeam([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTeamData();

        const handleUpdate = () => fetchTeamData();
        window.addEventListener("attendance-updated", handleUpdate);
        window.addEventListener("leaves-updated", handleUpdate);
        return () => {
            window.removeEventListener("attendance-updated", handleUpdate);
            window.removeEventListener("leaves-updated", handleUpdate);
        };
    }, []);

    // GSAP Animation
    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".team-card",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [team, searchQuery, statusFilter, loading]);

    // Filter Logic
    const filteredTeam = team.filter((t) => {
        const matchesSearch =
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === "PRESENT") matchesStatus = t.todayStatus === "Present";
        else if (statusFilter === "LATE") matchesStatus = t.todayStatus === "Late";
        else if (statusFilter === "ON LEAVE") matchesStatus = t.todayStatus === "On Leave";
        else if (statusFilter === "ABSENT") matchesStatus = t.todayStatus === "Absent";

        return matchesSearch && matchesStatus;
    });

    const presentCount = team.filter((t) => t.todayStatus === "Present").length;
    const lateCount = team.filter((t) => t.todayStatus === "Late").length;
    const onLeaveCount = team.filter((t) => t.todayStatus === "On Leave").length;
    const absentCount = team.filter((t) => t.todayStatus === "Absent").length;

    const getInitials = (name: string) => {
        if (!name) return "EM";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex-1 bg-[#FBFBFA] flex items-center justify-center min-h-[70vh]">
                <div className="flex flex-col items-center gap-3 text-neutral-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050]" />
                    <p className="text-xs font-semibold">Loading Live Team Directory...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#00B050]" />
                        My Assigned Team
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Direct reports & staff members in {deptName}</span>
                        <span className="text-neutral-300">·</span>
                        <span className="font-semibold text-[#00B050]">{branchName}</span>
                        <span className="text-neutral-300">·</span>
                        <span className="font-bold text-neutral-800">{team.length} Total Staff</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => fetchTeamData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh live team data from database"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search team member..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9.5 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                <button
                    onClick={() => setStatusFilter("ALL")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === "ALL"
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    }`}
                >
                    <span>All Staff</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-700/60 text-white">
                        {team.length}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter("PRESENT")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === "PRESENT"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                >
                    <span>Present Today</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                        {presentCount}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter("LATE")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === "LATE"
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                    }`}
                >
                    <span>Late</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                        {lateCount}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter("ON LEAVE")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === "ON LEAVE"
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                >
                    <span>On Leave</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
                        {onLeaveCount}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter("ABSENT")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === "ABSENT"
                            ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                            : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                    }`}
                >
                    <span>Not Punched / Absent</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800">
                        {absentCount}
                    </span>
                </button>
            </div>

            {/* Team Grid */}
            {filteredTeam.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center space-y-3 shadow-xs">
                    <UserX className="w-12 h-12 text-neutral-300 mx-auto" />
                    <h3 className="text-base font-bold text-neutral-800">No Team Members Found</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        {searchQuery 
                            ? `No members matching "${searchQuery}". Try clearing search filters.` 
                            : "No employees currently registered under your assigned department or branch in the database."}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="px-4 py-2 bg-[#00B050] text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#009b46] transition-colors"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeam.map((member) => (
                        <div
                            key={member.id}
                            className="team-card bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-4 hover:shadow-md hover:border-neutral-300 transition-all relative"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {member.avatar ? (
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-neutral-100"
                                            onError={(e: any) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                                            {getInitials(member.name)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-neutral-900 text-sm leading-tight flex items-center gap-1.5">
                                            {member.name}
                                            {member.faceRegistered && (
                                                <span title="AI Face Enrolled">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-[#00B050]" />
                                                </span>
                                            )}
                                        </h3>
                                        <span className="text-xs text-neutral-400 font-mono">{member.employeeId}</span>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    member.todayStatus === "Present"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : member.todayStatus === "Late"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : member.todayStatus === "On Leave"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}>
                                    {member.todayStatus}
                                </span>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Designation:</span>
                                    <span className="font-semibold text-neutral-800">{member.designation}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Assigned Shift:</span>
                                    <span className="font-medium text-neutral-700 truncate max-w-[160px]" title={member.shift}>
                                        {member.shift}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Today Check-In:</span>
                                    <span className="font-bold text-neutral-900">
                                        {member.checkInTime ? (
                                            <span className="text-emerald-700">{member.checkInTime}</span>
                                        ) : member.todayStatus === "On Leave" ? (
                                            <span className="text-blue-600">On Leave</span>
                                        ) : (
                                            <span className="text-neutral-400">Not Punched</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Punctuality Score:</span>
                                    <span className="font-bold text-[#00B050]">{member.attendanceRate}%</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-neutral-500">
                                    {member.email && member.email !== "N/A" && (
                                        <a 
                                            href={`mailto:${member.email}`} 
                                            className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-[#00B050] transition-colors"
                                            title={`Email ${member.email}`}
                                        >
                                            <Mail className="w-4 h-4" />
                                        </a>
                                    )}
                                    {member.phone && member.phone !== "N/A" && (
                                        <a 
                                            href={`tel:${member.phone}`} 
                                            className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-[#00B050] transition-colors"
                                            title={`Call ${member.phone}`}
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedMember(member)}
                                    className="text-xs font-bold text-[#00B050] hover:underline cursor-pointer"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Member Profile Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <h3 className="text-base font-bold text-neutral-900">Team Member Profile</h3>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-center space-y-2">
                            {selectedMember.avatar ? (
                                <img
                                    src={selectedMember.avatar}
                                    alt={selectedMember.name}
                                    className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-[#00B050]/20"
                                    onError={(e: any) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md mx-auto ring-4 ring-[#00B050]/20">
                                    {getInitials(selectedMember.name)}
                                </div>
                            )}
                            <h4 className="font-bold text-neutral-900 text-lg flex items-center justify-center gap-1.5">
                                {selectedMember.name}
                                {selectedMember.faceRegistered && (
                                    <span title="AI Face Enrolled">
                                        <ShieldCheck className="w-4 h-4 text-[#00B050]" />
                                    </span>
                                )}
                            </h4>
                            <p className="text-xs text-neutral-500 font-mono">{selectedMember.employeeId} · {selectedMember.designation}</p>
                        </div>

                        <div className="bg-neutral-50 rounded-2xl p-4 space-y-2.5 text-xs border border-neutral-100">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Email:</span>
                                <span className="font-semibold text-neutral-800">{selectedMember.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Phone:</span>
                                <span className="font-semibold text-neutral-800">{selectedMember.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Branch & Dept:</span>
                                <span className="font-semibold text-neutral-800">{selectedMember.branch} · {selectedMember.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Today Status:</span>
                                <span className={`font-bold ${
                                    selectedMember.todayStatus === "Present" 
                                        ? "text-emerald-600" 
                                        : selectedMember.todayStatus === "Late" 
                                        ? "text-amber-600" 
                                        : selectedMember.todayStatus === "On Leave" 
                                        ? "text-blue-600" 
                                        : "text-rose-600"
                                }`}>
                                    {selectedMember.todayStatus} {selectedMember.checkInTime ? `(${selectedMember.checkInTime})` : ""}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Joining Date:</span>
                                <span className="font-semibold text-neutral-800">{selectedMember.joiningDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Current Shift:</span>
                                <span className="font-semibold text-neutral-800">{selectedMember.shift}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Punctuality Score:</span>
                                <span className="font-bold text-[#00B050]">{selectedMember.attendanceRate}% Compliance</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="px-5 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ManagerTeamPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 bg-[#FBFBFA] flex items-center justify-center min-h-[70vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B050]" />
            </div>
        }>
            <ManagerTeamContent />
        </Suspense>
    );
}
