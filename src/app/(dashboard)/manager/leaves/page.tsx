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
    Plane,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

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

export default function ManagerLeavesPage() {
    const [requests, setRequests] = useState<TeamLeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("All");

    // Modal
    const [activeRequest, setActiveRequest] = useState<TeamLeaveRequest | null>(null);
    const [actionType, setActionType] = useState<"Approve" | "Reject">("Approve");
    const [managerNote, setManagerNote] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.leaves.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: TeamLeaveRequest[] = res.data.map((item: any) => {
                    let formattedStatus: TeamLeaveRequest["status"] = "Pending Manager";
                    if (item.managerApproval === "APPROVED") formattedStatus = "Approved by Manager";
                    else if (item.managerApproval === "REJECTED") formattedStatus = "Rejected";

                    let formattedType: TeamLeaveRequest["leaveType"] = "Casual Leave";
                    if (item.type === "SICK") formattedType = "Sick Leave";
                    else if (item.type === "ANNUAL") formattedType = "Annual Leave";

                    return {
                        id: item.id,
                        employeeName: item.employeeName || item.employeeId,
                        employeeId: item.employeeId,
                        avatar: item.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        leaveType: formattedType,
                        startDate: item.startDate,
                        endDate: item.endDate,
                        totalDays: item.daysCount || item.totalDays || 1,
                        reason: item.reason,
                        appliedOn: item.createdAt ? item.createdAt.split("T")[0] : "2026-08-18",
                        status: formattedStatus,
                        managerComment: item.managerComment,
                    };
                });
                setRequests(mapped);
            }
        } catch (e) {
            console.error("Failed to load team leave requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".leave-row",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [requests, selectedStatus, loading]);

    const handleOpenAction = (req: TeamLeaveRequest, type: "Approve" | "Reject") => {
        setActiveRequest(req);
        setActionType(type);
        setManagerNote("");
    };

    const handleProcessAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeRequest) return;

        try {
            if (actionType === "Approve") {
                await api.leaves.approve(activeRequest.id, managerNote || "Manager Approved");
            } else {
                await api.leaves.reject(activeRequest.id, managerNote || "Manager Rejected");
            }
            await fetchRequests();
        } catch (e) {
            console.error("Failed to process leave action", e);
        } finally {
            setActiveRequest(null);
        }
    };

    const filteredRequests = requests.filter(r => 
        selectedStatus === "All" || r.status === selectedStatus
    );

    const pendingCount = requests.filter(r => r.status === "Pending Manager").length;

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
                        First-stage supervisor leave approvals before escalating to Organization Admin
                    </p>
                </div>
                <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200">
                    {pendingCount} Pending Review
                </span>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                    <span>Loading team leave requests...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 text-xs">
                            No team leave applications matching criteria.
                        </div>
                    ) : (
                        filteredRequests.map((req) => (
                            <div key={req.id} className="leave-row bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={req.avatar}
                                            alt={req.employeeName}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{req.employeeName}</h3>
                                            <p className="text-[11px] text-gray-400 font-mono">{req.employeeId} · {req.leaveType}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {req.status === "Approved by Manager" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Endorsed & Escalated
                                            </span>
                                        )}
                                        {req.status === "Pending Manager" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                                                <Clock className="w-3.5 h-3.5" /> Awaiting Your Review
                                            </span>
                                        )}
                                        {req.status === "Rejected" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
                                                <XCircle className="w-3.5 h-3.5" /> Rejected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                                    <div>
                                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Dates</p>
                                        <p className="font-bold text-gray-800">{req.startDate} to {req.endDate} ({req.totalDays} Days)</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Applied On</p>
                                        <p className="font-semibold text-gray-800">{req.appliedOn}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Reason</p>
                                        <p className="font-semibold text-gray-800">{req.reason}</p>
                                    </div>
                                </div>

                                {req.status === "Pending Manager" && (
                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                                        <button
                                            onClick={() => handleOpenAction(req, "Reject")}
                                            className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleOpenAction(req, "Approve")}
                                            className="px-3 py-1.5 bg-[#00B050] text-white hover:bg-[#009b46] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                                        >
                                            Approve & Recommend
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Action Modal */}
            {activeRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">
                                {actionType === "Approve" ? "Recommend Leave for Approval" : "Reject Leave Request"}
                            </h3>
                            <button
                                onClick={() => setActiveRequest(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleProcessAction} className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500">Employee Application</p>
                                <p className="text-sm font-bold text-gray-900">{activeRequest.employeeName} ({activeRequest.leaveType} · {activeRequest.totalDays} Days)</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Supervisor Remark</label>
                                <textarea
                                    rows={3}
                                    placeholder={actionType === "Approve" ? "e.g. All sprint tasks delegated, recommended for approval." : "e.g. In conflict with critical release milestone."}
                                    value={managerNote}
                                    onChange={(e) => setManagerNote(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveRequest(null)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors cursor-pointer ${
                                        actionType === "Approve" 
                                            ? "bg-[#00B050] hover:bg-[#009b46] shadow-[#00B050]/20" 
                                            : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                    }`}
                                >
                                    Confirm {actionType}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
