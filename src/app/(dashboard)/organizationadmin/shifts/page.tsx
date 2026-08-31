"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
    Edit2, 
    Trash2, 
    Building2,
    Calendar,
    CheckCircle2, 
    AlertCircle, 
    X,
    Loader2,
    RefreshCw,
    Search,
    UserPlus,
    Check,
    ArrowRightLeft
} from "lucide-react";
import { api } from "@/lib/api-client";

interface Shift {
    id: string;
    organizationId: string;
    branchId?: string;
    branchName?: string;
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

interface Branch {
    id: string;
    name: string;
    code?: string;
}

interface EmployeeItem {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    branch: string;
    branchId?: string;
    shiftId?: string | null;
    shiftName?: string;
    image?: string;
}

const ALL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employees, setEmployees] = useState<EmployeeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
    
    // Filters
    const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("All");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");
    
    // Form & Action states
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successToast, setSuccessToast] = useState<string | null>(null);

    // Staff Assignment Modal State
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [activeShiftForStaff, setActiveShiftForStaff] = useState<Shift | null>(null);
    const [staffSearchQuery, setStaffSearchQuery] = useState("");
    const [staffBranchFilter, setStaffBranchFilter] = useState("All");
    const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
    const [isSavingStaff, setIsSavingStaff] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        branchId: "",
        type: "Morning" as Shift["type"],
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        breakMinutes: 60,
        graceMinutes: 15,
        overtimeThresholdHours: 8,
        days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
        status: "Active" as Shift["status"],
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const showToast = (msg: string) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(null), 4000);
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [shiftRes, branchRes, empRes] = await Promise.allSettled([
                api.shifts.getAll(),
                api.branches.getAll(),
                api.employees.getAll({ limit: 200 }),
            ]);

            if (branchRes.status === "fulfilled" && branchRes.value.success) {
                const bVal = branchRes.value as any;
                const bData = bVal.data?.data || bVal.data || (Array.isArray(bVal.data) ? bVal.data : []);
                setBranches(Array.isArray(bData) ? bData : []);
            }

            if (empRes.status === "fulfilled" && empRes.value.success) {
                const eVal = empRes.value as any;
                const rawEmpList = eVal.data?.items || eVal.items || (Array.isArray(eVal.data) ? eVal.data : []);
                if (Array.isArray(rawEmpList)) {
                    setEmployees(rawEmpList.map((e: any) => ({
                        id: e.id || e.userId,
                        employeeId: e.employeeId || e.employeeCode || `EMP-${(e.id || "").slice(-4)}`,
                        name: e.name || e.fullName || "Staff Member",
                        email: e.email || "",
                        designation: e.designation || "Employee",
                        department: e.department || e.departmentName || "General",
                        branch: e.branch || e.branchName || "Main Branch",
                        branchId: e.branchId,
                        shiftId: e.shiftId || null,
                        shiftName: e.shiftName || undefined,
                        image: e.image || e.profilePicture,
                    })));
                }
            }

            if (shiftRes.status === "fulfilled" && shiftRes.value.success) {
                const sVal = shiftRes.value as any;
                const sData = sVal.data || (Array.isArray(sVal.data) ? sVal.data : []);
                if (Array.isArray(sData)) {
                    const mapped: Shift[] = sData.map((s: any) => {
                        let formattedType: Shift["type"] = "Morning";
                        const upperType = (s.type || "").toUpperCase();
                        if (upperType === "EVENING") formattedType = "Evening";
                        else if (upperType === "NIGHT") formattedType = "Night";
                        else if (upperType === "FLEXIBLE") formattedType = "Flexible";
                        else if (upperType === "ROTATIONAL") formattedType = "Rotational";

                        return {
                            id: s.id,
                            organizationId: s.organizationId,
                            branchId: s.branchId,
                            branchName: s.branchName || (s.branches?.name) || "Main Branch",
                            name: s.name,
                            type: formattedType,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            breakMinutes: Number(s.breakMinutes) || 60,
                            graceMinutes: Number(s.graceMinutes) || 15,
                            overtimeThresholdHours: Number(s.overtimeThresholdHours) || 8,
                            activeEmployees: Number(s.activeEmployees) || 0,
                            days: Array.isArray(s.workingDays) ? s.workingDays : (Array.isArray(s.days) ? s.days : ["Sun", "Mon", "Tue", "Wed", "Thu"]),
                            status: s.status === "INACTIVE" || s.status === "Inactive" ? "Inactive" : "Active",
                        };
                    });
                    setShifts(mapped);
                }
            }
        } catch (e) {
            console.error("Failed to load shifts data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".shift-card",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [shifts, selectedTypeFilter, selectedBranchFilter, loading]);

    // Computed Real Metrics
    const totalAssignedEmployees = useMemo(() => {
        return shifts.reduce((acc, curr) => acc + (curr.activeEmployees || 0), 0);
    }, [shifts]);

    const averageGracePeriod = useMemo(() => {
        if (shifts.length === 0) return 0;
        return Math.round(shifts.reduce((acc, curr) => acc + (curr.graceMinutes || 0), 0) / shifts.length);
    }, [shifts]);

    const averageBreakTime = useMemo(() => {
        if (shifts.length === 0) return 0;
        return Math.round(shifts.reduce((acc, curr) => acc + (curr.breakMinutes || 0), 0) / shifts.length);
    }, [shifts]);

    const handleOpenCreateModal = () => {
        setError(null);
        setEditingShift(null);
        setFormData({
            name: "",
            branchId: selectedBranchFilter !== "All" ? selectedBranchFilter : (branches[0]?.id || ""),
            type: "Morning",
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            breakMinutes: 60,
            graceMinutes: 15,
            overtimeThresholdHours: 8,
            days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
            status: "Active",
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (shift: Shift) => {
        setError(null);
        setEditingShift(shift);
        setFormData({
            name: shift.name,
            branchId: shift.branchId || branches[0]?.id || "",
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

    const handleOpenStaffModal = async (shift: Shift) => {
        setActiveShiftForStaff(shift);
        setStaffSearchQuery("");
        setStaffBranchFilter("All");
        
        // Find staff currently assigned to this shift
        const preSelected = employees
            .filter((e) => e.shiftId === shift.id || (e.shiftName && e.shiftName === shift.name))
            .map((e) => e.id);

        setSelectedStaffIds(preSelected);
        setIsStaffModalOpen(true);
    };

    const toggleStaffSelection = (empId: string) => {
        setSelectedStaffIds((prev) => 
            prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
        );
    };

    const handleSaveStaffAssignments = async () => {
        if (!activeShiftForStaff) return;
        setIsSavingStaff(true);
        try {
            const res = await api.shifts.assign(activeShiftForStaff.id, selectedStaffIds);
            if (res.success) {
                showToast(`Shift updated for ${selectedStaffIds.length} employee(s) successfully!`);
                await fetchAllData();
                setIsStaffModalOpen(false);
            } else {
                alert((res as any).message || "Failed to update staff shift assignment.");
            }
        } catch (e: any) {
            console.error("Failed to assign shift to staff", e);
            alert(e?.message || "An error occurred while assigning employees.");
        } finally {
            setIsSavingStaff(false);
        }
    };

    const toggleDay = (day: string) => {
        setFormData((prev) => {
            const exists = prev.days.includes(day);
            if (exists) {
                if (prev.days.length === 1) return prev;
                return { ...prev, days: prev.days.filter((d) => d !== day) };
            } else {
                return { ...prev, days: [...prev.days, day] };
            }
        });
    };

    const handleSaveShift = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError("Please enter a valid shift name.");
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                name: formData.name.trim(),
                branchId: formData.branchId || undefined,
                type: formData.type.toUpperCase(),
                startTime: formData.startTime.trim(),
                endTime: formData.endTime.trim(),
                breakMinutes: Number(formData.breakMinutes) || 60,
                graceMinutes: Number(formData.graceMinutes) || 15,
                overtimeThresholdHours: Number(formData.overtimeThresholdHours) || 8,
                workingDays: formData.days,
                status: formData.status.toUpperCase(),
            };

            if (editingShift) {
                await api.shifts.update(editingShift.id, payload);
                showToast(`Shift "${formData.name}" updated successfully!`);
            } else {
                await api.shifts.create(payload);
                showToast(`New shift "${formData.name}" created successfully!`);
            }

            await fetchAllData();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Failed to save shift", err);
            setError(err?.message || "Failed to save shift in database");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await api.shifts.delete(deleteTarget.id);
            showToast(`Shift "${deleteTarget.name}" removed successfully.`);
            await fetchAllData();
            setDeleteTarget(null);
        } catch (e) {
            console.error("Failed to delete shift", e);
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter shifts by Type and Branch
    const filteredShifts = useMemo(() => {
        return shifts.filter((s) => {
            const matchesType = selectedTypeFilter === "All" || s.type === selectedTypeFilter;
            const matchesBranch = 
                selectedBranchFilter === "All" || 
                s.branchId === selectedBranchFilter ||
                (s.branchName && branches.find((b) => b.id === selectedBranchFilter)?.name === s.branchName);

            return matchesType && matchesBranch;
        });
    }, [shifts, selectedTypeFilter, selectedBranchFilter, branches]);

    // Filter employees in staff assignment modal
    const modalFilteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            const q = staffSearchQuery.toLowerCase();
            const matchesSearch = 
                emp.name.toLowerCase().includes(q) ||
                emp.employeeId.toLowerCase().includes(q) ||
                emp.designation.toLowerCase().includes(q) ||
                emp.department.toLowerCase().includes(q);

            const matchesBranch = 
                staffBranchFilter === "All" ||
                emp.branchId === staffBranchFilter ||
                emp.branch.toLowerCase() === staffBranchFilter.toLowerCase();

            return matchesSearch && matchesBranch;
        });
    }, [employees, staffSearchQuery, staffBranchFilter]);

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
        <div ref={containerRef} className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Toast Notification */}
            {successToast && (
                <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{successToast}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <Clock className="w-6 h-6 text-[#00B050]" />
                        Shift Schedule & Branch Roster
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Configure duty hours, grace periods, meal breaks, and assign staff to shifts across any branch location
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={fetchAllData}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Refresh shifts and staff roster"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Shift
                    </button>
                </div>
            </div>

            {/* Quick Metrics Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Active Shifts</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-extrabold text-stone-900">{shifts.length}</h3>
                        <span className="text-[10px] font-bold text-[#00B050] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Live Config</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Assigned Workforce</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-extrabold text-stone-900">{totalAssignedEmployees}</h3>
                        <span className="text-[10px] text-stone-500 font-medium">In workforce</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Avg Grace Period</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-extrabold text-stone-900">{averageGracePeriod} <span className="text-sm font-semibold text-stone-500">Mins</span></h3>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Late cutoff</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Avg Meal Break</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-2xl font-extrabold text-stone-900">{averageBreakTime} <span className="text-sm font-semibold text-stone-500">Mins</span></h3>
                        <span className="text-[10px] text-stone-500 font-medium">Auto-deducted</span>
                    </div>
                </div>
            </div>

            {/* Filter Control Bar (Branch Switcher & Shift Type Pills) */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Branch Dropdown Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5 whitespace-nowrap">
                        <Building2 className="w-3.5 h-3.5 text-stone-400" />
                        Branch:
                    </span>
                    <select
                        value={selectedBranchFilter}
                        onChange={(e) => setSelectedBranchFilter(e.target.value)}
                        className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 cursor-pointer"
                    >
                        <option value="All">All Branches ({shifts.length} shifts)</option>
                        {branches.map((b) => {
                            const count = shifts.filter((s) => s.branchId === b.id || s.branchName === b.name).length;
                            return (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({count} shifts)
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Shift Type Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {["All", "Morning", "Evening", "Night", "Flexible", "Rotational"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedTypeFilter(type)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                                selectedTypeFilter === type
                                    ? "bg-[#00B050] text-white shadow-xs shadow-[#00B050]/20"
                                    : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                            }`}
                        >
                            {type} Shifts
                        </button>
                    ))}
                </div>
            </div>

            {/* Shifts Cards Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-stone-400 bg-white rounded-3xl border border-stone-200/80">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span className="text-xs font-semibold">Loading shifts and rosters...</span>
                </div>
            ) : filteredShifts.length === 0 ? (
                <div className="p-16 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200/80 space-y-3">
                    <Clock className="w-10 h-10 text-stone-300 mx-auto mb-1" />
                    <p className="font-bold text-stone-800 text-sm">
                        {selectedBranchFilter !== "All" || selectedTypeFilter !== "All"
                            ? "No matching shifts found for this branch or filter"
                            : "No shifts configured yet"}
                    </p>
                    <p className="text-stone-400 max-w-sm mx-auto">
                        Click "Create New Shift" to configure duty hours, meal breaks, and grace periods for any branch.
                    </p>
                    <button 
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-xs hover:bg-[#009b46] transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Create Shift
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShifts.map((shift) => (
                        <div key={shift.id} className="shift-card bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-stone-50 flex items-center justify-center border border-stone-100 shadow-2xs">
                                            {getShiftIcon(shift.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 text-sm leading-tight">{shift.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-[#00B050] border border-emerald-100 uppercase tracking-wide">
                                                    {shift.type}
                                                </span>
                                                <span className="text-[10.5px] text-stone-600 bg-stone-100/80 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold truncate max-w-[150px]">
                                                    <Building2 className="w-3 h-3 text-stone-400" />
                                                    {shift.branchName || "Main Office"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEditModal(shift)}
                                            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                                            title="Edit Shift / Change Branch"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(shift)}
                                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Delete Shift"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs">
                                    <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-100">
                                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Working Hours</p>
                                        <p className="font-extrabold text-stone-800 mt-1">{shift.startTime} - {shift.endTime}</p>
                                    </div>
                                    <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-100">
                                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Grace Period</p>
                                        <p className="font-extrabold text-amber-700 mt-1">{shift.graceMinutes} Mins</p>
                                    </div>
                                    <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-100">
                                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Meal Break</p>
                                        <p className="font-extrabold text-stone-800 mt-1">{shift.breakMinutes} Mins</p>
                                    </div>
                                    <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-100">
                                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">OT Trigger</p>
                                        <p className="font-extrabold text-stone-800 mt-1">{shift.overtimeThresholdHours} Hours</p>
                                    </div>
                                </div>

                                {/* Working Days */}
                                <div className="mt-3 flex items-center gap-1">
                                    {ALL_DAYS.map((day) => {
                                        const isWorkDay = shift.days.includes(day);
                                        return (
                                            <span 
                                                key={day}
                                                className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md ${
                                                    isWorkDay 
                                                        ? "bg-emerald-100 text-emerald-800 font-extrabold" 
                                                        : "bg-stone-100 text-stone-400"
                                                }`}
                                            >
                                                {day[0]}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Card Footer: Assign Employees Button and Active Status */}
                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                                <button
                                    onClick={() => handleOpenStaffModal(shift)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#00B050]/10 hover:text-[#00B050] text-stone-700 font-bold transition-all cursor-pointer text-xs"
                                    title="Assign or reassign employees to this shift"
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{shift.activeEmployees} Staff Assigned</span>
                                    <span className="text-[10px] text-[#00B050] font-extrabold underline ml-0.5">Manage</span>
                                </button>

                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                    shift.status === "Active" 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : "bg-stone-100 text-stone-600 border-stone-200"
                                }`}>
                                    {shift.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Shift Create/Edit Modal (With Any-Branch Selection) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 border border-stone-100">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 text-base">
                                        {editingShift ? "Edit Shift Configuration" : "Create New Shift Schedule"}
                                    </h3>
                                    <p className="text-xs text-stone-400">Set duty hours, grace minutes, and branch location</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveShift} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Shift Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Regular Morning Shift"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            {/* Branch Selection (Choose ANY Branch) */}
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Assigned Branch Location *
                                </label>
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 cursor-pointer"
                                >
                                    {branches.length > 0 ? (
                                        branches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} ({b.code || "Branch"})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Main Head Office</option>
                                    )}
                                </select>
                                <p className="text-[10.5px] text-stone-400 mt-1">
                                    You can change the branch at any time to reassign or share this shift with another office.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Shift Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Shift["type"] })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    >
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Night">Night</option>
                                        <option value="Flexible">Flexible</option>
                                        <option value="Rotational">Rotational</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Shift["status"] })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Start Time *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="09:00 AM"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">End Time *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="05:00 PM"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Grace Period (Mins)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.graceMinutes}
                                        onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Break Time (Mins)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.breakMinutes}
                                        onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Working Days Selector */}
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1.5">Working Days Schedule</label>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {ALL_DAYS.map((day) => {
                                        const isSelected = formData.days.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-[#00B050] text-white shadow-xs"
                                                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2.5 text-xs font-bold bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl shadow-md shadow-[#00B050]/20 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {editingShift ? "Update Shift" : "Save Shift"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage / Assign Staff to Shift Modal */}
            {isStaffModalOpen && activeShiftForStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-7 shadow-2xl space-y-4 border border-stone-100 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 text-base">
                                        Assign Employees to {activeShiftForStaff.name}
                                    </h3>
                                    <p className="text-xs text-stone-400">
                                        Branch: <strong>{activeShiftForStaff.branchName || "Main Office"}</strong> | Duty: {activeShiftForStaff.startTime} - {activeShiftForStaff.endTime}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsStaffModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, ID or department..."
                                    value={staffSearchQuery}
                                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <select
                                value={staffBranchFilter}
                                onChange={(e) => setStaffBranchFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="All">All Branches ({employees.length} employees)</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Staff Selection Quick Bar */}
                        <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-100">
                            <span>
                                Selected: <strong className="text-stone-900">{selectedStaffIds.length}</strong> / {employees.length} Employees
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedStaffIds(modalFilteredEmployees.map((e) => e.id))}
                                    className="text-[11px] font-bold text-[#00B050] hover:underline cursor-pointer"
                                >
                                    Select All Filtered
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                    onClick={() => setSelectedStaffIds([])}
                                    className="text-[11px] font-bold text-stone-500 hover:underline cursor-pointer"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Employee List */}
                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] pr-1">
                            {modalFilteredEmployees.length === 0 ? (
                                <div className="p-8 text-center text-xs text-stone-400">
                                    No employees found matching your criteria.
                                </div>
                            ) : (
                                modalFilteredEmployees.map((emp) => {
                                    const isSelected = selectedStaffIds.includes(emp.id);
                                    const isCurrentlyOnThisShift = emp.shiftId === activeShiftForStaff.id;

                                    return (
                                        <div
                                            key={emp.id}
                                            onClick={() => toggleStaffSelection(emp.id)}
                                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                isSelected
                                                    ? "bg-emerald-50/70 border-emerald-300 shadow-2xs"
                                                    : "bg-white border-stone-200/80 hover:bg-stone-50/60"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                                    isSelected
                                                        ? "bg-[#00B050] border-[#00B050] text-white"
                                                        : "border-stone-300 bg-white"
                                                }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-stone-900 text-xs">{emp.name}</h4>
                                                        <span className="text-[10px] text-stone-400 font-mono">({emp.employeeId})</span>
                                                    </div>
                                                    <p className="text-[10.5px] text-stone-500">
                                                        {emp.designation} • {emp.department} • <span className="font-semibold text-stone-700">{emp.branch}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {emp.shiftName ? (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                                        isCurrentlyOnThisShift
                                                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                            : "bg-amber-50 text-amber-800 border-amber-200"
                                                    }`}>
                                                        {isCurrentlyOnThisShift ? "Current Shift" : `On: ${emp.shiftName}`}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-500">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setIsStaffModalOpen(false)}
                                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveStaffAssignments}
                                disabled={isSavingStaff}
                                className="px-5 py-2.5 text-xs font-bold bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl shadow-md shadow-[#00B050]/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                                {isSavingStaff ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Saving Shift Roster...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-3.5 h-3.5" />
                                        Update Shift for {selectedStaffIds.length} Staff
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl space-y-5 border border-stone-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-stone-900 leading-tight">
                                    Delete Shift Schedule?
                                </h3>
                                <p className="text-xs text-stone-500">
                                    Are you sure you want to permanently remove this shift from your company schedules?
                                </p>
                            </div>
                        </div>

                        {/* Shift Preview Box */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-stone-900">{deleteTarget.name}</h4>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-[#00B050] border border-emerald-100">
                                    {deleteTarget.type}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-stone-500">
                                <span>Duty: <strong className="text-stone-700">{deleteTarget.startTime} - {deleteTarget.endTime}</strong></span>
                                <span>Assigned: <strong className="text-stone-700">{deleteTarget.activeEmployees} employee(s)</strong></span>
                            </div>
                            {deleteTarget.branchName && (
                                <p className="text-[10.5px] text-stone-500 font-semibold">Branch: {deleteTarget.branchName}</p>
                            )}
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11.5px] text-amber-800 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                                This action cannot be undone. Assigned employees will lose this schedule and may need to be assigned to another shift.
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
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
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Shift
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
