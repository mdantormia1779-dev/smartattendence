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
    Loader2,
    Calendar,
    DollarSign,
    Check,
    AlertCircle,
    RefreshCw,
    Lock,
    KeyRound,
    Eye,
    EyeOff
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function OrganizationSettingsPage() {
    const [orgId, setOrgId] = useState("org-1");

    // 1. General Company Info
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("Information Technology & Services");
    const [companyEmail, setCompanyEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("Bangladesh");
    const [currency, setCurrency] = useState("BDT (৳)");
    const [timezone, setTimezone] = useState("Asia/Dhaka (GMT+6:00)");

    // 2. Work Timing Defaults
    const [workingDays, setWorkingDays] = useState<string[]>(["Sun", "Mon", "Tue", "Wed", "Thu"]);
    const [defaultOfficeStart, setDefaultOfficeStart] = useState("09:00 AM");
    const [defaultOfficeEnd, setDefaultOfficeEnd] = useState("05:00 PM");

    // 3. Face & Geofence Security
    const [defaultGeofenceRadius, setDefaultGeofenceRadius] = useState(120);
    const [antiSpoofingStrictness, setAntiSpoofingStrictness] = useState("High");

    // 4. White-Label Settings
    const [brandThemeColor, setBrandThemeColor] = useState("#00B050");
    const [customSubdomain, setCustomSubdomain] = useState("");
    const [subscriptionPlan, setSubscriptionPlan] = useState("BUSINESS");

    // 5. Password Change System States
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);

    // Toast and UI states
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Dynamic resolution of Org ID from session
    const getResolvedOrgId = () => {
        let id = "org-1";
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.organizationId || parsed.orgId) id = parsed.organizationId || parsed.orgId;
                } catch {}
            }
            const directOrgId = localStorage.getItem("organizationId");
            if (directOrgId) id = directOrgId;
        }
        return id;
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const targetOrgId = getResolvedOrgId();
            setOrgId(targetOrgId);

            const res = await api.organizations.getById(targetOrgId).catch(() => null);
            if (res?.success && res.data) {
                const d = res.data;
                setCompanyName(d.name || "");
                setCompanyEmail(d.email || "");
                setPhone(d.phone || "");
                setWebsite(d.website || "");
                setIndustry(d.industry || "Information Technology & Services");
                setAddress(d.address || "");
                setCountry(d.country || "Bangladesh");
                setCurrency(d.currency || "BDT (৳)");
                setTimezone(d.timezone || "Asia/Dhaka (GMT+6:00)");

                if (d.defaultOfficeStart) setDefaultOfficeStart(d.defaultOfficeStart);
                if (d.defaultOfficeEnd) setDefaultOfficeEnd(d.defaultOfficeEnd);
                if (d.defaultGeofenceM) setDefaultGeofenceRadius(d.defaultGeofenceM);
                if (d.brandColor) setBrandThemeColor(d.brandColor);
                if (d.antiSpoofingMode) setAntiSpoofingStrictness(d.antiSpoofingMode);
                if (d.customDomain || d.slug) setCustomSubdomain(d.customDomain || `${d.slug}.attendanceerp.com`);
                if (d.planName || d.planTier) setSubscriptionPlan(d.planName || d.planTier);

                if (Array.isArray(d.workingDays) && d.workingDays.length > 0) {
                    setWorkingDays(d.workingDays);
                } else if (typeof d.workingDays === "string" && d.workingDays) {
                    try {
                        const parsed = JSON.parse(d.workingDays);
                        if (Array.isArray(parsed)) setWorkingDays(parsed);
                    } catch {
                        setWorkingDays(d.workingDays.split(",").map((s: string) => s.trim()));
                    }
                }
            }
        } catch (e: any) {
            console.error("Failed to load organization settings", e);
            setErrorMessage("Failed to load organization settings from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
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

    const toggleWorkingDay = (day: string) => {
        setWorkingDays((prev) => 
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    // Save General Settings
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim() || !companyEmail.trim()) {
            setErrorMessage("Company Name and Official Email are required fields.");
            return;
        }

        try {
            setSaving(true);
            setErrorMessage(null);

            const payload = {
                name: companyName.trim(),
                email: companyEmail.trim(),
                phone: phone.trim() || undefined,
                website: website.trim() || undefined,
                industry: industry.trim() || undefined,
                address: address.trim() || undefined,
                country: country.trim() || undefined,
                currency: currency.trim() || undefined,
                timezone: timezone.trim() || undefined,
                defaultOfficeStart,
                defaultOfficeEnd,
                workingDays,
                defaultGeofenceM: defaultGeofenceRadius,
                antiSpoofingMode: antiSpoofingStrictness,
                brandColor: brandThemeColor,
            };

            const res = await api.organizations.update(orgId, payload);
            if (res.success) {
                // Update local storage user session with updated org name
                if (typeof window !== "undefined") {
                    const stored = localStorage.getItem("user");
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            parsed.organizationName = companyName.trim();
                            parsed.companyName = companyName.trim();
                            localStorage.setItem("user", JSON.stringify(parsed));
                        } catch {}
                    }
                }

                setShowToast(true);
                setTimeout(() => setShowToast(false), 3500);
            } else {
                setErrorMessage(res.message || "Failed to update organization settings");
            }
        } catch (e: any) {
            console.error("Failed to save settings", e);
            setErrorMessage(e?.message || "Failed to save organization settings");
        } finally {
            setSaving(false);
        }
    };

    // Password Change Action
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordErrorMessage(null);
        setPasswordSuccessMessage(null);

        if (!currentPassword) {
            setPasswordErrorMessage("Please enter your current password.");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordErrorMessage("New password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrorMessage("New password and confirm password do not match.");
            return;
        }

        try {
            setIsChangingPassword(true);
            const res = await api.auth.changePassword({
                currentPassword,
                newPassword,
            });

            if (res.success) {
                setPasswordSuccessMessage("Your password has been changed successfully! Please use your new password for next logins.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => setPasswordSuccessMessage(null), 5000);
            } else {
                setPasswordErrorMessage(res.message || res.error?.message || "Failed to change password. Please verify current password.");
            }
        } catch (e: any) {
            console.error("Password change error", e);
            setPasswordErrorMessage(e?.message || "Incorrect current password or server error.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const allDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div ref={containerRef} className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <Settings className="w-6 h-6 text-[#00B050]" />
                        Company Settings & Security
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Manage corporate identity, default shift schedules, GPS geofencing radius & change account passwords
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={fetchSettings}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Reload settings"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save All Changes
                    </button>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-stone-400 bg-white rounded-3xl border border-stone-200/80 shadow-2xs gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050]" />
                    <span className="text-xs font-bold text-stone-600">Loading organization settings from database...</span>
                </div>
            ) : (
                <div className="space-y-6 max-w-5xl">
                    {/* 1. General Company Profile Card */}
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="settings-card bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold border border-emerald-100">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900 text-base">General Company Profile</h3>
                                        <p className="text-xs text-stone-500">Legal corporate entity details & official communication contacts</p>
                                    </div>
                                </div>
                                <span className="text-xs font-extrabold bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
                                    Org ID: <span className="font-mono text-[#00B050]">{orgId}</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">
                                        Company / Organization Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Industry Sector</label>
                                    <input
                                        type="text"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">
                                        Official Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={companyEmail}
                                        onChange={(e) => setCompanyEmail(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Official Contact Phone</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Corporate Website</label>
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Country / Region</label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Headquarters Physical Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Currency Format</label>
                                    <input
                                        type="text"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Organization Timezone</label>
                                    <input
                                        type="text"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Work Schedule & Timings Card */}
                        <div className="settings-card bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 text-base">Work Schedule & Default Timings</h3>
                                    <p className="text-xs text-stone-500">Official working days of the week & standard working hours</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-2">Weekly Working Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {allDaysOfWeek.map((day) => {
                                            const isSelected = workingDays.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleWorkingDay(day)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                                                        isSelected
                                                            ? "bg-[#00B050] text-white shadow-xs"
                                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Standard Office Start Time</label>
                                        <input
                                            type="text"
                                            value={defaultOfficeStart}
                                            onChange={(e) => setDefaultOfficeStart(e.target.value)}
                                            placeholder="09:00 AM"
                                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Standard Office End Time</label>
                                        <input
                                            type="text"
                                            value={defaultOfficeEnd}
                                            onChange={(e) => setDefaultOfficeEnd(e.target.value)}
                                            placeholder="05:00 PM"
                                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Face Recognition & Geofence Policy Card */}
                        <div className="settings-card bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 text-base">Security, Face AI & Geofence Policy</h3>
                                    <p className="text-xs text-stone-500">Anti-spoofing criteria & GPS geofencing radius validation</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Default Branch Geofence Radius (Meters)</label>
                                    <input
                                        type="number"
                                        min="20"
                                        max="1000"
                                        value={defaultGeofenceRadius}
                                        onChange={(e) => setDefaultGeofenceRadius(parseInt(e.target.value) || 120)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                    <span className="text-[11px] text-stone-400 font-medium mt-1 block">Valid range: 20m - 1000m (Recommended: 120m)</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">AI Anti-Spoofing Strictness</label>
                                    <select
                                        value={antiSpoofingStrictness}
                                        onChange={(e) => setAntiSpoofingStrictness(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="High">High (Euclidean Distance &le; 0.55)</option>
                                        <option value="Standard">Standard (Euclidean Distance &le; 0.60)</option>
                                        <option value="Ultra">Ultra (Strict Angle & Blink Liveness)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 4. Branding & White-Label Theme */}
                        <div className="settings-card bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 text-base">Corporate Branding & Theme Color</h3>
                                    <p className="text-xs text-stone-500">Brand identity color & custom ERP portal domain</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Brand Theme Accent Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={brandThemeColor}
                                            onChange={(e) => setBrandThemeColor(e.target.value)}
                                            className="w-11 h-11 p-1 bg-white border border-stone-200 rounded-xl cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={brandThemeColor}
                                            onChange={(e) => setBrandThemeColor(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Active Enterprise Plan</label>
                                    <div className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-800">{subscriptionPlan} Plan</span>
                                        <span className="text-[10px] font-extrabold bg-emerald-50 text-[#00B050] px-2.5 py-1 rounded-md border border-emerald-200">
                                            ACTIVE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* ========================================================================= */}
                    {/* 5. PASSWORD CHANGE SYSTEM CARD */}
                    {/* ========================================================================= */}
                    <div className="settings-card bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900 text-base">Admin Security & Password Change</h3>
                                <p className="text-xs text-stone-500">Update your account credentials to keep your administrator portal secure</p>
                            </div>
                        </div>

                        {passwordSuccessMessage && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in duration-150">
                                <CheckCircle2 className="w-4 h-4 text-[#00B050] shrink-0" />
                                <span>{passwordSuccessMessage}</span>
                            </div>
                        )}

                        {passwordErrorMessage && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-bold flex items-center gap-2 animate-in fade-in duration-150">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{passwordErrorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-2xl">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Current Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter your current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">
                                        New Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            placeholder="Minimum 6 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">
                                        Confirm New Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            placeholder="Re-type new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-start">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-stone-900 text-white rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom duration-200">
                    <CheckCircle2 className="w-5 h-5 text-[#00B050]" />
                    <span>Organization settings successfully saved and synced across database!</span>
                </div>
            )}
        </div>
    );
}
