"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ScanFace } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";

interface HeaderProps {
    title?: string;
}

export default function EmployeeHeader({ title = "Employee Self-Service" }: HeaderProps) {
    const [employeeName, setEmployeeName] = useState("Employee");
    const [designation, setDesignation] = useState("Staff Member");

    const loadProfile = () => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.name || parsed.fullName) setEmployeeName(parsed.name || parsed.fullName);
                    if (parsed.designation || parsed.roleTitle) setDesignation(parsed.designation || parsed.roleTitle);
                } catch {}
            }
        }
    };

    useEffect(() => {
        loadProfile();
        const handleUpdate = (e: any) => {
            if (e.detail) {
                if (e.detail.name || e.detail.fullName) setEmployeeName(e.detail.name || e.detail.fullName);
            } else {
                loadProfile();
            }
        };

        window.addEventListener("user-profile-updated", handleUpdate);
        return () => window.removeEventListener("user-profile-updated", handleUpdate);
    }, []);

    const getInitials = (name: string) => {
        if (!name) return "EM";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
            {/* Page Title & Status Badge */}
            <div className="flex items-center gap-3">
                <h1 className="text-base font-bold text-neutral-900">{title}</h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-[#10b981] px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                    Attendance Portal
                </span>
            </div>

            {/* Right Side: Quick Check-In CTA & Profile */}
            <div className="flex items-center gap-4">
                <Link
                    href="/employee/checkin"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                    <ScanFace className="w-3.5 h-3.5" />
                    Check In / Punch
                </Link>

                {/* Scoped Notification Dropdown for Employee */}
                <NotificationDropdown 
                    userId="user-emp-1" 
                    role="EMPLOYEE" 
                    organizationId="org-1" 
                />

                {/* Profile Pill */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200 cursor-pointer">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10b981] font-bold text-xs shadow-2xs">
                        {getInitials(employeeName)}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-neutral-900 leading-tight">{employeeName}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">{designation}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>
            </div>
        </header>
    );
}
