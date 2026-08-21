"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Clock, 
    Calendar, 
    UserCheck, 
    RotateCcw, 
    Plus, 
    CheckCircle2, 
    Search, 
    ArrowRightLeft,
    Sun,
    Sunset,
    Moon
} from "lucide-react";

interface TeamShiftSchedule {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    designation: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
}

const initialSchedules: TeamShiftSchedule[] = [
    {
        id: "sch-1",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        designation: "Senior Software Engineer",
        mon: "Morning (09-05)",
        tue: "Morning (09-05)",
        wed: "Morning (09-05)",
        thu: "Morning (09-05)",
        fri: "Morning (09-05)",
        sat: "Off",
        sun: "Off",
    },
    {
        id: "sch-2",
        employeeName: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        designation: "Frontend Engineer",
        mon: "Morning (09-05)",
        tue: "Morning (09-05)",
        wed: "Morning (09-05)",
        thu: "Morning (09-05)",
        fri: "Morning (09-05)",
        sat: "Off",
        sun: "Off",
    },
    {
        id: "sch-3",
        employeeName: "Sabbir Hossain",
        employeeId: "EMP-1049",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        designation: "Backend API Engineer",
        mon: "Evening (02-10)",
        tue: "Evening (02-10)",
        wed: "Evening (02-10)",
        thu: "Evening (02-10)",
        fri: "Evening (02-10)",
        sat: "Off",
        sun: "Off",
    },
    {
        id: "sch-4",
        employeeName: "Farhana Islam",
        employeeId: "EMP-1051",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        designation: "QA Engineer",
        mon: "Flexible (10-07)",
        tue: "Flexible (10-07)",
        wed: "Flexible (10-07)",
        thu: "Flexible (10-07)",
        fri: "Flexible (10-07)",
        sat: "Off",
        sun: "Off",
    },
];

export default function ManagerShiftsPage() {
    const [schedules, setSchedules] = useState<TeamShiftSchedule[]>(initialSchedules);
    const [selectedWeek, setSelectedWeek] = useState("Week 34 (Aug 17 - Aug 23, 2026)");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".roster-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [schedules, selectedWeek]);

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Clock className="w-6 h-6 text-[#00B050]" />
                        Team Weekly Shift Roster
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Assign shifts, handle rotational duties and manage team schedule coverage
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
                    >
                        <option value="Week 34 (Aug 17 - Aug 23, 2026)">Week 34 (Aug 17 - Aug 23, 2026)</option>
                        <option value="Week 35 (Aug 24 - Aug 30, 2026)">Week 35 (Aug 24 - Aug 30, 2026)</option>
                    </select>
                    <button
                        onClick={() => alert("Shift swap request initiated!")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Swap Shift
                    </button>
                </div>
            </div>

            {/* Shift Legend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                        <Sun className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">Morning Shift</p>
                        <span className="text-[11px] text-gray-500">09:00 AM – 05:00 PM</span>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                        <Sunset className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">Evening Shift</p>
                        <span className="text-[11px] text-gray-500">02:00 PM – 10:00 PM</span>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00B050]">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">Flexible Core</p>
                        <span className="text-[11px] text-gray-500">10:00 AM – 07:00 PM</span>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                        <Moon className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">Night Support</p>
                        <span className="text-[11px] text-gray-500">10:00 PM – 06:00 AM</span>
                    </div>
                </div>
            </div>

            {/* Weekly Roster Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6 min-w-[200px]">Team Member</th>
                                <th className="py-4 px-3 text-center">Mon</th>
                                <th className="py-4 px-3 text-center">Tue</th>
                                <th className="py-4 px-3 text-center">Wed</th>
                                <th className="py-4 px-3 text-center">Thu</th>
                                <th className="py-4 px-3 text-center">Fri</th>
                                <th className="py-4 px-3 text-center text-rose-500">Sat</th>
                                <th className="py-4 px-3 text-center text-rose-500">Sun</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {schedules.map((row) => (
                                <tr key={row.id} className="roster-row hover:bg-gray-50/60 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={row.avatar}
                                                alt={row.employeeName}
                                                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                                            />
                                            <div>
                                                <p className="font-bold text-gray-900">{row.employeeName}</p>
                                                <span className="text-[10px] text-gray-400 font-mono">{row.employeeId}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((dayKey) => {
                                        const val = (row as any)[dayKey];
                                        const isOff = val === "Off";
                                        return (
                                            <td key={dayKey} className="py-4 px-3 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                                    isOff
                                                        ? "bg-gray-100 text-gray-400"
                                                        : val.includes("Morning")
                                                        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                                        : val.includes("Evening")
                                                        ? "bg-orange-50 text-orange-700 border border-orange-200/60"
                                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                }`}>
                                                    {val}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
