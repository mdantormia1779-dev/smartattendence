import React from 'react';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';

export const metadata = {
    title: 'Super Admin Dashboard - Attendance ERP',
    description: 'Manage organizations, plans, payments, and system configurations.',
};

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FBF9F5] flex">
            {/* Sidebar for Desktop */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}