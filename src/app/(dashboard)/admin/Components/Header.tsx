"use client"
import React from 'react';
import { Search } from 'lucide-react';
import NotificationDropdown from "@/components/NotificationDropdown";

const Header = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-100 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            {/* Search Box */}
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 w-64 md:w-80">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search organizations, plans, payments..." 
                    className="bg-transparent text-sm outline-none w-full text-gray-700"
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
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-[#00B050]/20 flex items-center justify-center text-[#00B050] font-bold">
                        SA
                    </div>
                    <div className="hidden md:block text-left">
                        <h4 className="text-sm font-semibold text-gray-900">System Admin</h4>
                        <span className="text-xs text-gray-500">superadmin@erp.com</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;