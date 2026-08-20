"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard,
    Building2, 
    CreditCard, 
    Ticket, 
    DollarSign, 
    UserX, 
    FileText, 
    Settings, 
    LogOut 
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Create Organization', href: '/admin/create-organization', icon: Building2 },
    { name: 'Subscription Plans', href: '/admin/subscription-plans', icon: CreditCard },
    { name: 'Approve Payments', href: '/admin/approve-payments', icon: DollarSign },
    { name: 'Manage Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'View Revenue', href: '/admin/revenue', icon: DollarSign },
    { name: 'Suspend Organizations', href: '/admin/suspend', icon: UserX },
    { name: 'View Audit Logs', href: '/admin/audit-logs', icon: FileText },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-40 md:flex">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider">
                        VX
                    </div>
                    <div className="text-xl font-bold tracking-tight text-gray-900">
                        Super<span className="text-[#00B050]">Admin</span>
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                isActive 
                                    ? 'bg-[#00B050]/10 text-[#00B050]' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-[#00B050]' : 'text-gray-400'}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Logout / Footer */}
            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={() => console.log('Logout')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;