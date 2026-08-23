"use client";

import React, { useState, useEffect } from "react";
import { 
    BellRing, 
    Send, 
    Building2, 
    Users, 
    UserCheck, 
    User, 
    CheckCircle2, 
    Search, 
    RefreshCw,
    ShieldCheck
} from "lucide-react";

export default function OrgAdminNotificationCenterPage() {
    const [scope, setScope] = useState<"ORG_BROADCAST" | "ROLE_BROADCAST" | "TARGETED_USER">("ORG_BROADCAST");
    const [targetRole, setTargetRole] = useState<"MANAGER" | "EMPLOYEE">("EMPLOYEE");
    const [recipientUserId, setRecipientUserId] = useState("user-emp-1");
    const [category, setCategory] = useState("ATTENDANCE");
    const [type, setType] = useState<"INFO" | "SUCCESS" | "WARNING" | "ALERT">("INFO");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");

    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/notifications?userId=user-org-1&role=ORG_ADMIN&organizationId=org-1");
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            alert("Please fill in title and message");
            return;
        }

        try {
            setIsSending(true);
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: "user-org-1",
                    senderName: "Sarah Rahman (Org Admin)",
                    senderRole: "ORG_ADMIN",
                    senderOrgId: "org-1",
                    scope,
                    targetOrgId: "org-1",
                    targetRole: scope === "ROLE_BROADCAST" ? targetRole : null,
                    recipientUserId: scope === "TARGETED_USER" ? recipientUserId : null,
                    title,
                    message,
                    category,
                    type,
                    link: link || undefined,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSentSuccess(true);
                setTitle("");
                setMessage("");
                setLink("");
                setTimeout(() => setSentSuccess(false), 3000);
                fetchNotifications();
            } else {
                alert(data.error || "Failed to dispatch notification");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <BellRing className="w-6 h-6 text-[#00B050]" />
                        Company Internal Notification Center
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Send targeted policy announcements, holiday alerts, and shift notices to your organization's managers & employees
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-[#00B050] px-3 py-1.5 rounded-xl border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" /> Vertex Technologies Scoped
                    </span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Dispatch Form */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Send className="w-4 h-4 text-[#00B050]" />
                            Dispatch Internal Notice
                        </h2>
                        {sentSuccess && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Delivered to staff!
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="space-y-4 text-xs">
                        {/* Scope Selector */}
                        <div>
                            <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">
                                Target Audience in Vertex Tech
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "ORG_BROADCAST", label: "All Staff", desc: "All 291 Members", icon: Building2 },
                                    { id: "ROLE_BROADCAST", label: "By Role", desc: "Managers or Emps", icon: Users },
                                    { id: "TARGETED_USER", label: "Direct Member", desc: "Single Employee", icon: User },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = scope === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setScope(item.id as any)}
                                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                                                isSelected
                                                    ? "bg-[#00B050]/10 border-[#00B050] text-[#00B050] shadow-xs"
                                                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/60"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <div>
                                                <p className="font-bold text-xs">{item.label}</p>
                                                <p className="text-[10px] text-gray-400">{item.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Role Filter */}
                        {scope === "ROLE_BROADCAST" && (
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                                <label className="block font-semibold text-gray-700 mb-1">Select Role</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="MANAGER">All Department & Branch Managers (4 Leads)</option>
                                    <option value="EMPLOYEE">All Regular Staff & Engineers (287 Members)</option>
                                </select>
                            </div>
                        )}

                        {/* Direct User Picker */}
                        {scope === "TARGETED_USER" && (
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                                <label className="block font-semibold text-gray-700 mb-1">Select Employee</label>
                                <select
                                    value={recipientUserId}
                                    onChange={(e) => setRecipientUserId(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="user-emp-1">Arif Chowdhury (EMP-1042 · IT Dept)</option>
                                    <option value="user-mgr-1">Tanvir Ahmed (MGR-001 · IT Lead)</option>
                                    <option value="user-emp-2">Mahmudul Hasan (EMP-1047 · IT Dept)</option>
                                    <option value="user-emp-3">Farhana Islam (EMP-1051 · Accounts)</option>
                                </select>
                            </div>
                        )}

                        {/* Category & Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="ATTENDANCE">Attendance & Shifts</option>
                                    <option value="LEAVE">Leave & Holidays</option>
                                    <option value="PAYROLL">Payroll & Salary</option>
                                    <option value="SYSTEM">General Company Notice</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Notice Priority</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="INFO">Information</option>
                                    <option value="SUCCESS">Important Update (Green)</option>
                                    <option value="WARNING">Urgent Action Required</option>
                                    <option value="ALERT">Critical Policy Alert</option>
                                </select>
                            </div>
                        </div>

                        {/* Title & Message */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Notice Subject</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Mandatory Face Registration Deadline"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Notice Message</label>
                            <textarea
                                rows={4}
                                required
                                placeholder="Write the announcement for your team..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full py-3 bg-[#00B050] hover:bg-[#009b46] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                        >
                            <Send className="w-4 h-4" />
                            {isSending ? "Dispatching..." : "Send Company Notice"}
                        </button>
                    </form>
                </div>

                {/* Sent History Log */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Company Notices Delivered</h2>
                            <p className="text-xs text-gray-500">Live stream of notifications received by Vertex Tech staff</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors space-y-2 text-xs"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {n.scope.replace("_", " ")}
                                        </span>
                                        <span className="font-bold text-gray-900">{n.title}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">{n.createdAt.slice(0, 16)}</span>
                                </div>

                                <p className="text-gray-600 text-[11px] leading-relaxed">{n.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
