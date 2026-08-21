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
    CheckCircle2
} from "lucide-react";

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

const initialHolidays: Holiday[] = [
    {
        id: "hol-1",
        name: "Eid-ul-Adha Celebration",
        type: "Festival Holiday",
        startDate: "2026-06-16",
        endDate: "2026-06-20",
        totalDays: 5,
        description: "Official religious festival holidays declared by government.",
        applicableBranches: "All Branches",
        status: "Completed",
    },
    {
        id: "hol-2",
        name: "National Mourning Day",
        type: "Government Holiday",
        startDate: "2026-08-15",
        endDate: "2026-08-15",
        totalDays: 1,
        description: "National public holiday commemorating Father of the Nation.",
        applicableBranches: "All Branches",
        status: "Completed",
    },
    {
        id: "hol-3",
        name: "Janmashtami",
        type: "Government Holiday",
        startDate: "2026-09-04",
        endDate: "2026-09-04",
        totalDays: 1,
        description: "Official public holiday celebration.",
        applicableBranches: "All Branches",
        status: "Upcoming",
    },
    {
        id: "hol-4",
        name: "Durga Puja (Bijoya Dashami)",
        type: "Festival Holiday",
        startDate: "2026-10-20",
        endDate: "2026-10-21",
        totalDays: 2,
        description: "Major autumn festival celebrations.",
        applicableBranches: "All Branches",
        status: "Upcoming",
    },
    {
        id: "hol-5",
        name: "Vertex Annual Foundation Day",
        type: "Company Holiday",
        startDate: "2026-11-12",
        endDate: "2026-11-12",
        totalDays: 1,
        description: "Company special anniversary celebration & corporate retreat.",
        applicableBranches: "Head Office – Dhaka, Gulshan Branch",
        status: "Upcoming",
    },
    {
        id: "hol-6",
        name: "Victory Day",
        type: "Government Holiday",
        startDate: "2026-12-16",
        endDate: "2026-12-16",
        totalDays: 1,
        description: "National Victory Day celebration of Bangladesh.",
        applicableBranches: "All Branches",
        status: "Upcoming",
    },
];

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
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

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".holiday-card",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [holidays, selectedType]);

    const handleOpenCreateModal = () => {
        setEditingHoliday(null);
        setFormData({
            name: "",
            type: "Government Holiday",
            startDate: "",
            endDate: "",
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

    const handleSaveHoliday = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingHoliday) {
            setHolidays(holidays.map(h => h.id === editingHoliday.id ? { ...h, ...formData } : h));
        } else {
            const newHoliday: Holiday = {
                id: `hol-${Date.now()}`,
                ...formData,
                status: "Upcoming",
            };
            setHolidays([...holidays, newHoliday]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteHoliday = (id: string) => {
        if (confirm("Are you sure you want to remove this holiday?")) {
            setHolidays(holidays.filter(h => h.id !== id));
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
                    <p className="text-xs font-semibold text-gray-500 uppercase">Weekly Offs</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-bold text-indigo-600">Friday & Saturday</h3>
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">Standard</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {["All", "Government Holiday", "Festival Holiday", "Company Holiday"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedType(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            selectedType === tab
                                ? "bg-[#00B050] text-white shadow-sm"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {tab} {tab !== "All" && `(${holidays.filter(h => h.type === tab).length})`}
                    </button>
                ))}
            </div>

            {/* Holiday Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHolidays.map((holiday) => (
                    <div
                        key={holiday.id}
                        className="holiday-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    {getHolidayIcon(holiday.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">{holiday.name}</h3>
                                    <span className="inline-block text-[11px] font-semibold text-gray-500">
                                        {holiday.type}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleOpenEditModal(holiday)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#00B050] transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Dates Box */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Date Range</p>
                                <p className="text-sm font-bold text-gray-800 mt-0.5">
                                    {holiday.startDate} {holiday.startDate !== holiday.endDate && `→ ${holiday.endDate}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                                    {holiday.totalDays} {holiday.totalDays === 1 ? "Day" : "Days"}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {holiday.description}
                        </p>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-gray-500 text-[11px] flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                {holiday.applicableBranches}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                holiday.status === "Upcoming" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                            }`}>
                                {holiday.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveHoliday} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Holiday Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Independence Day"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Holiday Category</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Holiday["type"] })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Government Holiday">Government Holiday</option>
                                        <option value="Festival Holiday">Festival Holiday</option>
                                        <option value="Company Holiday">Company Holiday</option>
                                        <option value="Weekly Holiday">Weekly Holiday</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Applicable Branches</label>
                                    <input
                                        type="text"
                                        value={formData.applicableBranches}
                                        onChange={(e) => setFormData({ ...formData, applicableBranches: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.endDate || e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Total Days</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={formData.totalDays}
                                        onChange={(e) => setFormData({ ...formData, totalDays: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Note</label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief note about the holiday..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
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
                                    {editingHoliday ? "Update Holiday" : "Save Holiday"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
