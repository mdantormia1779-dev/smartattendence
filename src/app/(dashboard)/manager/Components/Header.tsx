"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Building2 } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";

interface HeaderProps {
    title?: string;
}

export default function ManagerHeader({ title = "Manager Dashboard" }: HeaderProps) {
    const [managerName, setManagerName] = useState("Manager");
    const [deptName, setDeptName] = useState("Operations Department");

    const loadProfile = () => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.name || parsed.fullName) setManagerName(parsed.name || parsed.fullName);
                    if (parsed.department || parsed.departmentName) setDeptName(parsed.department || parsed.departmentName);
                } catch {}
            }
        }
    };

    useEffect(() => {
        loadProfile();
        const handleUpdate = (e: any) => {
            if (e.detail) {
                if (e.detail.name || e.detail.fullName) setManagerName(e.detail.name || e.detail.fullName);
            } else {
                loadProfile();
            }
        };

        window.addEventListener("user-profile-updated", handleUpdate);
        return () => window.removeEventListener("user-profile-updated", handleUpdate);
    }, []);

    const getInitials = (name: string) => {
        if (!name) return "MG";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
            {/* Page Title & Assigned Dept */}
            <div className="flex items-center gap-3">
                <h1 className="text-base font-bold text-neutral-900">{title}</h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-[#10b981] px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    <Building2 className="w-3 h-3" /> {deptName}
                </span>
            </div>

            {/* Right Side: Search, Notification, Profile */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block w-60">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search team..."
                        className="w-full pl-9 pr-4 py-2 bg-neutral-50/80 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all"
                    />
                </div>

                {/* Scoped Notification Bell */}
                <NotificationDropdown 
                    userId="user-mgr-1" 
                    role="MANAGER" 
                    organizationId="org-1" 
                />

                {/* Manager Profile */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200 cursor-pointer">
                    <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs shadow-2xs">
                        {getInitials(managerName)}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-neutral-900 leading-tight">{managerName}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Team Lead & Manager</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>
            </div>
        </header>
    );
}
