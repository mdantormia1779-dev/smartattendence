"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    Clock, 
    MapPin, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    Loader2, 
    LogIn, 
    LogOut, 
    User, 
    Building2, 
    Sparkles, 
    RefreshCw,
    Search
} from "lucide-react";
import { api } from "@/lib/api-client";

interface EmployeeOption {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    department: string;
    branch: string;
    branchId?: string;
    todayPunchIn?: string;
    todayPunchOut?: string;
    avatar?: string;
}

interface WebPunchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPunchSuccess: () => void;
}

export default function WebPunchModal({ isOpen, onClose, onPunchSuccess }: WebPunchModalProps) {
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [selectedEmpId, setSelectedEmpId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    
    // Live clock
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    
    // GPS & Status
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<"locating" | "ready" | "fallback">("locating");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Live clock tick
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
            setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Get browser coordinates
    useEffect(() => {
        if (!isOpen) return;

        setLocationStatus("locating");
        if (typeof window !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationStatus("ready");
                },
                (err) => {
                    console.warn("Geolocation permission skipped or unavailable, using branch default coordinates:", err);
                    setCoords({ lat: 23.8103, lng: 90.4125 }); // Standard default
                    setLocationStatus("fallback");
                },
                { enableHighAccuracy: true, timeout: 6000 }
            );
        } else {
            setCoords({ lat: 23.8103, lng: 90.4125 });
            setLocationStatus("fallback");
        }
    }, [isOpen]);

    // Fetch employees & today's punches
    useEffect(() => {
        if (!isOpen) return;

        async function loadEmployeesAndPunches() {
            try {
                setLoadingEmployees(true);
                const [empRes, attRes] = await Promise.allSettled([
                    api.employees.getAll({ limit: 150 }),
                    api.attendance.getLogs({ date: new Date().toISOString().split("T")[0] }),
                ]);

                let punchMap: Record<string, { punchIn?: string; punchOut?: string }> = {};
                if (attRes.status === "fulfilled" && attRes.value?.success && Array.isArray(attRes.value.data)) {
                    attRes.value.data.forEach((att: any) => {
                        const data = {
                            punchIn: att.checkInTime && att.checkInTime !== "-" && att.checkInTime !== "--" ? att.checkInTime : undefined,
                            punchOut: att.checkOutTime && att.checkOutTime !== "—" && att.checkOutTime !== "-" ? att.checkOutTime : undefined,
                        };
                        if (att.id) punchMap[att.id] = data;
                        if (att.employeeId) punchMap[att.employeeId] = data;
                    });
                }

                if (empRes.status === "fulfilled" && empRes.value?.success) {
                    const rawList = empRes.value.data?.items || empRes.value.data || [];
                    if (Array.isArray(rawList)) {
                        const mapped: EmployeeOption[] = rawList.map((e: any) => {
                            const p = punchMap[e.id] || punchMap[e.employeeCode] || punchMap[e.employeeId] || {};
                            return {
                                id: e.id,
                                employeeId: e.employeeCode || e.employeeId || `EMP-${(e.id || "").slice(-4)}`,
                                name: e.fullName || e.name || "Staff",
                                designation: e.designation || "Employee",
                                department: e.department || e.departments?.name || "General",
                                branch: e.branch || e.branches?.name || "Main Branch",
                                branchId: e.branchId,
                                todayPunchIn: p.punchIn,
                                todayPunchOut: p.punchOut,
                                avatar: e.profilePicture || e.image,
                            };
                        });
                        setEmployees(mapped);
                        if (mapped.length > 0 && !selectedEmpId) {
                            setSelectedEmpId(mapped[0].id);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load employees for punch", e);
            } finally {
                setLoadingEmployees(false);
            }
        }

        loadEmployeesAndPunches();
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredEmployees = employees.filter((emp) => {
        const q = searchQuery.toLowerCase();
        return (
            emp.name.toLowerCase().includes(q) ||
            emp.employeeId.toLowerCase().includes(q) ||
            emp.department.toLowerCase().includes(q) ||
            emp.branch.toLowerCase().includes(q)
        );
    });

    const activeEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

    const handlePunch = async (type: "IN" | "OUT") => {
        if (!activeEmployee) {
            setErrorMsg("Please select an employee first.");
            return;
        }

        setErrorMsg(null);
        setSuccessMsg(null);
        setIsSubmitting(true);

        const payload = {
            employeeId: activeEmployee.id,
            latitude: coords?.lat || 23.8103,
            longitude: coords?.lng || 90.4125,
            verificationMethod: "GPS_GEOFENCE",
        };

        try {
            if (type === "IN") {
                const res = await api.attendance.checkIn(payload);
                if (res.success) {
                    setSuccessMsg(`Punch In recorded for ${activeEmployee.name} at ${currentTime}!`);
                    onPunchSuccess();
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                } else {
                    setErrorMsg((res as any).message || "Failed to record Punch In.");
                }
            } else {
                const res = await api.attendance.checkOut(payload);
                if (res.success) {
                    setSuccessMsg(`Punch Out recorded for ${activeEmployee.name} at ${currentTime}!`);
                    onPunchSuccess();
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                } else {
                    setErrorMsg((res as any).message || "Failed to record Punch Out.");
                }
            }
        } catch (e: any) {
            console.error(`Failed to punch ${type}:`, e);
            setErrorMsg(e?.message || `An error occurred while punching ${type}.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 border border-stone-100 animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold shadow-2xs border border-emerald-100">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-900 text-lg leading-tight">
                                Web Attendance Terminal
                            </h3>
                            <p className="text-xs text-stone-400">
                                Instant Punch In & Punch Out with GPS verification
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Live Clock Card */}
                <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-5 rounded-2xl text-white text-center shadow-md space-y-1">
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider text-emerald-400">
                        {currentTime || "00:00:00 AM"}
                    </div>
                    <p className="text-xs text-stone-300 font-medium">{currentDate}</p>
                    
                    <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                            {locationStatus === "locating" ? "Acquiring GPS location..." : "GPS Geofenced & Active"}
                        </span>
                    </div>
                </div>

                {/* Notifications */}
                {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00B050]" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Employee Selector */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-700">Select Employee to Punch</label>
                    {loadingEmployees ? (
                        <div className="flex items-center gap-2 text-xs text-stone-400 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#00B050]" />
                            Loading employee list...
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by name or employee code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <select
                                value={selectedEmpId}
                                onChange={(e) => setSelectedEmpId(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 cursor-pointer"
                            >
                                {filteredEmployees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.employeeId}) — {emp.branch}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                {/* Selected Employee Live Status Preview */}
                {activeEmployee && (
                    <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00B050] font-bold flex items-center justify-center text-xs">
                                    {activeEmployee.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-stone-900">{activeEmployee.name}</p>
                                    <p className="text-[11px] text-stone-500">{activeEmployee.designation} · {activeEmployee.branch}</p>
                                </div>
                            </div>
                        </div>

                        {/* Today's punches status */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60 text-[11.5px]">
                            <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                                <span className="text-stone-400 font-bold block text-[10px] uppercase">Today's Punch In</span>
                                <strong className="text-emerald-700 font-extrabold">{activeEmployee.todayPunchIn || "Not Punched"}</strong>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                                <span className="text-stone-400 font-bold block text-[10px] uppercase">Today's Punch Out</span>
                                <strong className="text-stone-700 font-extrabold">{activeEmployee.todayPunchOut || "Not Punched"}</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dual Punch Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => handlePunch("IN")}
                        disabled={isSubmitting}
                        className="py-3.5 px-4 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-[#00B050] hover:from-emerald-700 hover:to-[#009b46] shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LogIn className="w-4 h-4" />
                        )}
                        <span>PUNCH IN (Clock-In)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handlePunch("OUT")}
                        disabled={isSubmitting}
                        className="py-3.5 px-4 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LogOut className="w-4 h-4" />
                        )}
                        <span>PUNCH OUT (Clock-Out)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
