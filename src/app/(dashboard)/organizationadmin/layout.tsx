import React from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FBFBFA] flex">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header title="Dashboard" />
                
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}