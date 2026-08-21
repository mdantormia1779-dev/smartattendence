import React from "react";
import ManagerSidebar from "./Components/Sidebar";
import ManagerHeader from "./Components/Header";

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FBFBFA] flex">
            {/* Manager Sidebar */}
            <ManagerSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <ManagerHeader title="Manager Workspace" />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
