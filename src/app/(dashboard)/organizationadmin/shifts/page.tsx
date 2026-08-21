"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Clock, 
    Plus, 
    Users, 
    Moon, 
    Sun, 
    Sunset, 
    RotateCcw, 
    Sparkles, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    X 
} from "lucide-react";

interface Shift {
    id: string;
    name: string;
    type: "Morning" | "Evening" | "Night" | "Flexible" | "Rotational";
    startTime: string;
    endTime: string;
    breakMinutes: number;
    graceMinutes: number;
    overtimeThresholdHours: number;
    activeEmployees: number;
    days: string[];
    status: "Active" | "Inactive";
}

const initialShifts: Shift[] = [
    {
        id: "shift-1",
        name: "Regular Morning Shift",
        type: "Morning",
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        breakMinutes: 60,
        graceMinutes: 15,
        overtimeThresholdHours: 8,
        activeEmployees: 114,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        status: "Active",
    },
    {
        id: "shift-2",
        name: "Afternoon / Evening Shift",
        type: "Evening",
        startTime: "02:00 PM",
        endTime: "10:00 PM",
        breakMinutes: 45,
        graceMinutes: 15,
        overtimeThresholdHours: 8,
        activeEmployees: 48,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        status: "Active",
    },
    {
        id: "shift-3",
        name: "Overnight Support Shift",
        type: "Night",
        startTime: "10:00 PM",
        endTime: "06:00 AM",
        breakMinutes: 60,
        graceMinutes: 10,
        overtimeThresholdHours: 8,
        activeEmployees: 22,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        status: "Active",
    },
    {
        id: "shift-4",
        name: "Flexible Core Hours",
        type: "Flexible",
        startTime: "10:00 AM",
        endTime: "07:00 PM",
        breakMinutes: 60,
        graceMinutes: 30,
        overtimeThresholdHours: 8,
        activeEmployees: 35,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        status: "Active",
    },
    {
        id: "shift-5",
        name: "Rotational Plant Crew",
        type: "Rotational",
        startTime: "06:00 AM",
        endTime: "02:00 PM",
        breakMinutes: 45,
        graceMinutes: 10,
        overtimeThresholdHours: 8,
        activeEmployees: 36,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        status: "Active",
    },
];

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        type: "Morning" as Shift["type"],
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        breakMinutes: 60,
        graceMinutes: 15,
        overtimeThresholdHours: 8,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        status: "Active" as Shift["status"],
    });

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".shift-card",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [shifts, selectedTypeFilter]);

    const handleOpenCreateModal = () => {
        setEditingShift(null);
        setFormData({
            name: "",
            type: "Morning",
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            breakMinutes: 60,
            graceMinutes: 15,
            overtimeThresholdHours: 8,
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            status: "Active",
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (shift: Shift) => {
        setEditingShift(shift);
        setFormData({
            name: shift.name,
            type: shift.type,
            startTime: shift.startTime,
            endTime: shift.endTime,
            breakMinutes: shift.breakMinutes,
            graceMinutes: shift.graceMinutes,
            overtimeThresholdHours: shift.overtimeThresholdHours,
            days: shift.days,
            status: shift.status,
        });
        setIsModalOpen(true);
    };

    const handleSaveShift = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingShift) {
            setShifts(shifts.map(s => s.id === editingShift.id ? { ...s, ...formData } : s));
        } else {
            const newShift: Shift = {
                id: `shift-${Date.now()}`,
                ...formData,
                activeEmployees: 0,
            };
            setShifts([newShift, ...shifts]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteShift = (id: string) => {
        if (confirm("Are you sure you want to delete this shift?")) {
            setShifts(shifts.filter(s => s.id !== id));
        }
    };

    const filteredShifts = shifts.filter(s => 
        selectedTypeFilter === "All" || s.type === selectedTypeFilter
    );

    const getShiftIcon = (type: Shift["type"]) => {
        switch (type) {
            case "Morning": return <Sun className="w-5 h-5 text-amber-500" />;
            case "Evening": return <Sunset className="w-5 h-5 text-orange-500" />;
            case "Night": return <Moon className="w-5 h-5 text-indigo-500" />;
            case "Flexible": return <Sparkles className="w-5 h-5 text-emerald-500" />;
            case "Rotational": return <RotateCcw className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Clock className="w-6 h-6 text-[#00B050]" />
                        Shift Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Configure regular, evening, night, flexible and rotational schedules with grace periods & OT triggers
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Create New Shift
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Shifts</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">{shifts.length}</h3>
                        <span className="text-xs font-bold text-[#00B050] bg-emerald-50 px-2 py-0.5 rounded-md">Configured</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Employees</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {shifts.reduce((acc, curr) => acc + curr.activeEmployees, 0)}
                        </h3>
                        <span className="text-xs text-gray-500">Across 3 branches</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Grace Period</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-amber-600">15 Mins</h3>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Late threshold</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">OT Trigger Basis</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-indigo-600">&gt; 8.0 Hrs</h3>
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Auto calculated</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {["All", "Morning", "Evening", "Night", "Flexible", "Rotational"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedTypeFilter(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            selectedTypeFilter === type
                                ? "bg-[#00B050] text-white shadow-sm"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {type} {type !== "All" && `(${shifts.filter(s => s.type === type).length})`}
                    </button>
                ))}
            </div>

            {/* Shifts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShifts.map((shift) => (
                    <div
                        key={shift.id}
                        className="shift-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                    {getShiftIcon(shift.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">{shift.name}</h3>
                                    <span className="inline-block text-[11px] font-semibold text-gray-500">
                                        {shift.type} Shift
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-90">
                                <button
                                    onClick={() => handleOpenEditModal(shift)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#00B050] transition-colors cursor-pointer"
                                    title="Edit Shift"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteShift(shift.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Delete Shift"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Shift Times */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Working Hours</p>
                                <p className="text-sm font-bold text-gray-800 mt-0.5">
                                    {shift.startTime} – {shift.endTime}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Break</p>
                                <p className="text-sm font-semibold text-gray-700 mt-0.5">{shift.breakMinutes} mins</p>
                            </div>
                        </div>

                        {/* Working Days Badges */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Active Working Days</p>
                            <div className="flex flex-wrap gap-1.5">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                                    const isDayActive = shift.days.includes(d);
                                    return (
                                        <span
                                            key={d}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                isDayActive
                                                    ? "bg-[#00B050]/10 text-[#00B050] border border-[#00B050]/20"
                                                    : "bg-gray-100 text-gray-400"
                                            }`}
                                        >
                                            {d}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rules Summary */}
                        <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                                <span className="text-gray-400">Grace:</span>{" "}
                                <span className="font-semibold text-amber-600">{shift.graceMinutes}m</span>
                            </div>
                            <div>
                                <span className="text-gray-400">OT Threshold:</span>{" "}
                                <span className="font-semibold text-indigo-600">{shift.overtimeThresholdHours}h</span>
                            </div>
                        </div>

                        {/* Bottom Active Staff Footer */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                <Users className="w-4 h-4 text-gray-400" />
                                {shift.activeEmployees} Employees assigned
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                shift.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                            }`}>
                                {shift.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add / Edit Shift Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingShift ? "Edit Shift Configuration" : "Create New Shift"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveShift} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Shift Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Regular Morning Shift"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Shift Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Shift["type"] })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Morning">Morning Shift</option>
                                        <option value="Evening">Evening Shift</option>
                                        <option value="Night">Night Shift</option>
                                        <option value="Flexible">Flexible Shift</option>
                                        <option value="Rotational">Rotational Shift</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Shift Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Shift["status"] })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="09:00 AM"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="05:00 PM"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Break (Mins)</label>
                                    <input
                                        type="number"
                                        value={formData.breakMinutes}
                                        onChange={(e) => setFormData({ ...formData, breakMinutes: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Grace Period (Mins)</label>
                                    <input
                                        type="number"
                                        value={formData.graceMinutes}
                                        onChange={(e) => setFormData({ ...formData, graceMinutes: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">OT Threshold (Hrs)</label>
                                    <input
                                        type="number"
                                        value={formData.overtimeThresholdHours}
                                        onChange={(e) => setFormData({ ...formData, overtimeThresholdHours: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Working Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                                        const isChecked = formData.days.includes(day);
                                        return (
                                            <button
                                                type="button"
                                                key={day}
                                                onClick={() => {
                                                    if (isChecked) {
                                                        setFormData({ ...formData, days: formData.days.filter(d => d !== day) });
                                                    } else {
                                                        setFormData({ ...formData, days: [...formData.days, day] });
                                                    }
                                                }}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                                                    isChecked
                                                        ? "bg-[#00B050] text-white border-[#00B050]"
                                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-[#00B050] hover:bg-[#009b46] text-white text-sm font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
                                >
                                    {editingShift ? "Update Shift" : "Create Shift"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
