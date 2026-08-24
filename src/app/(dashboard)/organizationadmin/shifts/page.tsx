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
    X,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

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

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
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

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const res = await api.shifts.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: Shift[] = res.data.map((s: any) => {
                    let formattedType: Shift["type"] = "Morning";
                    if (s.type === "EVENING") formattedType = "Evening";
                    else if (s.type === "NIGHT") formattedType = "Night";
                    else if (s.type === "FLEXIBLE") formattedType = "Flexible";
                    else if (s.type === "ROTATIONAL") formattedType = "Rotational";

                    return {
                        id: s.id,
                        name: s.name,
                        type: formattedType,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        breakMinutes: s.breakMinutes || 60,
                        graceMinutes: s.graceMinutes || 15,
                        overtimeThresholdHours: s.overtimeThresholdHours || 8,
                        activeEmployees: s.activeEmployees || 0,
                        days: s.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
                        status: s.status === "INACTIVE" ? "Inactive" : "Active",
                    };
                });
                setShifts(mapped);
            }
        } catch (e) {
            console.error("Failed to load shifts", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".shift-card",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [shifts, selectedTypeFilter, loading]);

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

    const handleSaveShift = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingShift) {
                await api.shifts.update(editingShift.id, {
                    name: formData.name,
                    type: formData.type.toUpperCase(),
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    breakMinutes: formData.breakMinutes,
                    graceMinutes: formData.graceMinutes,
                    overtimeThresholdHours: formData.overtimeThresholdHours,
                    status: formData.status.toUpperCase(),
                });
            } else {
                await api.shifts.create({
                    name: formData.name,
                    type: formData.type.toUpperCase(),
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    breakMinutes: formData.breakMinutes,
                    graceMinutes: formData.graceMinutes,
                    overtimeThresholdHours: formData.overtimeThresholdHours,
                    status: formData.status.toUpperCase(),
                });
            }
            await fetchShifts();
            setIsModalOpen(false);
        } catch (e) {
            console.error("Failed to save shift", e);
        }
    };

    const handleDeleteShift = async (id: string) => {
        if (confirm("Are you sure you want to delete this shift?")) {
            try {
                await api.shifts.delete(id);
                await fetchShifts();
            } catch (e) {
                console.error("Failed to delete shift", e);
            }
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
                        <span className="text-xs text-gray-500">Across active branches</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Grace Period</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">15 Mins</h3>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Late threshold</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Break Time</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">60 Mins</h3>
                        <span className="text-xs text-gray-500">Auto-deducted</span>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {["All", "Morning", "Evening", "Night", "Flexible", "Rotational"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedTypeFilter(type)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                                selectedTypeFilter === type
                                    ? "bg-[#00B050] text-white shadow-xs shadow-[#00B050]/20"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {type} Shifts
                        </button>
                    ))}
                </div>
            </div>

            {/* Shifts Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span>Loading company shifts...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShifts.map((shift) => (
                        <div key={shift.id} className="shift-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                            {getShiftIcon(shift.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{shift.name}</h3>
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00B050] uppercase">
                                                {shift.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEditModal(shift)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                            title="Edit Shift"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteShift(shift.id)}
                                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Delete Shift"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                                    <div className="bg-gray-50/75 p-2.5 rounded-xl">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase">Working Hours</p>
                                        <p className="font-extrabold text-gray-800 mt-0.5">{shift.startTime} - {shift.endTime}</p>
                                    </div>
                                    <div className="bg-gray-50/75 p-2.5 rounded-xl">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase">Grace Period</p>
                                        <p className="font-extrabold text-gray-800 mt-0.5">{shift.graceMinutes} Mins</p>
                                    </div>
                                    <div className="bg-gray-50/75 p-2.5 rounded-xl">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase">Meal Break</p>
                                        <p className="font-extrabold text-gray-800 mt-0.5">{shift.breakMinutes} Mins</p>
                                    </div>
                                    <div className="bg-gray-50/75 p-2.5 rounded-xl">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase">OT Trigger</p>
                                        <p className="font-extrabold text-gray-800 mt-0.5">{shift.overtimeThresholdHours} Hours</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-gray-500 font-semibold">
                                    <Users className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{shift.activeEmployees} Assigned</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    shift.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                                }`}>
                                    {shift.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Shift Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">
                                {editingShift ? "Edit Shift Configuration" : "Create New Shift Schedule"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveShift} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Shift Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Regular Morning Shift"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Shift Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Shift["type"] })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    >
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Night">Night</option>
                                        <option value="Flexible">Flexible</option>
                                        <option value="Rotational">Rotational</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Shift["status"] })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="09:00 AM"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="05:00 PM"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Grace Period (Mins)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.graceMinutes}
                                        onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Break Time (Mins)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.breakMinutes}
                                        onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                                >
                                    Save Shift
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
