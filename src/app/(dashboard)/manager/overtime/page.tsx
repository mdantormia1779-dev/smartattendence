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
    Zap
} from "lucide-react";

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

const initialOTClaims: TeamOTClaim[] = [
    {
        id: "mot-1",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        date: "2026-08-16",
        hours: 3.5,
        otType: "Regular OT",
        taskDone: "Server cloud database replication and indexing upgrade.",
        status: "Pending Manager",
    },
    {
        id: "mot-2",
        employeeName: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        date: "2026-08-14",
        hours: 2.0,
        otType: "Regular OT",
        taskDone: "Resolving critical payment gateway callback webhook error.",
        status: "Approved by Manager",
    },
];

export default function ManagerOvertimePage() {
    const [claims, setClaims] = useState<TeamOTClaim[]>(initialOTClaims);

    const handleApprove = (id: string) => {
        setClaims(claims.map(c => c.id === id ? { ...c, status: "Approved by Manager" } : c));
    };

    const handleReject = (id: string) => {
        setClaims(claims.map(c => c.id === id ? { ...c, status: "Rejected" } : c));
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
                            {claims.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
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
                                        <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {item.otType}
                                        </span>
                                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{item.date}</p>
                                    </td>

                                    <td className="py-4 px-6 font-bold text-xs text-gray-900">
                                        {item.hours} Hours
                                    </td>

                                    <td className="py-4 px-6 max-w-xs text-xs text-gray-700">
                                        {item.taskDone}
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
                                                    onClick={() => handleApprove(item.id)}
                                                    className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item.id)}
                                                    className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Reviewed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
