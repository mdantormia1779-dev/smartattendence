"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Calendar, 
    Plus, 
    Trash2, 
    Edit2, 
    Sparkles, 
    Building2, 
    PartyPopper, 
    Landmark, 
    Sun, 
    X,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

interface Holiday {
    id: string;
    name: string;
    type: "Government Holiday" | "Festival Holiday" | "Company Holiday" | "Weekly Holiday";
    startDate: string;
    endDate: string;
    totalDays: number;
    description: string;
    applicableBranches: string;
    status: "Upcoming" | "Completed";
}

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: "",
        type: "Government Holiday" as Holiday["type"],
        startDate: "",
        endDate: "",
        totalDays: 1,
        description: "",
        applicableBranches: "All Branches",
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const res = await api.holidays.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: Holiday[] = res.data.map((h: any) => {
                    let formattedType: Holiday["type"] = "Government Holiday";
                    if (h.type === "FESTIVAL") formattedType = "Festival Holiday";
                    else if (h.type === "COMPANY") formattedType = "Company Holiday";
                    else if (h.type === "WEEKLY") formattedType = "Weekly Holiday";

                    const isPast = new Date(h.date || h.startDate) < new Date();

                    return {
                        id: h.id,
                        name: h.name,
                        type: formattedType,
                        startDate: h.date || h.startDate,
                        endDate: h.endDate || h.date || h.startDate,
                        totalDays: h.daysCount || 1,
                        description: h.description || "Public holiday observation",
                        applicableBranches: h.branchName || "All Branches",
                        status: isPast ? "Completed" : "Upcoming",
                    };
                });
                setHolidays(mapped);
            }
        } catch (e) {
            console.error("Failed to load holidays", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".holiday-card",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [holidays, selectedType, loading]);

    const handleOpenCreateModal = () => {
        setEditingHoliday(null);
        setFormData({
            name: "",
            type: "Government Holiday",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            totalDays: 1,
            description: "",
            applicableBranches: "All Branches",
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (hol: Holiday) => {
        setEditingHoliday(hol);
        setFormData({
            name: hol.name,
            type: hol.type,
            startDate: hol.startDate,
            endDate: hol.endDate,
            totalDays: hol.totalDays,
            description: hol.description,
            applicableBranches: hol.applicableBranches,
        });
        setIsModalOpen(true);
    };

    const handleSaveHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingHoliday) {
                await api.holidays.update(editingHoliday.id, {
                    name: formData.name,
                    date: formData.startDate,
                    type: formData.type.toUpperCase().replace(" HOLIDAY", ""),
                    description: formData.description,
                });
            } else {
                await api.holidays.create({
                    name: formData.name,
                    date: formData.startDate,
                    type: formData.type.toUpperCase().replace(" HOLIDAY", ""),
                    description: formData.description,
                });
            }
            await fetchHolidays();
            setIsModalOpen(false);
        } catch (e) {
            console.error("Failed to save holiday", e);
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        if (confirm("Are you sure you want to remove this holiday?")) {
            try {
                await api.holidays.delete(id);
                await fetchHolidays();
            } catch (e) {
                console.error("Failed to delete holiday", e);
            }
        }
    };

    const filteredHolidays = holidays.filter(h => 
        selectedType === "All" || h.type === selectedType
    );

    const upcomingCount = holidays.filter(h => h.status === "Upcoming").length;
    const totalDaysCount = holidays.reduce((acc, curr) => acc + curr.totalDays, 0);

    const getHolidayIcon = (type: Holiday["type"]) => {
        switch (type) {
            case "Government Holiday": return <Landmark className="w-5 h-5 text-indigo-600" />;
            case "Festival Holiday": return <PartyPopper className="w-5 h-5 text-pink-600" />;
            case "Company Holiday": return <Building2 className="w-5 h-5 text-emerald-600" />;
            case "Weekly Holiday": return <Sun className="w-5 h-5 text-amber-600" />;
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-[#00B050]" />
                        Holiday Calendar & Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Configure official government, company festival & weekly public holidays
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Add Holiday
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Upcoming Holidays</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-emerald-600">{upcomingCount} Events</h3>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">Scheduled</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Holiday Days (2026)</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">{totalDaysCount} Days</h3>
                        <span className="text-xs text-gray-500">Excluding weekends</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Weekly Off Days</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-indigo-600">Fri & Sat</h3>
                        <span className="text-xs text-gray-400">Standard Policy</span>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {["All", "Government Holiday", "Festival Holiday", "Company Holiday"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                                selectedType === type
                                    ? "bg-[#00B050] text-white shadow-xs shadow-[#00B050]/20"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Holidays Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span>Loading holiday calendar...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHolidays.map((holiday) => (
                        <div key={holiday.id} className="holiday-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                            {getHolidayIcon(holiday.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{holiday.name}</h3>
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00B050]">
                                                {holiday.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEditModal(holiday)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                            title="Edit Holiday"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHoliday(holiday.id)}
                                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Delete Holiday"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 bg-gray-50/75 p-3 rounded-xl space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase">Dates</span>
                                        <span className="font-bold text-gray-800">{holiday.startDate} {holiday.startDate !== holiday.endDate && `to ${holiday.endDate}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase">Total Days</span>
                                        <span className="font-extrabold text-[#00B050] bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                                            {holiday.totalDays} {holiday.totalDays === 1 ? "Day" : "Days"}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                                        {holiday.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                <span className="text-gray-400 text-[11px] font-medium">{holiday.applicableBranches}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    holiday.status === "Upcoming" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                                }`}>
                                    {holiday.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Holiday Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">
                                {editingHoliday ? "Edit Holiday Event" : "Add Public Holiday"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveHoliday} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Holiday Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Eid-ul-Fitr Celebration"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Holiday Category</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Holiday["type"] })}
                                    className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                >
                                    <option value="Government Holiday">Government Holiday</option>
                                    <option value="Festival Holiday">Festival Holiday</option>
                                    <option value="Company Holiday">Company Holiday</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief holiday details"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                                />
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
                                    Save Holiday
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
