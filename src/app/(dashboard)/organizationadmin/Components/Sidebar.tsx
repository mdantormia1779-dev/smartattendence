"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    GitBranch, 
    Building2, 
    UserCog, 
    Users, 
    DollarSign, 
    BarChart3, 
    Settings, 
    LogOut,
    ShieldCheck
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/organizationadmin", icon: LayoutDashboard },
    { name: "Create Branches", href: "/organizationadmin/branchescreate", icon: GitBranch },
    { name: "Create Departments", href: "/organizationadmin/departments/create", icon: Building2 },
    { name: "Assign Managers", href: "/organizationadmin/assign-managers", icon: UserCog },
    { name: "Manage Employees", href: "/organizationadmin/employees", icon: Users },
    { name: "Manage Payroll", href: "/organizationadmin/payroll", icon: DollarSign },
    { name: "View Reports", href: "/organizationadmin/reports", icon: BarChart3 },
    { name: "Configure Company Settings", href: "/organizationadmin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-40 md:flex select-none">
            
            {/* Logo & Company Section */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider shadow-sm">
                        VX
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 tracking-tight leading-tight">Vertex Technologies</h2>
                        <span className="inline-block px-2 py-0.5 mt-1 bg-[#00B050]/10 text-[#00B050] text-[10px] font-bold rounded-md">
                            Business Plan
                        </span>
                    </div>
                </div>
            </div>

            {/* Logged-in User Profile Card */}
            <div className="p-3.5 mx-4 my-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00B050]/10 text-[#00B050] flex items-center justify-center font-bold text-xs shrink-0">
                        SR
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <p className="text-xs font-bold text-gray-900 truncate">Sarah Rahman</p>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium truncate">Organization Admin</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu Links */}
            <div className="flex-1 overflow-y-auto py-2 px-4 space-y-1 custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/organizationadmin/dashboard" && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive 
                                    ? 'bg-[#00B050]/10 text-[#00B050]' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-[#00B050]' : 'text-gray-400'}`} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Logout / Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <button
                    onClick={() => console.log("Signing out...")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span>Sign out</span>
                </button>
            </div>

        </aside>
    );
}