"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboard,
    Building2, 
    CreditCard, 
    Ticket, 
    DollarSign, 
    UserX, 
    FileText, 
    Settings, 
    LogOut,
    Share2,
    BellRing,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    MessageSquare,
    X
} from "lucide-react";
import { api } from "@/lib/api-client";

interface MenuItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeKey?: "pendingPayments" | "pendingWithdrawals" | "unreadNotifications" | "suspendedOrgs" | "unreadInquiries";
}

const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Create Organization", href: "/admin/create-organization", icon: Building2 },
    { name: "Subscription Plans", href: "/admin/subscription-plans", icon: CreditCard },
    { name: "Approve Payments", href: "/admin/approve-payments", icon: DollarSign, badgeKey: "pendingPayments" },
    { name: "Manage Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "View Revenue", href: "/admin/revenue", icon: DollarSign },
    { name: "Client Inquiries", href: "/admin/contact-messages", icon: MessageSquare, badgeKey: "unreadInquiries" },
    { name: "Referrals & Affiliates", href: "/admin/referrals", icon: Share2, badgeKey: "pendingWithdrawals" },
    { name: "Notification Center", href: "/admin/notifications", icon: BellRing, badgeKey: "unreadNotifications" },
    { name: "Suspend Organizations", href: "/admin/suspend", icon: UserX, badgeKey: "suspendedOrgs" },
    { name: "View Audit Logs", href: "/admin/audit-logs", icon: FileText },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    // Real Super Admin Profile State
    const [adminName, setAdminName] = useState("Super Admin");
    const [adminEmail, setAdminEmail] = useState("admin@smartattendance.io");

    // Real Live Badge Counts
    const [badgeCounts, setBadgeCounts] = useState({
        pendingPayments: 0,
        pendingWithdrawals: 0,
        unreadNotifications: 0,
        suspendedOrgs: 0,
        unreadInquiries: 0,
    });

    // 1. Load Real Super Admin Session & Dynamic Badges
    const loadAdminData = async () => {
        // Read user session from localStorage
        if (typeof window !== "undefined") {
            const rawUser =
                localStorage.getItem("user") ||
                localStorage.getItem("user_info") ||
                localStorage.getItem("userData");

            if (rawUser) {
                try {
                    const parsed = JSON.parse(rawUser);
                    if (parsed.name || parsed.fullName) setAdminName(parsed.name || parsed.fullName);
                    if (parsed.email) setAdminEmail(parsed.email);
                } catch {}
            }
        }

        // Fetch live badge counts from real backend APIs
        try {
            const [paymentsRes, withdrawalsRes, notifsRes, orgsRes, contactRes] = await Promise.allSettled([
                api.payments.getAll(),
                api.adminReferrals.getWithdrawals(),
                api.notifications.getAll(),
                api.organizations.getAll(),
                api.adminContact.getAll({ limit: 100 }),
            ]);

            let pendingPayCount = 0;
            if (paymentsRes.status === "fulfilled" && paymentsRes.value?.success && Array.isArray(paymentsRes.value.data)) {
                pendingPayCount = paymentsRes.value.data.filter((p: any) => 
                    p.status === "PENDING" || p.paymentStatus === "PENDING"
                ).length;
            }

            let pendingWithCount = 0;
            if (withdrawalsRes.status === "fulfilled" && withdrawalsRes.value?.success && Array.isArray(withdrawalsRes.value.data)) {
                pendingWithCount = withdrawalsRes.value.data.filter((w: any) => 
                    w.status === "PENDING" || w.status === "REQUESTED"
                ).length;
            }

            let unreadNotifCount = 0;
            if (notifsRes.status === "fulfilled" && notifsRes.value?.success && Array.isArray(notifsRes.value.data)) {
                unreadNotifCount = notifsRes.value.data.filter((n: any) => !n.read && !n.isRead).length;
            }

            let suspendedOrgCount = 0;
            if (orgsRes.status === "fulfilled" && orgsRes.value?.success && Array.isArray(orgsRes.value.data)) {
                suspendedOrgCount = orgsRes.value.data.filter((o: any) => 
                    o.status === "SUSPENDED" || o.isSuspended === true
                ).length;
            }

            let unreadInquiriesCount = 0;
            if (contactRes.status === "fulfilled" && contactRes.value?.success) {
                const val = contactRes.value as any;
                unreadInquiriesCount = val?.stats?.unread || val?.data?.stats?.unread || 0;
            }

            setBadgeCounts({
                pendingPayments: pendingPayCount,
                pendingWithdrawals: pendingWithCount,
                unreadNotifications: unreadNotifCount,
                suspendedOrgs: suspendedOrgCount,
                unreadInquiries: unreadInquiriesCount,
            });
        } catch (e) {
            console.warn("Super Admin badge metrics load fallback:", e);
        }
    };

    useEffect(() => {
        loadAdminData();

        const handleUpdate = () => loadAdminData();
        window.addEventListener("user-profile-updated", handleUpdate);
        window.addEventListener("notifications-updated", handleUpdate);
        window.addEventListener("payments-updated", handleUpdate);
        return () => {
            window.removeEventListener("user-profile-updated", handleUpdate);
            window.removeEventListener("notifications-updated", handleUpdate);
            window.removeEventListener("payments-updated", handleUpdate);
        };
    }, []);

    // 2. Real Safe Logout
    const handleLogout = async () => {
        try {
            await api.auth.logout();
        } catch {}

        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("user_info");
            localStorage.removeItem("userData");
            document.cookie = "auth_session=; path=/; max-age=0";
            document.cookie = "user_role=; path=/; max-age=0";
        }
        router.push("/login");
    };

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => setMobileOpen((prev) => !prev);
        const handleClose = () => setMobileOpen(false);

        window.addEventListener("toggle-admin-sidebar", handleToggle);
        window.addEventListener("close-admin-sidebar", handleClose);

        return () => {
            window.removeEventListener("toggle-admin-sidebar", handleToggle);
            window.removeEventListener("close-admin-sidebar", handleClose);
        };
    }, []);

    // Auto-close on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const getInitials = (name: string) => {
        if (!name) return "SA";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const renderSidebarContent = (isMobile = false) => (
        <>
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-neutral-200 justify-between shrink-0">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="bg-[#00B050] text-white font-black px-2.5 py-1.5 rounded-xl text-sm tracking-wider shadow-2xs">
                        SA
                    </div>
                    <div>
                        <div className="text-sm font-black tracking-tight text-neutral-900 leading-tight">
                            Super<span className="text-[#00B050]">Admin</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium">Control Center</span>
                    </div>
                </Link>
                {isMobile && (
                    <button 
                        onClick={() => setMobileOpen(false)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Super Admin Live Profile Pill */}
            <div className="p-3 mx-4 my-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                        {getInitials(adminName)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <p className="text-xs font-bold text-neutral-900 truncate">{adminName}</p>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                        </div>
                        <p className="text-[10px] text-neutral-500 font-medium truncate">{adminEmail}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links with Real Dynamic Badges */}
            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(`${item.href}/`));
                    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                                isActive 
                                    ? "bg-[#00B050]/10 text-[#00B050] font-bold shadow-2xs" 
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00B050]" : "text-neutral-400"}`} />
                                <span className="truncate">{item.name}</span>
                            </div>

                            {/* Dynamic Real Badge */}
                            {badgeCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                    item.badgeKey === "suspendedOrgs"
                                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                                        : item.badgeKey === "unreadNotifications"
                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                        : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}>
                                    {badgeCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Real Logout Action */}
            <div className="p-3 border-t border-neutral-200 bg-white shrink-0">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-neutral-200 flex-col h-screen sticky top-0 z-40 select-none shrink-0">
                {renderSidebarContent(false)}
            </aside>

            {/* Mobile Drawer Backdrop & Sliding Sheet */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
                        {renderSidebarContent(true)}
                    </div>
                </div>
            )}
        </>
    );
}