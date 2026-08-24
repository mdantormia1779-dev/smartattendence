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
    Sparkles,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await api.organizations.getSettings("org-1");
                if (res.success && res.data) {
                    const d = res.data;
                    if (d.name) setCompanyName(d.name);
                    if (d.email) setCompanyEmail(d.email);
                    if (d.phone) setPhone(d.phone);
                    if (d.address) setAddress(d.address);
                    if (d.timezone) setTimezone(d.timezone);
                    if (d.defaultGeofenceM) setDefaultGeofenceRadius(d.defaultGeofenceM);
                    if (d.brandThemeColor) setBrandThemeColor(d.brandThemeColor);
                }
            } catch (e) {
                console.error("Failed to load organization settings", e);
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".settings-card",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.organizations.updateSettings("org-1", {
                name: companyName,
                email: companyEmail,
                phone,
                address,
                timezone,
                defaultGeofenceM: defaultGeofenceRadius,
                brandThemeColor,
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (e) {
            console.error("Failed to save settings", e);
        } finally {
            setSaving(false);
        }
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
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save All Changes
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span>Loading company settings...</span>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
                    {/* 1. Company Profile Card */}
                    <div className="settings-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">General Company Profile</h3>
                                <p className="text-xs text-gray-500">Legal entity details & communication contacts</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Industry Sector</label>
                                <input
                                    type="text"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Official Email</label>
                                <input
                                    type="email"
                                    required
                                    value={companyEmail}
                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Official Phone</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Headquarters Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Face Recognition & Geofence Policy */}
                    <div className="settings-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Security, Face AI & Geofence Policy</h3>
                                <p className="text-xs text-gray-500">Anti-spoofing criteria & GPS geofencing radius validation</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Default Branch Geofence Radius (Meters)</label>
                                <input
                                    type="number"
                                    min="20"
                                    max="1000"
                                    value={defaultGeofenceRadius}
                                    onChange={(e) => setDefaultGeofenceRadius(parseInt(e.target.value) || 120)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                                <span className="text-[11px] text-gray-400">Valid range: 20m - 1000m (Recommended: 120m)</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">AI Anti-Spoofing Strictness</label>
                                <select
                                    value={antiSpoofingStrictness}
                                    onChange={(e) => setAntiSpoofingStrictness(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                >
                                    <option value="High">High (Euclidean Distance &le; 0.55)</option>
                                    <option value="Standard">Standard (Euclidean Distance &le; 0.60)</option>
                                    <option value="Ultra">Ultra (Strict Angle & Blink Liveness)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom duration-300">
                    <CheckCircle2 className="w-4 h-4 text-[#00B050]" />
                    Organization settings saved and persisted successfully!
                </div>
            )}
        </div>
    );
}
