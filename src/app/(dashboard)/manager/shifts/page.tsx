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
    Moon,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

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

export default function ManagerShiftsPage() {
    const [schedules, setSchedules] = useState<TeamShiftSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState("Current Work Week (Aug 2026)");
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchRoster = async () => {
        try {
            setLoading(true);
            const [empRes, shiftRes] = await Promise.all([
                api.employees.getAll(),
                api.shifts.getAll(),
            ]);

            if (empRes.success && Array.isArray(empRes.data)) {
                const primaryShift = Array.isArray(shiftRes.data) && shiftRes.data.length > 0 
                    ? `${shiftRes.data[0].name} (${shiftRes.data[0].startTime?.substring(0, 5)}-${shiftRes.data[0].endTime?.substring(0, 5)})` 
                    : "Regular (09:00-17:00)";

                const mapped: TeamShiftSchedule[] = empRes.data.map((emp: any) => ({
                    id: emp.id,
                    employeeName: emp.name || emp.fullName,
                    employeeId: emp.employeeId || emp.code,
                    avatar: emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                    designation: emp.designation || "Team Member",
                    mon: primaryShift,
                    tue: primaryShift,
                    wed: primaryShift,
                    thu: primaryShift,
                    fri: primaryShift,
                    sat: "Off",
                    sun: "Off",
                }));
                setSchedules(mapped);
            }
        } catch (e) {
            console.error("Failed to load manager shift roster", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoster();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".roster-row",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [schedules, loading]);

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-[#00B050]" />
                        Team Shift Roaster & Roster Allocation
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        View weekly assigned shifts, weekend off-days & rotational roster schedules
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                    >
                        <option value="Current Work Week (Aug 2026)">Current Work Week (Aug 2026)</option>
                        <option value="Next Work Week (Sep 2026)">Next Work Week (Sep 2026)</option>
                    </select>
                </div>
            </div>

            {/* Shift Legends */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-xs">
                <span className="font-bold text-gray-700">Roster Shifts:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    <Sun className="w-3.5 h-3.5" /> Morning Standard (09:00 AM - 05:00 PM)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    <Sunset className="w-3.5 h-3.5" /> Evening Shift (02:00 PM - 10:00 PM)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold border border-gray-200">
                    <Clock className="w-3.5 h-3.5" /> Weekly Off-Day (Rest)
                </span>
            </div>

            {/* Roster Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading team shift schedule...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-4 py-4 text-center">Mon</th>
                                    <th className="px-4 py-4 text-center">Tue</th>
                                    <th className="px-4 py-4 text-center">Wed</th>
                                    <th className="px-4 py-4 text-center">Thu</th>
                                    <th className="px-4 py-4 text-center">Fri</th>
                                    <th className="px-4 py-4 text-center bg-gray-50">Sat</th>
                                    <th className="px-4 py-4 text-center bg-gray-50">Sun</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-gray-400">
                                            No shift assignments found for team.
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((item) => (
                                        <tr key={item.id} className="roster-row hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.employeeName}
                                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.employeeName}</p>
                                                        <p className="text-[10px] text-gray-400">{item.employeeId} · {item.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                    {item.mon}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                    {item.tue}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                    {item.wed}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                    {item.thu}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                    {item.fri}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center bg-gray-50/50">
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold">
                                                    OFF
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center bg-gray-50/50">
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold">
                                                    OFF
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
