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
    X
} from "lucide-react";

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
    faceConfidence: number; // e.g. 98.4
    gpsDistance: string; // e.g. "32m (Allowed: 120m)"
    isVerified: boolean;
    date: string;
}

const initialAttendance: AttendanceRecord[] = [
    {
        id: "att-1",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        department: "Information Technology",
        branch: "Head Office – Dhaka",
        shift: "Regular Morning (09:00 - 05:00)",
        checkInTime: "08:52 AM",
        checkOutTime: "05:14 PM",
        status: "Present",
        verificationMethod: "Face Recognition",
        faceConfidence: 99.2,
        gpsDistance: "24m within geofence",
        isVerified: true,
        date: "2026-08-18",
    },
    {
        id: "att-2",
        employeeName: "Nusrat Jahan",
        employeeId: "EMP-1043",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        department: "Accounts & Finance",
        branch: "Head Office – Dhaka",
        shift: "Regular Morning (09:00 - 05:00)",
        checkInTime: "08:58 AM",
        checkOutTime: null,
        status: "Present",
        verificationMethod: "Face Recognition",
        faceConfidence: 97.8,
        gpsDistance: "41m within geofence",
        isVerified: true,
        date: "2026-08-18",
    },
    {
        id: "att-3",
        employeeName: "Tanvir Ahmed",
        employeeId: "EMP-1044",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        department: "Marketing",
        branch: "Gulshan Branch",
        shift: "Regular Morning (09:00 - 05:00)",
        checkInTime: "09:28 AM",
        checkOutTime: null,
        status: "Late",
        verificationMethod: "GPS Geofence",
        faceConfidence: 95.4,
        gpsDistance: "55m within geofence",
        isVerified: true,
        date: "2026-08-18",
    },
    {
        id: "att-4",
        employeeName: "Sabrina Noor",
        employeeId: "EMP-1045",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        department: "Human Resources",
        branch: "Head Office – Dhaka",
        shift: "Regular Morning (09:00 - 05:00)",
        checkInTime: "09:04 AM",
        checkOutTime: "01:30 PM",
        status: "Half-Day",
        verificationMethod: "Biometric Fingerprint",
        faceConfidence: 0,
        gpsDistance: "Device ID #BIO-01",
        isVerified: true,
        date: "2026-08-18",
    },
    {
        id: "att-5",
        employeeName: "Rahim Ullah",
        employeeId: "EMP-1046",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        department: "Operations",
        branch: "Chattogram Branch",
        shift: "Rotational Shift",
        checkInTime: "-",
        checkOutTime: null,
        status: "On Leave",
        verificationMethod: "Manual Override",
        faceConfidence: 0,
        gpsDistance: "Approved Casual Leave",
        isVerified: true,
        date: "2026-08-18",
    },
    {
        id: "att-6",
        employeeName: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        department: "Information Technology",
        branch: "Head Office – Dhaka",
        shift: "Flexible Core Hours",
        checkInTime: "-",
        checkOutTime: null,
        status: "Absent",
        verificationMethod: "Face Recognition",
        faceConfidence: 0,
        gpsDistance: "No check-in detected",
        isVerified: false,
        date: "2026-08-18",
    },
];

export default function AttendancePage() {
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(initialAttendance);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedDate, setSelectedDate] = useState("2026-08-18");

    // Modal state for manual regularize
    const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [overrideStatus, setOverrideStatus] = useState<AttendanceRecord["status"]>("Present");
    const [overrideNote, setOverrideNote] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".animate-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [attendanceList, selectedBranch, selectedStatus, searchQuery]);

    const handleOpenOverride = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setOverrideStatus(record.status);
        setOverrideNote("");
        setIsOverrideModalOpen(true);
    };

    const handleSaveOverride = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        setAttendanceList(attendanceList.map(item => {
            if (item.id === selectedRecord.id) {
                return {
                    ...item,
                    status: overrideStatus,
                    verificationMethod: "Manual Override",
                    checkInTime: item.checkInTime === "-" ? "09:00 AM" : item.checkInTime,
                    gpsDistance: overrideNote ? `Override: ${overrideNote}` : "Manager regularized",
                    isVerified: true,
                };
            }
            return item;
        }));
        setIsOverrideModalOpen(false);
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
                        onClick={() => alert("Attendance summary CSV exported successfully!")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Present Today</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">On time</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Late Arrivals</p>
                        <h3 className="text-2xl font-bold text-amber-600 mt-1">{lateCount}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Exceeded grace period</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Absent</p>
                        <h3 className="text-2xl font-bold text-rose-600 mt-1">{absentCount}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">No check-in record</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <XCircle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">On Leave / Half-Day</p>
                        <h3 className="text-2xl font-bold text-blue-600 mt-1">{onLeaveCount}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Approved leaves</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search employee name, ID or dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Branch Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">Branch:</span>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                        >
                            <option value="All">All Branches</option>
                            <option value="Head Office – Dhaka">Head Office – Dhaka</option>
                            <option value="Gulshan Branch">Gulshan Branch</option>
                            <option value="Chattogram Branch">Chattogram Branch</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">Status:</span>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
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
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">Branch & Department</th>
                                <th className="py-4 px-6">In / Out Time</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6">AI Face Match</th>
                                <th className="py-4 px-6">GPS Geofence Validation</th>
                                <th className="py-4 px-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((item) => (
                                    <tr key={item.id} className="animate-row hover:bg-gray-50/60 transition-colors">
                                        {/* Employee info */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.avatar}
                                                    alt={item.employeeName}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{item.employeeName}</p>
                                                    <span className="text-xs text-gray-400 font-mono">{item.employeeId}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Branch & Dept */}
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-gray-800 text-xs">{item.department}</p>
                                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                <Building2 className="w-3 h-3 text-[#00B050]" />
                                                {item.branch}
                                            </p>
                                        </td>

                                        {/* In / Out times */}
                                        <td className="py-4 px-6">
                                            <div className="font-mono text-xs font-semibold text-gray-800">
                                                In: <span className="text-[#00B050]">{item.checkInTime}</span>
                                            </div>
                                            <div className="font-mono text-[11px] text-gray-500">
                                                Out: {item.checkOutTime || "--:--"}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            {getStatusBadge(item.status)}
                                        </td>

                                        {/* Face Match Score */}
                                        <td className="py-4 px-6">
                                            {item.faceConfidence > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                        <ScanFace className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-emerald-700">{item.faceConfidence}%</p>
                                                        <span className="text-[10px] text-gray-400">Liveness OK</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No face scan</span>
                                            )}
                                        </td>

                                        {/* GPS Geofence */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                                <MapPin className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                                <span className="truncate max-w-[180px]">{item.gpsDistance}</span>
                                            </div>
                                        </td>

                                        {/* Action / Regularize */}
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleOpenOverride(item)}
                                                className="px-3 py-1.5 bg-gray-50 hover:bg-[#00B050] hover:text-white text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                                Regularize
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                                        No attendance records found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Override Modal */}
            {isOverrideModalOpen && selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Regularize Attendance</h3>
                                <p className="text-xs text-gray-500">{selectedRecord.employeeName} ({selectedRecord.employeeId})</p>
                            </div>
                            <button
                                onClick={() => setIsOverrideModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOverride} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Correct Status</label>
                                <select
                                    value={overrideStatus}
                                    onChange={(e) => setOverrideStatus(e.target.value as AttendanceRecord["status"])}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Half-Day">Half-Day</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Absent">Absent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason / Note for Override</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="e.g. Employee was on external client visit at client office with branch approval."
                                    value={overrideNote}
                                    onChange={(e) => setOverrideNote(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOverrideModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#00B050] hover:bg-[#009b46] text-white text-xs font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
                                >
                                    Save Regularization
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
