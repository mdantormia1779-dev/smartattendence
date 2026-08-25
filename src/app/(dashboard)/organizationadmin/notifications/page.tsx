"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
    ShieldCheck,
    Loader2,
    Edit,
    Trash2,
    X,
    Save,
    AlertCircle,
    Info,
    AlertTriangle,
    Zap,
    ExternalLink,
    Briefcase,
    Check
} from "lucide-react";
import { api } from "@/lib/api-client";

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: "MANAGER" | "EMPLOYEE";
    designation?: string;
    department?: string;
    branch?: string;
    avatar?: string;
    code?: string;
}

export default function OrgAdminNotificationCenterPage() {
    const [scope, setScope] = useState<"ORG_BROADCAST" | "ROLE_BROADCAST" | "TARGETED_USER">("ORG_BROADCAST");
    const [targetRole, setTargetRole] = useState<"MANAGER" | "EMPLOYEE">("EMPLOYEE");
    const [recipientUserId, setRecipientUserId] = useState("");
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    const [category, setCategory] = useState("ATTENDANCE");
    const [type, setType] = useState<"INFO" | "SUCCESS" | "WARNING" | "ALERT">("INFO");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");

    // Staff Directory State for Recipient Selection
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [staffFilter, setStaffFilter] = useState<"ALL" | "EMPLOYEE" | "MANAGER">("ALL");
    const [staffSearchQuery, setStaffSearchQuery] = useState("");
    const [isStaffLoading, setIsStaffLoading] = useState(false);

    // Edit & Delete States
    const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
    const [deletingNotification, setDeletingNotification] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Get current session context
    const getSession = () => {
        let userId = "user-org-1";
        let userName = "Org Admin";
        let orgId = "org-1";

        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.id || parsed.userId) userId = parsed.id || parsed.userId;
                    if (parsed.name || parsed.fullName) userName = parsed.name || parsed.fullName;
                    if (parsed.organizationId) orgId = parsed.organizationId;
                } catch {}
            }
        }
        return { userId, userName, orgId };
    };

    // 1. Fetch Real Staff Directory (Employees & Managers)
    const fetchStaffDirectory = async () => {
        try {
            setIsStaffLoading(true);
            const [empRes, mgrRes] = await Promise.all([
                api.employees.getAll({ limit: 300 }).catch(() => ({ success: false, data: [] })),
                api.managers.getAll().catch(() => ({ success: false, data: [] })),
            ]);

            const combined: StaffMember[] = [];

            // Add Employees (handles { items: [...] }, { data: [...] }, or raw array)
            const anyEmp: any = empRes;
            const empArray: any[] = Array.isArray(anyEmp?.data?.items)
                ? anyEmp.data.items
                : Array.isArray(anyEmp?.items)
                ? anyEmp.items
                : Array.isArray(anyEmp?.data)
                ? anyEmp.data
                : [];

            empArray.forEach((e: any) => {
                combined.push({
                    id: e.id || e.userId || e.employeeId,
                    name: e.fullName || e.name || "Employee",
                    email: e.email,
                    role: "EMPLOYEE",
                    designation: e.designation || "Staff Member",
                    department: e.department || e.departments?.name || "General",
                    branch: e.branch || e.branches?.name || "Main Branch",
                    avatar: e.image || e.profilePicture || e.avatar || "",
                    code: e.employeeCode || e.employeeId || "EMP",
                });
            });

            // Add Managers (handles { items: [...] }, { data: [...] }, or raw array)
            const anyMgr: any = mgrRes;
            const mgrArray: any[] = Array.isArray(anyMgr?.data?.items)
                ? anyMgr.data.items
                : Array.isArray(anyMgr?.items)
                ? anyMgr.items
                : Array.isArray(anyMgr?.data)
                ? anyMgr.data
                : [];

            mgrArray.forEach((m: any) => {
                combined.push({
                    id: m.id || m.userId,
                    name: m.name || m.fullName || "Manager",
                    email: m.email,
                    role: "MANAGER",
                    designation: m.designation || "Branch / Dept Manager",
                    department: m.department || m.departments?.name || "Management",
                    branch: m.branch || m.branches?.name || "Main Branch",
                    avatar: m.avatar || m.profilePicture || "",
                    code: m.code || m.managerCode || "MGR",
                });
            });

            setStaffList(combined);
        } catch (e) {
            console.error("Failed to load staff directory", e);
        } finally {
            setIsStaffLoading(false);
        }
    };

    // 2. Fetch Notifications List
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const { userId, orgId } = getSession();
            const res = await fetch(`/api/notifications?userId=${userId}&role=ORG_ADMIN&organizationId=${orgId}&_t=${Date.now()}`, {
                cache: "no-store",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    "x-user-role": "ORG_ADMIN",
                    "x-org-id": orgId,
                },
            });
            const json = await res.json();
            const data = json.data || json;
            if (json.success || data.notifications) {
                setNotifications(data.notifications || []);
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffDirectory();
        fetchNotifications();
    }, []);

    // Filter staff based on role & search query
    const filteredStaff = useMemo(() => {
        return staffList.filter((s) => {
            const matchesRole = staffFilter === "ALL" || s.role === staffFilter;
            const q = staffSearchQuery.toLowerCase();
            const matchesSearch = 
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                (s.code && s.code.toLowerCase().includes(q)) ||
                (s.department && s.department.toLowerCase().includes(q));
            return matchesRole && matchesSearch;
        });
    }, [staffList, staffFilter, staffSearchQuery]);

    const handleSelectRecipient = (staff: StaffMember) => {
        setSelectedStaff(staff);
        setRecipientUserId(staff.id);
    };

    const handleClearSelectedRecipient = () => {
        setSelectedStaff(null);
        setRecipientUserId("");
    };

    const handleStartEdit = (notif: any) => {
        setEditingNotificationId(notif.id);
        setTitle(notif.title || "");
        setMessage(notif.message || "");
        setCategory(notif.category || "ATTENDANCE");
        setType(notif.type || "INFO");
        setLink(notif.link || "");
        setScope(notif.scope || "ORG_BROADCAST");
        if (notif.targetRole) setTargetRole(notif.targetRole);
        if (notif.recipientUserId) {
            setRecipientUserId(notif.recipientUserId);
            const found = staffList.find((s) => s.id === notif.recipientUserId || s.email === notif.recipientUserId || s.code === notif.recipientUserId);
            if (found) setSelectedStaff(found);
        }
    };

    const handleCancelEdit = () => {
        setEditingNotificationId(null);
        setTitle("");
        setMessage("");
        setLink("");
        setRecipientUserId("");
        setSelectedStaff(null);
        setErrorMessage(null);
    };

    const handleSaveNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            setErrorMessage("Please enter both announcement subject and message details.");
            return;
        }

        if (scope === "TARGETED_USER" && !recipientUserId.trim()) {
            setErrorMessage("Please select a recipient employee or manager from the list.");
            return;
        }

        try {
            setIsSending(true);
            setErrorMessage(null);
            const { userId, userName, orgId } = getSession();

            const payload = {
                senderId: userId,
                senderName: `${userName} (Org Admin)`,
                senderRole: "ORG_ADMIN",
                senderOrgId: orgId,
                scope,
                targetOrgId: orgId,
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
                    "x-user-role": "ORG_ADMIN",
                    "x-org-id": orgId,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (json.success) {
                setSentSuccess(editingNotificationId ? "Announcement updated successfully!" : "Announcement dispatched successfully!");
                handleCancelEdit();
                setTimeout(() => setSentSuccess(null), 3000);
                await fetchNotifications();
            } else {
                setErrorMessage(json.error || json.message || "Failed to process notification");
            }
        } catch (e: any) {
            console.error(e);
            setErrorMessage(e?.message || "Failed to process notification");
        } finally {
            setIsSending(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingNotification) return;
        try {
            setIsProcessing(true);
            const { orgId } = getSession();
            const res = await fetch(`/api/notifications/${deletingNotification.id}`, {
                method: "DELETE",
                headers: {
                    "x-user-role": "ORG_ADMIN",
                    "x-org-id": orgId,
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
        <div className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <BellRing className="w-6 h-6 text-[#00B050]" />
                        Company Internal Notification Center
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Dispatch, edit, and manage policy announcements, holiday alerts, and shift notices for staff members
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => {
                            fetchNotifications();
                            fetchStaffDirectory();
                        }}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Refresh notifications"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00B050]" : ""}`} />
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-[#00B050] px-3.5 py-2 rounded-xl border border-emerald-200">
                        <ShieldCheck className="w-4 h-4" /> Organization Scoped
                    </span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Dispatch / Edit Form */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 md:p-8 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                            {editingNotificationId ? (
                                <>
                                    <Edit className="w-4 h-4 text-amber-600" />
                                    Edit Company Announcement
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 text-[#00B050]" />
                                    Dispatch Internal Announcement
                                </>
                            )}
                        </h2>

                        <div className="flex items-center gap-2">
                            {editingNotificationId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer px-3 py-1 rounded-xl border border-stone-200 bg-stone-50"
                                >
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                            )}

                            {sentSuccess && (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200 animate-in fade-in duration-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {sentSuccess}
                                </span>
                            )}
                        </div>
                    </div>

                    {editingNotificationId && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between font-medium">
                            <span>Editing active announcement. Click <strong>"Save Changes"</strong> to update all recipients.</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveNotification} className="space-y-4 text-xs">
                        {/* Scope Selector */}
                        <div>
                            <label className="block font-bold text-stone-700 mb-1.5 uppercase tracking-wider text-[10px]">
                                1. Target Audience
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "ORG_BROADCAST", label: "Entire Company", desc: "All Staff", icon: Building2 },
                                    { id: "ROLE_BROADCAST", label: "By Role", desc: "Managers or Staff", icon: Users },
                                    { id: "TARGETED_USER", label: "Direct Employee", desc: "Select Individual", icon: User },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = scope === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setScope(item.id as any)}
                                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-98 ${
                                                isSelected
                                                    ? "bg-emerald-50/80 border-[#00B050] text-[#00B050] shadow-xs"
                                                    : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100/70"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 mb-2" />
                                            <div>
                                                <p className="font-bold text-xs">{item.label}</p>
                                                <p className="text-[10px] text-stone-400 font-medium">{item.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Role Selector */}
                        {scope === "ROLE_BROADCAST" && (
                            <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5 border border-stone-200">
                                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                                    Select Target Role
                                </label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                >
                                    <option value="EMPLOYEE">All Employees & Staff Members</option>
                                    <option value="MANAGER">Branch & Department Managers Only</option>
                                </select>
                            </div>
                        )}

                        {/* Direct Staff Recipient Selection System */}
                        {scope === "TARGETED_USER" && (
                            <div className="p-4 bg-stone-50 rounded-2xl space-y-3 border border-stone-200">
                                <div className="flex items-center justify-between">
                                    <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                                        Select Recipient Employee / Manager
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {(["ALL", "EMPLOYEE", "MANAGER"] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => setStaffFilter(tab)}
                                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                                    staffFilter === tab
                                                        ? "bg-[#00B050] text-white"
                                                        : "bg-stone-200/80 text-stone-600 hover:bg-stone-200"
                                                }`}
                                            >
                                                {tab === "ALL" ? "All" : tab === "EMPLOYEE" ? "Employees" : "Managers"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedStaff ? (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-[#00B050] text-white flex items-center justify-center font-bold text-xs uppercase">
                                                {selectedStaff.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                                                    {selectedStaff.name}
                                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                                        selectedStaff.role === "MANAGER" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                                    }`}>
                                                        {selectedStaff.role}
                                                    </span>
                                                </p>
                                                <p className="text-[10px] text-stone-500">{selectedStaff.designation} · {selectedStaff.department} ({selectedStaff.email})</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleClearSelectedRecipient}
                                            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                                            title="Change recipient"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                            <input
                                                type="text"
                                                placeholder="Search staff by name, ID or department..."
                                                value={staffSearchQuery}
                                                onChange={(e) => setStaffSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                            />
                                        </div>

                                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                            {isStaffLoading ? (
                                                <div className="py-6 text-center text-stone-400 flex items-center justify-center gap-1.5">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B050]" />
                                                    <span>Loading staff directory...</span>
                                                </div>
                                            ) : filteredStaff.length === 0 ? (
                                                <div className="py-4 text-center text-stone-400 text-[11px]">
                                                    No matching staff members found.
                                                </div>
                                            ) : (
                                                filteredStaff.map((staff) => (
                                                    <div
                                                        key={staff.id}
                                                        onClick={() => handleSelectRecipient(staff)}
                                                        className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-100 hover:border-emerald-200 flex items-center justify-between cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px] font-bold">
                                                                {staff.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-stone-800 text-[11px] leading-tight">{staff.name}</p>
                                                                <p className="text-[10px] text-stone-400">{staff.designation} · {staff.department}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                                            staff.role === "MANAGER" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                                                        }`}>
                                                            {staff.role}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Category & Severity Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                >
                                    <option value="ATTENDANCE">Attendance & Rosters</option>
                                    <option value="LEAVE">Leaves & Holidays</option>
                                    <option value="PAYROLL">Salary & Payslips</option>
                                    <option value="SYSTEM">General Company Notice</option>
                                    <option value="SECURITY">Security / Emergency</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                                    Severity
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                >
                                    <option value="INFO">Info (Neutral/Blue)</option>
                                    <option value="SUCCESS">Success (Emerald)</option>
                                    <option value="WARNING">Important (Amber)</option>
                                    <option value="ALERT">Urgent Alert (Red)</option>
                                </select>
                            </div>
                        </div>

                        {/* Title & Body */}
                        <div>
                            <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                                Announcement Subject <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Public Holiday Notice for Next Sunday"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                                Message Details <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                required
                                placeholder="Write clear instructions or information for staff members..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                                Action Link (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. /employee/leaves or /organizationadmin/shifts"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className={`w-full py-3 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] ${
                                editingNotificationId
                                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                                    : "bg-[#00B050] hover:bg-[#009b46] shadow-[#00B050]/20"
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
                                    <Send className="w-4 h-4" /> Send Announcement
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sent Stream */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div>
                            <h2 className="text-base font-bold text-stone-900">Recent Organization Broadcasts</h2>
                            <p className="text-xs text-stone-500 mt-0.5">Live stream of notifications sent to company members</p>
                        </div>
                        <span className="text-xs font-extrabold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                            {filteredNotifications.length} Total
                        </span>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search notices by title, message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-stone-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#00B050] mr-2" />
                            <span className="text-xs font-semibold">Loading broadcasts...</span>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-20 text-center text-xs text-stone-400 space-y-2">
                            <BellRing className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                            <p className="font-bold text-stone-700">No broadcasts found</p>
                            <p className="text-stone-400 text-[11px]">Use the form on the left to send policy or holiday notices to staff.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
                            {filteredNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4.5 rounded-2xl border transition-colors space-y-2 text-xs ${
                                        editingNotificationId === n.id
                                            ? "border-amber-400 bg-amber-50/40"
                                            : "border-stone-200/80 bg-stone-50/50 hover:bg-stone-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                n.type === "ALERT" 
                                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                                    : n.type === "WARNING"
                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                    : n.type === "SUCCESS"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                            }`}>
                                                {n.scope?.replace("_", " ") || "ORG NOTICE"}
                                            </span>
                                            <span className="font-bold text-stone-900">{n.title}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleStartEdit(n)}
                                                className="p-1.5 rounded-lg border border-stone-200 hover:bg-white text-stone-600 hover:text-amber-600 transition-colors cursor-pointer"
                                                title="Edit notice"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                onClick={() => setDeletingNotification(n)}
                                                className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors cursor-pointer"
                                                title="Delete notice"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-stone-600 leading-relaxed text-xs">{n.message}</p>

                                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-[11px] text-stone-400">
                                        <span>Sender: <strong className="text-stone-700">{n.senderName}</strong> · <span className="font-mono text-[10px]">{n.createdAt?.slice(0, 16) || "Just now"}</span></span>
                                        {n.link && <span className="text-[#00B050] font-mono text-[10px] font-bold">{n.link}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deletingNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 md:p-8 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                Delete Announcement
                            </h3>
                            <button
                                onClick={() => setDeletingNotification(null)}
                                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed">
                            Are you sure you want to delete <strong className="text-stone-900">"{deletingNotification.title}"</strong>? It will be permanently removed from staff feeds.
                        </p>

                        <div className="flex justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => setDeletingNotification(null)}
                                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors active:scale-95"
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
