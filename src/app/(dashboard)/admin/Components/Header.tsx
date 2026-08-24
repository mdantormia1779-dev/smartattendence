"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";

const Header = () => {
    const [adminName, setAdminName] = useState("Super Admin");
    const [adminEmail, setAdminEmail] = useState("superadmin@erp.com");

    const fetchAdminProfile = async () => {
        // 1. Check localStorage first
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.name || parsed.fullName) setAdminName(parsed.name || parsed.fullName);
                    if (parsed.email) setAdminEmail(parsed.email);
                } catch {}
            }
        }

        // 2. Fetch fresh from database API
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
                setAdminName(data.admin.name || "Super Admin");
                setAdminEmail(data.admin.email || "superadmin@erp.com");
            }
        } catch (e) {
            console.error("Failed to fetch admin profile for header", e);
        }
    };

    useEffect(() => {
        fetchAdminProfile();

        // Listen for real-time profile updates from settings page
        const handleProfileUpdate = (event: any) => {
            if (event.detail) {
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

    // Initials helper
    const getInitials = (name: string) => {
        if (!name) return "SA";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200/80 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            {/* Search Box */}
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200 w-64 md:w-80">
                <Search className="w-4 h-4 text-neutral-400" />
                <input 
                    type="text" 
                    placeholder="Search organizations, plans, payments..." 
                    className="bg-transparent text-xs outline-none w-full text-neutral-700 placeholder:text-neutral-400"
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                {/* Live Scoped Notification Dropdown */}
                <NotificationDropdown 
                    userId="user-super-1" 
                    role="SUPER_ADMIN" 
                    organizationId={null} 
                />

                {/* Profile Avatar */}
                <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#10b981] font-bold text-xs shadow-2xs">
                        {getInitials(adminName)}
                    </div>
                    <div className="hidden md:block text-left">
                        <h4 className="text-xs font-bold text-neutral-900 tracking-tight leading-tight">{adminName}</h4>
                        <span className="text-[11px] text-neutral-400 font-mono">{adminEmail}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;