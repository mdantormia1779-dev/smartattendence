"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, ScanFace } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";

interface HeaderProps {
    title?: string;
}

export default function EmployeeHeader({ title = "Employee Self-Service" }: HeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
            {/* Page Title & Status Badge */}
            <div className="flex items-center gap-3">
                <h1 className="text-base font-bold text-neutral-900">{title}</h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-[#00B050] px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    <span className="w-2 h-2 rounded-full bg-[#00B050] animate-pulse"></span>
                    Clocked In · 08:52 AM
                </span>
            </div>

            {/* Right Side: Quick Check-In CTA & Profile */}
            <div className="flex items-center gap-4">
                <Link
                    href="/employee/checkin"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-sm transition-transform hover:scale-105 cursor-pointer"
                >
                    <ScanFace className="w-3.5 h-3.5" />
                    Punch Out
                </Link>

                {/* Scoped Notification Dropdown for Employee */}
                <NotificationDropdown 
                    userId="user-emp-1" 
                    role="EMPLOYEE" 
                    organizationId="org-1" 
                />

                {/* Profile Pill */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200 cursor-pointer">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                        alt="Arif Chowdhury"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100"
                    />
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-neutral-900 leading-tight">Arif Chowdhury</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Software Engineer</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>
            </div>
        </header>
    );
}
