"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Plus, CheckCircle2 } from "lucide-react";
import StatCards from "./Components/HomePage/StatCards";
import BarChartSection from "./Components/HomePage/BarChartSection";
import PieChartSection from "./Components/HomePage/PieChartSection";
import LiveAttendanceTable from "./Components/HomePage/LiveAttendanceTable";
import SideWidgets from "./Components/HomePage/SideWidgets";

export default function OrganizationDashboardPage() {
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (headerRef.current) {
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
        }
    }, []);

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto">
            {/* Top Greeting */}
            <div ref={headerRef} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Good morning, Sarah <span className="inline-block animate-bounce">👋</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Here's what's happening at Vertex today — Tuesday, Aug 18, 2026
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Add Employee
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer">
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Attendance
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <StatCards />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BarChartSection />
                <PieChartSection />
            </div>

            {/* Bottom Grid: Live Attendance & Side Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LiveAttendanceTable />
                <SideWidgets />
            </div>
        </div>
    );
}