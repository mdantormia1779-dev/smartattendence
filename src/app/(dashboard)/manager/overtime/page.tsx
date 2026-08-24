"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    TrendingUp, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Check, 
    X, 
    DollarSign,
    Calendar,
    Zap,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

interface TeamOTClaim {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    date: string;
    hours: number;
    otType: "Regular OT" | "Weekend OT" | "Emergency OT";
    taskDone: string;
    status: "Pending Manager" | "Approved by Manager" | "Rejected";
}

export default function ManagerOvertimePage() {
    const [claims, setClaims] = useState<TeamOTClaim[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await api.overtime.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: TeamOTClaim[] = res.data.map((c: any) => {
                    let type: TeamOTClaim["otType"] = "Regular OT";
                    if (c.type === "WEEKEND") type = "Weekend OT";
                    else if (c.type === "EMERGENCY") type = "Emergency OT";

                    let status: TeamOTClaim["status"] = "Pending Manager";
                    if (c.managerApproval === "APPROVED") status = "Approved by Manager";
                    else if (c.managerApproval === "REJECTED") status = "Rejected";

                    return {
                        id: c.id,
                        employeeName: c.employeeName || c.employeeId,
                        employeeId: c.employeeId,
                        avatar: c.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        date: c.date,
                        hours: c.claimedHours || 2,
                        otType: type,
                        taskDone: c.reason || "Extended tasks",
                        status,
                    };
                });
                setClaims(mapped);
            }
        } catch (e) {
            console.error("Failed to load manager overtime claims", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await api.overtime.approve(id, "Manager Approved");
            await fetchClaims();
        } catch (e) {
            console.error("Failed to approve OT claim", e);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.overtime.reject(id, "Manager Rejected");
            await fetchClaims();
        } catch (e) {
            console.error("Failed to reject OT claim", e);
        }
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-[#00B050]" />
                        Team Overtime (OT) Approvals
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Review overtime hours claimed by direct reports before payroll calculation
                    </p>
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading team overtime claims...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">Team Member</th>
                                    <th className="py-4 px-6">Date & Type</th>
                                    <th className="py-4 px-6">Claimed Hours</th>
                                    <th className="py-4 px-6">Work Performed</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {claims.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                                            No overtime claims pending.
                                        </td>
                                    </tr>
                                ) : (
                                    claims.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.employeeName}
                                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-xs">{item.employeeName}</p>
                                                        <p className="text-[11px] text-gray-400 font-mono">{item.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-700">
                                                <p className="font-semibold">{item.date}</p>
                                                <span className="text-[10px] text-indigo-600 font-bold">{item.otType}</span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-xs text-gray-900 font-mono">
                                                {item.hours} Hours
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-600 max-w-xs truncate">
                                                {item.taskDone}
                                            </td>
                                            <td className="py-4 px-6">
                                                {item.status === "Approved by Manager" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                                        <CheckCircle2 className="w-3 h-3" /> Endorsed
                                                    </span>
                                                )}
                                                {item.status === "Pending Manager" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                                                        <Clock className="w-3 h-3" /> Pending Review
                                                    </span>
                                                )}
                                                {item.status === "Rejected" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">
                                                        <XCircle className="w-3 h-3" /> Rejected
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {item.status === "Pending Manager" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleReject(item.id)}
                                                            className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                            title="Reject"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(item.id)}
                                                            className="p-1 rounded-lg bg-[#00B050] text-white hover:bg-[#009b46] shadow-xs cursor-pointer"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
