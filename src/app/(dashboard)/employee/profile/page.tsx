"use client";

import React, { useState } from "react";
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
    HeartPulse
} from "lucide-react";

export default function EmployeeProfilePage() {
    const [activeTab, setActiveTab] = useState<"personal" | "official" | "documents">("personal");

    const documents = [
        { name: "National ID Card (Front)", type: "Image / JPEG", size: "1.4 MB", uploadedOn: "Jan 12, 2020", status: "Verified" },
        { name: "National ID Card (Back)", type: "Image / JPEG", size: "1.2 MB", uploadedOn: "Jan 12, 2020", status: "Verified" },
        { name: "Official Appointment Letter", type: "PDF Document", size: "2.8 MB", uploadedOn: "Jan 12, 2020", status: "Verified" },
        { name: "Latest Updated Resume", type: "PDF Document", size: "850 KB", uploadedOn: "Aug 02, 2024", status: "Verified" },
        { name: "Passport Copy (Page 2-3)", type: "PDF Document", size: "3.1 MB", uploadedOn: "Jan 15, 2022", status: "Verified" },
    ];

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Top Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                    alt="Arif Chowdhury"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-[#00B050]/20"
                />
                <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">Arif Chowdhury</h1>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 w-fit mx-auto md:mx-0">
                            <ShieldCheck className="w-3.5 h-3.5" /> Full-Time Employee
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">
                        Employee ID: <span className="font-bold text-gray-800">EMP-1042</span> · Senior Software Engineer
                    </p>
                    <p className="text-xs text-gray-400">
                        Information Technology Department · Head Office – Dhaka
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                {[
                    { id: "personal", label: "Personal & Contact Information" },
                    { id: "official", label: "Official Employment Details" },
                    { id: "documents", label: "Uploaded Documents Vault" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === tab.id
                                ? "bg-[#00B050] text-white shadow-sm"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: Personal & Contact */}
            {activeTab === "personal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 text-xs">
                        <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">Personal Data</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-gray-400">Date of Birth</span><p className="font-bold text-gray-800 mt-0.5">May 14, 1994</p></div>
                            <div><span className="text-gray-400">Gender</span><p className="font-bold text-gray-800 mt-0.5">Male</p></div>
                            <div><span className="text-gray-400">Blood Group</span><p className="font-bold text-rose-600 mt-0.5">B+ (Positive)</p></div>
                            <div><span className="text-gray-400">Marital Status</span><p className="font-bold text-gray-800 mt-0.5">Married</p></div>
                            <div><span className="text-gray-400">Nationality</span><p className="font-bold text-gray-800 mt-0.5">Bangladeshi</p></div>
                            <div><span className="text-gray-400">National NID</span><p className="font-mono font-bold text-gray-800 mt-0.5">8219402941</p></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 text-xs">
                        <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">Contact & Emergency Details</h3>
                        <div className="space-y-3">
                            <div><span className="text-gray-400">Work Email</span><p className="font-semibold text-gray-800 mt-0.5">arif.c@vertextech.io</p></div>
                            <div><span className="text-gray-400">Mobile Phone</span><p className="font-semibold text-gray-800 mt-0.5">+880 1712-100201</p></div>
                            <div><span className="text-gray-400">Present Address</span><p className="font-semibold text-gray-800 mt-0.5">House 24, Road 11, Dhanmondi, Dhaka</p></div>
                            <div className="pt-2 border-t border-gray-100">
                                <span className="text-gray-400 font-bold">Emergency Contact:</span>
                                <p className="font-semibold text-gray-800 mt-0.5">Mrs. Sabrina Chowdhury (Spouse) · +880 1799-887766</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Official Info */}
            {activeTab === "official" && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 text-xs max-w-3xl">
                    <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">Employment & Organization Mapping</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><span className="text-gray-400">Department</span><p className="font-bold text-gray-800 mt-0.5">Information Technology</p></div>
                        <div><span className="text-gray-400">Assigned Branch</span><p className="font-bold text-gray-800 mt-0.5">Head Office – Dhaka</p></div>
                        <div><span className="text-gray-400">Reporting Manager</span><p className="font-bold text-[#00B050] mt-0.5">Tanvir Ahmed (IT Lead)</p></div>
                        <div><span className="text-gray-400">Joining Date</span><p className="font-bold text-gray-800 mt-0.5">January 12, 2020 (4+ Years)</p></div>
                        <div><span className="text-gray-400">Salary Grade</span><p className="font-bold text-gray-800 mt-0.5">Grade 8 (Monthly)</p></div>
                        <div><span className="text-gray-400">Assigned Shift</span><p className="font-bold text-gray-800 mt-0.5">Regular Morning (09:00 AM - 05:00 PM)</p></div>
                    </div>
                </div>
            )}

            {/* Tab 3: Documents Vault */}
            {activeTab === "documents" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">Verified Employee Documents</h3>
                        <button
                            onClick={() => alert("Upload document prompt opened.")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B050] text-white rounded-xl text-xs font-semibold"
                        >
                            <Upload className="w-3.5 h-3.5" /> Upload New File
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100 text-xs">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00B050]">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{doc.name}</p>
                                        <span className="text-[11px] text-gray-400">{doc.type} · {doc.size} · Uploaded {doc.uploadedOn}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                        {doc.status}
                                    </span>
                                    <button
                                        onClick={() => alert(`Downloading ${doc.name}...`)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#00B050]"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
