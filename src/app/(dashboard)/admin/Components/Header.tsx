"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Search, 
    ChevronDown, 
    ShieldCheck, 
    Settings, 
    CreditCard, 
    DollarSign, 
    FileText, 
    LogOut, 
    X,
    Building2,
    Sparkles,
    Shield
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { api } from "@/lib/api-client";

export default function Header() {
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Profile & Context States
    const [adminName, setAdminName] = useState("Super Admin");
    const [adminEmail, setAdminEmail] = useState("admin@smartattendance.io");
    const [userId, setUserId] = useState("user-super-1");

    // UI States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Fetch Real Super Admin Profile
    const fetchAdminProfile = async () => {
        let currentUserId = "user-super-1";

        // Check localStorage first
        if (typeof window !== "undefined") {
            const rawUser =
                localStorage.getItem("user") ||
                localStorage.getItem("user_info") ||
                localStorage.getItem("userData");

            if (rawUser) {
                try {
                    const parsed = JSON.parse(rawUser);
                    if (parsed.id || parsed.userId) {
                        currentUserId = parsed.id || parsed.userId;
                        setUserId(currentUserId);
                    }
                    if (parsed.name || parsed.fullName) setAdminName(parsed.name || parsed.fullName);
                    if (parsed.email) setAdminEmail(parsed.email);
                } catch {}
            }
        }

        // Fetch fresh from database API
        try {
            const res = await fetch(`/api/admin/settings?_t=${Date.now()}`, {
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
            if (json.success && data.admin) {
                if (data.admin.name) setAdminName(data.admin.name);
                if (data.admin.email) setAdminEmail(data.admin.email);
                if (data.admin.id) {
                    currentUserId = data.admin.id;
                    setUserId(currentUserId);
                }
            }
        } catch (e) {
            console.warn("Live Super Admin profile load fallback:", e);
        }
    };

    useEffect(() => {
        fetchAdminProfile();

        const handleProfileUpdate = (event: any) => {
            if (event?.detail) {
                if (event.detail.name || event.detail.fullName) {
                    setAdminName(event.detail.name || event.detail.fullName);
                }
                if (event.detail.email) {
                    setAdminEmail(event.detail.email);
                }
            } else {
                fetchAdminProfile();
            }
        };

        window.addEventListener("admin-profile-updated", handleProfileUpdate);
        window.addEventListener("user-profile-updated", handleProfileUpdate);

        return () => {
            window.removeEventListener("admin-profile-updated", handleProfileUpdate);
            window.removeEventListener("user-profile-updated", handleProfileUpdate);
        };
    }, []);

    // 2. Click outside listener for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isProfileOpen]);

    // 3. Search handler
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/admin/create-organization?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    // 4. Safe Logout handler
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

    const getInitials = (name: string) => {
        if (!name) return "SA";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-64 sm:w-80 md:w-96">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search organizations, plans, payments..." 
                    className="w-full pl-9.5 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] transition-all"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3.5">
                {/* Live Scoped Notification Dropdown */}
                <NotificationDropdown 
                    userId={userId} 
                    role="SUPER_ADMIN" 
                    organizationId={null} 
                />

                {/* System Mode Badge */}
                <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#00B050] border border-emerald-100 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#00B050] animate-pulse"></span>
                    <span>System Master</span>
                </div>

                {/* Interactive Super Admin Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-expanded={isProfileOpen}
                        className={`flex items-center gap-2.5 pl-2 py-1.5 pr-2 rounded-2xl border transition-all cursor-pointer select-none ${
                            isProfileOpen 
                                ? "bg-neutral-50 border-neutral-300 shadow-xs ring-2 ring-[#00B050]/15" 
                                : "bg-transparent border-transparent hover:bg-neutral-50 hover:border-neutral-200"
                        }`}
                    >
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {getInitials(adminName)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <h4 className="text-xs font-bold text-neutral-900 tracking-tight leading-tight truncate max-w-[130px]">{adminName}</h4>
                            <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[130px] block">{adminEmail}</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180 text-neutral-700" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                            {/* Profile Header */}
                            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                                <p className="text-xs font-bold text-neutral-900">{adminName}</p>
                                <p className="text-[11px] text-neutral-500 font-mono truncate">{adminEmail}</p>
                                <div className="mt-2 flex items-center gap-1.5">
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Super Administrator
                                    </span>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="py-1">
                                <Link 
                                    href="/admin/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>System Settings</span>
                                </Link>

                                <Link 
                                    href="/admin/subscription-plans"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Subscription Plans</span>
                                </Link>

                                <Link 
                                    href="/admin/approve-payments"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Approve Payments</span>
                                </Link>

                                <Link 
                                    href="/admin/audit-logs"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>System Audit Logs</span>
                                </Link>
                            </div>

                            {/* Logout Action */}
                            <div className="pt-1 border-t border-neutral-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer text-left"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}