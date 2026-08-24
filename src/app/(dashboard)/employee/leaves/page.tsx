"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    CalendarCheck, 
    Plus, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Briefcase, 
    HeartPulse, 
    Plane, 
    Baby, 
    X,
    FileText,
    Calendar,
    ArrowRight,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

interface MyLeave {
    id: string;
    type: "Casual Leave" | "Sick Leave" | "Annual Leave";
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    appliedOn: string;
    status: "Pending Manager Review" | "Pending Org Approval" | "Approved" | "Rejected";
    managerNote?: string;
}

export default function EmployeeLeavesPage() {
    const [leaves, setLeaves] = useState<MyLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        type: "Casual Leave" as MyLeave["type"],
        startDate: "",
        endDate: "",
        totalDays: 1,
        reason: "",
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchMyLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.leaves.getAll({ employeeId: "EMP-1042" });
            if (res.success && Array.isArray(res.data)) {
                const mapped: MyLeave[] = res.data.map((l: any) => {
                    let formattedStatus: MyLeave["status"] = "Pending Manager Review";
                    if (l.orgApproval === "APPROVED") formattedStatus = "Approved";
                    else if (l.orgApproval === "REJECTED" || l.managerApproval === "REJECTED") formattedStatus = "Rejected";
                    else if (l.managerApproval === "APPROVED") formattedStatus = "Pending Org Approval";

                    let formattedType: MyLeave["type"] = "Casual Leave";
                    if (l.type === "SICK") formattedType = "Sick Leave";
                    else if (l.type === "ANNUAL") formattedType = "Annual Leave";

                    return {
                        id: l.id,
                        type: formattedType,
                        startDate: l.startDate,
                        endDate: l.endDate,
                        totalDays: l.daysCount || l.totalDays || 1,
                        reason: l.reason,
                        appliedOn: l.createdAt ? l.createdAt.split("T")[0] : "2026-08-18",
                        status: formattedStatus,
                        managerNote: l.managerComment || l.orgComment,
                    };
                });
                setLeaves(mapped);
            }
        } catch (e) {
            console.error("Failed to load my leaves", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyLeaves();
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            let backendType = "CASUAL";
            if (formData.type === "Sick Leave") backendType = "SICK";
            else if (formData.type === "Annual Leave") backendType = "ANNUAL";

            await api.leaves.submit({
                employeeId: "EMP-1042",
                type: backendType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason,
            });

            await fetchMyLeaves();
            setIsApplyModalOpen(false);
            alert("🎉 Leave application submitted! Your manager has been notified.");
        } catch (e) {
            console.error("Failed to apply leave", e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-[#00B050]" />
                        My Leaves & Time-Off
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Apply for casual, sick, or annual leave & track manager and admin approval progress
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            type: "Casual Leave",
                            startDate: new Date().toISOString().split("T")[0],
                            endDate: new Date().toISOString().split("T")[0],
                            totalDays: 1,
                            reason: "",
                        });
                        setIsApplyModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Apply for Leave
                </button>
            </div>

            {/* Leave Balance Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Casual Leave Balance</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">10 <span className="text-xs text-gray-400 font-normal">/ 14 Days Remaining</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Briefcase className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Sick Leave Balance</p>
                        <h3 className="text-2xl font-bold text-rose-600 mt-1">12 <span className="text-xs text-gray-400 font-normal">/ 14 Days Remaining</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <HeartPulse className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Annual Leave Balance</p>
                        <h3 className="text-2xl font-bold text-blue-600 mt-1">16 <span className="text-xs text-gray-400 font-normal">/ 20 Days Remaining</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Plane className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* My Leaves History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-gray-900 text-base">Application History & Real-Time Status</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading your leave history...</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaves.length === 0 ? (
                            <p className="text-gray-400 text-xs py-8 text-center">No leave applications found.</p>
                        ) : (
                            leaves.map((leave) => (
                                <div key={leave.id} className="p-4 rounded-2xl bg-gray-50/75 border border-gray-100 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-sm">{leave.type}</span>
                                            <span className="text-xs text-gray-400">({leave.totalDays} Days)</span>
                                        </div>
                                        <div>
                                            {leave.status === "Approved" && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                                </span>
                                            )}
                                            {leave.status === "Pending Org Approval" && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                                                    <Clock className="w-3.5 h-3.5" /> Awaiting Admin
                                                </span>
                                            )}
                                            {leave.status === "Pending Manager Review" && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                                                    <Clock className="w-3.5 h-3.5" /> Manager Review
                                                </span>
                                            )}
                                            {leave.status === "Rejected" && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
                                                    <XCircle className="w-3.5 h-3.5" /> Rejected
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                                        <p><span className="font-bold text-gray-800">Date Range: </span>{leave.startDate} to {leave.endDate}</p>
                                        <p><span className="font-bold text-gray-800">Applied On: </span>{leave.appliedOn}</p>
                                        <p className="sm:col-span-2"><span className="font-bold text-gray-800">Reason: </span>{leave.reason}</p>
                                        {leave.managerNote && (
                                            <p className="sm:col-span-2 text-emerald-700 font-semibold bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                                                <span className="font-bold">Supervisor Note: </span>{leave.managerNote}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">Submit Leave Application</h3>
                            <button
                                onClick={() => setIsApplyModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Leave Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MyLeave["type"] })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                >
                                    <option value="Casual Leave">Casual Leave (10 days left)</option>
                                    <option value="Sick Leave">Sick Leave (12 days left)</option>
                                    <option value="Annual Leave">Annual Leave (16 days left)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Leave</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Explain your reason in detail..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
