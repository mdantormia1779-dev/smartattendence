import React from "react";
import EmployeeSidebar from "./Components/Sidebar";
import EmployeeHeader from "./Components/Header";

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FBFBFA] flex">
            {/* Employee Sidebar */}
            <EmployeeSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <EmployeeHeader title="Employee Portal" />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
