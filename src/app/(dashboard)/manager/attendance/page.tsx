"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    ScanFace, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    MapPin, 
    Search, 
    Filter, 
    Download, 
    Edit3, 
    X, 
    Building2, 
    Check, 
    Calendar,
    Loader2,
    RefreshCw,
    AlertCircle,
    UserCheck,
    Sparkles,
    LogIn
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatAttendanceTime, formatReadableDate, formatLongDate } from "@/lib/datetime";
import WebPunchModal from "../../organizationadmin/Components/Attendance/WebPunchModal";

interface TeamAttendance {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string | null;
    designation: string;
    department: string;
    branch: string;
    checkInTime: string;
    checkOutTime: string | null;
    status: "Present" | "Late" | "Absent" | "On Leave" | "Half-Day";
    faceConfidence: number;
    gpsStatus: string;
    date: string;
}

export default function ManagerAttendancePage() {
    const [attendance, setAttendance] = useState<TeamAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);

    // Regularize modal
    const [selectedRecord, setSelectedRecord] = useState<TeamAttendance | null>(null);
    const [regularizeStatus, setRegularizeStatus] = useState<TeamAttendance["status"]>("Present");
    const [managerRemark, setManagerRemark] = useState("");
    const [savingRegularize, setSavingRegularize] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchAttendance = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const [attendanceRes, employeesRes, leavesRes] = await Promise.allSettled([
                api.attendance.getLogs(),
                api.employees.getAll(),
                api.leaves.getAll(),
            ]);

            // Map employees
            let empMap: Record<string, any> = {};
            if (employeesRes.status === "fulfilled" && employeesRes.value?.success) {
                let rawEmployees: any[] = [];
                if (Array.isArray(employeesRes.value.data)) {
                    rawEmployees = employeesRes.value.data;
                } else if (employeesRes.value.data && Array.isArray(employeesRes.value.data.items)) {
                    rawEmployees = employeesRes.value.data.items;
                } else if (Array.isArray((employeesRes.value as any).items)) {
                    rawEmployees = (employeesRes.value as any).items;
                }

                rawEmployees.forEach((emp: any) => {
                    if (emp.id) empMap[emp.id] = emp;
                    if (emp.employeeCode) empMap[emp.employeeCode] = emp;
                });
            }

            // Map today's approved leaves
            let todayLeavesMap: Record<string, boolean> = {};
            if (leavesRes.status === "fulfilled" && leavesRes.value?.success && Array.isArray(leavesRes.value.data)) {
                const today = new Date().toISOString().split("T")[0];
                leavesRes.value.data.forEach((l: any) => {
                    if (l.status === "APPROVED" || l.managerApproval === "APPROVED" || l.adminApproval === "APPROVED") {
                        if (l.startDate <= today && l.endDate >= today) {
                            todayLeavesMap[l.employeeId] = true;
                        }
                    }
                });
            }

            if (attendanceRes.status === "fulfilled" && attendanceRes.value?.success && Array.isArray(attendanceRes.value.data)) {
                const mapped: TeamAttendance[] = attendanceRes.value.data.map((item: any) => {
                    const emp = empMap[item.employeeId] || item.employee || {};

                    const isLateTime = (timeStr?: string | null): boolean => {
                        if (!timeStr || timeStr === "—" || timeStr === "-") return false;
                        const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
                        if (match) {
                            let hour = parseInt(match[1], 10);
                            const minute = parseInt(match[2], 10);
                            const meridian = match[3]?.toUpperCase();
                            if (meridian === "PM" && hour < 12) hour += 12;
                            if (meridian === "AM" && hour === 12) hour = 0;
                            if (hour > 9 || (hour === 9 && minute > 15)) return true;
                        }
                        return false;
                    };

                    const timeStr = item.checkInTime || item.punchIn || null;
                    const hasValidPunch = timeStr && timeStr !== "—" && timeStr !== "-";

                    let formattedStatus: TeamAttendance["status"] = "Present";
                    if (todayLeavesMap[item.employeeId] || item.status === "ON_LEAVE") {
                        formattedStatus = "On Leave";
                    } else if (item.status === "LATE" || isLateTime(timeStr)) {
                        formattedStatus = "Late";
                    } else if (item.status === "HALF_DAY") {
                        formattedStatus = "Half-Day";
                    } else if (item.status === "ABSENT" || !hasValidPunch) {
                        formattedStatus = "Absent";
                    } else if (item.status === "PRESENT" || hasValidPunch) {
                        formattedStatus = "Present";
                    }

                    let formattedDate = new Date().toISOString().split("T")[0];
                    if (item.date) {
                        formattedDate = item.date;
                    } else if (item.createdAt) {
                        formattedDate = new Date(item.createdAt).toISOString().split("T")[0];
                    }

                    const rawConfidence = item.faceMatchScore 
                        ? Number((item.faceMatchScore * 100).toFixed(1)) 
                        : typeof item.faceConfidence === "number" 
                        ? item.faceConfidence 
                        : 0;

                    return {
                        id: item.id,
                        employeeName: emp.name || emp.fullName || item.employeeName || `Staff (${item.employeeId})`,
                        employeeId: emp.employeeCode || emp.code || item.employeeId || "EMP-1000",
                        avatar: emp.avatarUrl || emp.avatar || item.avatar || null,
                        designation: emp.designation || emp.role || item.department || "Team Staff",
                        department: emp.department?.name || emp.departmentName || emp.department || "Operations",
                        branch: emp.branch?.name || emp.branchName || emp.branch || "Main Branch",
                        checkInTime: formatAttendanceTime(item.checkInTime || item.punchIn),
                        checkOutTime: formatAttendanceTime(item.checkOutTime || item.punchOut) === "--" ? null : formatAttendanceTime(item.checkOutTime || item.punchOut),
                        status: formattedStatus,
                        faceConfidence: rawConfidence,
                        gpsStatus: item.isGeofenceVerified 
                            ? "Geofence Verified (On-Premises)" 
                            : item.location 
                            ? String(item.location) 
                            : "Location Logged",
                        date: formattedDate,
                    };
                });

                setAttendance(mapped);
            } else {
                setAttendance([]);
            }
        } catch (e) {
            console.error("Failed to load manager team attendance", e);
            setAttendance([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAttendance();

        const handleUpdate = () => fetchAttendance();
        window.addEventListener("attendance-updated", handleUpdate);
        return () => window.removeEventListener("attendance-updated", handleUpdate);
    }, []);

    useEffect(() => {
        if (!loading && attendance.length > 0) {
            const ctx = gsap.context(() => {
                const rows = containerRef.current?.querySelectorAll(".att-row");
                if (rows && rows.length > 0) {
                    gsap.fromTo(
                        rows,
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                    );
                }
            }, containerRef);
            return () => ctx.revert();
        }
    }, [attendance, selectedStatus, searchQuery, loading]);

    const handleOpenRegularize = (record: TeamAttendance) => {
        setSelectedRecord(record);
        setRegularizeStatus(record.status);
        setManagerRemark("");
    };

    const handleSaveRegularize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        setSavingRegularize(true);
        try {
            await api.attendance.regularize({
                attendanceId: selectedRecord.id,
                status: regularizeStatus.toUpperCase(),
                reason: managerRemark || "Regularized by Manager",
            });

            setSuccessMessage(`Attendance for ${selectedRecord.employeeName} updated to ${regularizeStatus}!`);
            setTimeout(() => setSuccessMessage(null), 4000);

            // Dispatch global event for live sync
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("attendance-updated"));
            }

            await fetchAttendance();
        } catch (e) {
            console.error("Failed to regularize attendance", e);
        } finally {
            setSavingRegularize(false);
            setSelectedRecord(null);
        }
    };

    const filteredRecords = attendance.filter(item => {
        const matchesSearch = 
            item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = 
            selectedStatus === "All" || 
            item.status.toUpperCase() === selectedStatus.toUpperCase();

        return matchesSearch && matchesStatus;
    });
    console.log(filteredRecords);

    const presentCount = attendance.filter(a => a.status === "Present").length;
    const lateCount = attendance.filter(a => a.status === "Late").length;
    const leaveCount = attendance.filter(a => a.status === "On Leave").length;
    const absentCount = attendance.filter(a => a.status === "Absent").length;

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
            {/* Success Toast */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B050]" />
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <ScanFace className="w-6 h-6 text-[#00B050]" />
                        Team Live Attendance Feed
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70">
                            <Calendar className="w-3.5 h-3.5 text-[#00B050]" />
                            <span>Today's Date: <strong className="text-emerald-950 font-extrabold">{formatLongDate(new Date())}</strong></span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => setIsPunchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Web Punch In / Out</span>
                    </button>

                    <button
                        onClick={() => fetchAttendance(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh live attendance records"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        onClick={() => {
                            if (attendance.length === 0) return;
                            const csvContent = "data:text/csv;charset=utf-8," + 
                                ["Date,Employee,ID,Designation,PunchIn,PunchOut,Status,AI Confidence,Location", 
                                 ...attendance.map(a => `"${a.date}","${a.employeeName}","${a.employeeId}","${a.designation}","${a.checkInTime}","${a.checkOutTime || ""}","${a.status}","${a.faceConfidence}%","${a.gpsStatus}"`)
                                ].join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `team_attendance_${new Date().toISOString().split("T")[0]}.csv`);
                            document.body.appendChild(link);
                            link.click();
                        }}
                        disabled={attendance.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Download className="w-4 h-4 text-neutral-500" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Present Today</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{presentCount} Staff</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Checked in on-time</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Late Check-Ins</p>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">{lateCount} Staff</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Grace threshold exceeded</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">On Approved Leave</p>
                    <h3 className="text-2xl font-black text-blue-600 mt-1">{leaveCount} Staff</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Authorized quota</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Not Punched / Absent</p>
                    <h3 className="text-2xl font-black text-rose-600 mt-1">{absentCount} Staff</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Unrecorded workforce</p>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9.5 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] transition-all"
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

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer"
                    >
                        <option value="All">All Statuses ({attendance.length})</option>
                        <option value="Present">Present ({presentCount})</option>
                        <option value="Late">Late ({lateCount})</option>
                        <option value="On Leave">On Leave ({leaveCount})</option>
                        <option value="Absent">Absent ({absentCount})</option>
                    </select>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-neutral-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00B050]" />
                        <span className="text-xs font-semibold">Loading live team attendance records...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Punch In</th>
                                    <th className="px-6 py-4">Punch Out</th>
                                    <th className="px-6 py-4">AI Face Match</th>
                                    <th className="px-6 py-4">GPS Geofence Status</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-neutral-400">
                                            {searchQuery 
                                                ? `No attendance records matching "${searchQuery}".` 
                                                : "No team attendance records logged for today yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="att-row hover:bg-neutral-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {record.avatar ? (
                                                        <img
                                                             src={record.avatar}
                                                            alt={record.employeeName}
                                                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-200"
                                                            onError={(e: any) => {
                                                                e.target.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                                            {getInitials(record.employeeName)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-neutral-900 leading-tight">{record.employeeName}</p>
                                                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{record.employeeId} · {record.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-neutral-900 text-[11px] font-mono">{formatReadableDate(record.date || new Date())}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-neutral-900">{record.checkInTime}</td>
                                            <td className="px-6 py-4 text-neutral-500">{record.checkOutTime || "—"}</td>
                                            <td className="px-6 py-4">
                                                {record.faceConfidence > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50">
                                                        <ScanFace className="w-3 h-3 text-[#00B050]" /> {record.faceConfidence}% Match
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400 text-[11px] font-medium">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">
                                                <span className="inline-flex items-center gap-1 text-[11px]">
                                                    <MapPin className="w-3.5 h-3.5 text-[#00B050] shrink-0" /> 
                                                    <span className="truncate max-w-[200px]" title={record.gpsStatus}>{record.gpsStatus}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.status === "Present" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                                    </span>
                                                )}
                                                {record.status === "Late" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5" /> Late
                                                    </span>
                                                )}
                                                {record.status === "On Leave" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <Calendar className="w-3.5 h-3.5" /> On Leave
                                                    </span>
                                                )}
                                                {record.status === "Absent" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle className="w-3.5 h-3.5" /> Absent
                                                    </span>
                                                )}
                                                {record.status === "Half-Day" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                        Half-Day
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenRegularize(record)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                                                    Regularize
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Regularize Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="font-bold text-neutral-900 text-base">Manager Attendance Regularize</h3>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveRegularize} className="space-y-4">
                            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
                                <p className="text-[11px] text-neutral-500 font-medium">Selected Employee</p>
                                <p className="text-xs font-bold text-neutral-900 mt-0.5">{selectedRecord.employeeName} ({selectedRecord.employeeId})</p>
                                <p className="text-[10px] text-neutral-400 font-mono">{selectedRecord.designation} · {selectedRecord.department}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Adjusted Status</label>
                                <select
                                    value={regularizeStatus}
                                    onChange={(e) => setRegularizeStatus(e.target.value as TeamAttendance["status"])}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Half-Day">Half-Day</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Absent">Absent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Manager Justification / Remark</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="e.g. Employee had client onsite meeting or network connectivity issue"
                                    value={managerRemark}
                                    onChange={(e) => setManagerRemark(e.target.value)}
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRecord(null)}
                                    disabled={savingRegularize}
                                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingRegularize}
                                    className="px-4 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {savingRegularize && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Confirm Adjustment</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Web Punch Terminal Modal */}
            <WebPunchModal
                isOpen={isPunchModalOpen}
                onClose={() => setIsPunchModalOpen(false)}
                onPunchSuccess={() => fetchAttendance(true)}
            />
        </div>
    );
}
