"use client";

import React from "react";
import { Search, ChevronDown } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
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
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                        alt="Sarah Rahman"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100"
                    />
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-neutral-900 leading-tight">Sarah Rahman</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Vertex Tech · Org Admin</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>
            </div>
        </header>
    );
}