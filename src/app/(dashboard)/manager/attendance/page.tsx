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
    Calendar
} from "lucide-react";

interface TeamAttendance {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    designation: string;
    checkInTime: string;
    checkOutTime: string | null;
    status: "Present" | "Late" | "Absent" | "On Leave" | "Half-Day";
    faceConfidence: number;
    gpsStatus: string;
    date: string;
}

const initialAttendance: TeamAttendance[] = [
    {
        id: "ta-1",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        designation: "Senior Software Engineer",
        checkInTime: "08:52 AM",
        checkOutTime: "05:14 PM",
        status: "Present",
        faceConfidence: 99.2,
        gpsStatus: "Within Head Office Geofence (24m)",
        date: "2026-08-18",
    },
    {
        id: "ta-2",
        employeeName: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        designation: "Frontend Engineer",
        checkInTime: "08:58 AM",
        checkOutTime: null,
        status: "Present",
        faceConfidence: 98.4,
        gpsStatus: "Within Head Office Geofence (35m)",
        date: "2026-08-18",
    },
    {
        id: "ta-3",
        employeeName: "Sabbir Hossain",
        employeeId: "EMP-1049",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        designation: "Backend API Engineer",
        checkInTime: "09:22 AM",
        checkOutTime: null,
        status: "Late",
        faceConfidence: 96.1,
        gpsStatus: "Within Head Office Geofence (50m)",
        date: "2026-08-18",
    },
    {
        id: "ta-4",
        employeeName: "Farhana Islam",
        employeeId: "EMP-1051",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        designation: "QA Engineer",
        checkInTime: "-",
        checkOutTime: null,
        status: "On Leave",
        faceConfidence: 0,
        gpsStatus: "Approved Sick Leave",
        date: "2026-08-18",
    },
];

export default function ManagerAttendancePage() {
    const [attendance, setAttendance] = useState<TeamAttendance[]>(initialAttendance);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");

    // Regularize modal
    const [selectedRecord, setSelectedRecord] = useState<TeamAttendance | null>(null);
    const [regularizeStatus, setRegularizeStatus] = useState<TeamAttendance["status"]>("Present");
    const [managerRemark, setManagerRemark] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".attendance-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [attendance, selectedStatus, searchQuery]);

    const handleSaveRegularize = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        setAttendance(attendance.map(a => {
            if (a.id === selectedRecord.id) {
                return {
                    ...a,
                    status: regularizeStatus,
                    checkInTime: a.checkInTime === "-" ? "09:00 AM" : a.checkInTime,
                    gpsStatus: managerRemark ? `Regularized: ${managerRemark}` : "Regularized by Manager",
                };
            }
            return a;
        }));
        setSelectedRecord(null);
    };

    const filtered = attendance.filter(item => {
        const matchesSearch = item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || item.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <ScanFace className="w-6 h-6 text-[#00B050]" />
                        Team Attendance Monitoring
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Track live punches, verification scores, and regularize team attendance
                    </p>
                </div>
                <button
                    onClick={() => alert("Team daily attendance sheet downloaded!")}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Export Team Sheet
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search team member..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {["All", "Present", "Late", "Absent", "On Leave"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedStatus(tab)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                selectedStatus === tab
                                    ? "bg-[#00B050] text-white shadow-xs"
                                    : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Team Member</th>
                                <th className="py-4 px-6">In / Out Time</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6">Face Confidence</th>
                                <th className="py-4 px-6">GPS Geofence Status</th>
                                <th className="py-4 px-6 text-right">Regularize</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filtered.map((item) => (
                                <tr key={item.id} className="attendance-row hover:bg-gray-50/60 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.avatar}
                                                alt={item.employeeName}
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                                            />
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{item.employeeName}</p>
                                                <span className="text-xs text-gray-400 font-mono">{item.employeeId} · {item.designation}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-6 font-mono text-xs">
                                        <div className="font-bold text-gray-900">In: <span className="text-[#00B050]">{item.checkInTime}</span></div>
                                        <div className="text-gray-400">Out: {item.checkOutTime || "--:--"}</div>
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            item.status === "Present"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : item.status === "Late"
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-blue-50 text-blue-700"
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6">
                                        {item.faceConfidence > 0 ? (
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                {item.faceConfidence}% Verified
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No biometric scan</span>
                                        )}
                                    </td>

                                    <td className="py-4 px-6 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                            <span>{item.gpsStatus}</span>
                                        </div>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedRecord(item);
                                                setRegularizeStatus(item.status);
                                                setManagerRemark("");
                                            }}
                                            className="px-3 py-1.5 bg-gray-50 hover:bg-[#00B050] hover:text-white text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3 h-3" /> Regularize
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Regularize Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Regularize Attendance</h3>
                                <p className="text-xs text-gray-500">{selectedRecord.employeeName}</p>
                            </div>
                            <button onClick={() => setSelectedRecord(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRegularize} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                                <select
                                    value={regularizeStatus}
                                    onChange={(e) => setRegularizeStatus(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Half-Day">Half-Day</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Manager Note</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="e.g. Worked from remote client meeting site with prior approval."
                                    value={managerRemark}
                                    onChange={(e) => setManagerRemark(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRecord(null)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#00B050] text-white text-xs font-semibold shadow-md"
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
