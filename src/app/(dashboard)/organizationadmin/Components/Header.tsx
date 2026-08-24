"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Building2 } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
    const [userName, setUserName] = useState("Organization Admin");
    const [userEmail, setUserEmail] = useState("admin@company.com");
    const [companyName, setCompanyName] = useState("Company Admin");

    const loadProfile = () => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.name || parsed.fullName) setUserName(parsed.name || parsed.fullName);
                    if (parsed.email) setUserEmail(parsed.email);
                    if (parsed.companyName || parsed.organizationName) {
                        setCompanyName(parsed.companyName || parsed.organizationName);
                    }
                } catch {}
            }
        }
    };

    useEffect(() => {
        loadProfile();
        const handleUpdate = (e: any) => {
            if (e.detail) {
                if (e.detail.name || e.detail.fullName) setUserName(e.detail.name || e.detail.fullName);
                if (e.detail.email) setUserEmail(e.detail.email);
                if (e.detail.companyName) setCompanyName(e.detail.companyName);
            } else {
                loadProfile();
            }
        };

        window.addEventListener("user-profile-updated", handleUpdate);
        return () => window.removeEventListener("user-profile-updated", handleUpdate);
    }, []);

    const getInitials = (name: string) => {
        if (!name) return "OA";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
            {/* Page Title */}
            <div>
                <h1 className="text-base font-bold text-neutral-900">{title}</h1>
            </div>

            {/* Right Side: Search, Notification, Profile */}
            <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="relative hidden md:block w-64">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-9 pr-4 py-2 bg-neutral-50/80 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all"
                    />
                </div>

                {/* Scoped Notification Dropdown for Org Admin */}
                <NotificationDropdown 
                    userId="user-org-1" 
                    role="ORG_ADMIN" 
                    organizationId="org-1" 
                />

                {/* Admin Profile Dropdown Pill */}
                <div className="flex items-center gap-3 pl-2 border-l border-neutral-200 cursor-pointer">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-2xs">
                        {getInitials(userName)}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-neutral-900 leading-tight">{userName}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">{companyName} · Org Admin</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>
            </div>
        </header>
    );
}