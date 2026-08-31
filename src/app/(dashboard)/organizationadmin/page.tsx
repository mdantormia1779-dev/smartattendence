"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Plus, CheckCircle2, RefreshCw, LogIn } from "lucide-react";
import StatCards from "./Components/HomePage/StatCards";
import BarChartSection from "./Components/HomePage/BarChartSection";
import PieChartSection from "./Components/HomePage/PieChartSection";
import LiveAttendanceTable from "./Components/HomePage/LiveAttendanceTable";
import SideWidgets from "./Components/HomePage/SideWidgets";
import WebPunchModal from "./Components/Attendance/WebPunchModal";
import { api } from "@/lib/api-client";

export default function OrganizationDashboardPage() {
    const router = useRouter();
    const headerRef = useRef<HTMLDivElement>(null);
    const [adminName, setAdminName] = useState("Administrator");
    const [companyName, setCompanyName] = useState("Organization");
    const [currentDateStr, setCurrentDateStr] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);

    const loadProfileAndOrg = async () => {
        let foundName = "";
        let foundCompany = "";

        // 1. Check local session storage keys
        if (typeof window !== "undefined") {
            const rawUser =
                localStorage.getItem("user") ||
                localStorage.getItem("user_info") ||
                localStorage.getItem("userData") ||
                localStorage.getItem("currentUser");

            if (rawUser) {
                try {
                    const parsed = JSON.parse(rawUser);
                    if (parsed.name || parsed.fullName) {
                        foundName = parsed.name || parsed.fullName;
                        setAdminName(foundName);
                    }
                    if (parsed.companyName || parsed.organizationName || parsed.organization?.name) {
                        foundCompany = parsed.companyName || parsed.organizationName || parsed.organization?.name;
                        setCompanyName(foundCompany);
                    }
                } catch {}
            }
        }

        // 2. Fetch live organization from PostgreSQL Database
        try {
            const res = await api.organizations.getAll();
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                const org = res.data[0];
                if (org.name) {
                    setCompanyName(org.name);
                }
                // Only if name was not found in storage, use fallback
                if (!foundName) {
                    if (org.ownerName) {
                        setAdminName(org.ownerName);
                    } else if (org.email) {
                        const extracted = org.email.split("@")[0];
                        setAdminName(extracted.charAt(0).toUpperCase() + extracted.slice(1));
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load organization info:", e);
        }
    };

    useEffect(() => {
        loadProfileAndOrg();

        // Format live date
        const now = new Date();
        const formatted = now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        setCurrentDateStr(formatted);

        // Listen for profile update events
        const handleProfileUpdate = (e: any) => {
            if (e.detail) {
                if (e.detail.name || e.detail.fullName) setAdminName(e.detail.name || e.detail.fullName);
                if (e.detail.companyName) setCompanyName(e.detail.companyName);
            } else {
                loadProfileAndOrg();
            }
        };

        window.addEventListener("user-profile-updated", handleProfileUpdate);
        window.addEventListener("admin-profile-updated", handleProfileUpdate);

        if (headerRef.current) {
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
        }

        return () => {
            window.removeEventListener("user-profile-updated", handleProfileUpdate);
            window.removeEventListener("admin-profile-updated", handleProfileUpdate);
        };
    }, []);

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
        loadProfileAndOrg();
    };

    return (
        <div className="flex-1 bg-[#FBFBFA] p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-neutral-800">
            {/* Top Greeting Banner */}
            <div ref={headerRef} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        Good day, {adminName} <span className="inline-block animate-bounce">👋</span>
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Live operations & attendance overview for <strong className="text-neutral-700">{companyName}</strong> — {currentDateStr || "Today"}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => setIsPunchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#00B050] hover:bg-[#009b46] text-white shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95"
                    >
                        <LogIn className="w-4 h-4" />
                        Web Punch In / Out
                    </button>
                    <button 
                        onClick={handleRefresh}
                        className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
                        title="Refresh dashboard metrics"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => router.push("/organizationadmin/employees")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-xs active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-[#10b981]" />
                        Add Employee
                    </button>
                    <button 
                        onClick={() => router.push("/organizationadmin/attendance")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Attendance Console
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <StatCards key={`stats-${refreshKey}`} />

            {/* Charts Section: Weekly Trend Bar Chart & Today Breakdown Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BarChartSection key={`bars-${refreshKey}`} />
                <PieChartSection key={`pie-${refreshKey}`} />
            </div>

            {/* Bottom Grid: Live Attendance & Side Widgets (Leaves + Holidays) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LiveAttendanceTable key={`logs-${refreshKey}`} />
                <SideWidgets key={`widgets-${refreshKey}`} />
            </div>

            {/* Web Punch Terminal Modal */}
            <WebPunchModal
                isOpen={isPunchModalOpen}
                onClose={() => setIsPunchModalOpen(false)}
                onPunchSuccess={handleRefresh}
            />
        </div>
    );
}