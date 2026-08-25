"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboard, 
    Users, 
    ScanFace, 
    Clock, 
    CalendarCheck, 
    TrendingUp, 
    BarChart3, 
    LogOut,
    UserCheck,
    Building2,
    Shield,
    Share2,
    Briefcase
} from "lucide-react";
import { api } from "@/lib/api-client";

const managerNavItems = [
    { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { name: "My Team Members", href: "/manager/employees", icon: Users },
    { name: "Team Attendance", href: "/manager/attendance", icon: ScanFace },
    { name: "Shift Scheduling", href: "/manager/shifts", icon: Clock },
    { name: "Leave Approvals", href: "/manager/leaves", icon: CalendarCheck },
    { name: "Overtime Requests", href: "/manager/overtime", icon: TrendingUp },
    { name: "Referral & Rewards", href: "/manager/referrals", icon: Share2 },
    { name: "Team Reports", href: "/manager/reports", icon: BarChart3 },
];

export default function ManagerSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    // Live Real Manager & Organization States
    const [managerName, setManagerName] = useState("Manager");
    const [managerRole, setManagerRole] = useState("Branch Manager");
    const [branchName, setBranchName] = useState("Main Branch");
    const [deptName, setDeptName] = useState("Operations");
    const [companyName, setCompanyName] = useState("Smart Attendance");
    const [orgLogo, setOrgLogo] = useState<string | null>(null);

    // 1. Load Live Manager & Organization Profile
    const loadProfile = async () => {
        let currentUserId = "user-mgr-1";
        let currentOrgId = "org-1";

        if (typeof window !== "undefined") {
            const rawUser =
                localStorage.getItem("user") ||
                localStorage.getItem("user_info") ||
                localStorage.getItem("userData");

            if (rawUser) {
                try {
                    const parsed = JSON.parse(rawUser);
                    if (parsed.id || parsed.userId) currentUserId = parsed.id || parsed.userId;
                    if (parsed.name || parsed.fullName) setManagerName(parsed.name || parsed.fullName);
                    if (parsed.organizationId) currentOrgId = parsed.organizationId;
                    if (parsed.department || parsed.departmentName) setDeptName(parsed.department || parsed.departmentName);
                    if (parsed.branch || parsed.branchName) setBranchName(parsed.branch || parsed.branchName);
                    if (parsed.designation || parsed.role) setManagerRole(parsed.designation || "Branch Manager");
                    if (parsed.companyName || parsed.organizationName) {
                        setCompanyName(parsed.companyName || parsed.organizationName);
                    }
                } catch {}
            }
        }

        // Fetch fresh manager and organization data from live backend API
        try {
            const [mgrRes, orgsRes] = await Promise.allSettled([
                api.managers.getById(currentUserId),
                api.organizations.getAll()
            ]);

            if (mgrRes.status === "fulfilled" && mgrRes.value?.success && mgrRes.value.data) {
                const m = mgrRes.value.data;
                if (m.name) setManagerName(m.name);
                if (m.departmentName || m.department) setDeptName(m.departmentName || m.department);
                if (m.branchName || m.branch) setBranchName(m.branchName || m.branch);
                if (m.designation) setManagerRole(m.designation);
            }

            if (orgsRes.status === "fulfilled" && orgsRes.value?.success && Array.isArray(orgsRes.value.data)) {
                const org = orgsRes.value.data.find((o: any) => o.id === currentOrgId) || orgsRes.value.data[0];
                if (org) {
                    if (org.name) setCompanyName(org.name);
                    if (org.customLogoUrl) setOrgLogo(org.customLogoUrl);
                }
            }
        } catch (e) {
            console.warn("Sidebar manager profile load fallback:", e);
        }
    };

    useEffect(() => {
        loadProfile();

        const handleUpdate = (e: any) => {
            if (e?.detail) {
                if (e.detail.name || e.detail.fullName) setManagerName(e.detail.name || e.detail.fullName);
                if (e.detail.department) setDeptName(e.detail.department);
                if (e.detail.branch) setBranchName(e.detail.branch);
                if (e.detail.companyName) setCompanyName(e.detail.companyName);
            } else {
                loadProfile();
            }
        };

        window.addEventListener("user-profile-updated", handleUpdate);
        window.addEventListener("manager-profile-updated", handleUpdate);
        window.addEventListener("org-profile-updated", handleUpdate);
        return () => {
            window.removeEventListener("user-profile-updated", handleUpdate);
            window.removeEventListener("manager-profile-updated", handleUpdate);
            window.removeEventListener("org-profile-updated", handleUpdate);
        };
    }, []);

    // 2. Real Logout Action
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

    const getCompanyInitials = (name: string) => {
        if (!name) return "VX";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0 z-40 select-none">
            {/* Logo & Role Section */}
            <div className="h-16 flex items-center px-6 border-b border-neutral-200 justify-between">
                <Link href="/manager" className="flex items-center gap-3 min-w-0">
                    {orgLogo ? (
                        <img 
                            src={orgLogo} 
                            alt={companyName} 
                            className="w-9 h-9 rounded-xl object-cover border border-neutral-200 shadow-2xs shrink-0" 
                        />
                    ) : (
                        <div className="bg-[#00B050] text-white font-black px-2.5 py-1.5 rounded-xl text-sm tracking-wider shadow-2xs shrink-0">
                            {getCompanyInitials(companyName)}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xs font-bold text-neutral-900 tracking-tight leading-tight truncate">
                            {companyName}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 bg-emerald-50 text-[#00B050] text-[10px] font-bold rounded-md border border-emerald-200/60 truncate max-w-full">
                            <Building2 className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{branchName}</span>
                        </span>
                    </div>
                </Link>
            </div>

            {/* Manager Live Profile Pill */}
            <div className="p-3 mx-4 my-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                        {getInitials(managerName)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <p className="text-xs font-bold text-neutral-900 truncate">{managerName}</p>
                            <UserCheck className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                        </div>
                        <p className="text-[10px] text-neutral-500 font-medium truncate">{managerRole}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                {managerNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/manager"
                        ? pathname === "/manager"
                        : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                                isActive
                                    ? "bg-[#00B050]/10 text-[#00B050] font-bold shadow-2xs"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00B050]" : "text-neutral-400"}`} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Real Logout Action */}
            <div className="p-3 border-t border-neutral-200 bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
