"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Search, 
    ChevronDown, 
    Building2, 
    Settings, 
    Users, 
    ScanFace, 
    Share2, 
    LogOut, 
    ShieldCheck, 
    Sparkles, 
    X,
    ExternalLink,
    HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "@/components/NotificationDropdown";
import { api } from "@/lib/api-client";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Profile & Organization States
    const [userName, setUserName] = useState("Sarah Rahman");
    const [userEmail, setUserEmail] = useState("sarah.admin@vertextech.io");
    const [userId, setUserId] = useState("user-org-1");
    const [organizationId, setOrganizationId] = useState("org-1");
    const [companyName, setCompanyName] = useState("Vertex Technologies Ltd.");
    const [planTier, setPlanTier] = useState("Business Plan");
    const [orgLogo, setOrgLogo] = useState<string | null>(null);
    const [logoError, setLogoError] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);

    // UI States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Load Profile from localStorage & DB
    const loadProfile = async () => {
        let currentUserId = "user-org-1";
        let currentOrgId = "org-1";
        let foundName = "";
        let foundEmail = "";
        let foundCompany = "";

        // Check localStorage keys
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
                    if (parsed.name || parsed.fullName) {
                        foundName = parsed.name || parsed.fullName;
                        setUserName(foundName);
                    }
                    if (parsed.email) {
                        foundEmail = parsed.email;
                        setUserEmail(foundEmail);
                    }
                    if (parsed.organizationId) {
                        currentOrgId = parsed.organizationId;
                        setOrganizationId(currentOrgId);
                    }
                    if (parsed.companyName || parsed.organizationName || parsed.organization?.name) {
                        foundCompany = parsed.companyName || parsed.organizationName || parsed.organization?.name;
                        setCompanyName(foundCompany);
                    }
                } catch {}
            }
        }

        // Fetch fresh organization data from API
        try {
            const res = await api.organizations.getAll();
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                // Find matching org or take first active org
                const org = res.data.find((o: any) => o.id === currentOrgId) || res.data[0];
                if (org) {
                    if (org.name) setCompanyName(org.name);
                    if (org.customLogoUrl) setOrgLogo(org.customLogoUrl);
                    if (org.planTier || org.planName) {
                        const tier = (org.planTier || org.planName || "BUSINESS").toUpperCase();
                        const isFreeOrTrial = tier === "FREE" || tier.includes("TRIAL") || org.subscriptionStatus === "TRIAL";
                        const createdDate = org.createdAt ? new Date(org.createdAt) : new Date();
                        const now = new Date();
                        const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                        
                        let remaining = 30;
                        if (isFreeOrTrial) {
                            remaining = Math.max(0, 30 - diffDays);
                        } else {
                            remaining = Math.max(0, 30 - (diffDays % 30));
                        }

                        if (org.subscriptionStatus === "EXPIRED" || (isFreeOrTrial && remaining === 0)) {
                            setPlanTier(`⚠️ ${tier} Expired`);
                        } else if (isFreeOrTrial) {
                            setPlanTier(`30-Day Free Trial (${remaining} days left)`);
                        } else {
                            const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
                            setPlanTier(`${formattedTier} Plan (${remaining} days left)`);
                        }
                    }
                    if (org.id) setOrganizationId(org.id);

                    if (!foundName && org.ownerName) {
                        setUserName(org.ownerName);
                    }
                    if (!foundEmail && org.email) {
                        setUserEmail(org.email);
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to fetch fresh org profile in Header:", e);
        }
    };

    useEffect(() => {
        loadProfile();

        // Listen for live profile updates
        const handleUpdate = (e: any) => {
            if (e?.detail) {
                if (e.detail.name || e.detail.fullName) setUserName(e.detail.name || e.detail.fullName);
                if (e.detail.email) setUserEmail(e.detail.email);
                if (e.detail.companyName || e.detail.organizationName) {
                    setCompanyName(e.detail.companyName || e.detail.organizationName);
                }
            } else {
                loadProfile();
            }
        };

        window.addEventListener("user-profile-updated", handleUpdate);
        window.addEventListener("org-profile-updated", handleUpdate);
        window.addEventListener("organization-updated", handleUpdate);

        return () => {
            window.removeEventListener("user-profile-updated", handleUpdate);
            window.removeEventListener("org-profile-updated", handleUpdate);
            window.removeEventListener("organization-updated", handleUpdate);
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
            router.push(`/organizationadmin/employees?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    // 4. Logout handler
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
        if (!name) return "OA";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            {/* Left: Page Title & Org Context */}
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-sm md:text-base font-bold text-gray-900 leading-tight flex items-center gap-2">
                        {title}
                    </h1>
                    <p className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-gray-600 truncate max-w-[180px]">{companyName}</span>
                        <span>·</span>
                        <span className="text-[#00B050] font-semibold">{planTier}</span>
                    </p>
                </div>
            </div>

            {/* Right Side: Global Search, Notification, Profile Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3.5">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-56 lg:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search employees, shifts..."
                        className="w-full pl-9.5 pr-8 py-2 bg-gray-50/80 hover:bg-gray-100/60 focus:bg-white border border-gray-200/70 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] transition-all"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </form>

                {/* Scoped Enterprise Notification Dropdown */}
                <NotificationDropdown 
                    userId={userId} 
                    role="ORG_ADMIN" 
                    organizationId={organizationId} 
                />

                {/* Live System Status Pill (Desktop only) */}
                <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#00B050] border border-emerald-100 text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#00B050] animate-pulse"></span>
                    <span>Live</span>
                </div>

                {/* Interactive Admin Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-expanded={isProfileOpen}
                        className={`flex items-center gap-2.5 pl-2.5 py-1.5 pr-2 rounded-2xl border transition-all cursor-pointer select-none ${
                            isProfileOpen 
                                ? "bg-gray-50 border-gray-200 shadow-sm ring-2 ring-[#00B050]/15" 
                                : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-200/80"
                        }`}
                    >
                        {/* Avatar */}
                        {orgLogo && !logoError ? (
                            <img 
                                src={orgLogo} 
                                alt={companyName} 
                                onError={() => setLogoError(true)}
                                className="w-8 h-8 rounded-xl object-cover border border-gray-100 shadow-2xs shrink-0" 
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-[#00B050] text-white font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0">
                                {getInitials(userName)}
                            </div>
                        )}

                        {/* Name & Role */}
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[120px]">{userName}</p>
                            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">{companyName}</p>
                        </div>

                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180 text-gray-700" : ""}`} />
                    </button>

                    {/* Dropdown Menu Modal / Box */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-72 bg-white rounded-3xl border border-gray-100 shadow-2xl z-50 overflow-hidden text-left"
                            >
                                {/* Header Profile Card */}
                                <div className="p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        {userAvatar && !avatarError ? (
                                            <img
                                                src={userAvatar}
                                                alt={userName}
                                                onError={() => setAvatarError(true)}
                                                className="w-10 h-10 rounded-2xl object-cover border border-gray-100 shadow-md shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00B050] to-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
                                                {getInitials(userName)}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                                <h4 className="text-xs font-bold text-gray-900 truncate">{userName}</h4>
                                                <ShieldCheck className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                            </div>
                                            <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                                        </div>
                                    </div>

                                    {/* Company Info Box */}
                                    <div className="mt-3 p-2.5 rounded-xl bg-white border border-gray-100 flex items-center justify-between shadow-2xs">
                                        <div className="min-w-0 flex-1 mr-2">
                                            <p className="text-[11px] font-bold text-gray-800 truncate">{companyName}</p>
                                            <p className="text-[10px] text-gray-400">Organization Administrator</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md bg-[#00B050]/10 text-[#00B050] text-[10px] font-bold shrink-0">
                                            {planTier.split(" ")[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu Links */}
                                <div className="p-2 space-y-0.5 text-xs font-semibold text-gray-700">
                                    <Link
                                        href="/organizationadmin/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-gray-400" />
                                        <span>Company & Security Settings</span>
                                    </Link>

                                    <Link
                                        href="/organizationadmin/employees"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>Manage Employees</span>
                                    </Link>

                                    <Link
                                        href="/organizationadmin/attendance"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        <ScanFace className="w-4 h-4 text-gray-400" />
                                        <span>Live Attendance Logs</span>
                                    </Link>

                                    <Link
                                        href="/organizationadmin/referrals"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-emerald-50/60 hover:text-[#00B050] transition-colors"
                                    >
                                        <Share2 className="w-4 h-4 text-[#00B050]" />
                                        <span>Refer & Earn (20% Comm.)</span>
                                    </Link>
                                </div>

                                {/* Sign Out Section */}
                                <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-500" />
                                        <span>Sign Out from Workspace</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}