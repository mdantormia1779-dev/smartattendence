"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
    Loader2,
    RefreshCw
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
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Overtime Rules Config State
    const [regularMultiplier, setRegularMultiplier] = useState(1.5);
    const [weekendMultiplier, setWeekendMultiplier] = useState(2.0);
    const [holidayMultiplier, setHolidayMultiplier] = useState(2.5);
    const [emergencyMultiplier, setEmergencyMultiplier] = useState(3.0);
    const [isConfigSaved, setIsConfigSaved] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await api.overtime.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: OvertimeClaim[] = res.data.map((c: any) => {
                    let formattedType: OvertimeClaim["type"] = "Regular OT";
                    const upperType = (c.type || "").toUpperCase();
                    if (upperType.includes("WEEKEND")) formattedType = "Weekend OT";
                    else if (upperType.includes("HOLIDAY")) formattedType = "Holiday OT";
                    else if (upperType.includes("EMERGENCY")) formattedType = "Emergency OT";

                    let formattedOrgStatus: OvertimeClaim["orgStatus"] = "Pending Org Admin";
                    const upperOrg = (c.orgApproval || (c.approved ? "APPROVED" : "PENDING_ORG_ADMIN")).toUpperCase();
                    if (upperOrg === "APPROVED") formattedOrgStatus = "Approved";
                    else if (upperOrg === "REJECTED") formattedOrgStatus = "Rejected";

                    const claimedHours = Number(c.claimedHours || (c.minutes ? c.minutes / 60 : 2));
                    const hourlyRate = Number(c.hourlyRate || 350);
                    const multiplier = Number(c.multiplier || 1.5);
                    const calculatedAmount = Number(c.calculatedAmount || (claimedHours * hourlyRate * multiplier));

                    return {
                        id: c.id,
                        employeeName: c.employeeName || c.employeeId,
                        employeeId: c.employeeId,
                        avatar: c.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        department: c.department || "General",
                        branch: c.branch || "Main Branch",
                        date: c.date ? c.date.split("T")[0] : new Date().toISOString().split("T")[0],
                        type: formattedType,
                        claimedHours,
                        hourlyRate,
                        multiplier,
                        calculatedAmount,
                        reason: c.reason || "Post-shift project tasks",
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
        if (!loading && containerRef.current) {
            const rows = containerRef.current.querySelectorAll(".ot-row");
            if (rows.length > 0) {
                const ctx = gsap.context(() => {
                    gsap.fromTo(
                        rows,
                        { opacity: 0, y: 12 },
                        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                    );
                }, containerRef);
                return () => ctx.revert();
            }
        }
    }, [claims, selectedStatus, searchQuery, loading]);

    const handleApproveClaim = async (id: string) => {
        try {
            setProcessingId(id);
            await api.overtime.approve(id, "Approved by Org Admin");
            await fetchClaims();
        } catch (e) {
            console.error("Failed to approve claim", e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectClaim = async (id: string) => {
        try {
            setProcessingId(id);
            await api.overtime.reject(id, "Rejected by Org Admin");
            await fetchClaims();
        } catch (e) {
            console.error("Failed to reject claim", e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleSaveRules = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfigSaved(true);
        setTimeout(() => setIsConfigSaved(false), 2500);
    };

    const filteredClaims = useMemo(() => {
        return claims.filter((c) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                c.employeeName.toLowerCase().includes(q) ||
                c.employeeId.toLowerCase().includes(q) ||
                c.department.toLowerCase().includes(q) ||
                c.branch.toLowerCase().includes(q);

            const matchesStatus = selectedStatus === "All" || c.orgStatus === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [claims, searchQuery, selectedStatus]);

    const totalOTPayout = useMemo(() => {
        return claims
            .filter((c) => c.orgStatus === "Approved")
            .reduce((acc, curr) => acc + curr.calculatedAmount, 0);
    }, [claims]);

    const pendingOTCount = useMemo(() => {
        return claims.filter((c) => c.orgStatus === "Pending Org Admin").length;
    }, [claims]);

    const handleExportCSV = () => {
        const headers = ["Employee Name", "Employee ID", "Department", "Branch", "Date", "Type", "Claimed Hours", "Hourly Rate (BDT)", "Multiplier", "Calculated Amount (BDT)", "Status"];
        const rows = filteredClaims.map((c) => [
            `"${c.employeeName}"`,
            `"${c.employeeId}"`,
            `"${c.department}"`,
            `"${c.branch}"`,
            `"${c.date}"`,
            `"${c.type}"`,
            `"${c.claimedHours}"`,
            `"${c.hourlyRate.toFixed(2)}"`,
            `"${c.multiplier}x"`,
            `"${c.calculatedAmount.toFixed(2)}"`,
            `"${c.orgStatus}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `overtime_report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <TrendingUp className="w-6 h-6 text-[#00B050]" />
                        Overtime (OT) Policy & Approvals
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Configure formula multipliers, review workforce claims, and manage monthly OT payouts
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchClaims}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Refresh claims"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer active:scale-95"
                    >
                        <Download className="w-4 h-4 text-stone-500" />
                        Export OT Summary
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Approved OT Payout</p>
                        <h3 className="text-2xl font-extrabold text-[#00B050] mt-1">
                            ৳{totalOTPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Payroll billing</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold border border-emerald-100">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pending Requests</p>
                        <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingOTCount} Requests</h3>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Awaiting final decision</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Standard Working Hours</p>
                        <h3 className="text-2xl font-extrabold text-stone-900 mt-1">160 Hrs / Mo</h3>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Hourly divisor base</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                        <Calculator className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Overtime Multiplier Engine Settings Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                    <div>
                        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-[#00B050]" />
                            Canonical Overtime Rate Policy & Multipliers
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Formula: <span className="font-mono font-bold text-stone-800">(Basic Salary / 160) × Multiplier × Claimed Hours</span>
                        </p>
                    </div>
                    {isConfigSaved && (
                        <span className="text-xs font-bold text-[#00B050] flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full animate-fade-in border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Policy rules updated!
                        </span>
                    )}
                </div>

                <form onSubmit={handleSaveRules} className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                    <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Regular Days Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={regularMultiplier}
                            onChange={(e) => setRegularMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-stone-400 font-semibold">Standard: 1.5x</span>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Weekend Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={weekendMultiplier}
                            onChange={(e) => setWeekendMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-stone-400 font-semibold">Standard: 2.0x</span>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Public Holiday Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={holidayMultiplier}
                            onChange={(e) => setHolidayMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-stone-400 font-semibold">Standard: 2.5x</span>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Emergency OT Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={emergencyMultiplier}
                            onChange={(e) => setEmergencyMultiplier(parseFloat(e.target.value))}
                            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                        <span className="text-[10px] text-stone-400 font-semibold">Standard: 3.0x</span>
                    </div>

                    <div className="flex flex-col justify-end">
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#00B050]/20 active:scale-95"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Update Policy
                        </button>
                    </div>
                </form>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search employee, ID, branch or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending Org Admin">Pending Org Admin</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Overtime Claims Table */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-stone-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span className="text-xs font-semibold">Loading overtime claims from database...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-50/80 border-b border-stone-200/70 text-stone-500 font-bold uppercase tracking-wider">
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
                            <tbody className="divide-y divide-stone-100 font-medium">
                                {filteredClaims.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-stone-400">
                                            No overtime claims found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClaims.map((claim) => (
                                        <tr key={claim.id} className="ot-row hover:bg-stone-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={claim.avatar}
                                                        alt={claim.employeeName}
                                                        className="w-9 h-9 rounded-full object-cover border border-stone-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-stone-900 leading-tight">{claim.employeeName}</p>
                                                        <p className="text-[11px] text-stone-400 font-medium">{claim.employeeId} · {claim.department} ({claim.branch})</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-stone-900 font-semibold">{claim.date}</p>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-stone-100 text-stone-700 border border-stone-200">
                                                    {claim.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-stone-800">
                                                {claim.claimedHours} Hours
                                            </td>
                                            <td className="px-6 py-4 text-stone-600">
                                                <p className="font-semibold">৳{claim.hourlyRate.toFixed(2)}/hr</p>
                                                <p className="text-[11px] text-indigo-600 font-bold">{claim.multiplier}x Multiplier</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-extrabold text-[#00B050]">
                                                    ৳{claim.calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {claim.orgStatus === "Approved" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                                    </span>
                                                )}
                                                {claim.orgStatus === "Rejected" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle className="w-3.5 h-3.5" /> Rejected
                                                    </span>
                                                )}
                                                {claim.orgStatus === "Pending Org Admin" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5" /> Pending Org Admin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {claim.orgStatus === "Pending Org Admin" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRejectClaim(claim.id)}
                                                            disabled={processingId === claim.id}
                                                            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer active:scale-95"
                                                            title="Reject Claim"
                                                        >
                                                            {processingId === claim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveClaim(claim.id)}
                                                            disabled={processingId === claim.id}
                                                            className="p-2 rounded-xl bg-[#00B050] text-white hover:bg-[#009b46] shadow-sm shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95"
                                                            title="Approve Claim"
                                                        >
                                                            {processingId === claim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-400 text-xs font-semibold">—</span>
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
