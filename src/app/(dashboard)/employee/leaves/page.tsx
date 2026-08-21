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
    ArrowRight
} from "lucide-react";

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

const initialMyLeaves: MyLeave[] = [
    {
        id: "myleave-1",
        type: "Annual Leave",
        startDate: "2026-08-25",
        endDate: "2026-08-28",
        totalDays: 4,
        reason: "Family vacation to Cox's Bazar and personal downtime.",
        appliedOn: "2026-08-18",
        status: "Pending Org Approval",
        managerNote: "Approved by Tanvir Ahmed (Manager). Awaiting Org Admin sign-off.",
    },
    {
        id: "myleave-2",
        type: "Casual Leave",
        startDate: "2026-06-10",
        endDate: "2026-06-11",
        totalDays: 2,
        reason: "Personal family event in hometown.",
        appliedOn: "2026-06-05",
        status: "Approved",
        managerNote: "Approved with full pay.",
    },
    {
        id: "myleave-3",
        type: "Sick Leave",
        startDate: "2026-04-14",
        endDate: "2026-04-15",
        totalDays: 2,
        reason: "Seasonal flu and doctor recommended bed rest.",
        appliedOn: "2026-04-14",
        status: "Approved",
        managerNote: "Medical prescription attached & verified.",
    },
];

export default function EmployeeLeavesPage() {
    const [leaves, setLeaves] = useState<MyLeave[]>(initialMyLeaves);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        type: "Casual Leave" as MyLeave["type"],
        startDate: "",
        endDate: "",
        totalDays: 1,
        reason: "",
    });

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        const newLeave: MyLeave = {
            id: `myleave-${Date.now()}`,
            type: formData.type,
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalDays: formData.totalDays,
            reason: formData.reason,
            appliedOn: new Date().toISOString().split("T")[0],
            status: "Pending Manager Review",
        };

        setLeaves([newLeave, ...leaves]);
        setIsApplyModalOpen(false);
        alert("🎉 Leave application submitted! Your manager has been notified.");
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-[#00B050]" />
                        Leave Quotas & Applications
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Apply for leaves, view remaining balance allowances & track approval stages
                    </p>
                </div>
                <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Apply for Leave
                </button>
            </div>

            {/* Leave Balance Quota Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Casual Leave</span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-[#00B050]"><Briefcase className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">8 / 10 Days</h3>
                    <p className="text-[11px] text-gray-400 mt-1">2 days used this year</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Sick Leave</span>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><HeartPulse className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">12 / 14 Days</h3>
                    <p className="text-[11px] text-gray-400 mt-1">2 days used with medical note</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Annual Vacation</span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Plane className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">16 / 20 Days</h3>
                    <p className="text-[11px] text-gray-400 mt-1">4 days pending approval</p>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">My Leave Requests History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Leave Type</th>
                                <th className="py-4 px-6">Duration</th>
                                <th className="py-4 px-6">Dates</th>
                                <th className="py-4 px-6">Reason</th>
                                <th className="py-4 px-6">Status & Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {leaves.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-4 px-6 font-bold text-xs text-gray-900">
                                        {item.type}
                                        <p className="text-[10px] text-gray-400 font-normal">Applied: {item.appliedOn}</p>
                                    </td>

                                    <td className="py-4 px-6 font-bold text-xs text-gray-800">
                                        {item.totalDays} Days
                                    </td>

                                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                                        {item.startDate} → {item.endDate}
                                    </td>

                                    <td className="py-4 px-6 text-xs text-gray-700 max-w-xs">
                                        {item.reason}
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            item.status === "Approved"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : item.status === "Rejected"
                                                ? "bg-rose-50 text-rose-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}>
                                            {item.status === "Approved" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {item.status}
                                        </span>
                                        {item.managerNote && (
                                            <p className="text-[10px] text-gray-500 mt-1 italic">{item.managerNote}</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply Leave Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Apply for Time Off / Leave</h3>
                            <button onClick={() => setIsApplyModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Leave Category</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                >
                                    <option value="Casual Leave">Casual Leave (8 days balance)</option>
                                    <option value="Sick Leave">Sick Leave (12 days balance)</option>
                                    <option value="Annual Leave">Annual Leave (16 days balance)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.endDate || e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Total Days</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={formData.totalDays}
                                        onChange={(e) => setFormData({ ...formData, totalDays: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason / Description</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Please describe why you need this leave..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#00B050] hover:bg-[#009b46] text-white text-xs font-semibold shadow-md cursor-pointer"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
