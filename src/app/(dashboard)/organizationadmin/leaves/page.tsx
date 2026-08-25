"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Filter, 
    Download, 
    UserCheck, 
    FileText, 
    Check, 
    X, 
    AlertCircle,
    Building2,
    CalendarCheck,
    CalendarRange,
    Plane,
    HeartPulse,
    Baby,
    Briefcase,
    Loader2,
    RefreshCw
} from "lucide-react";
import { api } from "@/lib/api-client";

interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    department: string;
    branch: string;
    leaveType: "Casual Leave" | "Sick Leave" | "Annual Leave" | "Maternity Leave" | "Unpaid Leave";
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    appliedOn: string;
    status: "Pending Org Admin" | "Approved" | "Rejected";
    managerApproval: "Approved" | "Pending" | "Rejected";
    managerComment?: string;
    orgComment?: string;
}

export default function OrganizationLeavesPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>("All");
    const [selectedType, setSelectedType] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state for Approval / Rejection
    const [activeModalRequest, setActiveModalRequest] = useState<LeaveRequest | null>(null);
    const [modalAction, setModalAction] = useState<"Approve" | "Reject">("Approve");
    const [orgNote, setOrgNote] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.leaves.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: LeaveRequest[] = res.data.map((l: any) => {
                    let formattedStatus: LeaveRequest["status"] = "Pending Org Admin";
                    const upperStatus = (l.status || l.orgApproval || "").toUpperCase();
                    if (upperStatus === "APPROVED") formattedStatus = "Approved";
                    else if (upperStatus === "REJECTED") formattedStatus = "Rejected";

                    let type: LeaveRequest["leaveType"] = "Casual Leave";
                    const upperType = (l.type || "").toUpperCase();
                    if (upperType === "SICK") type = "Sick Leave";
                    else if (upperType === "ANNUAL") type = "Annual Leave";
                    else if (upperType === "MATERNITY") type = "Maternity Leave";
                    else if (upperType === "UNPAID") type = "Unpaid Leave";

                    return {
                        id: l.id,
                        employeeName: l.employeeName || l.employeeId,
                        employeeId: l.employeeId,
                        avatar: l.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        department: l.department || "General",
                        branch: l.branch || "Main Branch",
                        leaveType: type,
                        startDate: l.startDate ? l.startDate.split("T")[0] : "",
                        endDate: l.endDate ? l.endDate.split("T")[0] : "",
                        totalDays: Number(l.totalDays || l.days || 1),
                        reason: l.reason || "Personal Leave",
                        appliedOn: l.createdAt ? l.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
                        status: formattedStatus,
                        managerApproval: l.managerApproval === "APPROVED" ? "Approved" : l.managerApproval === "REJECTED" ? "Rejected" : "Pending",
                        managerComment: l.managerComment,
                        orgComment: l.orgComment,
                    };
                });
                setLeaves(mapped);
            }
        } catch (e) {
            console.error("Failed to load leaves", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            const cards = containerRef.current.querySelectorAll(".leave-card");
            if (cards.length > 0) {
                const ctx = gsap.context(() => {
                    gsap.fromTo(
                        cards,
                        { opacity: 0, y: 12 },
                        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
                    );
                }, containerRef);
                return () => ctx.revert();
            }
        }
    }, [leaves, selectedStatus, selectedType, searchQuery, loading]);

    const handleOpenActionModal = (request: LeaveRequest, action: "Approve" | "Reject") => {
        setActiveModalRequest(request);
        setModalAction(action);
        setOrgNote("");
        setActionError(null);
    };

    const handleProcessAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModalRequest) return;
        setActionError(null);

        try {
            setIsProcessing(true);
            if (modalAction === "Approve") {
                await api.leaves.approve(activeModalRequest.id, orgNote.trim() || "Approved by Org Admin");
            } else {
                await api.leaves.reject(activeModalRequest.id, orgNote.trim() || "Rejected by Org Admin");
            }
            await fetchLeaves();
            setActiveModalRequest(null);
        } catch (err: any) {
            console.error("Failed to process leave action", err);
            setActionError(err?.message || "Failed to update leave request status");
        } finally {
            setIsProcessing(false);
        }
    };

    // Filter Logic
    const filteredLeaves = useMemo(() => {
        return leaves.filter((item) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                item.employeeName.toLowerCase().includes(q) ||
                item.employeeId.toLowerCase().includes(q) ||
                item.department.toLowerCase().includes(q) ||
                item.branch.toLowerCase().includes(q);

            const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
            const matchesType = selectedType === "All" || item.leaveType === selectedType;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [leaves, searchQuery, selectedStatus, selectedType]);

    // Live Quota Metrics Computed from Real Data
    const casualLeaveDays = useMemo(() => {
        return leaves
            .filter((l) => l.leaveType === "Casual Leave" && l.status === "Approved")
            .reduce((acc, curr) => acc + curr.totalDays, 0);
    }, [leaves]);

    const sickLeaveDays = useMemo(() => {
        return leaves
            .filter((l) => l.leaveType === "Sick Leave" && l.status === "Approved")
            .reduce((acc, curr) => acc + curr.totalDays, 0);
    }, [leaves]);

    const annualLeaveDays = useMemo(() => {
        return leaves
            .filter((l) => l.leaveType === "Annual Leave" && l.status === "Approved")
            .reduce((acc, curr) => acc + curr.totalDays, 0);
    }, [leaves]);

    const maternityLeaveDays = useMemo(() => {
        return leaves
            .filter((l) => l.leaveType === "Maternity Leave" && l.status === "Approved")
            .reduce((acc, curr) => acc + curr.totalDays, 0);
    }, [leaves]);

    const pendingCount = useMemo(() => {
        return leaves.filter((l) => l.status === "Pending Org Admin").length;
    }, [leaves]);

    const getLeaveIcon = (type: LeaveRequest["leaveType"]) => {
        switch (type) {
            case "Casual Leave": return <Briefcase className="w-4 h-4 text-emerald-600" />;
            case "Sick Leave": return <HeartPulse className="w-4 h-4 text-rose-600" />;
            case "Annual Leave": return <Plane className="w-4 h-4 text-blue-600" />;
            case "Maternity Leave": return <Baby className="w-4 h-4 text-purple-600" />;
            case "Unpaid Leave": return <CalendarRange className="w-4 h-4 text-amber-600" />;
        }
    };

    const handleExportCSV = () => {
        const headers = ["Employee Name", "Employee ID", "Department", "Branch", "Leave Type", "Start Date", "End Date", "Total Days", "Reason", "Applied On", "Status", "Manager Approval"];
        const rows = filteredLeaves.map((l) => [
            `"${l.employeeName}"`,
            `"${l.employeeId}"`,
            `"${l.department}"`,
            `"${l.branch}"`,
            `"${l.leaveType}"`,
            `"${l.startDate}"`,
            `"${l.endDate}"`,
            `"${l.totalDays}"`,
            `"${l.reason}"`,
            `"${l.appliedOn}"`,
            `"${l.status}"`,
            `"${l.managerApproval}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leave_report_${new Date().toISOString().split("T")[0]}.csv`);
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
                        <CalendarCheck className="w-6 h-6 text-[#00B050]" />
                        Organization Leave Management
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Review workforce leave applications, grant approvals, and manage company quotas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLeaves}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Refresh leaves"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer active:scale-95"
                    >
                        <Download className="w-4 h-4 text-stone-500" />
                        Export Leave Report
                    </button>
                </div>
            </div>

            {/* Leave Quotas Real Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Casual Leaves</p>
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-stone-900 mt-2">{casualLeaveDays} <span className="text-xs text-stone-400 font-semibold">days taken</span></p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Sick Leaves</p>
                        <HeartPulse className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-stone-900 mt-2">{sickLeaveDays} <span className="text-xs text-stone-400 font-semibold">days taken</span></p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Annual Leaves</p>
                        <Plane className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-stone-900 mt-2">{annualLeaveDays} <span className="text-xs text-stone-400 font-semibold">days taken</span></p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Maternity Leaves</p>
                        <Baby className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-stone-900 mt-2">{maternityLeaveDays} <span className="text-xs text-stone-400 font-semibold">days taken</span></p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pending Requests</p>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-amber-600 mt-2">{pendingCount} <span className="text-xs text-stone-400 font-semibold">waiting</span></p>
                </div>
            </div>

            {/* Filters Bar */}
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
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
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

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                    >
                        <option value="All">All Leave Types</option>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Annual Leave">Annual Leave</option>
                        <option value="Maternity Leave">Maternity Leave</option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                </div>
            </div>

            {/* Leaves List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-stone-400 bg-white rounded-3xl border border-stone-200/80">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span className="text-xs font-semibold">Loading leave requests from database...</span>
                </div>
            ) : filteredLeaves.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl border border-stone-200/80 text-center text-stone-400 space-y-2">
                    <CalendarCheck className="w-10 h-10 text-stone-300 mx-auto mb-1" />
                    <p className="font-bold text-stone-800 text-sm">No leave applications found</p>
                    <p className="text-xs text-stone-400">There are no leave requests matching your search and filter criteria.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLeaves.map((request) => (
                        <div key={request.id} className="leave-card bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
                                <div className="flex items-center gap-3.5">
                                    <img
                                        src={request.avatar}
                                        alt={request.employeeName}
                                        className="w-11 h-11 rounded-full object-cover border border-stone-200"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-stone-900 text-sm leading-tight">{request.employeeName}</h3>
                                            <span className="text-xs text-stone-400 font-semibold">({request.employeeId})</span>
                                        </div>
                                        <p className="text-xs text-stone-500 mt-0.5">{request.department} · {request.branch}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 rounded-xl border border-stone-200/60 text-xs font-semibold text-stone-700">
                                        {getLeaveIcon(request.leaveType)}
                                        {request.leaveType}
                                    </div>
                                    {request.status === "Approved" && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                        </span>
                                    )}
                                    {request.status === "Rejected" && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                            <XCircle className="w-3.5 h-3.5" /> Rejected
                                        </span>
                                    )}
                                    {request.status === "Pending Org Admin" && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                            <Clock className="w-3.5 h-3.5" /> Pending Org Admin
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="space-y-1">
                                    <p className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Leave Duration</p>
                                    <p className="font-extrabold text-stone-800 flex items-center gap-1.5 mt-0.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#00B050]" />
                                        {request.startDate} to {request.endDate}
                                        <span className="ml-1 px-2 py-0.5 bg-emerald-50 text-[#00B050] font-extrabold rounded-md text-[10px] border border-emerald-100">
                                            {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
                                        </span>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Manager Status</p>
                                    <p className="text-stone-700 flex items-center gap-1 mt-0.5 font-medium">
                                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="font-bold text-emerald-700">{request.managerApproval}</span>
                                        {request.managerComment && ` · "${request.managerComment}"`}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Applied Date</p>
                                    <p className="text-stone-700 font-semibold mt-0.5">{request.appliedOn}</p>
                                </div>
                            </div>

                            <div className="bg-stone-50/80 p-3.5 rounded-2xl text-xs text-stone-700 border border-stone-100">
                                <span className="font-bold text-stone-900">Reason: </span>
                                {request.reason}
                            </div>

                            {request.orgComment && (
                                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-900">
                                    <span className="font-bold">Org Admin Note: </span>
                                    {request.orgComment}
                                </div>
                            )}

                            {request.status === "Pending Org Admin" && (
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => handleOpenActionModal(request, "Reject")}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleOpenActionModal(request, "Approve")}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-[#00B050] text-white hover:bg-[#009b46] shadow-sm shadow-[#00B050]/20 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Grant Approval
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Approval / Rejection Action Modal */}
            {activeModalRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-4 border border-stone-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="font-bold text-stone-900 text-base">
                                {modalAction === "Approve" ? "Grant Final Leave Approval" : "Reject Leave Application"}
                            </h3>
                            <button
                                onClick={() => setActiveModalRequest(null)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {actionError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{actionError}</span>
                            </div>
                        )}

                        <form onSubmit={handleProcessAction} className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                                <p className="text-[11px] font-bold text-stone-400 uppercase">Applicant</p>
                                <p className="text-sm font-bold text-stone-900">
                                    {activeModalRequest.employeeName} ({activeModalRequest.employeeId})
                                </p>
                                <p className="text-xs text-stone-500">
                                    {activeModalRequest.leaveType} · {activeModalRequest.totalDays} Days ({activeModalRequest.startDate} to {activeModalRequest.endDate})
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Admin Note / Justification (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={modalAction === "Approve" ? "e.g. Approved with full pay" : "e.g. Due to conflicting project deadline"}
                                    value={orgNote}
                                    onChange={(e) => setOrgNote(e.target.value)}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModalRequest(null)}
                                    disabled={isProcessing}
                                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                                        modalAction === "Approve" 
                                            ? "bg-[#00B050] hover:bg-[#009b46] shadow-[#00B050]/20" 
                                            : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                    }`}
                                >
                                    {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Confirm {modalAction}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
