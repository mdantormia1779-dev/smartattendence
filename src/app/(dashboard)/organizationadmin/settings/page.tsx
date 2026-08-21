"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Settings, 
    Building2, 
    Globe, 
    Save, 
    CheckCircle2, 
    ShieldCheck, 
    Upload, 
    Clock, 
    MapPin, 
    ScanFace, 
    Palette, 
    Mail, 
    Phone,
    Sliders,
    Sparkles
} from "lucide-react";

export default function OrganizationSettingsPage() {
    // Org Info
    const [companyName, setCompanyName] = useState("Vertex Technologies Ltd.");
    const [industry, setIndustry] = useState("Information Technology & Software");
    const [companyEmail, setCompanyEmail] = useState("contact@vertextech.io");
    const [phone, setPhone] = useState("+880 1712-001122");
    const [website, setWebsite] = useState("https://vertextech.io");
    const [address, setAddress] = useState("Level 7, Vertex Tower, 114 Kazi Nazrul Islam Ave, Dhaka-1215");
    const [country, setCountry] = useState("Bangladesh");
    const [currency, setCurrency] = useState("BDT (৳)");
    const [timezone, setTimezone] = useState("Asia/Dhaka (GMT+6:00)");

    // Work Timing Defaults
    const [workingDays, setWorkingDays] = useState(["Sun", "Mon", "Tue", "Wed", "Thu"]);
    const [defaultOfficeStart, setDefaultOfficeStart] = useState("09:00 AM");
    const [defaultOfficeEnd, setDefaultOfficeEnd] = useState("05:00 PM");

    // Face & Geofence Security
    const [defaultGeofenceRadius, setDefaultGeofenceRadius] = useState(120);
    const [antiSpoofingStrictness, setAntiSpoofingStrictness] = useState("High");
    const [requireLivenessBlink, setRequireLivenessBlink] = useState(true);

    // White-Label Settings
    const [brandThemeColor, setBrandThemeColor] = useState("#00B050");
    const [customSubdomain, setCustomSubdomain] = useState("vertex.attendanceerp.com");
    const [whiteLabelActive, setWhiteLabelActive] = useState(true);

    // Toast state
    const [showToast, setShowToast] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".settings-card",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[#00B050]" />
                        Company Settings & White-Label
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Configure organizational profile, working days, GPS geofencing radius & white-label branding
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
                >
                    <Save className="w-4 h-4" />
                    Save All Changes
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
                {/* 1. Company Profile Card */}
                <div className="settings-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Organization Profile & Brand Logo</h3>
                            <p className="text-xs text-gray-500">Official company identification details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Industry</label>
                            <input
                                type="text"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Company Official Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={companyEmail}
                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">Headquarter Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
                            >
                                <option value="BDT (৳)">BDT (৳) - Bangladeshi Taka</option>
                                <option value="USD ($)">USD ($) - US Dollar</option>
                                <option value="EUR (€)">EUR (€) - Euro</option>
                                <option value="GBP (£)">GBP (£) - British Pound</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Time Zone</label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
                            >
                                <option value="Asia/Dhaka (GMT+6:00)">Asia/Dhaka (GMT+6:00)</option>
                                <option value="UTC (GMT+0:00)">UTC (GMT+0:00)</option>
                                <option value="America/New_York (GMT-5:00)">America/New_York (GMT-5:00)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Working Days & Timing Defaults */}
                <div className="settings-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Standard Working Days & Office Hours</h3>
                            <p className="text-xs text-gray-500">Default company operating schedule</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Weekly Working Days</label>
                            <div className="flex flex-wrap gap-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => {
                                    const isActive = workingDays.includes(day);
                                    return (
                                        <button
                                            type="button"
                                            key={day}
                                            onClick={() => {
                                                if (isActive) {
                                                    setWorkingDays(workingDays.filter(d => d !== day));
                                                } else {
                                                    setWorkingDays([...workingDays, day]);
                                                }
                                            }}
                                            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                                                isActive
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

                        <div className="grid grid-cols-2 gap-4 max-w-md">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Default Start Time</label>
                                <input
                                    type="text"
                                    value={defaultOfficeStart}
                                    onChange={(e) => setDefaultOfficeStart(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Default End Time</label>
                                <input
                                    type="text"
                                    value={defaultOfficeEnd}
                                    onChange={(e) => setDefaultOfficeEnd(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Geo-Fencing & AI Face Security Settings */}
                <div className="settings-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">GPS Geo-Fence & AI Anti-Spoofing Rules</h3>
                            <p className="text-xs text-gray-500">Strict attendance verification parameters</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Default Branch Geo-Fence Radius (Meters)</label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="number"
                                    value={defaultGeofenceRadius}
                                    onChange={(e) => setDefaultGeofenceRadius(Number(e.target.value))}
                                    className="w-full pl-9 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">meters</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">Employees must be within this circle to clock in</p>
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">AI Anti-Spoofing Sensitivity</label>
                            <select
                                value={antiSpoofingStrictness}
                                onChange={(e) => setAntiSpoofingStrictness(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
                            >
                                <option value="High">Strict (Liveness + 3D Depth + Head Movement)</option>
                                <option value="Medium">Standard (Blink Detection + Confidence Score)</option>
                                <option value="Low">Relaxed (Confidence Match Only)</option>
                            </select>
                            <p className="text-[11px] text-gray-400 mt-1">Prevents photo & screen video playback fraud</p>
                        </div>
                    </div>
                </div>

                {/* 4. White-Label & Custom Branding */}
                <div className="settings-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">White-Label Branding & Domain</h3>
                            <p className="text-xs text-gray-500">Custom theme color, logo, and dedicated organization domain</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Brand Theme Accent Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={brandThemeColor}
                                    onChange={(e) => setBrandThemeColor(e.target.value)}
                                    className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-1"
                                />
                                <input
                                    type="text"
                                    value={brandThemeColor}
                                    onChange={(e) => setBrandThemeColor(e.target.value)}
                                    className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Dedicated Tenant Subdomain</label>
                            <input
                                type="text"
                                value={customSubdomain}
                                onChange={(e) => setCustomSubdomain(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </form>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-neutral-800 animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 className="w-5 h-5 text-[#00B050]" />
                    <div className="text-xs">
                        <p className="font-bold">Settings Saved Successfully!</p>
                        <p className="text-neutral-400">All organization preferences and security rules have been updated.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
