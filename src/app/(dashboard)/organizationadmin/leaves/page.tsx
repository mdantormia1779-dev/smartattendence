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
    Briefcase
} from "lucide-react";

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

const initialLeaves: LeaveRequest[] = [
    {
        id: "leave-101",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        department: "Information Technology",
        branch: "Head Office – Dhaka",
        leaveType: "Annual Leave",
        startDate: "2026-08-25",
        endDate: "2026-08-28",
        totalDays: 4,
        reason: "Family vacation to Cox's Bazar and personal downtime.",
        appliedOn: "2026-08-18",
        status: "Pending Org Admin",
        managerApproval: "Approved",
        managerComment: "All sprint deliverables are on track. Recommended for approval.",
    },
    {
        id: "leave-102",
        employeeName: "Nusrat Jahan",
        employeeId: "EMP-1043",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        department: "Accounts & Finance",
        branch: "Head Office – Dhaka",
        leaveType: "Sick Leave",
        startDate: "2026-08-19",
        endDate: "2026-08-20",
        totalDays: 2,
        reason: "Severe viral fever and doctor recommended bed rest.",
        appliedOn: "2026-08-18",
        status: "Approved",
        managerApproval: "Approved",
        managerComment: "Approved immediately. Medical certificate attached.",
        orgComment: "Approved with full pay.",
    },
    {
        id: "leave-103",
        employeeName: "Tanvir Ahmed",
        employeeId: "EMP-1044",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        department: "Marketing",
        branch: "Gulshan Branch",
        leaveType: "Casual Leave",
        startDate: "2026-08-22",
        endDate: "2026-08-22",
        totalDays: 1,
        reason: "Urgent personal family obligation in hometown.",
        appliedOn: "2026-08-17",
        status: "Pending Org Admin",
        managerApproval: "Approved",
        managerComment: "Substitute coordinator assigned for marketing campaigns.",
    },
    {
        id: "leave-104",
        employeeName: "Sabrina Noor",
        employeeId: "EMP-1045",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        department: "Human Resources",
        branch: "Head Office – Dhaka",
        leaveType: "Casual Leave",
        startDate: "2026-08-10",
        endDate: "2026-08-11",
        totalDays: 2,
        reason: "Personal errands and bank tasks.",
        appliedOn: "2026-08-08",
        status: "Approved",
        managerApproval: "Approved",
        orgComment: "Leave granted.",
    },
    {
        id: "leave-105",
        employeeName: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        department: "Information Technology",
        branch: "Head Office – Dhaka",
        leaveType: "Unpaid Leave",
        startDate: "2026-08-01",
        endDate: "2026-08-05",
        totalDays: 5,
        reason: "Attending overseas tech conference.",
        appliedOn: "2026-07-28",
        status: "Rejected",
        managerApproval: "Approved",
        orgComment: "Critical project release milestone coincided with requested period.",
    },
];

export default function OrganizationLeavesPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
    const [selectedStatus, setSelectedStatus] = useState<string>("All");
    const [selectedType, setSelectedType] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state for Approval / Rejection
    const [activeModalRequest, setActiveModalRequest] = useState<LeaveRequest | null>(null);
    const [modalAction, setModalAction] = useState<"Approve" | "Reject">("Approve");
    const [orgNote, setOrgNote] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".leave-card",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [leaves, selectedStatus, selectedType, searchQuery]);

    const handleOpenActionModal = (request: LeaveRequest, action: "Approve" | "Reject") => {
        setActiveModalRequest(request);
        setModalAction(action);
        setOrgNote("");
    };

    const handleProcessAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModalRequest) return;

        setLeaves(leaves.map(req => {
            if (req.id === activeModalRequest.id) {
                return {
                    ...req,
                    status: modalAction === "Approve" ? "Approved" : "Rejected",
                    orgComment: orgNote || (modalAction === "Approve" ? "Approved by Organization Admin" : "Rejected by Organization Admin"),
                };
            }
            return req;
        }));
        setActiveModalRequest(null);
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
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00B050] flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">10 Days</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Per employee / year</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Sick Leave</p>
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <HeartPulse className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">14 Days</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Full pay allowance</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Annual Leave</p>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Plane className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">20 Days</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Paid vacation</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Maternity</p>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Baby className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">112 Days</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Statutory paid</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Pending Action</p>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-amber-600 mt-2">{pendingCount} Requests</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Awaiting decision</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
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

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5">
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
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">Leave Details</th>
                                <th className="py-4 px-6">Duration & Dates</th>
                                <th className="py-4 px-6">Reason</th>
                                <th className="py-4 px-6">Manager Status</th>
                                <th className="py-4 px-6">Org Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredLeaves.length > 0 ? (
                                filteredLeaves.map((item) => (
                                    <tr key={item.id} className="leave-card hover:bg-gray-50/60 transition-colors">
                                        {/* Employee info */}
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

                                        {/* Leave Type */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                                                {getLeaveIcon(item.leaveType)}
                                                {item.leaveType}
                                            </div>
                                            <span className="text-[11px] text-gray-400 mt-0.5">Applied: {item.appliedOn}</span>
                                        </td>

                                        {/* Duration */}
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-gray-900 text-xs">
                                                {item.totalDays} {item.totalDays === 1 ? "Day" : "Days"}
                                            </div>
                                            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                                {item.startDate} → {item.endDate}
                                            </div>
                                        </td>

                                        {/* Reason */}
                                        <td className="py-4 px-6 max-w-xs">
                                            <p className="text-xs text-gray-700 line-clamp-2">{item.reason}</p>
                                            {item.managerComment && (
                                                <p className="text-[11px] text-emerald-600 mt-1 italic">
                                                    Mgr note: {item.managerComment}
                                                </p>
                                            )}
                                        </td>

                                        {/* Manager Status */}
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                                <CheckCircle2 className="w-3 h-3" /> Approved
                                            </span>
                                        </td>

                                        {/* Org Status */}
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                item.status === "Approved"
                                                    ? "bg-emerald-50 text-[#00B050] border border-emerald-200/60"
                                                    : item.status === "Rejected"
                                                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                                            }`}>
                                                {item.status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {item.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                                                {item.status === "Pending Org Admin" && <Clock className="w-3.5 h-3.5" />}
                                                {item.status === "Pending Org Admin" ? "Pending Approval" : item.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            {item.status === "Pending Org Admin" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenActionModal(item, "Approve")}
                                                        className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenActionModal(item, "Reject")}
                                                        className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                                        No leave requests found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approval / Rejection Decision Modal */}
            {activeModalRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {modalAction === "Approve" ? "Approve Leave Request" : "Reject Leave Request"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {activeModalRequest.employeeName} · {activeModalRequest.leaveType} ({activeModalRequest.totalDays} Days)
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveModalRequest(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProcessAction} className="space-y-4">
                            <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="font-bold text-gray-900">{activeModalRequest.startDate} to {activeModalRequest.endDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Reason:</span>
                                    <span className="text-gray-800 font-medium text-right max-w-[200px]">{activeModalRequest.reason}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Organization Remarks (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={modalAction === "Approve" ? "e.g. Approved with full pay." : "e.g. Unable to grant due to staffing shortage."}
                                    value={orgNote}
                                    onChange={(e) => setOrgNote(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setActiveModalRequest(null)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all cursor-pointer ${
                                        modalAction === "Approve"
                                            ? "bg-[#00B050] hover:bg-[#009b46] shadow-[#00B050]/20"
                                            : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                    }`}
                                >
                                    {modalAction === "Approve" ? "Confirm Approval" : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
