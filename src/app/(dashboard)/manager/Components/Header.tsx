"use client";

import React from "react";
import { Search, Bell, ChevronDown, Building2, UserCheck } from "lucide-react";

interface HeaderProps {
    title?: string;
}

export default function ManagerHeader({ title = "Manager Dashboard" }: HeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
            {/* Page Title & Assigned Dept */}
            <div className="flex items-center gap-3">
                <h1 className="text-base font-bold text-neutral-900">{title}</h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-[#00B050] px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    <Building2 className="w-3 h-3" /> Head Office – IT Dept
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

                {/* Notification Bell */}
                <button 
                    aria-label="Notifications"
                    className="w-9 h-9 rounded-xl border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors relative cursor-pointer"
                >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* Manager Profile */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200 cursor-pointer">
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
                        alt="Tanvir Ahmed"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100"
                    />
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-neutral-900 leading-tight">Tanvir Ahmed</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Team Lead & Manager</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>
            </div>
        </header>
    );
}
