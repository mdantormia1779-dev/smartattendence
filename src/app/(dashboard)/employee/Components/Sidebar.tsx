"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    ScanFace, 
    UserCheck, 
    Calendar, 
    CalendarCheck, 
    DollarSign, 
    User, 
    LogOut,
    Sparkles
} from "lucide-react";

const employeeNavItems = [
    { name: "Dashboard", href: "/employee", icon: LayoutDashboard },
    { name: "Smart Check-In / Out", href: "/employee/checkin", icon: ScanFace },
    { name: "Face Registration", href: "/employee/face-registration", icon: UserCheck },
    { name: "My Attendance", href: "/employee/attendance", icon: Calendar },
    { name: "Apply Leave", href: "/employee/leaves", icon: CalendarCheck },
    { name: "Salary & Payslips", href: "/employee/salary", icon: DollarSign },
    { name: "Profile & Documents", href: "/employee/profile", icon: User },
];

export default function EmployeeSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-40 md:flex select-none">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
                <Link href="/employee" className="flex items-center gap-3">
                    <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider shadow-sm">
                        VX
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 tracking-tight leading-tight">Employee Portal</h2>
                        <span className="inline-block px-2 py-0.5 mt-0.5 bg-emerald-50 text-[#00B050] text-[10px] font-bold rounded-md">
                            Vertex Tech
                        </span>
                    </div>
                </Link>
            </div>

            {/* Employee Profile Pill */}
            <div className="p-3 mx-4 my-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                        alt="Arif Chowdhury"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00B050]/30"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">Arif Chowdhury</p>
                        <p className="text-[10px] text-gray-500 font-medium font-mono truncate">EMP-1042 · Sr. Dev</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                {employeeNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/employee"
                        ? pathname === "/employee"
                        : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                                isActive
                                    ? "bg-[#00B050]/10 text-[#00B050] font-bold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00B050]" : "text-gray-400"}`} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Logout */}
            <div className="p-3 border-t border-gray-100 bg-white">
                <Link
                    href="/login"
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign out</span>
                </Link>
            </div>
        </aside>
    );
}
