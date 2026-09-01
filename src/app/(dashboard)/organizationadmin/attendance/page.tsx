"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    MapPin, 
    ScanFace, 
    Search, 
    Filter, 
    Download, 
    Calendar, 
    Building2, 
    Layers,
    MoreHorizontal, 
    Edit3, 
    ShieldCheck, 
    Fingerprint, 
    Sparkles, 
    UserCheck,
    Loader2,
    RefreshCw,
    X,
    AlertCircle,
    LogIn
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatAttendanceTime, formatReadableDate, formatLongDate } from "@/lib/datetime";
import WebPunchModal from "../Components/Attendance/WebPunchModal";

interface AttendanceRecord {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    department: string;
    branch: string;
    branchId?: string;
    departmentId?: string;
    shift: string;
    checkInTime: string;
    checkOutTime: string | null;
    status: "Present" | "Late" | "Absent" | "Half-Day" | "On Leave";
    verificationMethod: "Face Recognition" | "GPS Geofence" | "Biometric Fingerprint" | "Manual Override";
    faceConfidence: number;
    gpsDistance: string;
    isVerified: boolean;
    isRegularized?: boolean;
    date: string;
}

interface Branch {
    id: string;
    name: string;
    code?: string;
}

interface Department {
    id: string;
    name: string;
    code?: string;
}

export default function AttendancePage() {
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("All");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    // Modal state for web punch in/out
    const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);

    // Modal state for manual regularize
    const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [overrideStatus, setOverrideStatus] = useState<AttendanceRecord["status"]>("Present");
    const [overrideNote, setOverrideNote] = useState("");
    const [isSavingOverride, setIsSavingOverride] = useState(false);
    const [overrideError, setOverrideError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [attRes, branchRes, deptRes] = await Promise.allSettled([
                api.attendance.getLogs({ date: selectedDate }),
                api.branches.getAll(),
                api.departments.getAll(),
            ]);

            if (branchRes.status === "fulfilled" && branchRes.value.success && Array.isArray(branchRes.value.data)) {
                setBranches(branchRes.value.data);
            }

            if (deptRes.status === "fulfilled" && deptRes.value.success && Array.isArray(deptRes.value.data)) {
                setDepartments(deptRes.value.data);
            }

            if (attRes.status === "fulfilled" && attRes.value.success && Array.isArray(attRes.value.data)) {
                const mapped: AttendanceRecord[] = attRes.value.data.map((item: any) => {
                    let formattedStatus: AttendanceRecord["status"] = "Present";
                    const upperStatus = (item.status || "").toUpperCase();
                    if (upperStatus === "LATE") formattedStatus = "Late";
                    else if (upperStatus === "ABSENT") formattedStatus = "Absent";
                    else if (upperStatus === "ON_LEAVE") formattedStatus = "On Leave";
                    else if (upperStatus === "HALF_DAY") formattedStatus = "Half-Day";

                    let method: AttendanceRecord["verificationMethod"] = "Face Recognition";
                    const upperMethod = (item.verificationMethod || "").toUpperCase();
                    if (upperMethod.includes("GPS")) method = "GPS Geofence";
                    else if (upperMethod.includes("MANUAL") || upperMethod.includes("OVERRIDE")) method = "Manual Override";
                    else if (upperMethod.includes("BIOMETRIC") || upperMethod.includes("FINGERPRINT")) method = "Biometric Fingerprint";

                    return {
                        id: item.id,
                        employeeName: item.employeeName || item.employeeId,
                        employeeId: item.employeeId,
                        avatar: item.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        department: item.department || "General",
                        branch: item.branch || "Main Branch",
                        branchId: item.branchId,
                        departmentId: item.departmentId,
                        shift: item.shift || "Regular Morning (09:00 AM - 05:00 PM)",
                        checkInTime: formatAttendanceTime(item.checkInTime),
                        checkOutTime: formatAttendanceTime(item.checkOutTime) === "--" ? null : formatAttendanceTime(item.checkOutTime),
                        status: formattedStatus,
                        verificationMethod: method,
                        faceConfidence: item.faceConfidence ? Number(item.faceConfidence) : 98.5,
                        gpsDistance: item.gpsDistanceMeters ? `${item.gpsDistanceMeters}m within geofence` : "Location verified",
                        isVerified: item.isGeofenceVerified ?? true,
                        isRegularized: item.isRegularized,
                        date: item.date || selectedDate,
                    };
                });
                setAttendanceList(mapped);
            }
        } catch (e) {
            console.error("Failed to load attendance data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [selectedDate]);

    useEffect(() => {
        if (!loading && containerRef.current) {
            const rows = containerRef.current.querySelectorAll(".animate-row");
            if (rows.length > 0) {
                const ctx = gsap.context(() => {
                    gsap.fromTo(
                        rows,
                        { opacity: 0, y: 12 },
                        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                    );
                }, containerRef);
                return () => ctx.revert();
            }
        }
    }, [attendanceList, selectedBranch, selectedDepartment, selectedStatus, searchQuery, loading]);

    const handleOpenOverride = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setOverrideStatus(record.status === "Absent" ? "Present" : record.status);
        setOverrideNote("");
        setOverrideError(null);
        setIsOverrideModalOpen(true);
    };

    const handleSaveOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;
        setOverrideError(null);

        try {
            setIsSavingOverride(true);
            const res = await api.attendance.regularize({
                attendanceId: selectedRecord.id,
                status: overrideStatus.toUpperCase(),
                reason: overrideNote.trim() || "Manager Regularized",
            });

            if (res.success) {
                await fetchAllData();
                setIsOverrideModalOpen(false);
            } else {
                setOverrideError(res.message || "Failed to regularize attendance record");
            }
        } catch (err: any) {
            console.error("Failed to regularize attendance", err);
            setOverrideError(err?.message || "Failed to save regularization");
        } finally {
            setIsSavingOverride(false);
        }
    };

    // Filter logic
    const filteredRecords = useMemo(() => {
        return attendanceList.filter((item) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                item.employeeName.toLowerCase().includes(q) ||
                item.employeeId.toLowerCase().includes(q) ||
                item.department.toLowerCase().includes(q) ||
                item.branch.toLowerCase().includes(q);

            const matchesBranch = 
                selectedBranch === "All" || 
                item.branchId === selectedBranch || 
                item.branch === selectedBranch;

            const matchesDepartment = 
                selectedDepartment === "All" || 
                item.departmentId === selectedDepartment || 
                item.department === selectedDepartment;

            const matchesStatus = 
                selectedStatus === "All" || 
                item.status === selectedStatus;

            return matchesSearch && matchesBranch && matchesDepartment && matchesStatus;
        });
    }, [attendanceList, searchQuery, selectedBranch, selectedDepartment, selectedStatus]);
    console.log(filteredRecords)

    const presentCount = useMemo(() => attendanceList.filter((a) => a.status === "Present").length, [attendanceList]);
    const lateCount = useMemo(() => attendanceList.filter((a) => a.status === "Late").length, [attendanceList]);
    const absentCount = useMemo(() => attendanceList.filter((a) => a.status === "Absent").length, [attendanceList]);
    const onLeaveCount = useMemo(() => attendanceList.filter((a) => a.status === "On Leave" || a.status === "Half-Day").length, [attendanceList]);

    const getStatusBadge = (status: AttendanceRecord["status"]) => {
        switch (status) {
            case "Present":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60"><CheckCircle2 className="w-3 h-3" /> Present</span>;
            case "Late":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/60"><Clock className="w-3 h-3" /> Late</span>;
            case "Absent":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/60"><XCircle className="w-3 h-3" /> Absent</span>;
            case "Half-Day":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200/60"><Clock className="w-3 h-3" /> Half-Day</span>;
            case "On Leave":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/60"><Calendar className="w-3 h-3" /> On Leave</span>;
        }
    };

    const handleExportCSV = () => {
        const headers = ["Employee Name", "Employee ID", "Department", "Branch", "Shift", "Date", "Punch In", "Punch Out", "Status", "Verification Method"];
        const rows = filteredRecords.map((a) => [
            `"${a.employeeName}"`,
            `"${a.employeeId}"`,
            `"${a.department}"`,
            `"${a.branch}"`,
            `"${a.shift}"`,
            `"${a.date}"`,
            `"${a.checkInTime}"`,
            `"${a.checkOutTime || "-"}"`,
            `"${a.status}"`,
            `"${a.verificationMethod}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <ScanFace className="w-6 h-6 text-[#00B050]" />
                        Live Attendance Monitoring
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70">
                            <Calendar className="w-3.5 h-3.5 text-[#00B050]" />
                            <span>Viewing Attendance for: <strong className="text-emerald-950 font-extrabold">{formatLongDate(selectedDate)}</strong></span>
                        </span>
                        {selectedDate !== new Date().toISOString().split("T")[0] ? (
                            <button
                                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                                className="px-2.5 py-1 rounded-lg bg-[#00B050] text-white text-[11px] font-extrabold hover:bg-[#009b46] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                            >
                                Jump to Today
                            </button>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/70 text-[#00B050] text-[10px] font-extrabold tracking-wide uppercase">
                                ● Today's Live Records
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsPunchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#00B050] hover:bg-[#009b46] text-white shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95"
                    >
                        <LogIn className="w-4 h-4" />
                        Web Punch In / Out
                    </button>
                    <button
                        onClick={fetchAllData}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Refresh live logs"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
                    </button>
                    <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#00B050]/20">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent text-xs font-bold text-stone-700 focus:outline-none cursor-pointer"
                        />
                    </div>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                    >
                        <Download className="w-4 h-4 text-stone-500" />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Quick Metrics Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Present Staff</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{presentCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Late Arrivals</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Absent Staff</p>
                    <p className="text-2xl font-extrabold text-rose-600 mt-1">{absentCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">On Leave / Half-Day</p>
                    <p className="text-2xl font-extrabold text-blue-600 mt-1">{onLeaveCount}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search employee, ID, branch or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                    {/* Dynamic Branches */}
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                    >
                        <option value="All">All Branches</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>

                    {/* Dynamic Departments */}
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                    >
                        <option value="All">All Departments</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Half-Day">Half-Day</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                        <span className="text-xs font-semibold">Loading live attendance records from database...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-50/80 border-b border-stone-200/70 text-stone-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Branch & Shift</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Punch In</th>
                                    <th className="px-6 py-4">Punch Out</th>
                                    <th className="px-6 py-4">Verification Evidence</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-stone-400">
                                            No attendance records found matching this filter on {formatReadableDate(selectedDate)}.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="animate-row hover:bg-stone-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={record.avatar}
                                                        alt={record.employeeName}
                                                        className="w-9 h-9 rounded-full object-cover border border-stone-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-stone-900 leading-tight">{record.employeeName}</p>
                                                        <p className="text-[11px] text-stone-400 font-medium">{record.employeeId} · {record.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-stone-900 font-semibold">{record.branch}</p>
                                                <p className="text-[11px] text-stone-400">{record.shift}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-stone-900 text-[11px]">{formatReadableDate(record.date)}</span>
                                                    {record.date === new Date().toISOString().split("T")[0] && (
                                                        <span className="text-[9px] font-extrabold text-[#00B050] uppercase tracking-wide">
                                                            Today
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-stone-900">{record.checkInTime}</td>
                                            <td className="px-6 py-4 text-stone-500">{record.checkOutTime || "—"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {record.verificationMethod === "Face Recognition" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50">
                                                            <ScanFace className="w-3 h-3" /> Face {record.faceConfidence}%
                                                        </span>
                                                    )}
                                                    {record.verificationMethod === "GPS Geofence" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/50">
                                                            <MapPin className="w-3 h-3" /> {record.gpsDistance}
                                                        </span>
                                                    )}
                                                    {record.verificationMethod === "Manual Override" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/50">
                                                            <UserCheck className="w-3 h-3" /> Regularized
                                                        </span>
                                                    )}
                                                    {record.verificationMethod === "Biometric Fingerprint" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200/50">
                                                            <Fingerprint className="w-3 h-3" /> Biometric
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenOverride(record)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer border border-stone-200 active:scale-95"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
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

            {/* Regularize Override Modal */}
            {isOverrideModalOpen && selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-4 border border-stone-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-[#00B050]" />
                                Manual Regularize Attendance
                            </h3>
                            <button
                                onClick={() => setIsOverrideModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {overrideError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{overrideError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveOverride} className="space-y-4">
                            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                                <p className="text-[11px] font-bold text-stone-400 uppercase">Employee</p>
                                <p className="text-sm font-bold text-stone-900 mt-0.5">{selectedRecord.employeeName}</p>
                                <p className="text-xs text-stone-500">{selectedRecord.employeeId} · {selectedRecord.department} ({selectedRecord.branch})</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Select Status *</label>
                                <select
                                    value={overrideStatus}
                                    onChange={(e) => setOverrideStatus(e.target.value as AttendanceRecord["status"])}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Half-Day">Half-Day</option>
                                    <option value="Absent">Absent</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Reason / Manager Justification *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="e.g. Employee visited client site, biometric scanner maintenance"
                                    value={overrideNote}
                                    onChange={(e) => setOverrideNote(e.target.value)}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOverrideModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingOverride}
                                    className="px-5 py-2.5 text-xs font-bold bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl shadow-md shadow-[#00B050]/20 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    {isSavingOverride && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Confirm Regularization
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
                onPunchSuccess={fetchAllData}
            />
        </div>
    );
}
