"use client";

import React, { useState, useEffect, useRef } from "react";
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
    Loader2
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
    managerApproval: "Approved" | "Pending";
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

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.leaves.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: LeaveRequest[] = res.data.map((l: any) => {
                    let formattedStatus: LeaveRequest["status"] = "Pending Org Admin";
                    if (l.orgApproval === "APPROVED") formattedStatus = "Approved";
                    else if (l.orgApproval === "REJECTED") formattedStatus = "Rejected";

                    let type: LeaveRequest["leaveType"] = "Casual Leave";
                    if (l.type === "SICK") type = "Sick Leave";
                    else if (l.type === "ANNUAL") type = "Annual Leave";
                    else if (l.type === "MATERNITY") type = "Maternity Leave";
                    else if (l.type === "UNPAID") type = "Unpaid Leave";

                    return {
                        id: l.id,
                        employeeName: l.employeeName || l.employeeId,
                        employeeId: l.employeeId,
                        avatar: l.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        department: l.department || "Information Technology",
                        branch: l.branch || "Head Office – Dhaka",
                        leaveType: type,
                        startDate: l.startDate,
                        endDate: l.endDate,
                        totalDays: l.daysCount || l.totalDays || 1,
                        reason: l.reason || "Personal Leave",
                        appliedOn: l.createdAt ? l.createdAt.split("T")[0] : "2026-08-18",
                        status: formattedStatus,
                        managerApproval: l.managerApproval === "APPROVED" ? "Approved" : "Pending",
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
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".leave-card",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [leaves, selectedStatus, selectedType, searchQuery, loading]);

    const handleOpenActionModal = (request: LeaveRequest, action: "Approve" | "Reject") => {
        setActiveModalRequest(request);
        setModalAction(action);
        setOrgNote("");
    };

    const handleProcessAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModalRequest) return;

        try {
            if (modalAction === "Approve") {
                await api.leaves.approve(activeModalRequest.id, orgNote || "Approved by Org Admin");
            } else {
                await api.leaves.reject(activeModalRequest.id, orgNote || "Rejected by Org Admin");
            }
            await fetchLeaves();
        } catch (e) {
            console.error("Failed to process leave action", e);
        } finally {
            setActiveModalRequest(null);
        }
    };

    const filteredLeaves = leaves.filter(item => {
        const matchesSearch = 
            item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
        const matchesType = selectedType === "All" || item.leaveType === selectedType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const pendingCount = leaves.filter(l => l.status === "Pending Org Admin").length;

    const getLeaveIcon = (type: LeaveRequest["leaveType"]) => {
        switch (type) {
            case "Casual Leave": return <Briefcase className="w-4 h-4 text-emerald-600" />;
            case "Sick Leave": return <HeartPulse className="w-4 h-4 text-rose-600" />;
            case "Annual Leave": return <Plane className="w-4 h-4 text-blue-600" />;
            case "Maternity Leave": return <Baby className="w-4 h-4 text-purple-600" />;
            case "Unpaid Leave": return <CalendarRange className="w-4 h-4 text-amber-600" />;
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-[#00B050]" />
                        Organization Leave Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Review leave applications, manage approval workflows & monitor company quotas
                    </p>
                </div>
                <button
                    onClick={() => alert("Leave report exported successfully!")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Export Leave Report
                </button>
            </div>

            {/* Leave Policy Quotas Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Casual Leave</p>
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-2">14 <span className="text-xs text-gray-400 font-normal">days/yr</span></p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Sick Leave</p>
                        <HeartPulse className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-2">14 <span className="text-xs text-gray-400 font-normal">days/yr</span></p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Annual Leave</p>
                        <Plane className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-2">20 <span className="text-xs text-gray-400 font-normal">days/yr</span></p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Maternity Leave</p>
                        <Baby className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-2">112 <span className="text-xs text-gray-400 font-normal">days (16 wks)</span></p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Pending Requests</p>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-amber-600 mt-2">{pendingCount} <span className="text-xs text-gray-400 font-normal">waiting</span></p>
                </div>
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

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
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
                <div className="flex flex-col items-center justify-center p-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span>Loading leave requests...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLeaves.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">
                            No leave applications found matching your criteria.
                        </div>
                    ) : (
                        filteredLeaves.map((request) => (
                            <div key={request.id} className="leave-card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={request.avatar}
                                            alt={request.employeeName}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 text-sm">{request.employeeName}</h3>
                                                <span className="text-xs text-gray-400">({request.employeeId})</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{request.department} · {request.branch}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-700">
                                            {getLeaveIcon(request.leaveType)}
                                            {request.leaveType}
                                        </div>
                                        {request.status === "Approved" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                            </span>
                                        )}
                                        {request.status === "Rejected" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                <XCircle className="w-3.5 h-3.5" /> Rejected
                                            </span>
                                        )}
                                        {request.status === "Pending Org Admin" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                <Clock className="w-3.5 h-3.5" /> Pending Org Admin
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="space-y-1">
                                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Leave Duration</p>
                                        <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-[#00B050]" />
                                            {request.startDate} to {request.endDate}
                                            <span className="ml-1 px-2 py-0.5 bg-emerald-50 text-[#00B050] font-extrabold rounded-md text-[10px]">
                                                {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Manager Endorsement</p>
                                        <p className="text-gray-700 flex items-center gap-1">
                                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="font-bold text-emerald-700">Recommended</span>: {request.managerComment || "Tasks delegated & approved"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Applied On</p>
                                        <p className="text-gray-700 font-medium">{request.appliedOn}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/75 p-3 rounded-xl text-xs text-gray-700">
                                    <span className="font-bold text-gray-900">Reason: </span>
                                    {request.reason}
                                </div>

                                {request.status === "Pending Org Admin" && (
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => handleOpenActionModal(request, "Reject")}
                                            className="flex items-center gap-1.5 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleOpenActionModal(request, "Approve")}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-[#00B050] text-white hover:bg-[#009b46] shadow-sm shadow-[#00B050]/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Grant Approval
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Approval / Rejection Modal */}
            {activeModalRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">
                                {modalAction === "Approve" ? "Grant Final Leave Approval" : "Reject Leave Application"}
                            </h3>
                            <button
                                onClick={() => setActiveModalRequest(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleProcessAction} className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500">Applicant</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {activeModalRequest.employeeName} ({activeModalRequest.leaveType} · {activeModalRequest.totalDays} Days)
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Admin Note / Justification (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={modalAction === "Approve" ? "e.g. Approved with full pay" : "e.g. Due to conflicting critical deadline"}
                                    value={orgNote}
                                    onChange={(e) => setOrgNote(e.target.value)}
                                    className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModalRequest(null)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors cursor-pointer ${
                                        modalAction === "Approve" 
                                            ? "bg-[#00B050] hover:bg-[#009b46] shadow-[#00B050]/20" 
                                            : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                    }`}
                                >
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
