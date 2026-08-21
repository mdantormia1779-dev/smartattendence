"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    CalendarCheck, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Check, 
    X, 
    FileText,
    Calendar,
    Briefcase,
    HeartPulse,
    Plane
} from "lucide-react";

interface TeamLeaveRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    leaveType: "Casual Leave" | "Sick Leave" | "Annual Leave";
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    appliedOn: string;
    status: "Pending Manager" | "Approved by Manager" | "Rejected";
    managerComment?: string;
}

const initialTeamLeaves: TeamLeaveRequest[] = [
    {
        id: "tl-1",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        leaveType: "Annual Leave",
        startDate: "2026-08-25",
        endDate: "2026-08-28",
        totalDays: 4,
        reason: "Family vacation to Cox's Bazar and personal rest.",
        appliedOn: "2026-08-18",
        status: "Pending Manager",
    },
    {
        id: "tl-2",
        employeeName: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        leaveType: "Casual Leave",
        startDate: "2026-08-21",
        endDate: "2026-08-21",
        totalDays: 1,
        reason: "Bank biometric NID update and personal errand.",
        appliedOn: "2026-08-17",
        status: "Approved by Manager",
        managerComment: "Substitute assigned for morning sprint duty.",
    },
    {
        id: "tl-3",
        employeeName: "Farhana Islam",
        employeeId: "EMP-1051",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        leaveType: "Sick Leave",
        startDate: "2026-08-18",
        endDate: "2026-08-18",
        totalDays: 1,
        reason: "Sudden seasonal migraine and fever.",
        appliedOn: "2026-08-18",
        status: "Approved by Manager",
        managerComment: "Get well soon. Medical note submitted.",
    },
];

export default function ManagerLeavesPage() {
    const [requests, setRequests] = useState<TeamLeaveRequest[]>(initialTeamLeaves);
    const [selectedStatus, setSelectedStatus] = useState("All");

    // Modal
    const [activeRequest, setActiveRequest] = useState<TeamLeaveRequest | null>(null);
    const [actionType, setActionType] = useState<"Approve" | "Reject">("Approve");
    const [managerNote, setManagerNote] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".leave-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [requests, selectedStatus]);

    const handleProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeRequest) return;

        setRequests(requests.map(r => {
            if (r.id === activeRequest.id) {
                return {
                    ...r,
                    status: actionType === "Approve" ? "Approved by Manager" : "Rejected",
                    managerComment: managerNote || (actionType === "Approve" ? "Approved by Team Manager" : "Rejected due to project deadlines"),
                };
            }
            return r;
        }));
        setActiveRequest(null);
    };

    const filtered = requests.filter(r => 
        selectedStatus === "All" || r.status === selectedStatus
    );

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-[#00B050]" />
                        Team Leave Approvals
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Review leave applications from IT department team members and forward to Organization Admin
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {["All", "Pending Manager", "Approved by Manager", "Rejected"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedStatus(tab)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                selectedStatus === tab
                                    ? "bg-[#00B050] text-white shadow-xs"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {tab === "Pending Manager" ? "Pending (1)" : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leave Applications Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Team Member</th>
                                <th className="py-4 px-6">Leave Type</th>
                                <th className="py-4 px-6">Duration</th>
                                <th className="py-4 px-6">Reason</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filtered.map((item) => (
                                <tr key={item.id} className="leave-row hover:bg-gray-50/60 transition-colors">
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

                                    <td className="py-4 px-6">
                                        <span className="font-bold text-xs text-gray-800">{item.leaveType}</span>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Applied: {item.appliedOn}</p>
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className="font-bold text-xs text-gray-900">{item.totalDays} Days</span>
                                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{item.startDate} → {item.endDate}</p>
                                    </td>

                                    <td className="py-4 px-6 max-w-xs text-xs text-gray-700">
                                        {item.reason}
                                        {item.managerComment && (
                                            <p className="text-[11px] text-[#00B050] mt-1 italic">Note: {item.managerComment}</p>
                                        )}
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            item.status === "Approved by Manager"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : item.status === "Rejected"
                                                ? "bg-rose-50 text-rose-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}>
                                            {item.status === "Approved by Manager" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {item.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                                            {item.status === "Pending Manager" && <Clock className="w-3.5 h-3.5" />}
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        {item.status === "Pending Manager" ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveRequest(item);
                                                        setActionType("Approve");
                                                        setManagerNote("");
                                                    }}
                                                    className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveRequest(item);
                                                        setActionType("Reject");
                                                        setManagerNote("");
                                                    }}
                                                    className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Decision Modal */}
            {activeRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {actionType === "Approve" ? "Recommend Leave Approval" : "Reject Leave Request"}
                                </h3>
                                <p className="text-xs text-gray-500">{activeRequest.employeeName} · {activeRequest.leaveType}</p>
                            </div>
                            <button onClick={() => setActiveRequest(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProcess} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Manager Comments</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder={actionType === "Approve" ? "e.g. Approved. Sprint tasks reassigned." : "e.g. Critical release milestone."}
                                    value={managerNote}
                                    onChange={(e) => setManagerNote(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setActiveRequest(null)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md ${
                                        actionType === "Approve" ? "bg-[#00B050]" : "bg-rose-600"
                                    }`}
                                >
                                    {actionType === "Approve" ? "Confirm Approval" : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
