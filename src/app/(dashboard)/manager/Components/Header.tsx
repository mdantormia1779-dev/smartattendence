"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Search, 
    ChevronDown, 
    Building2, 
    Users, 
    Clock, 
    Calendar, 
    LogOut, 
    Sparkles, 
    X, 
    CheckCircle2, 
    ShieldCheck, 
    MapPin,
    Briefcase,
    TrendingUp,
    Share2
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { api } from "@/lib/api-client";

interface HeaderProps {
    title?: string;
}

export default function ManagerHeader({ title = "Manager Dashboard" }: HeaderProps) {
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Profile & Context States
    const [managerName, setManagerName] = useState("Manager");
    const [managerEmail, setManagerEmail] = useState("");
    const [userId, setUserId] = useState("user-mgr-1");
    const [organizationId, setOrganizationId] = useState("org-1");
    const [deptName, setDeptName] = useState("Operations");
    const [branchName, setBranchName] = useState("Main Branch");
    const [designation, setDesignation] = useState("Branch Manager");

    // UI States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Load Live Manager Profile from Session & Real APIs
    const loadProfile = async () => {
        let currentUserId = "user-mgr-1";
        let currentOrgId = "org-1";
        let foundName = "";
        let foundEmail = "";
        let foundDept = "";
        let foundBranch = "";
        let foundDesignation = "";

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
                        setManagerName(foundName);
                    }
                    if (parsed.email) {
                        foundEmail = parsed.email;
                        setManagerEmail(foundEmail);
                    }
                    if (parsed.organizationId) {
                        currentOrgId = parsed.organizationId;
                        setOrganizationId(currentOrgId);
                    }
                    if (parsed.department || parsed.departmentName) {
                        foundDept = parsed.department || parsed.departmentName;
                        setDeptName(foundDept);
                    }
                    if (parsed.branch || parsed.branchName) {
                        foundBranch = parsed.branch || parsed.branchName;
                        setBranchName(foundBranch);
                    }
                    if (parsed.designation || parsed.role) {
                        foundDesignation = parsed.designation || "Branch Manager";
                        setDesignation(foundDesignation);
                    }
                } catch {}
            }
        }

        // Fetch fresh manager details from live backend API
        try {
            const [mgrRes, branchesRes, deptsRes] = await Promise.allSettled([
                api.managers.getById(currentUserId),
                api.branches.getAll(),
                api.departments.getAll()
            ]);

            if (mgrRes.status === "fulfilled" && mgrRes.value?.success && mgrRes.value.data) {
                const m = mgrRes.value.data;
                if (m.name) setManagerName(m.name);
                if (m.email) setManagerEmail(m.email);
                if (m.organizationId) setOrganizationId(m.organizationId);
                if (m.departmentName || m.department) setDeptName(m.departmentName || m.department);
                if (m.branchName || m.branch) setBranchName(m.branchName || m.branch);
                if (m.designation) setDesignation(m.designation);
            } else {
                // Fetch branch/dept fallback if specific manager API is scoped by org
                if (branchesRes.status === "fulfilled" && branchesRes.value?.success && Array.isArray(branchesRes.value.data)) {
                    if (branchesRes.value.data.length > 0 && !foundBranch) {
                        setBranchName(branchesRes.value.data[0].name || "Main Branch");
                    }
                }
                if (deptsRes.status === "fulfilled" && deptsRes.value?.success && Array.isArray(deptsRes.value.data)) {
                    if (deptsRes.value.data.length > 0 && !foundDept) {
                        setDeptName(deptsRes.value.data[0].name || "Operations");
                    }
                }
            }
        } catch (e) {
            console.warn("Live Manager profile API fetch fallback:", e);
        }
    };

    useEffect(() => {
        loadProfile();

        // Listen for live profile updates
        const handleUpdate = (e: any) => {
            if (e?.detail) {
                if (e.detail.name || e.detail.fullName) setManagerName(e.detail.name || e.detail.fullName);
                if (e.detail.email) setManagerEmail(e.detail.email);
                if (e.detail.department) setDeptName(e.detail.department);
                if (e.detail.branch) setBranchName(e.detail.branch);
            } else {
                loadProfile();
            }
        };

        window.addEventListener("user-profile-updated", handleUpdate);
        window.addEventListener("manager-profile-updated", handleUpdate);
        return () => {
            window.removeEventListener("user-profile-updated", handleUpdate);
            window.removeEventListener("manager-profile-updated", handleUpdate);
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
            router.push(`/manager/employees?search=${encodeURIComponent(searchTerm.trim())}`);
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
        if (!name) return "MG";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            {/* Left: Page Title & Assigned Context */}
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight flex items-center gap-2">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-[#00B050] px-2 py-0.5 rounded-full border border-emerald-200/60">
                            <Building2 className="w-3 h-3 shrink-0" /> {branchName}
                        </span>
                        {deptName && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-neutral-500 font-medium">
                                · {deptName}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Global Search, Scoped Notification Bell, Profile Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3.5">
                {/* Search Team */}
                <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-52 lg:w-64">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search team members..."
                        className="w-full pl-9.5 pr-8 py-2 bg-neutral-50/80 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] transition-all"
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

                {/* Scoped Manager Notification Bell with Real Dynamic IDs */}
                <NotificationDropdown 
                    userId={userId} 
                    role="MANAGER" 
                    organizationId={organizationId} 
                />

                {/* Status Indicator */}
                <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#00B050] border border-emerald-100 text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#00B050] animate-pulse"></span>
                    <span>Manager Portal</span>
                </div>

                {/* Manager Interactive Profile Dropdown */}
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
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {getInitials(managerName)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-bold text-neutral-900 leading-tight truncate max-w-[130px]">{managerName}</p>
                            <p className="text-[10px] text-neutral-400 font-medium truncate max-w-[130px]">{designation}</p>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180 text-neutral-700" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                            {/* Profile Header */}
                            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                                <p className="text-xs font-bold text-neutral-900">{managerName}</p>
                                <p className="text-[11px] text-neutral-500 truncate">{managerEmail || "manager@vertextech.io"}</p>
                                <div className="mt-2 flex items-center gap-1.5">
                                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Team Lead & Manager
                                    </span>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="py-1">
                                <Link 
                                    href="/manager/employees"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>My Team Members</span>
                                </Link>

                                <Link 
                                    href="/manager/attendance"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Team Attendance</span>
                                </Link>

                                <Link 
                                    href="/manager/leaves"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Leave Approvals</span>
                                </Link>

                                <Link 
                                    href="/manager/overtime"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Overtime Requests</span>
                                </Link>

                                <Link 
                                    href="/manager/referrals"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Referrals & Rewards</span>
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
