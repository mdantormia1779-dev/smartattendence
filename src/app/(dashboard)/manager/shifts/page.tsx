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
    Loader2,
    RefreshCw,
    X,
    Edit3,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Users
} from "lucide-react";
import { api } from "@/lib/api-client";

interface ShiftModel {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    workDays?: string[];
}

interface TeamShiftSchedule {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string | null;
    designation: string;
    department: string;
    branch: string;
    currentShiftId: string;
    currentShiftName: string;
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
    const [shiftsList, setShiftsList] = useState<ShiftModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedShiftFilter, setSelectedShiftFilter] = useState("ALL");
    const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, -1 = prev week

    // Reassign Shift Modal
    const [selectedEmployee, setSelectedEmployee] = useState<TeamShiftSchedule | null>(null);
    const [newShiftId, setNewShiftId] = useState("");
    const [savingAssignment, setSavingAssignment] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate dates for the week
    const getWeekDates = (offset = 0) => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        
        const monday = new Date(now);
        monday.setDate(now.getDate() + distanceToMonday + offset * 7);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push({
                dayName: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
                dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                fullDate: d.toISOString().split("T")[0],
                isWeekend: i >= 5,
            });
        }
        return days;
    };

    const weekDays = getWeekDates(weekOffset);
    const weekLabel = `${weekDays[0].dateStr} – ${weekDays[6].dateStr}, ${new Date().getFullYear()}`;

    const fetchRoster = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const [empRes, shiftRes] = await Promise.allSettled([
                api.employees.getAll(),
                api.shifts.getAll(),
            ]);

            let shifts: ShiftModel[] = [];
            if (shiftRes.status === "fulfilled" && shiftRes.value?.success && Array.isArray(shiftRes.value.data)) {
                shifts = shiftRes.value.data.map((s: any) => ({
                    id: s.id,
                    name: s.name || s.title || "Standard Shift",
                    startTime: s.startTime || "09:00",
                    endTime: s.endTime || "17:00",
                    workDays: s.workDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
                }));
            }
            setShiftsList(shifts);

            let rawEmployees: any[] = [];
            if (empRes.status === "fulfilled" && empRes.value?.success) {
                if (Array.isArray(empRes.value.data)) {
                    rawEmployees = empRes.value.data;
                } else if (empRes.value.data && Array.isArray(empRes.value.data.items)) {
                    rawEmployees = empRes.value.data.items;
                } else if (Array.isArray((empRes.value as any).items)) {
                    rawEmployees = (empRes.value as any).items;
                }
            }

            if (rawEmployees.length > 0) {
                const defaultShift = shifts[0] || {
                    id: "default-1",
                    name: "Regular Morning",
                    startTime: "09:00",
                    endTime: "17:00",
                };

                const mapped: TeamShiftSchedule[] = rawEmployees.map((emp: any, idx: number) => {
                    const empFullName = emp.fullName || emp.name || `Staff Member #${idx + 1}`;
                    const empCode = emp.employeeCode || emp.code || emp.id || `EMP-${1000 + idx}`;

                    // Find matched shift
                    const assignedShift = shifts.find(
                        (s) => s.id === emp.shiftId || (emp.shift?.name && s.name === emp.shift.name) || s.name === emp.shiftName
                    ) || defaultShift;

                    const shiftTiming = `${assignedShift.startTime.substring(0, 5)}-${assignedShift.endTime.substring(0, 5)}`;
                    const shiftDisplay = `${assignedShift.name} (${shiftTiming})`;

                    return {
                        id: emp.id || `emp-${idx}`,
                        employeeName: empFullName,
                        employeeId: empCode,
                        avatar: emp.profilePicture || emp.avatarUrl || emp.avatar || null,
                        designation: emp.designation || emp.role || "Team Staff",
                        department: emp.departments?.name || emp.department?.name || emp.department || "Operations",
                        branch: emp.branches?.name || emp.branch?.name || emp.branch || "Main Branch",
                        currentShiftId: assignedShift.id,
                        currentShiftName: assignedShift.name,
                        mon: shiftDisplay,
                        tue: shiftDisplay,
                        wed: shiftDisplay,
                        thu: shiftDisplay,
                        fri: shiftDisplay,
                        sat: "OFF",
                        sun: "OFF",
                    };
                });

                setSchedules(mapped);
            } else {
                setSchedules([]);
            }
        } catch (e) {
            console.error("Failed to load manager shift roster:", e);
            setSchedules([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
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
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [schedules, loading, searchQuery, selectedShiftFilter]);

    const handleOpenAssignModal = (emp: TeamShiftSchedule) => {
        setSelectedEmployee(emp);
        setNewShiftId(emp.currentShiftId || (shiftsList[0]?.id ?? ""));
    };

    const handleSaveShiftAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !newShiftId) return;

        setSavingAssignment(true);
        try {
            await api.shifts.assign(newShiftId, [selectedEmployee.id]);
            const targetShift = shiftsList.find((s) => s.id === newShiftId);
            setSuccessMessage(`Shift for ${selectedEmployee.employeeName} updated to ${targetShift?.name || "New Shift"}!`);
            setTimeout(() => setSuccessMessage(null), 4000);
            await fetchRoster();
        } catch (e) {
            console.error("Failed to assign shift:", e);
        } finally {
            setSavingAssignment(false);
            setSelectedEmployee(null);
        }
    };

    const filteredSchedules = schedules.filter((s) => {
        const matchesSearch =
            s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.department.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesShift =
            selectedShiftFilter === "ALL" ||
            s.currentShiftName.toLowerCase() === selectedShiftFilter.toLowerCase();

        return matchesSearch && matchesShift;
    });

    const getInitials = (name: string) => {
        if (!name) return "EM";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen">
            {/* Success Toast */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B050]" />
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-[#00B050]" />
                        Team Shift Roaster & Roster Allocation
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Weekly shift distribution, rotational roster schedule & staff assignments
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Week Navigation */}
                    <div className="flex items-center gap-1.5 bg-neutral-50 p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
                        <button
                            onClick={() => setWeekOffset(weekOffset - 1)}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            title="Previous week"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-neutral-800">
                            {weekOffset === 0 ? `Current Week (${weekLabel})` : weekLabel}
                        </span>
                        <button
                            onClick={() => setWeekOffset(weekOffset + 1)}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            title="Next week"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        {weekOffset !== 0 && (
                            <button
                                onClick={() => setWeekOffset(0)}
                                className="px-2 py-1 text-[10px] font-bold text-[#00B050] hover:bg-emerald-50 rounded-lg cursor-pointer ml-1"
                            >
                                Today
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => fetchRoster(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh roster data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Shift Legends & Configured Shift Chips */}
            <div className="flex flex-wrap items-center gap-2.5 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs text-xs">
                <span className="font-bold text-neutral-700 mr-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00B050]" />
                    Configured Shifts:
                </span>

                {shiftsList.length === 0 ? (
                    <span className="text-neutral-400 text-xs">Regular Shift (09:00 AM - 05:00 PM)</span>
                ) : (
                    shiftsList.map((s, idx) => (
                        <span 
                            key={s.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold border ${
                                idx === 0 
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : idx === 1
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                                    : "bg-purple-50 text-purple-800 border-purple-200"
                            }`}
                        >
                            {idx === 0 ? <Sun className="w-3.5 h-3.5" /> : idx === 1 ? <Sunset className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                            <span>{s.name} ({s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)})</span>
                        </span>
                    ))
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 text-neutral-600 font-bold border border-neutral-200">
                    <span>Weekly Off-Day (Rest)</span>
                </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search team member by name, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9.5 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedShiftFilter}
                        onChange={(e) => setSelectedShiftFilter(e.target.value)}
                        className="px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer"
                    >
                        <option value="ALL">All Shifts ({schedules.length})</option>
                        {shiftsList.map((s) => (
                            <option key={s.id} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Roster Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-neutral-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00B050]" />
                        <span className="text-xs font-semibold">Loading team shift schedule...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    {weekDays.map((day) => (
                                        <th 
                                            key={day.dayName} 
                                            className={`px-3 py-4 text-center ${day.isWeekend ? "bg-neutral-100/60 text-neutral-400" : ""}`}
                                        >
                                            <div>{day.dayName}</div>
                                            <div className="text-[10px] font-normal text-neutral-400 lowercase">{day.dateStr}</div>
                                        </th>
                                    ))}
                                    <th className="px-4 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium">
                                {filteredSchedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-12 text-neutral-400">
                                            {searchQuery 
                                                ? `No team members matching "${searchQuery}".` 
                                                : "No team members currently registered for shift scheduling."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSchedules.map((item) => (
                                        <tr key={item.id} className="roster-row hover:bg-neutral-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {item.avatar ? (
                                                        <img
                                                            src={item.avatar}
                                                            alt={item.employeeName}
                                                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-200"
                                                            onError={(e: any) => {
                                                                e.target.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                                            {getInitials(item.employeeName)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-neutral-900 leading-tight">{item.employeeName}</p>
                                                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{item.employeeId} · {item.designation}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4 text-center">
                                                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50 block truncate max-w-[120px]" title={item.mon}>
                                                    {item.mon}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50 block truncate max-w-[120px]" title={item.tue}>
                                                    {item.tue}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50 block truncate max-w-[120px]" title={item.wed}>
                                                    {item.wed}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50 block truncate max-w-[120px]" title={item.thu}>
                                                    {item.thu}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50 block truncate max-w-[120px]" title={item.fri}>
                                                    {item.fri}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-center bg-neutral-50/60">
                                                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-bold">
                                                    OFF
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-center bg-neutral-50/60">
                                                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-bold">
                                                    OFF
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenAssignModal(item)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                                                    <span>Change Shift</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reassign Shift Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="font-bold text-neutral-900 text-base">Assign / Change Employee Shift</h3>
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveShiftAssignment} className="space-y-4">
                            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
                                <p className="text-[11px] text-neutral-500 font-medium">Employee</p>
                                <p className="text-xs font-bold text-neutral-900 mt-0.5">{selectedEmployee.employeeName} ({selectedEmployee.employeeId})</p>
                                <p className="text-[10px] text-neutral-400 font-mono">{selectedEmployee.designation} · {selectedEmployee.department}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Select New Roster Shift</label>
                                <div className="space-y-2">
                                    {shiftsList.map((shift) => (
                                        <label
                                            key={shift.id}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                                newShiftId === shift.id
                                                    ? "bg-[#00B050]/10 border-[#00B050] text-neutral-900 shadow-2xs"
                                                    : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="selectedShift"
                                                    value={shift.id}
                                                    checked={newShiftId === shift.id}
                                                    onChange={(e) => setNewShiftId(e.target.value)}
                                                    className="text-[#00B050] focus:ring-[#00B050]"
                                                />
                                                <div>
                                                    <p className="text-xs font-bold">{shift.name}</p>
                                                    <p className="text-[11px] text-neutral-500 font-mono">
                                                        {shift.startTime?.substring(0, 5)} - {shift.endTime?.substring(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                                                Mon-Fri
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEmployee(null)}
                                    disabled={savingAssignment}
                                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingAssignment || !newShiftId}
                                    className="px-4 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {savingAssignment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Confirm Shift</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
