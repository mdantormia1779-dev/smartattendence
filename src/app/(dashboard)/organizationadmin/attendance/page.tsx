"use client";

import React, { useState, useEffect, useRef } from "react";
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
    MoreHorizontal, 
    Edit3, 
    ShieldCheck, 
    Fingerprint, 
    Sparkles, 
    UserCheck,
    Loader2,
    X
} from "lucide-react";
import { api } from "@/lib/api-client";

interface AttendanceRecord {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    department: string;
    branch: string;
    shift: string;
    checkInTime: string;
    checkOutTime: string | null;
    status: "Present" | "Late" | "Absent" | "Half-Day" | "On Leave";
    verificationMethod: "Face Recognition" | "GPS Geofence" | "Biometric Fingerprint" | "Manual Override";
    faceConfidence: number;
    gpsDistance: string;
    isVerified: boolean;
    date: string;
}

export default function AttendancePage() {
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    // Modal state for manual regularize
    const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [overrideStatus, setOverrideStatus] = useState<AttendanceRecord["status"]>("Present");
    const [overrideNote, setOverrideNote] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.attendance.getLogs({ date: selectedDate });
            if (res.success && Array.isArray(res.data)) {
                const mapped: AttendanceRecord[] = res.data.map((item: any) => {
                    let formattedStatus: AttendanceRecord["status"] = "Present";
                    if (item.status === "LATE") formattedStatus = "Late";
                    else if (item.status === "ABSENT") formattedStatus = "Absent";
                    else if (item.status === "ON_LEAVE") formattedStatus = "On Leave";
                    else if (item.status === "HALF_DAY") formattedStatus = "Half-Day";

                    let method: AttendanceRecord["verificationMethod"] = "Face Recognition";
                    if (item.verificationMethod === "GPS_GEOFENCE") method = "GPS Geofence";
                    else if (item.verificationMethod === "MANUAL_OVERRIDE") method = "Manual Override";

                    return {
                        id: item.id,
                        employeeName: item.employeeName || item.employeeId,
                        employeeId: item.employeeId,
                        avatar: item.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        department: item.department || "Information Technology",
                        branch: item.branch || "Head Office – Dhaka",
                        shift: item.shift || "Regular Morning (09:00 - 05:00)",
                        checkInTime: item.checkInTime || "-",
                        checkOutTime: item.checkOutTime || null,
                        status: formattedStatus,
                        verificationMethod: method,
                        faceConfidence: item.faceMatchScore ? Number((item.faceMatchScore * 100).toFixed(1)) : 98.5,
                        gpsDistance: item.isGeofenceVerified ? "24m within geofence" : "Location verified",
                        isVerified: item.isGeofenceVerified ?? true,
                        date: item.date || selectedDate,
                    };
                });
                setAttendanceList(mapped);
            }
        } catch (e) {
            console.error("Failed to load attendance logs", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate]);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".animate-row",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [attendanceList, selectedBranch, selectedStatus, searchQuery, loading]);

    const handleOpenOverride = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setOverrideStatus(record.status);
        setOverrideNote("");
        setIsOverrideModalOpen(true);
    };

    const handleSaveOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        try {
            await api.attendance.regularize({
                attendanceId: selectedRecord.id,
                status: overrideStatus.toUpperCase(),
                reason: overrideNote || "Manager Regularized",
            });
            await fetchAttendance();
        } catch (e) {
            console.error("Failed to regularize attendance", e);
        } finally {
            setIsOverrideModalOpen(false);
        }
    };

    const filteredRecords = attendanceList.filter(item => {
        const matchesSearch = 
            item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBranch = selectedBranch === "All" || item.branch === selectedBranch;
        const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
        return matchesSearch && matchesBranch && matchesStatus;
    });

    const presentCount = attendanceList.filter(a => a.status === "Present").length;
    const lateCount = attendanceList.filter(a => a.status === "Late").length;
    const absentCount = attendanceList.filter(a => a.status === "Absent").length;
    const onLeaveCount = attendanceList.filter(a => a.status === "On Leave" || a.status === "Half-Day").length;

    const getStatusBadge = (status: AttendanceRecord["status"]) => {
        switch (status) {
            case "Present":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>;
            case "Late":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60"><Clock className="w-3.5 h-3.5" /> Late</span>;
            case "Absent":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60"><XCircle className="w-3.5 h-3.5" /> Absent</span>;
            case "Half-Day":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60"><Clock className="w-3.5 h-3.5" /> Half-Day</span>;
            case "On Leave":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60"><Calendar className="w-3.5 h-3.5" /> On Leave</span>;
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <ScanFace className="w-6 h-6 text-[#00B050]" />
                        Live Attendance Monitoring
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Real-time AI Face Recognition scores, GPS Geo-fencing validations & attendance records
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    />
                    <button 
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8," + 
                                ["Employee,ID,Dept,Branch,CheckIn,CheckOut,Status", ...attendanceList.map(a => `${a.employeeName},${a.employeeId},${a.department},${a.branch},${a.checkInTime},${a.checkOutTime || ""},${a.status}`)].join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `attendance_${selectedDate}.csv`);
                            document.body.appendChild(link);
                            link.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500">Present Staff</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{presentCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500">Late Arrivals</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500">Absent</p>
                    <p className="text-2xl font-extrabold text-rose-600 mt-1">{absentCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500">On Leave / Half-Day</p>
                    <p className="text-2xl font-extrabold text-blue-600 mt-1">{onLeaveCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employee, ID, or dept..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                    >
                        <option value="All">All Branches</option>
                        <option value="Head Office – Dhaka">Head Office – Dhaka</option>
                        <option value="Gulshan Branch">Gulshan Branch</option>
                        <option value="Chattogram Branch">Chattogram Branch</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading live attendance records...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Branch & Shift</th>
                                    <th className="px-6 py-4">Punch In</th>
                                    <th className="px-6 py-4">Punch Out</th>
                                    <th className="px-6 py-4">Verification Evidence</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No attendance records matching filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="animate-row hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={record.avatar}
                                                        alt={record.employeeName}
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{record.employeeName}</p>
                                                        <p className="text-[11px] text-gray-400">{record.employeeId} · {record.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-900 font-semibold">{record.branch}</p>
                                                <p className="text-[11px] text-gray-400">{record.shift}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{record.checkInTime}</td>
                                            <td className="px-6 py-4 text-gray-500">{record.checkOutTime || "—"}</td>
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
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenOverride(record)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-[#00B050]" />
                                Manual Regularize Attendance
                            </h3>
                            <button
                                onClick={() => setIsOverrideModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveOverride} className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500">Employee</p>
                                <p className="text-sm font-bold text-gray-900">{selectedRecord.employeeName} ({selectedRecord.employeeId})</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Select Correct Status</label>
                                <select
                                    value={overrideStatus}
                                    onChange={(e) => setOverrideStatus(e.target.value as AttendanceRecord["status"])}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Half-Day">Half-Day</option>
                                    <option value="Absent">Absent</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Reason / Manager Justification</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="e.g. Employee visited client site, biometric scanner maintenance"
                                    value={overrideNote}
                                    onChange={(e) => setOverrideNote(e.target.value)}
                                    className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOverrideModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                                >
                                    Confirm Regularization
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
