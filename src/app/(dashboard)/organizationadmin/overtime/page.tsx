"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Clock, 
    Calculator, 
    CheckCircle2, 
    XCircle, 
    DollarSign, 
    Settings, 
    Search, 
    Filter, 
    Download, 
    AlertCircle, 
    Check, 
    X,
    TrendingUp,
    Zap,
    Building2,
    Save
} from "lucide-react";

interface OvertimeClaim {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    department: string;
    branch: string;
    date: string;
    type: "Regular OT" | "Weekend OT" | "Holiday OT" | "Emergency OT";
    claimedHours: number;
    hourlyRate: number;
    multiplier: number;
    calculatedAmount: number;
    reason: string;
    managerStatus: "Approved" | "Pending";
    orgStatus: "Pending Org Admin" | "Approved" | "Rejected";
}

const initialClaims: OvertimeClaim[] = [
    {
        id: "ot-1",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        department: "Information Technology",
        branch: "Head Office – Dhaka",
        date: "2026-08-16",
        type: "Regular OT",
        claimedHours: 3.5,
        hourlyRate: 593.75, // 95000 / 160
        multiplier: 1.5,
        calculatedAmount: 3117.18,
        reason: "Core cloud infrastructure upgrade during maintenance downtime.",
        managerStatus: "Approved",
        orgStatus: "Pending Org Admin",
    },
    {
        id: "ot-2",
        employeeName: "Tanvir Ahmed",
        employeeId: "EMP-1044",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        department: "Marketing",
        branch: "Gulshan Branch",
        date: "2026-08-15",
        type: "Holiday OT",
        claimedHours: 4.0,
        hourlyRate: 531.25, // 85000 / 160
        multiplier: 2.5,
        calculatedAmount: 5312.50,
        reason: "Live broadcasting coverage for product launch campaign.",
        managerStatus: "Approved",
        orgStatus: "Approved",
    },
    {
        id: "ot-3",
        employeeName: "Rahim Ullah",
        employeeId: "EMP-1046",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        department: "Operations",
        branch: "Chattogram Branch",
        date: "2026-08-17",
        type: "Emergency OT",
        claimedHours: 2.5,
        hourlyRate: 437.50, // 70000 / 160
        multiplier: 3.0,
        calculatedAmount: 3281.25,
        reason: "Emergency shipment clearance at port warehouse terminal.",
        managerStatus: "Approved",
        orgStatus: "Pending Org Admin",
    },
    {
        id: "ot-4",
        employeeName: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        department: "Information Technology",
        branch: "Head Office – Dhaka",
        date: "2026-08-14",
        type: "Regular OT",
        claimedHours: 2.0,
        hourlyRate: 500.00,
        multiplier: 1.5,
        calculatedAmount: 1500.00,
        reason: "Database backup replication error triage.",
        managerStatus: "Approved",
        orgStatus: "Approved",
    },
];

export default function OvertimePage() {
    const [claims, setClaims] = useState<OvertimeClaim[]>(initialClaims);
    const [selectedStatus, setSelectedStatus] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Overtime Rules Config State
    const [regularMultiplier, setRegularMultiplier] = useState(1.5);
    const [weekendMultiplier, setWeekendMultiplier] = useState(2.0);
    const [holidayMultiplier, setHolidayMultiplier] = useState(2.5);
    const [emergencyMultiplier, setEmergencyMultiplier] = useState(3.0);
    const [minThresholdMins, setMinThresholdMins] = useState(60);
    const [isConfigSaved, setIsConfigSaved] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".ot-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [claims, selectedStatus, searchQuery]);

    const handleApproveClaim = (id: string) => {
        setClaims(claims.map(c => c.id === id ? { ...c, orgStatus: "Approved" } : c));
    };

    const handleRejectClaim = (id: string) => {
        setClaims(claims.map(c => c.id === id ? { ...c, orgStatus: "Rejected" } : c));
    };

    const handleSaveRules = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfigSaved(true);
        setTimeout(() => setIsConfigSaved(false), 2500);
    };

    const filteredClaims = claims.filter(c => {
        const matchesSearch = 
            c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "All" || c.orgStatus === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const totalOTPayout = claims
        .filter(c => c.orgStatus === "Approved")
        .reduce((acc, curr) => acc + curr.calculatedAmount, 0);

    const pendingOTCount = claims.filter(c => c.orgStatus === "Pending Org Admin").length;

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-[#00B050]" />
                        Overtime (OT) Policy & Approvals
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Configure formula multipliers, review manager-approved claims, and track monthly OT payouts
                    </p>
                </div>
                <button
                    onClick={() => alert("Overtime report exported successfully!")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Export OT Summary
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Approved OT Payout</p>
                        <h3 className="text-2xl font-bold text-[#00B050] mt-1">
                            ৳{totalOTPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Aug 2026 payroll billing</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Pending Approval</p>
                        <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingOTCount} Requests</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Manager approved</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Standard Working Hours</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">160 Hrs / Mo</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Hourly divisor base</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Calculator className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Overtime Multiplier Engine Settings Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Overtime Calculation Formula Engine</h2>
                            <p className="text-xs text-gray-500 font-mono">
                                Hourly OT = (Monthly Basic Salary ÷ 160 Hours) × Multiplier
                            </p>
                        </div>
                    </div>
                    {isConfigSaved && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Formula Multipliers Saved
                        </span>
                    )}
                </div>

                <form onSubmit={handleSaveRules} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Regular OT</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={regularMultiplier}
                                onChange={(e) => setRegularMultiplier(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">x</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Weekend OT</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={weekendMultiplier}
                                onChange={(e) => setWeekendMultiplier(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">x</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Holiday OT</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={holidayMultiplier}
                                onChange={(e) => setHolidayMultiplier(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">x</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Emergency OT</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={emergencyMultiplier}
                                onChange={(e) => setEmergencyMultiplier(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">x</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Min Threshold</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={minThresholdMins}
                                onChange={(e) => setMinThresholdMins(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">m</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full py-2 px-3 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Save className="w-3.5 h-3.5" /> Save Multipliers
                        </button>
                    </div>
                </form>
            </div>

            {/* Filter and Table */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search employee, ID or dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {["All", "Pending Org Admin", "Approved", "Rejected"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedStatus(tab)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                selectedStatus === tab
                                    ? "bg-[#00B050] text-white shadow-xs"
                                    : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {tab === "Pending Org Admin" ? "Pending" : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">OT Type & Date</th>
                                <th className="py-4 px-6">Hours & Rate</th>
                                <th className="py-4 px-6">Calculated Payout</th>
                                <th className="py-4 px-6">Reason</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredClaims.length > 0 ? (
                                filteredClaims.map((item) => (
                                    <tr key={item.id} className="ot-row hover:bg-gray-50/60 transition-colors">
                                        {/* Employee */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.avatar}
                                                    alt={item.employeeName}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{item.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{item.department}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type & Date */}
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                {item.type} ({item.multiplier}x)
                                            </span>
                                            <p className="text-[11px] text-gray-400 mt-1 font-mono">{item.date}</p>
                                        </td>

                                        {/* Hours & Hourly Rate */}
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900 text-xs">{item.claimedHours} Hours</p>
                                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">Base: ৳{item.hourlyRate.toFixed(2)}/hr</p>
                                        </td>

                                        {/* Calculated Payout */}
                                        <td className="py-4 px-6 font-bold text-emerald-700 text-sm">
                                            ৳{item.calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>

                                        {/* Reason */}
                                        <td className="py-4 px-6 max-w-xs">
                                            <p className="text-xs text-gray-700 line-clamp-2">{item.reason}</p>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                item.orgStatus === "Approved"
                                                    ? "bg-emerald-50 text-[#00B050] border border-emerald-200/60"
                                                    : item.orgStatus === "Rejected"
                                                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                                            }`}>
                                                {item.orgStatus === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {item.orgStatus === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                                                {item.orgStatus === "Pending Org Admin" && <Clock className="w-3.5 h-3.5" />}
                                                {item.orgStatus === "Pending Org Admin" ? "Pending" : item.orgStatus}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            {item.orgStatus === "Pending Org Admin" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApproveClaim(item.id)}
                                                        className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClaim(item.id)}
                                                        className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Locked</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                                        No overtime claims found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
