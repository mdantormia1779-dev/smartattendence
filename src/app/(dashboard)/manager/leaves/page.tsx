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
    Loader2,
    RefreshCw,
    UserX,
    Sparkles,
    AlertCircle
} from "lucide-react";
import { api } from "@/lib/api-client";

interface TeamLeaveRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string | null;
    designation: string;
    department: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    appliedOn: string;
    status: "Pending Review" | "Endorsed & Escalated" | "Approved" | "Rejected";
    managerComment?: string;
    attachmentUrl?: string;
}

export default function ManagerLeavesPage() {
    const [requests, setRequests] = useState<TeamLeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    // Modal
    const [activeRequest, setActiveRequest] = useState<TeamLeaveRequest | null>(null);
    const [actionType, setActionType] = useState<"Approve" | "Reject">("Approve");
    const [managerNote, setManagerNote] = useState("");
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchRequests = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const [leavesRes, empRes] = await Promise.allSettled([
                api.leaves.getAll(),
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

            if (leavesRes.status === "fulfilled" && leavesRes.value?.success && Array.isArray(leavesRes.value.data)) {
                const mapped: TeamLeaveRequest[] = leavesRes.value.data.map((item: any) => {
                    const emp = empMap[item.employeeId] || item.employee || {};
                    const empFullName = emp.name || emp.fullName || item.employeeName || `Staff (${item.employeeId})`;
                    const empCode = emp.employeeCode || emp.code || item.employeeId || "EMP-1000";

                    // Determine Status
                    let formattedStatus: TeamLeaveRequest["status"] = "Pending Review";
                    if (item.status === "REJECTED" || item.managerApproval === "REJECTED" || item.adminApproval === "REJECTED") {
                        formattedStatus = "Rejected";
                    } else if (item.status === "APPROVED" || item.adminApproval === "APPROVED") {
                        formattedStatus = "Approved";
                    } else if (item.managerApproval === "APPROVED") {
                        formattedStatus = "Endorsed & Escalated";
                    }

                    // Determine Type
                    let formattedType = "Casual Leave";
                    const rawType = (item.type || "").toUpperCase();
                    if (rawType === "SICK" || rawType.includes("SICK")) formattedType = "Sick Leave";
                    else if (rawType === "ANNUAL" || rawType.includes("ANNUAL")) formattedType = "Annual Leave";
                    else if (rawType === "MATERNITY") formattedType = "Maternity Leave";
                    else if (rawType === "PATERNITY") formattedType = "Paternity Leave";
                    else if (rawType === "UNPAID") formattedType = "Unpaid Leave";
                    else if (item.type) formattedType = item.type;

                    // Dates
                    let startStr = item.startDate ? String(item.startDate).split("T")[0] : "—";
                    let endStr = item.endDate ? String(item.endDate).split("T")[0] : "—";

                    let days = item.daysCount || item.totalDays;
                    if (!days && item.startDate && item.endDate) {
                        try {
                            const d1 = new Date(item.startDate);
                            const d2 = new Date(item.endDate);
                            days = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                        } catch {
                            days = 1;
                        }
                    }

                    let appliedDate = "Recent";
                    if (item.createdAt) {
                        try {
                            appliedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            });
                        } catch {}
                    }

                    return {
                        id: item.id,
                        employeeName: empFullName,
                        employeeId: empCode,
                        avatar: emp.profilePicture || emp.avatarUrl || emp.avatar || null,
                        designation: emp.designation || emp.role || "Team Staff",
                        department: emp.departments?.name || emp.department?.name || emp.department || "Operations",
                        leaveType: formattedType,
                        startDate: startStr,
                        endDate: endStr,
                        totalDays: days || 1,
                        reason: item.reason || "No reason provided",
                        appliedOn: appliedDate,
                        status: formattedStatus,
                        managerComment: item.managerComment || item.adminComment,
                        attachmentUrl: item.attachmentS3Key || item.attachmentUrl,
                    };
                });

                setRequests(mapped);
            } else {
                setRequests([]);
            }
        } catch (e) {
            console.error("Failed to load team leave requests:", e);
            setRequests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        const handleUpdate = () => fetchRequests();
        window.addEventListener("leaves-updated", handleUpdate);
        return () => window.removeEventListener("leaves-updated", handleUpdate);
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".leave-row",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [requests, selectedStatus, loading, searchQuery]);

    const handleOpenAction = (req: TeamLeaveRequest, type: "Approve" | "Reject") => {
        setActiveRequest(req);
        setActionType(type);
        setManagerNote("");
    };

    const handleProcessAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeRequest) return;

        setProcessing(true);
        try {
            if (actionType === "Approve") {
                await api.leaves.approve(activeRequest.id, managerNote || "Manager Approved and Endorsed");
                setSuccessMessage(`Leave for ${activeRequest.employeeName} approved & endorsed!`);
            } else {
                await api.leaves.reject(activeRequest.id, managerNote || "Manager Rejected");
                setSuccessMessage(`Leave for ${activeRequest.employeeName} rejected.`);
            }

            setTimeout(() => setSuccessMessage(null), 4000);

            // Dispatch global event for live counter updates
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("leaves-updated"));
                window.dispatchEvent(new CustomEvent("attendance-updated"));
            }

            await fetchRequests();
        } catch (e) {
            console.error("Failed to process leave action:", e);
        } finally {
            setProcessing(false);
            setActiveRequest(null);
        }
    };

    const filteredRequests = requests.filter((r) => {
        const matchesSearch =
            r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.designation.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (selectedStatus === "PENDING") matchesStatus = r.status === "Pending Review";
        else if (selectedStatus === "ENDORSED") matchesStatus = r.status === "Endorsed & Escalated";
        else if (selectedStatus === "APPROVED") matchesStatus = r.status === "Approved";
        else if (selectedStatus === "REJECTED") matchesStatus = r.status === "Rejected";

        return matchesSearch && matchesStatus;
    });

    const pendingCount = requests.filter((r) => r.status === "Pending Review").length;
    const endorsedCount = requests.filter((r) => r.status === "Endorsed & Escalated").length;
    const approvedCount = requests.filter((r) => r.status === "Approved").length;
    const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

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
                        <CalendarCheck className="w-6 h-6 text-[#00B050]" />
                        Team Leave Approvals
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Review, endorse, or reject team leave applications before administrative escalation
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => fetchRequests(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh leave requests"
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
                    <span>All Applications</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-700/60 text-white">
                        {requests.length}
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
                        placeholder="Search by employee, leave type, reason..."
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

            {/* Requests List */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-neutral-400 bg-white rounded-2xl border border-neutral-200/80 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00B050]" />
                    <span className="text-xs font-semibold">Loading team leave requests...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-neutral-200/80 text-center space-y-3 shadow-xs">
                            <UserX className="w-12 h-12 text-neutral-300 mx-auto" />
                            <h3 className="text-base font-bold text-neutral-800">No Leave Applications Found</h3>
                            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                                {searchQuery 
                                    ? `No leave records matching "${searchQuery}".` 
                                    : "No leave applications currently pending for your assigned team members."}
                            </p>
                        </div>
                    ) : (
                        filteredRequests.map((req) => (
                            <div key={req.id} className="leave-row bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3.5">
                                    <div className="flex items-center gap-3">
                                        {req.avatar ? (
                                            <img
                                                src={req.avatar}
                                                alt={req.employeeName}
                                                className="w-10 h-10 rounded-xl object-cover ring-1 ring-neutral-200"
                                                onError={(e: any) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                                {getInitials(req.employeeName)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-neutral-900 text-sm leading-tight">{req.employeeName}</h3>
                                            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{req.employeeId} · {req.designation} · {req.department}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {req.status === "Approved" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00B050]" /> Approved & Finalized
                                            </span>
                                        )}
                                        {req.status === "Endorsed & Escalated" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Endorsed & Escalated to Admin
                                            </span>
                                        )}
                                        {req.status === "Pending Review" && (
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-600 bg-neutral-50/60 p-4 rounded-xl border border-neutral-100">
                                    <div>
                                        <p className="text-neutral-400 font-bold uppercase text-[10px]">Leave Type</p>
                                        <p className="font-bold text-neutral-900 mt-0.5">{req.leaveType}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 font-bold uppercase text-[10px]">Requested Duration</p>
                                        <p className="font-bold text-neutral-900 mt-0.5">
                                            {req.startDate} to {req.endDate}
                                        </p>
                                        <span className="text-[10px] text-neutral-500 font-semibold">({req.totalDays} Total Days)</span>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 font-bold uppercase text-[10px]">Applied On</p>
                                        <p className="font-semibold text-neutral-800 mt-0.5">{req.appliedOn}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 font-bold uppercase text-[10px]">Reason</p>
                                        <p className="font-semibold text-neutral-800 mt-0.5 line-clamp-2" title={req.reason}>
                                            {req.reason}
                                        </p>
                                    </div>
                                </div>

                                {req.managerComment && (
                                    <div className="text-xs bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200/60 text-neutral-600">
                                        <span className="font-bold text-neutral-700">Supervisor Note: </span>
                                        <span>{req.managerComment}</span>
                                    </div>
                                )}

                                {req.status === "Pending Review" && (
                                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                                        <button
                                            onClick={() => handleOpenAction(req, "Reject")}
                                            className="px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleOpenAction(req, "Approve")}
                                            className="px-4 py-2 bg-[#00B050] text-white hover:bg-[#009b46] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                                        >
                                            Approve & Endorse
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
                    <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="font-bold text-neutral-900 text-base">
                                {actionType === "Approve" ? "Endorse & Recommend Leave" : "Reject Leave Request"}
                            </h3>
                            <button
                                onClick={() => setActiveRequest(null)}
                                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleProcessAction} className="space-y-4">
                            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
                                <p className="text-[11px] text-neutral-500 font-medium">Employee Application</p>
                                <p className="text-xs font-bold text-neutral-900 mt-0.5">
                                    {activeRequest.employeeName} ({activeRequest.leaveType} · {activeRequest.totalDays} Days)
                                </p>
                                <p className="text-[11px] text-neutral-600 mt-1 italic">"{activeRequest.reason}"</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Supervisor Remark</label>
                                <textarea
                                    rows={3}
                                    placeholder={
                                        actionType === "Approve" 
                                            ? "e.g. Work delegated to team; recommended for approval." 
                                            : "e.g. Critical deployment sprint scheduled during this window."
                                    }
                                    value={managerNote}
                                    onChange={(e) => setManagerNote(e.target.value)}
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveRequest(null)}
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
