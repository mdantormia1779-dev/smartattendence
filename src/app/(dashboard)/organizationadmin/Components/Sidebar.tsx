"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboard, 
    GitBranch, 
    Building2, 
    UserCog, 
    Users, 
    Clock, 
    ScanFace, 
    CalendarCheck, 
    Calendar, 
    TrendingUp, 
    DollarSign, 
    BarChart3, 
    Settings, 
    LogOut,
    ShieldCheck,
    Share2,
    BellRing,
    Sparkles
} from "lucide-react";
import { api } from "@/lib/api-client";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeKey?: "pendingLeaves" | "pendingOvertime" | "totalEmployees";
}

const navItems: NavItem[] = [
    { name: "Dashboard", href: "/organizationadmin", icon: LayoutDashboard },
    { name: "Create Branches", href: "/organizationadmin/branchescreate", icon: GitBranch },
    { name: "Create Departments", href: "/organizationadmin/departmentscreate", icon: Building2 },
    { name: "Assign Managers", href: "/organizationadmin/assign-managers", icon: UserCog },
    { name: "Manage Employees", href: "/organizationadmin/employees", icon: Users, badgeKey: "totalEmployees" },
    { name: "Shift Management", href: "/organizationadmin/shifts", icon: Clock },
    { name: "Live Attendance", href: "/organizationadmin/attendance", icon: ScanFace },
    { name: "Leave Management", href: "/organizationadmin/leaves", icon: CalendarCheck, badgeKey: "pendingLeaves" },
    { name: "Holiday Calendar", href: "/organizationadmin/holidays", icon: Calendar },
    { name: "Overtime (OT) Rules", href: "/organizationadmin/overtime", icon: TrendingUp, badgeKey: "pendingOvertime" },
    { name: "Manage Payroll", href: "/organizationadmin/payroll", icon: DollarSign },
    { name: "Refer & Earn", href: "/organizationadmin/referrals", icon: Share2 },
    { name: "Send Notifications", href: "/organizationadmin/notifications", icon: BellRing },
    { name: "Reports & Analytics", href: "/organizationadmin/reports", icon: BarChart3 },
    { name: "Company Settings", href: "/organizationadmin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    // Live Real States
    const [companyName, setCompanyName] = useState("Vertex Technologies");
    const [orgLogo, setOrgLogo] = useState<string | null>(null);
    const [planName, setPlanName] = useState("Business Plan");
    const [daysRemaining, setDaysRemaining] = useState<number | null>(30);
    const [adminName, setAdminName] = useState("Admin User");
    const [adminRole, setAdminRole] = useState("Organization Admin");

    // Real Live Badge Counts
    const [badgeCounts, setBadgeCounts] = useState({
        pendingLeaves: 0,
        pendingOvertime: 0,
        totalEmployees: 0,
    });

    // 1. Load Real Organization Session, Plan, and Dynamic Badges
    const loadOrgData = async () => {
        let currentOrgId = "org-1";

        if (typeof window !== "undefined") {
            const rawUser =
                localStorage.getItem("user") ||
                localStorage.getItem("user_info") ||
                localStorage.getItem("userData");

            if (rawUser) {
                try {
                    const parsed = JSON.parse(rawUser);
                    if (parsed.organizationId) currentOrgId = parsed.organizationId;
                    if (parsed.name || parsed.fullName) setAdminName(parsed.name || parsed.fullName);
                    if (parsed.companyName || parsed.organizationName) setCompanyName(parsed.companyName || parsed.organizationName);
                    if (parsed.role) setAdminRole(parsed.role === "ORG_ADMIN" ? "Organization Admin" : parsed.role);
                } catch {}
            }
        }

        // Fetch fresh organization profile, trial status, and live action badges in parallel
        try {
            const [orgsRes, trialRes, leavesRes, overtimeRes, employeesRes] = await Promise.allSettled([
                api.organizations.getAll(),
                api.subscriptions.getTrialStatus(),
                api.leaves.getAll(),
                api.overtime.getAll(),
                api.employees.getAll(),
            ]);

            // Map Organization Profile & Plan
            if (orgsRes.status === "fulfilled" && orgsRes.value?.success && Array.isArray(orgsRes.value.data)) {
                const org = orgsRes.value.data.find((o: any) => o.id === currentOrgId) || orgsRes.value.data[0];
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
                            setPlanName("30-Day Free Trial");
                        } else {
                            remaining = Math.max(0, 30 - (diffDays % 30));
                            setPlanName(`${tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()} Plan`);
                        }
                        setDaysRemaining(remaining);
                    }
                }
            }

            // Fallback trial check
            if (trialRes.status === "fulfilled" && trialRes.value?.success && trialRes.value.data) {
                if (typeof trialRes.value.data.daysRemaining === "number") {
                    setDaysRemaining(trialRes.value.data.daysRemaining);
                }
            }

            // Map Pending Leaves Badge
            let pendingLeaveCount = 0;
            if (leavesRes.status === "fulfilled" && leavesRes.value?.success && Array.isArray(leavesRes.value.data)) {
                pendingLeaveCount = leavesRes.value.data.filter((l: any) => 
                    l.status === "PENDING" || l.adminApproval === "PENDING" || !l.adminApproval
                ).length;
            }

            // Map Pending Overtime Badge
            let pendingOtCount = 0;
            if (overtimeRes.status === "fulfilled" && overtimeRes.value?.success && Array.isArray(overtimeRes.value.data)) {
                pendingOtCount = overtimeRes.value.data.filter((o: any) => 
                    o.status === "PENDING" || o.approvalStatus === "PENDING"
                ).length;
            }

            // Map Total Employees
            let totalEmpCount = 0;
            if (employeesRes.status === "fulfilled" && employeesRes.value?.success && Array.isArray(employeesRes.value.data)) {
                totalEmpCount = employeesRes.value.data.length;
            }

            setBadgeCounts({
                pendingLeaves: pendingLeaveCount,
                pendingOvertime: pendingOtCount,
                totalEmployees: totalEmpCount,
            });
        } catch (e) {
            console.warn("Organization sidebar real data load fallback:", e);
        }
    };

    useEffect(() => {
        loadOrgData();

        const handleUpdate = () => loadOrgData();
        window.addEventListener("user-profile-updated", handleUpdate);
        window.addEventListener("org-profile-updated", handleUpdate);
        window.addEventListener("subscription-updated", handleUpdate);
        window.addEventListener("leaves-updated", handleUpdate);
        window.addEventListener("overtime-updated", handleUpdate);
        return () => {
            window.removeEventListener("user-profile-updated", handleUpdate);
            window.removeEventListener("org-profile-updated", handleUpdate);
            window.removeEventListener("subscription-updated", handleUpdate);
            window.removeEventListener("leaves-updated", handleUpdate);
            window.removeEventListener("overtime-updated", handleUpdate);
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

    const getInitials = (name: string) => {
        if (!name) return "AD";
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
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0 z-40 md:flex select-none">
            
            {/* Logo & Company Section */}
            <div className="h-16 flex items-center px-6 border-b border-neutral-200 justify-between">
                <Link href="/organizationadmin" className="flex items-center gap-3 min-w-0">
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
                            <Sparkles className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">
                                {planName} {daysRemaining !== null ? `(${daysRemaining}d left)` : ""}
                            </span>
                        </span>
                    </div>
                </Link>
            </div>

            {/* Logged-in User Profile Card */}
            <div className="p-3 mx-4 my-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                        {getInitials(adminName)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <p className="text-xs font-bold text-neutral-900 truncate">{adminName}</p>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                        </div>
                        <p className="text-[10px] text-neutral-500 font-medium truncate">{adminRole}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu Links */}
            <div className="flex-1 overflow-y-auto py-1 px-3 space-y-0.5 custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/organizationadmin" 
                        ? pathname === "/organizationadmin" 
                        : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    
                    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                                isActive 
                                    ? "bg-[#00B050]/10 text-[#00B050] font-bold shadow-2xs" 
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00B050]" : "text-neutral-400"}`} />
                                <span className="truncate">{item.name}</span>
                            </div>

                            {/* Dynamic Real Badges */}
                            {badgeCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                    item.badgeKey === "pendingLeaves"
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : item.badgeKey === "pendingOvertime"
                                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                        : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                                }`}>
                                    {badgeCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Real Logout Action */}
            <div className="p-3 border-t border-neutral-200 bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}