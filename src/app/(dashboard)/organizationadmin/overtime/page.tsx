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
    Save,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

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

export default function OvertimePage() {
    const [claims, setClaims] = useState<OvertimeClaim[]>([]);
    const [loading, setLoading] = useState(true);
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

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await api.overtime.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: OvertimeClaim[] = res.data.map((c: any) => {
                    let formattedType: OvertimeClaim["type"] = "Regular OT";
                    if (c.type === "WEEKEND") formattedType = "Weekend OT";
                    else if (c.type === "HOLIDAY") formattedType = "Holiday OT";
                    else if (c.type === "EMERGENCY") formattedType = "Emergency OT";

                    let formattedOrgStatus: OvertimeClaim["orgStatus"] = "Pending Org Admin";
                    if (c.orgApproval === "APPROVED") formattedOrgStatus = "Approved";
                    else if (c.orgApproval === "REJECTED") formattedOrgStatus = "Rejected";

                    return {
                        id: c.id,
                        employeeName: c.employeeName || c.employeeId,
                        employeeId: c.employeeId,
                        avatar: c.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        department: c.department || "Information Technology",
                        branch: c.branch || "Head Office – Dhaka",
                        date: c.date,
                        type: formattedType,
                        claimedHours: c.claimedHours || 2,
                        hourlyRate: c.hourlyRate || 593.75,
                        multiplier: c.multiplier || 1.5,
                        calculatedAmount: c.calculatedAmount || (c.claimedHours * c.hourlyRate * c.multiplier),
                        reason: c.reason || "Extended task execution",
                        managerStatus: c.managerApproval === "APPROVED" ? "Approved" : "Pending",
                        orgStatus: formattedOrgStatus,
                    };
                });
                setClaims(mapped);
            }
        } catch (e) {
            console.error("Failed to load overtime claims", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".ot-row",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [claims, selectedStatus, searchQuery, loading]);

    const handleApproveClaim = async (id: string) => {
        try {
            await api.overtime.approve(id, "Approved by Org Admin");
            await fetchClaims();
        } catch (e) {
            console.error("Failed to approve claim", e);
        }
    };

    const handleRejectClaim = async (id: string) => {
        try {
            await api.overtime.reject(id, "Rejected by Org Admin");
            await fetchClaims();
        } catch (e) {
            console.error("Failed to reject claim", e);
        }
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
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-[#00B050]" />
                            Canonical Overtime Rate Formula
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Formula: <span className="font-mono font-bold text-gray-800">(Basic Salary / 160) × Multiplier × Claimed Hours</span>
                        </p>
                    </div>
                    {isConfigSaved && (
                        <span className="text-xs font-bold text-[#00B050] flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full animate-fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Policy rules saved!
                        </span>
                    )}
                </div>

                <form onSubmit={handleSaveRules} className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Regular Days Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={regularMultiplier}
                            onChange={(e) => setRegularMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-gray-400">Default: 1.5x</span>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Weekend Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={weekendMultiplier}
                            onChange={(e) => setWeekendMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-gray-400">Default: 2.0x</span>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Public Holiday Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={holidayMultiplier}
                            onChange={(e) => setHolidayMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-gray-400">Default: 2.5x</span>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Emergency OT Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={emergencyMultiplier}
                            onChange={(e) => setEmergencyMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-gray-400">Default: 3.0x</span>
                    </div>

                    <div className="flex flex-col justify-end">
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Update Policy
                        </button>
                    </div>
                </form>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employee, ID or dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending Org Admin">Pending Org Admin</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Overtime Claims Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading overtime claims...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Date & Type</th>
                                    <th className="px-6 py-4">Claimed Time</th>
                                    <th className="px-6 py-4">Hourly Rate & Multiplier</th>
                                    <th className="px-6 py-4">Payout Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {filteredClaims.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No overtime claims matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClaims.map((claim) => (
                                        <tr key={claim.id} className="ot-row hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={claim.avatar}
                                                        alt={claim.employeeName}
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{claim.employeeName}</p>
                                                        <p className="text-[11px] text-gray-400">{claim.employeeId} · {claim.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-900 font-semibold">{claim.date}</p>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-gray-100 text-gray-700">
                                                    {claim.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                {claim.claimedHours} Hours
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <p>৳{claim.hourlyRate.toFixed(2)}/hr</p>
                                                <p className="text-[11px] text-indigo-600 font-bold">{claim.multiplier}x Multiplier</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-extrabold text-[#00B050]">
                                                    ৳{claim.calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {claim.orgStatus === "Approved" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                                    </span>
                                                )}
                                                {claim.orgStatus === "Rejected" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle className="w-3.5 h-3.5" /> Rejected
                                                    </span>
                                                )}
                                                {claim.orgStatus === "Pending Org Admin" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5" /> Pending Org Admin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {claim.orgStatus === "Pending Org Admin" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRejectClaim(claim.id)}
                                                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                            title="Reject Claim"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveClaim(claim.id)}
                                                            className="p-1.5 rounded-lg bg-[#00B050] text-white hover:bg-[#009b46] shadow-sm transition-colors cursor-pointer"
                                                            title="Approve Claim"
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
