"use client";

import React, { useState, useEffect } from "react";
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Building2, 
    Calendar, 
    FileText, 
    Download, 
    Eye, 
    ShieldCheck, 
    Upload, 
    CheckCircle2, 
    HeartPulse,
    Loader2,
    Lock,
    KeyRound,
    EyeOff,
    AlertCircle,
    Save
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function EmployeeProfilePage() {
    const [activeTab, setActiveTab] = useState<"personal" | "official" | "documents" | "security">("personal");
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.auth.me();
            if (res.success && res.data) {
                setEmployee(res.data);
            }
        } catch (e) {
            console.error("Failed to load employee profile", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

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
                setPasswordSuccessMessage("Password updated successfully! Please use your new password next time you log in.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => setPasswordSuccessMessage(null), 5000);
            } else {
                setPasswordErrorMessage(res.message || res.error?.message || "Failed to update password. Please check your current password.");
            }
        } catch (e: any) {
            console.error("Password update error", e);
            setPasswordErrorMessage(e?.message || "Incorrect current password or server connection issue.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const documents = [
        { name: "National ID Card (Front)", type: "Image / JPEG", size: "1.4 MB", uploadedOn: "Verified", status: "Verified" },
        { name: "National ID Card (Back)", type: "Image / JPEG", size: "1.2 MB", uploadedOn: "Verified", status: "Verified" },
        { name: "Official Appointment Letter", type: "PDF Document", size: "2.8 MB", uploadedOn: "Verified", status: "Verified" },
    ];

    if (loading) {
        return (
            <div className="flex-1 bg-stone-50/50 p-6 flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                <span className="text-stone-500 text-xs font-semibold">Loading employee profile...</span>
            </div>
        );
    }

    const empName = employee?.fullName || employee?.name || "Staff Member";
    const empCode = employee?.employeeId || employee?.employeeCode || "EMP-1001";
    const empEmail = employee?.email || "staff@company.com";
    const empDesignation = employee?.designation || "Software Engineer";
    const empDept = employee?.department || "Information Technology";
    const empBranch = employee?.branch || "Head Office – Dhaka";
    const empPhone = employee?.phone || "+880 1700-000000";
    const empAddress = employee?.address || "Dhaka, Bangladesh";
    const empEmergency = employee?.emergencyContact || "Family Member · +880 1799-887766";
    const empSalary = employee?.basicSalary ? `৳${Number(employee.basicSalary).toLocaleString()}` : "৳45,000";
    const empJoinDate = employee?.joiningDate ? employee.joiningDate.split("T")[0] : "2024-01-15";

    return (
        <div className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Top Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-6">
                <img
                    src={employee?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                    alt={empName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-[#00B050]/20"
                />
                <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h1 className="text-2xl font-bold text-stone-900">{empName}</h1>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 w-fit mx-auto md:mx-0 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" /> Full-Time Employee
                        </span>
                    </div>
                    <p className="text-xs text-stone-500 font-mono">
                        Employee ID: <span className="font-bold text-stone-800">{empCode}</span> · {empDesignation}
                    </p>
                    <p className="text-xs text-stone-400">
                        {empDept} · {empBranch}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
                {[
                    { id: "personal", label: "Personal & Contact" },
                    { id: "official", label: "Employment Details" },
                    { id: "documents", label: "Documents Vault" },
                    { id: "security", label: "Security & Password" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                            activeTab === tab.id
                                ? "bg-[#00B050] text-white shadow-xs"
                                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: Personal & Contact */}
            {activeTab === "personal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-4 text-xs">
                        <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">Personal Data</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-stone-400">Date of Birth</span><p className="font-bold text-stone-800 mt-0.5">May 14, 1994</p></div>
                            <div><span className="text-stone-400">Gender</span><p className="font-bold text-stone-800 mt-0.5">Male</p></div>
                            <div><span className="text-stone-400">Blood Group</span><p className="font-bold text-rose-600 mt-0.5">B+ (Positive)</p></div>
                            <div><span className="text-stone-400">Marital Status</span><p className="font-bold text-stone-800 mt-0.5">Married</p></div>
                            <div><span className="text-stone-400">Nationality</span><p className="font-bold text-stone-800 mt-0.5">Bangladeshi</p></div>
                            <div><span className="text-stone-400">National NID</span><p className="font-mono font-bold text-stone-800 mt-0.5">8219402941</p></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-4 text-xs">
                        <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">Contact & Emergency Details</h3>
                        <div className="space-y-3">
                            <div><span className="text-stone-400">Work Email</span><p className="font-semibold text-stone-800 mt-0.5">{empEmail}</p></div>
                            <div><span className="text-stone-400">Mobile Phone</span><p className="font-semibold text-stone-800 mt-0.5">{empPhone}</p></div>
                            <div><span className="text-stone-400">Present Address</span><p className="font-semibold text-stone-800 mt-0.5">{empAddress}</p></div>
                            <div className="pt-2 border-t border-stone-100">
                                <span className="text-stone-400 font-bold">Emergency Contact:</span>
                                <p className="font-semibold text-stone-800 mt-0.5">{empEmergency}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Official Employment */}
            {activeTab === "official" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-4 text-xs">
                        <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">Organization & Posting</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-stone-400">Designation</span><p className="font-bold text-stone-800 mt-0.5">{empDesignation}</p></div>
                            <div><span className="text-stone-400">Department</span><p className="font-bold text-stone-800 mt-0.5">{empDept}</p></div>
                            <div><span className="text-stone-400">Branch Location</span><p className="font-bold text-stone-800 mt-0.5">{empBranch}</p></div>
                            <div><span className="text-stone-400">Employment Type</span><p className="font-bold text-[#00B050] mt-0.5">Full-Time (Permanent)</p></div>
                            <div><span className="text-stone-400">Date of Joining</span><p className="font-bold text-stone-800 mt-0.5">{empJoinDate}</p></div>
                            <div><span className="text-stone-400">Status</span><p className="font-bold text-emerald-600 mt-0.5">Active Service</p></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-4 text-xs">
                        <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">Salary & Compensation Grade</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-stone-400">Base Salary</span><p className="font-bold text-stone-900 text-sm mt-0.5 font-mono">{empSalary}</p></div>
                            <div><span className="text-stone-400">Pay Frequency</span><p className="font-bold text-stone-800 mt-0.5">Monthly (Bank Transfer)</p></div>
                            <div><span className="text-stone-400">Provident Fund (PF)</span><p className="font-bold text-stone-800 mt-0.5">10% Contributory</p></div>
                            <div><span className="text-stone-400">Tax Deducted (TDS)</span><p className="font-bold text-stone-800 mt-0.5">As per Tax Law</p></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: Documents Vault */}
            {activeTab === "documents" && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                            <h3 className="font-bold text-stone-900 text-sm">Verified Employee Documents</h3>
                            <p className="text-xs text-stone-400">Encrypted in cloud vault</p>
                        </div>
                    </div>

                    <div className="divide-y divide-stone-100">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-[#00B050]" />
                                    <div>
                                        <p className="font-bold text-stone-900">{doc.name}</p>
                                        <p className="text-[10px] text-stone-400">{doc.type} · {doc.size}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> {doc.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 4: Security & Password Change */}
            {activeTab === "security" && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-6 max-w-2xl">
                    <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-900 text-base">Account Security & Password</h3>
                            <p className="text-xs text-stone-500">Update your login password to secure your employee account</p>
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

                    <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
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

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
