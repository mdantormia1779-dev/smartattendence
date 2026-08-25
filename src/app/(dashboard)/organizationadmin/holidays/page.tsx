"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
    Loader2,
    RefreshCw,
    AlertTriangle,
    Clock,
    Search
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
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete modal
    const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        name: "",
        type: "Government Holiday" as Holiday["type"],
        startDate: "",
        endDate: "",
        description: "",
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const res = await api.holidays.getAll();
            if (res.success && Array.isArray(res.data)) {
                const todayStr = new Date().toISOString().split("T")[0];
                const mapped: Holiday[] = res.data.map((h: any) => {
                    let formattedType: Holiday["type"] = "Government Holiday";
                    const upperType = (h.type || "").toUpperCase();
                    if (upperType.includes("FESTIVAL")) formattedType = "Festival Holiday";
                    else if (upperType.includes("COMPANY")) formattedType = "Company Holiday";
                    else if (upperType.includes("WEEKLY")) formattedType = "Weekly Holiday";

                    const start = h.date || h.startDate || todayStr;
                    const isPast = start < todayStr;

                    return {
                        id: h.id,
                        name: h.name,
                        type: formattedType,
                        startDate: start,
                        endDate: h.endDate || start,
                        totalDays: Number(h.totalDays || h.daysCount || 1),
                        description: h.description || `${h.name} observation`,
                        applicableBranches: h.applicableBranches || "All Branches",
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
        if (!loading && containerRef.current) {
            const cards = containerRef.current.querySelectorAll(".holiday-card");
            if (cards.length > 0) {
                const ctx = gsap.context(() => {
                    gsap.fromTo(
                        cards,
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
                    );
                }, containerRef);
                return () => ctx.revert();
            }
        }
    }, [holidays, selectedType, searchQuery, loading]);

    const handleOpenCreateModal = () => {
        setEditingHoliday(null);
        setFormError(null);
        const today = new Date().toISOString().split("T")[0];
        setFormData({
            name: "",
            type: "Government Holiday",
            startDate: today,
            endDate: today,
            description: "",
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (hol: Holiday) => {
        setEditingHoliday(hol);
        setFormError(null);
        setFormData({
            name: hol.name,
            type: hol.type,
            startDate: hol.startDate,
            endDate: hol.endDate,
            description: hol.description,
        });
        setIsModalOpen(true);
    };

    const handleSaveHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        try {
            setIsSaving(true);
            let apiType = "GOVERNMENT";
            if (formData.type === "Festival Holiday") apiType = "FESTIVAL";
            else if (formData.type === "Company Holiday") apiType = "COMPANY";
            else if (formData.type === "Weekly Holiday") apiType = "WEEKLY";

            if (editingHoliday) {
                await api.holidays.update(editingHoliday.id, {
                    name: formData.name.trim(),
                    date: formData.startDate,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    type: apiType,
                    description: formData.description.trim(),
                });
            } else {
                await api.holidays.create({
                    name: formData.name.trim(),
                    date: formData.startDate,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    type: apiType,
                    description: formData.description.trim(),
                });
            }
            await fetchHolidays();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Failed to save holiday", err);
            setFormError(err?.message || "Failed to save holiday");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingHoliday) return;
        try {
            setIsDeleting(true);
            await api.holidays.delete(deletingHoliday.id);
            await fetchHolidays();
            setDeletingHoliday(null);
        } catch (e) {
            console.error("Failed to delete holiday", e);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredHolidays = useMemo(() => {
        return holidays.filter((h) => {
            const matchesType = selectedType === "All" || h.type === selectedType;
            const matchesSearch = 
                h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [holidays, selectedType, searchQuery]);

    const upcomingCount = useMemo(() => holidays.filter((h) => h.status === "Upcoming").length, [holidays]);
    const totalDaysCount = useMemo(() => holidays.reduce((acc, curr) => acc + curr.totalDays, 0), [holidays]);

    const getHolidayIcon = (type: Holiday["type"]) => {
        switch (type) {
            case "Government Holiday": return <Landmark className="w-5 h-5 text-indigo-600" />;
            case "Festival Holiday": return <PartyPopper className="w-5 h-5 text-pink-600" />;
            case "Company Holiday": return <Building2 className="w-5 h-5 text-emerald-600" />;
            case "Weekly Holiday": return <Sun className="w-5 h-5 text-amber-600" />;
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <Calendar className="w-6 h-6 text-[#00B050]" />
                        Holiday Calendar & Management
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Configure official government, company festival & public holiday calendar
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchHolidays}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Refresh holidays"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Holiday
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Upcoming Holidays</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-extrabold text-emerald-600">{upcomingCount} Events</h3>
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-100">Scheduled</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Calendar Holidays</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-extrabold text-stone-900">{totalDaysCount} Days</h3>
                        <span className="text-xs text-stone-400 font-semibold">Excluding standard weekends</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Weekly Off Days</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-extrabold text-indigo-600">Fri & Sat</h3>
                        <span className="text-xs text-stone-400 font-semibold">Standard Policy</span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search holiday name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    {["All", "Government Holiday", "Festival Holiday", "Company Holiday"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                                selectedType === type
                                    ? "bg-[#00B050] text-white shadow-xs shadow-[#00B050]/20"
                                    : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Holidays Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-stone-400 bg-white rounded-3xl border border-stone-200/80">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span className="text-xs font-semibold">Loading holiday calendar from database...</span>
                </div>
            ) : filteredHolidays.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl border border-stone-200/80 text-center text-stone-400 space-y-2">
                    <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-1" />
                    <p className="font-bold text-stone-800 text-sm">No holidays found</p>
                    <p className="text-xs text-stone-400">There are no holidays matching the current filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHolidays.map((holiday) => (
                        <div key={holiday.id} className="holiday-card bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-stone-50 flex items-center justify-center border border-stone-200/70">
                                            {getHolidayIcon(holiday.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 text-sm leading-tight">{holiday.name}</h3>
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00B050] border border-emerald-100 inline-block mt-1">
                                                {holiday.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEditModal(holiday)}
                                            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                                            title="Edit Holiday"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingHoliday(holiday)}
                                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                                            title="Delete Holiday"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 bg-stone-50/80 p-3.5 rounded-2xl space-y-2 text-xs border border-stone-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Date</span>
                                        <span className="font-extrabold text-stone-800">{holiday.startDate} {holiday.startDate !== holiday.endDate && `to ${holiday.endDate}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Duration</span>
                                        <span className="font-extrabold text-[#00B050] bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] border border-emerald-100">
                                            {holiday.totalDays} {holiday.totalDays === 1 ? "Day" : "Days"}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500 pt-1.5 border-t border-stone-200/60 leading-relaxed font-medium">
                                        {holiday.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                                <span className="text-stone-400 text-[11px] font-medium">{holiday.applicableBranches}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    holiday.status === "Upcoming" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-stone-500 border border-stone-200"
                                }`}>
                                    {holiday.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Holiday Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-4 border border-stone-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="font-bold text-stone-900 text-base">
                                {editingHoliday ? "Edit Holiday Event" : "Add Public Holiday"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSaveHoliday} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Holiday Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Eid-ul-Fitr Celebration"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Holiday Category *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Holiday["type"] })}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                                >
                                    <option value="Government Holiday">Government Holiday</option>
                                    <option value="Festival Holiday">Festival Holiday</option>
                                    <option value="Company Holiday">Company Holiday</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Description (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief holiday details"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSaving}
                                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2.5 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                                >
                                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Save Holiday
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deletingHoliday && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-stone-100 animate-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-stone-900">Remove Holiday?</h3>
                            <p className="text-xs text-stone-500">
                                Are you sure you want to remove <span className="font-bold text-stone-900">{deletingHoliday.name}</span> ({deletingHoliday.startDate}) from the holiday calendar?
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingHoliday(null)}
                                disabled={isDeleting}
                                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
