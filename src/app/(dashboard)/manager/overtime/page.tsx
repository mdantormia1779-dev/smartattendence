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
    Loader2,
    RefreshCw,
    UserX,
    Sparkles,
    AlertCircle
} from "lucide-react";
import { api } from "@/lib/api-client";

interface TeamOTClaim {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string | null;
    designation: string;
    department: string;
    date: string;
    hours: number;
    otType: string;
    taskDone: string;
    status: "Pending Review" | "Endorsed & Escalated" | "Approved" | "Rejected";
    managerComment?: string;
}

export default function ManagerOvertimePage() {
    const [claims, setClaims] = useState<TeamOTClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    // Action Modal
    const [activeClaim, setActiveClaim] = useState<TeamOTClaim | null>(null);
    const [actionType, setActionType] = useState<"Approve" | "Reject">("Approve");
    const [managerComment, setManagerComment] = useState("");
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchClaims = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const [otRes, empRes] = await Promise.allSettled([
                api.overtime.getAll(),
                api.employees.getAll(),
            ]);

            // Map employees
            let empMap: Record<string, any> = {};
            if (empRes.status === "fulfilled" && empRes.value?.success) {
                let rawEmployees: any[] = [];
                if (Array.isArray(empRes.value.data)) {
                    rawEmployees = empRes.value.data;
                } else if (empRes.value.data && Array.isArray(empRes.value.data.items)) {
                    rawEmployees = empRes.value.data.items;
                } else if (Array.isArray((empRes.value as any).items)) {
                    rawEmployees = (empRes.value as any).items;
                }

                rawEmployees.forEach((emp: any) => {
                    if (emp.id) empMap[emp.id] = emp;
                    if (emp.employeeCode) empMap[emp.employeeCode] = emp;
                });
            }

            if (otRes.status === "fulfilled" && otRes.value?.success && Array.isArray(otRes.value.data)) {
                const mapped: TeamOTClaim[] = otRes.value.data.map((c: any) => {
                    const emp = empMap[c.employeeId] || c.employee || {};
                    const empFullName = emp.name || emp.fullName || c.employeeName || `Staff (${c.employeeId})`;
                    const empCode = emp.employeeCode || emp.code || c.employeeId || "EMP-1000";

                    // OT Type
                    let type = "Regular OT";
                    const rawType = (c.type || "").toUpperCase();
                    if (rawType === "WEEKEND" || rawType.includes("WEEKEND")) type = "Weekend OT";
                    else if (rawType === "EMERGENCY" || rawType.includes("EMERGENCY")) type = "Emergency OT";
                    else if (rawType === "HOLIDAY") type = "Holiday OT";
                    else if (rawType === "NIGHT") type = "Night Shift OT";
                    else if (c.type) type = c.type;

                    // Status
                    let formattedStatus: TeamOTClaim["status"] = "Pending Review";
                    if (c.status === "REJECTED" || c.managerApproval === "REJECTED" || c.adminApproval === "REJECTED") {
                        formattedStatus = "Rejected";
                    } else if (c.status === "APPROVED" || c.adminApproval === "APPROVED") {
                        formattedStatus = "Approved";
                    } else if (c.managerApproval === "APPROVED") {
                        formattedStatus = "Endorsed & Escalated";
                    }

                    // Date
                    let dateStr = "Recent";
                    if (c.date || c.createdAt) {
                        try {
                            dateStr = new Date(c.date || c.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            });
                        } catch {}
                    }

                    return {
                        id: c.id,
                        employeeName: empFullName,
                        employeeId: empCode,
                        avatar: emp.profilePicture || emp.avatarUrl || emp.avatar || null,
                        designation: emp.designation || emp.role || "Team Staff",
                        department: emp.departments?.name || emp.department?.name || emp.department || "Operations",
                        date: dateStr,
                        hours: c.hours || c.claimedHours || 2,
                        otType: type,
                        taskDone: c.reason || c.description || "Extended production and task completion",
                        status: formattedStatus,
                        managerComment: c.managerComment || c.adminComment,
                    };
                });

                setClaims(mapped);
            } else {
                setClaims([]);
            }
        } catch (e) {
            console.error("Failed to load manager overtime claims:", e);
            setClaims([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchClaims();

        const handleUpdate = () => fetchClaims();
        window.addEventListener("overtime-updated", handleUpdate);
        return () => window.removeEventListener("overtime-updated", handleUpdate);
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".ot-row",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [claims, selectedStatus, loading, searchQuery]);

    const handleOpenActionModal = (claim: TeamOTClaim, type: "Approve" | "Reject") => {
        setActiveClaim(claim);
        setActionType(type);
        setManagerComment("");
    };

    const handleProcessAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeClaim) return;

        setProcessing(true);
        try {
            if (actionType === "Approve") {
                await api.overtime.approve(activeClaim.id, managerComment || "Manager Endorsed & Recommended");
                setSuccessMessage(`Overtime claim for ${activeClaim.employeeName} approved & endorsed!`);
            } else {
                await api.overtime.reject(activeClaim.id, managerComment || "Manager Rejected");
                setSuccessMessage(`Overtime claim for ${activeClaim.employeeName} rejected.`);
            }

            setTimeout(() => setSuccessMessage(null), 4000);

            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("overtime-updated"));
            }

            await fetchClaims();
        } catch (e) {
            console.error("Failed to process overtime claim:", e);
        } finally {
            setProcessing(false);
            setActiveClaim(null);
        }
    };

    const filteredClaims = claims.filter((c) => {
        const matchesSearch =
            c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.otType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.taskDone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.designation.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (selectedStatus === "PENDING") matchesStatus = c.status === "Pending Review";
        else if (selectedStatus === "ENDORSED") matchesStatus = c.status === "Endorsed & Escalated";
        else if (selectedStatus === "APPROVED") matchesStatus = c.status === "Approved";
        else if (selectedStatus === "REJECTED") matchesStatus = c.status === "Rejected";

        return matchesSearch && matchesStatus;
    });

    const pendingCount = claims.filter((c) => c.status === "Pending Review").length;
    const endorsedCount = claims.filter((c) => c.status === "Endorsed & Escalated").length;
    const approvedCount = claims.filter((c) => c.status === "Approved").length;
    const rejectedCount = claims.filter((c) => c.status === "Rejected").length;

    const getInitials = (name: string) => {
        if (!name) return "EM";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen">
            {/* Success Toast */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B050]" />
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-[#00B050]" />
                        Team Overtime (OT) Approvals
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Review and endorse overtime hours claimed by direct reports prior to payroll finalization
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => fetchClaims(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh overtime claims"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <span className="px-3.5 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 shadow-2xs">
                        {pendingCount} Pending Review
                    </span>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                <button
                    onClick={() => setSelectedStatus("ALL")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedStatus === "ALL"
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    }`}
                >
                    <span>All Claims</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-700/60 text-white">
                        {claims.length}
                    </span>
                </button>

                <button
                    onClick={() => setSelectedStatus("PENDING")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedStatus === "PENDING"
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                    }`}
                >
                    <span>Pending Review</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                        {pendingCount}
                    </span>
                </button>

                <button
                    onClick={() => setSelectedStatus("ENDORSED")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedStatus === "ENDORSED"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    }`}
                >
                    <span>Endorsed & Escalated</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
                        {endorsedCount}
                    </span>
                </button>

                <button
                    onClick={() => setSelectedStatus("APPROVED")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedStatus === "APPROVED"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                >
                    <span>Final Approved</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                        {approvedCount}
                    </span>
                </button>

                <button
                    onClick={() => setSelectedStatus("REJECTED")}
                    className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedStatus === "REJECTED"
                            ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                            : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                    }`}
                >
                    <span>Rejected</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800">
                        {rejectedCount}
                    </span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by employee, OT type, work done..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9.5 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-neutral-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00B050]" />
                        <span className="text-xs font-semibold">Loading team overtime claims...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-4 px-6">Team Member</th>
                                    <th className="py-4 px-6">Date & Type</th>
                                    <th className="py-4 px-6">Claimed Hours</th>
                                    <th className="py-4 px-6">Work Performed</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium">
                                {filteredClaims.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-neutral-400">
                                            {searchQuery 
                                                ? `No overtime claims matching "${searchQuery}".` 
                                                : "No overtime claims currently pending for your assigned team."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClaims.map((item) => (
                                        <tr key={item.id} className="ot-row hover:bg-neutral-50/60 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {item.avatar ? (
                                                        <img
                                                            src={item.avatar}
                                                            alt={item.employeeName}
                                                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-200"
                                                            onError={(e: any) => {
                                                                e.target.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                                            {getInitials(item.employeeName)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-neutral-900 leading-tight">{item.employeeName}</p>
                                                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{item.employeeId} · {item.designation}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-xs text-neutral-700">
                                                <p className="font-semibold text-neutral-900">{item.date}</p>
                                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 mt-0.5 inline-block">
                                                    {item.otType}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 font-bold text-xs text-neutral-900 font-mono">
                                                <span className="px-2 py-1 bg-neutral-100 rounded-lg text-neutral-800">
                                                    +{item.hours} hrs
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-xs text-neutral-600 max-w-xs truncate" title={item.taskDone}>
                                                {item.taskDone}
                                            </td>

                                            <td className="py-4 px-6">
                                                {item.status === "Approved" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3 h-3 text-[#00B050]" /> Approved & Finalized
                                                    </span>
                                                )}
                                                {item.status === "Endorsed & Escalated" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        <CheckCircle2 className="w-3 h-3" /> Endorsed to Admin
                                                    </span>
                                                )}
                                                {item.status === "Pending Review" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3 h-3" /> Pending Review
                                                    </span>
                                                )}
                                                {item.status === "Rejected" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle className="w-3 h-3" /> Rejected
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                {item.status === "Pending Review" ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleOpenActionModal(item, "Reject")}
                                                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                                            title="Reject OT Claim"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenActionModal(item, "Approve")}
                                                            className="p-1.5 rounded-lg bg-[#00B050] text-white hover:bg-[#009b46] shadow-xs cursor-pointer transition-colors"
                                                            title="Approve & Recommend OT Claim"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 text-xs">—</span>
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

            {/* Action Confirmation Modal */}
            {activeClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="font-bold text-neutral-900 text-base">
                                {actionType === "Approve" ? "Recommend Overtime for Approval" : "Reject Overtime Claim"}
                            </h3>
                            <button
                                onClick={() => setActiveClaim(null)}
                                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleProcessAction} className="space-y-4">
                            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
                                <p className="text-[11px] text-neutral-500 font-medium">Overtime Claim Detail</p>
                                <p className="text-xs font-bold text-neutral-900 mt-0.5">
                                    {activeClaim.employeeName} ({activeClaim.hours} Hours · {activeClaim.otType})
                                </p>
                                <p className="text-[11px] text-neutral-600 mt-1 italic">"{activeClaim.taskDone}"</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Supervisor Remark</label>
                                <textarea
                                    rows={3}
                                    placeholder={
                                        actionType === "Approve" 
                                            ? "e.g. Critical release deliverables achieved; recommended for payroll inclusion." 
                                            : "e.g. Prior authorization was not obtained for this claim."
                                    }
                                    value={managerComment}
                                    onChange={(e) => setManagerComment(e.target.value)}
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveClaim(null)}
                                    disabled={processing}
                                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        actionType === "Approve" 
                                            ? "bg-[#00B050] hover:bg-[#009b46] shadow-[#00B050]/20" 
                                            : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                    }`}
                                >
                                    {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Confirm {actionType}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
