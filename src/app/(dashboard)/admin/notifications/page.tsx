"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    BellRing, 
    Send, 
    Globe, 
    Building2, 
    Users, 
    User, 
    CheckCircle2, 
    AlertTriangle, 
    Info, 
    ShieldAlert, 
    DollarSign,
    Calendar,
    Sparkles,
    Search,
    RefreshCw
} from "lucide-react";

export default function AdminNotificationCenterPage() {
    const [scope, setScope] = useState<"GLOBAL_BROADCAST" | "ORG_BROADCAST" | "ROLE_BROADCAST" | "TARGETED_USER">("GLOBAL_BROADCAST");
    const [targetOrgId, setTargetOrgId] = useState("org-1");
    const [targetRole, setTargetRole] = useState<"ORG_ADMIN" | "MANAGER" | "EMPLOYEE">("ORG_ADMIN");
    const [recipientUserId, setRecipientUserId] = useState("");
    const [category, setCategory] = useState("SYSTEM");
    const [type, setType] = useState<"INFO" | "SUCCESS" | "WARNING" | "ALERT">("INFO");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");
    
    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/notifications?userId=user-super-1&role=SUPER_ADMIN");
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
            alert("Please fill in both title and message");
            return;
        }

        try {
            setIsSending(true);
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: "user-super-1",
                    senderName: "Super Admin",
                    senderRole: "SUPER_ADMIN",
                    scope,
                    targetOrgId: scope === "ORG_BROADCAST" ? targetOrgId : null,
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
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <BellRing className="w-6 h-6 text-[#00B050]" />
                        Platform Notification Center & Broadcast
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Dispatch global system broadcasts, target specific organizations, filter by user roles, or direct message any individual
                    </p>
                </div>
                <button
                    onClick={fetchNotifications}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Main Grid: Send Form (Left) & Sent Log (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Dispatch Form */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Send className="w-4 h-4 text-[#00B050]" />
                            Create & Dispatch Notification
                        </h2>
                        {sentSuccess && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched!
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="space-y-4 text-xs">
                        {/* Scope Selector */}
                        <div>
                            <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">
                                1. Target Scope & Audience
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "GLOBAL_BROADCAST", label: "Global Platform", desc: "All Orgs & Users", icon: Globe },
                                    { id: "ORG_BROADCAST", label: "Target Organization", desc: "Specific Company", icon: Building2 },
                                    { id: "ROLE_BROADCAST", label: "Target Role", desc: "All Admins / Mgrs / Emps", icon: Users },
                                    { id: "TARGETED_USER", label: "Direct Individual", desc: "Single User ID", icon: User },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = scope === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setScope(item.id as any)}
                                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                                isSelected
                                                    ? "bg-[#00B050]/10 border-[#00B050] text-[#00B050] shadow-xs"
                                                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/60"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs truncate">{item.label}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Conditional Target Inputs */}
                        {scope === "ORG_BROADCAST" && (
                            <div className="p-3 bg-gray-50 rounded-2xl space-y-1 border border-gray-200">
                                <label className="block font-semibold text-gray-700">Select Target Organization</label>
                                <select
                                    value={targetOrgId}
                                    onChange={(e) => setTargetOrgId(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="org-1">Vertex Technologies Ltd. (291 Employees)</option>
                                    <option value="org-2">Bengal Textiles Ltd. (1,240 Employees)</option>
                                    <option value="org-3">GreenMart Superstores (84 Employees)</option>
                                    <option value="org-4">CareMed Hospital (460 Employees)</option>
                                </select>
                            </div>
                        )}

                        {scope === "ROLE_BROADCAST" && (
                            <div className="p-3 bg-gray-50 rounded-2xl space-y-1 border border-gray-200">
                                <label className="block font-semibold text-gray-700">Select Target Role Across All Organizations</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="ORG_ADMIN">All Organization Admins Only</option>
                                    <option value="MANAGER">All Department & Branch Managers Only</option>
                                    <option value="EMPLOYEE">All Registered Staff & Employees</option>
                                </select>
                            </div>
                        )}

                        {scope === "TARGETED_USER" && (
                            <div className="p-3 bg-gray-50 rounded-2xl space-y-1 border border-gray-200">
                                <label className="block font-semibold text-gray-700">User ID / Email</label>
                                <input
                                    type="text"
                                    placeholder="e.g. arif.c@vertextech.io or user-emp-1"
                                    value={recipientUserId}
                                    onChange={(e) => setRecipientUserId(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                                />
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
                                    <option value="SYSTEM">System Announcement</option>
                                    <option value="SECURITY">Security / Alert</option>
                                    <option value="PAYROLL">Payroll & Billing</option>
                                    <option value="REFERRAL">Referral & Commission</option>
                                    <option value="ATTENDANCE">Attendance & Policy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Severity / Tone</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="INFO">Info (Blue/Amber)</option>
                                    <option value="SUCCESS">Success (Emerald)</option>
                                    <option value="WARNING">Warning (Amber)</option>
                                    <option value="ALERT">Critical Alert (Red)</option>
                                </select>
                            </div>
                        </div>

                        {/* Title & Message */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Notification Subject / Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Scheduled Infrastructure Maintenance on Sunday"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Message Body</label>
                            <textarea
                                rows={4}
                                required
                                placeholder="Write clear, actionable details for the recipient audience..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Target Action Link (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. /admin/subscription-plans or /organizationadmin/leaves"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full py-3 bg-[#00B050] hover:bg-[#009b46] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                        >
                            <Send className="w-4 h-4" />
                            {isSending ? "Dispatching..." : "Send Targeted Notification"}
                        </button>
                    </form>
                </div>

                {/* Right: Sent Notifications Feed */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Recent Platform Broadcasts</h2>
                            <p className="text-xs text-gray-500">Live feed of notifications delivered across tenant accounts</p>
                        </div>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            {notifications.length} Total
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors space-y-2 text-xs"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                            n.scope === "GLOBAL_BROADCAST"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : n.scope === "ORG_BROADCAST"
                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                        }`}>
                                            {n.scope.replace("_", " ")}
                                        </span>
                                        <span className="font-bold text-gray-900">{n.title}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">{n.createdAt.slice(0, 16)}</span>
                                </div>

                                <p className="text-gray-600 leading-relaxed text-[11px]">{n.message}</p>

                                <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400">
                                    <span>Sender: <strong className="text-gray-700">{n.senderName}</strong></span>
                                    {n.link && <span className="text-[#00B050] font-mono">{n.link}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
