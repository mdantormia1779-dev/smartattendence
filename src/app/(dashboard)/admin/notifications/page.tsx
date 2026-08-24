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
    RefreshCw,
    Loader2,
    Edit,
    Trash2,
    X,
    Save
} from "lucide-react";
import { api } from "@/lib/api-client";

interface OrganizationOption {
    id: string;
    name: string;
    totalEmployees?: number;
}

export default function AdminNotificationCenterPage() {
    const [scope, setScope] = useState<"GLOBAL_BROADCAST" | "ORG_BROADCAST" | "ROLE_BROADCAST" | "TARGETED_USER">("GLOBAL_BROADCAST");
    const [targetOrgId, setTargetOrgId] = useState("");
    const [targetRole, setTargetRole] = useState<"ORG_ADMIN" | "MANAGER" | "EMPLOYEE">("ORG_ADMIN");
    const [recipientUserId, setRecipientUserId] = useState("");
    const [category, setCategory] = useState("SYSTEM");
    const [type, setType] = useState<"INFO" | "SUCCESS" | "WARNING" | "ALERT">("INFO");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");
    
    // Edit & Delete States
    const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
    const [deletingNotification, setDeletingNotification] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch real organizations for dropdown
    const fetchOrganizations = async () => {
        try {
            const res = await api.organizations.getAll();
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                setOrganizations(res.data);
                if (!targetOrgId) {
                    setTargetOrgId(res.data[0].id);
                }
            }
        } catch (e) {
            console.error("Failed to load organizations:", e);
        }
    };

    // Fetch real live notifications
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/notifications?userId=user-super-1&role=SUPER_ADMIN&_t=${Date.now()}`, {
                cache: "no-store",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    "x-user-role": "SUPER_ADMIN",
                    Authorization: "Bearer super-admin-token",
                },
            });
            const json = await res.json();
            const data = json.data || json;
            if (json.success || data.notifications) {
                setNotifications(data.notifications || []);
            }
        } catch (e) {
            console.error("Failed to load notifications:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
        fetchNotifications();
    }, []);

    // Set form to edit mode
    const handleStartEdit = (notif: any) => {
        setEditingNotificationId(notif.id);
        setTitle(notif.title || "");
        setMessage(notif.message || "");
        setCategory(notif.category || "SYSTEM");
        setType(notif.type || "INFO");
        setLink(notif.link || "");
        setScope(notif.scope || "GLOBAL_BROADCAST");
        if (notif.targetOrgId) setTargetOrgId(notif.targetOrgId);
        if (notif.targetRole) setTargetRole(notif.targetRole);
        if (notif.recipientUserId) setRecipientUserId(notif.recipientUserId);
        
        // Scroll to form
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Cancel edit mode
    const handleCancelEdit = () => {
        setEditingNotificationId(null);
        setTitle("");
        setMessage("");
        setLink("");
        setRecipientUserId("");
        setErrorMessage(null);
    };

    // Submit Create or Update
    const handleSaveNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            setErrorMessage("Please fill in both title and message");
            return;
        }

        try {
            setIsSending(true);
            setErrorMessage(null);

            const payload = {
                senderId: "user-super-1",
                senderName: "Super Admin",
                senderRole: "SUPER_ADMIN",
                scope,
                targetOrgId: scope === "ORG_BROADCAST" ? targetOrgId : null,
                targetRole: scope === "ROLE_BROADCAST" ? targetRole : null,
                recipientUserId: scope === "TARGETED_USER" ? recipientUserId.trim() : null,
                title: title.trim(),
                message: message.trim(),
                category,
                type,
                link: link.trim() || undefined,
            };

            const endpoint = editingNotificationId 
                ? `/api/notifications/${editingNotificationId}` 
                : "/api/notifications";
            
            const method = editingNotificationId ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    "x-user-role": "SUPER_ADMIN",
                    Authorization: "Bearer super-admin-token",
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (json.success) {
                setSentSuccess(editingNotificationId ? "Notification updated successfully!" : "Notification dispatched successfully!");
                handleCancelEdit();
                setTimeout(() => setSentSuccess(null), 3000);
                await fetchNotifications();
            } else {
                setErrorMessage(json.error || json.message || "Failed to process notification");
            }
        } catch (e: any) {
            console.error("Save notification error:", e);
            setErrorMessage(e?.message || "Failed to process notification");
        } finally {
            setIsSending(false);
        }
    };

    // Delete Notification Handler
    const handleConfirmDelete = async () => {
        if (!deletingNotification) return;
        try {
            setIsProcessing(true);
            const res = await fetch(`/api/notifications/${deletingNotification.id}`, {
                method: "DELETE",
                headers: {
                    "x-user-role": "SUPER_ADMIN",
                    Authorization: "Bearer super-admin-token",
                },
            });
            const json = await res.json();
            if (json.success) {
                setDeletingNotification(null);
                setSentSuccess("Notification deleted successfully!");
                setTimeout(() => setSentSuccess(null), 3000);
                await fetchNotifications();
            } else {
                alert(json.error || "Failed to delete notification");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredNotifications = notifications.filter((n) =>
        (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.message || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.scope || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-6 md:p-10 space-y-6 overflow-y-auto min-h-screen text-neutral-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
                        <BellRing className="w-6 h-6 text-[#10b981]" />
                        Platform Notification Center & Broadcast
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Dispatch, edit, and manage global broadcasts, organization alerts, or direct messages in real time
                    </p>
                </div>
                <button
                    onClick={fetchNotifications}
                    className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
                    title="Refresh notifications"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#10b981]" : ""}`} />
                </button>
            </div>

            {/* Main Grid: Send/Edit Form (Left) & Sent Log (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Dispatch / Edit Form */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 md:p-8 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                            {editingNotificationId ? (
                                <>
                                    <Edit className="w-4 h-4 text-amber-600" />
                                    Edit Broadcast Notification
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 text-[#10b981]" />
                                    Create & Dispatch Notification
                                </>
                            )}
                        </h2>

                        <div className="flex items-center gap-2">
                            {editingNotificationId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg border border-neutral-200"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                            )}

                            {sentSuccess && (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 animate-in fade-in duration-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {sentSuccess}
                                </span>
                            )}
                        </div>
                    </div>

                    {editingNotificationId && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                            <span>Editing active notification. Click <strong>"Save Changes"</strong> to update.</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSaveNotification} className="space-y-4 text-xs">
                        {/* Scope Selector */}
                        <div>
                            <label className="block font-bold text-neutral-700 mb-1.5 uppercase tracking-wider text-[11px]">
                                1. Target Scope & Audience
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
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
                                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                                isSelected
                                                    ? "bg-emerald-50 border-emerald-300 text-[#10b981] shadow-xs"
                                                    : "bg-neutral-50/70 border-neutral-200 text-neutral-700 hover:bg-neutral-100/60"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs truncate">{item.label}</p>
                                                <p className="text-[10px] text-neutral-400 truncate">{item.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Conditional Target Inputs */}
                        {scope === "ORG_BROADCAST" && (
                            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1.5 border border-neutral-200">
                                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                                    Select Target Organization
                                </label>
                                {organizations.length > 0 ? (
                                    <select
                                        value={targetOrgId}
                                        onChange={(e) => setTargetOrgId(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                    >
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.id}>
                                                {org.name} {org.totalEmployees ? `(${org.totalEmployees} Employees)` : ""}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-neutral-400 text-xs py-1">No organizations found in database.</p>
                                )}
                            </div>
                        )}

                        {scope === "ROLE_BROADCAST" && (
                            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1.5 border border-neutral-200">
                                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                                    Select Target Role Across All Organizations
                                </label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                >
                                    <option value="ORG_ADMIN">All Organization Admins Only</option>
                                    <option value="MANAGER">All Department & Branch Managers Only</option>
                                    <option value="EMPLOYEE">All Registered Staff & Employees</option>
                                </select>
                            </div>
                        )}

                        {scope === "TARGETED_USER" && (
                            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1.5 border border-neutral-200">
                                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                                    Recipient User ID or Email
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. employee@company.com or user-emp-1"
                                    value={recipientUserId}
                                    onChange={(e) => setRecipientUserId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                />
                            </div>
                        )}

                        {/* Category & Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                >
                                    <option value="SYSTEM">System Announcement</option>
                                    <option value="SECURITY">Security / Alert</option>
                                    <option value="PAYROLL">Payroll & Billing</option>
                                    <option value="REFERRAL">Referral & Commission</option>
                                    <option value="ATTENDANCE">Attendance & Policy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1">
                                    Severity / Tone
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                >
                                    <option value="INFO">Info (Blue/Neutral)</option>
                                    <option value="SUCCESS">Success (Emerald)</option>
                                    <option value="WARNING">Warning (Amber)</option>
                                    <option value="ALERT">Critical Alert (Red)</option>
                                </select>
                            </div>
                        </div>

                        {/* Title & Message */}
                        <div>
                            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1">
                                Notification Subject / Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Scheduled Infrastructure Maintenance on Sunday"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1">
                                Message Body <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                required
                                placeholder="Write clear, actionable notification details for the target audience..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1">
                                Target Action Link (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. /admin/subscription-plans or /organizationadmin/leaves"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className={`w-full py-3 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] ${
                                editingNotificationId
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-[#10b981] hover:bg-emerald-600"
                            } disabled:opacity-50`}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> {editingNotificationId ? "Saving Changes..." : "Dispatching..."}
                                </>
                            ) : editingNotificationId ? (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Dispatch Notification
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right: Sent Notifications Feed */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Recent Platform Broadcasts</h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Live feed of notifications delivered across tenant accounts</p>
                        </div>
                        <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full">
                            {filteredNotifications.length} Total
                        </span>
                    </div>

                    {/* Search in Feed */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search broadcasts by title, content, scope..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-neutral-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#10b981] mr-2" />
                            <span className="text-xs">Loading notifications...</span>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-20 text-center text-xs text-neutral-400 space-y-2">
                            <BellRing className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                            <p className="font-semibold text-neutral-700">No broadcasts found</p>
                            <p className="text-neutral-400 text-[11px]">Use the dispatch form on the left to send your first platform notification.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[540px] overflow-y-auto custom-scrollbar pr-1">
                            {filteredNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4.5 rounded-2xl border transition-colors space-y-2 text-xs ${
                                        editingNotificationId === n.id
                                            ? "border-amber-400 bg-amber-50/40"
                                            : "border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                n.scope === "GLOBAL_BROADCAST"
                                                    ? "bg-emerald-50 text-[#10b981] border border-emerald-200"
                                                    : n.scope === "ORG_BROADCAST"
                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                            }`}>
                                                {n.scope.replace("_", " ")}
                                            </span>
                                            <span className="font-bold text-neutral-900">{n.title}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleStartEdit(n)}
                                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-white text-neutral-600 hover:text-amber-600 transition-colors cursor-pointer"
                                                title="Edit notification"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                onClick={() => setDeletingNotification(n)}
                                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 transition-colors cursor-pointer"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-neutral-600 leading-relaxed text-xs">{n.message}</p>

                                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-400">
                                        <span>Sender: <strong className="text-neutral-700">{n.senderName}</strong> · <span className="font-mono text-[10px]">{n.createdAt?.slice(0, 16) || "Just now"}</span></span>
                                        {n.link && <span className="text-[#10b981] font-mono text-[10px]">{n.link}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deletingNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                Delete Notification
                            </h3>
                            <button
                                onClick={() => setDeletingNotification(null)}
                                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-neutral-600">
                            Are you sure you want to delete <strong className="text-neutral-900">"{deletingNotification.title}"</strong>? This notification will be permanently removed from all user drop-down feeds and databases.
                        </p>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setDeletingNotification(null)}
                                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
