"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Building2, Users, GitBranch, DollarSign, Calendar, 
    ShieldCheck, Layers, Mail, Phone, Globe, MapPin, 
    Clock, Globe2, Coins, CalendarDays 
} from 'lucide-react';

export interface Organization {
    id: string;
    name: string;
    logo?: string;
    category: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    country: string;
    language: string;
    currency: string;
    timeZone: string;
    workingDays: string;
    officeHours: string;
    plan: string;
    employees: number;
    branches: number;
    revenue: string;
    joined: string;
    status: string;
    initials: string;
    bg: string;
}

interface OrganizationDetailsModalProps {
    organization: Organization | null;
    isOpen: boolean;
    onClose: () => void;
}

export const OrganizationDetailsModal: React.FC<OrganizationDetailsModalProps> = ({
    organization,
    isOpen,
    onClose
}) => {
    if (!isOpen || !organization) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                {/* Backdrop Animation */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0"
                />

                {/* Modal Box Animation */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 text-left my-8"
                >
                    {/* Header Section */}
                    <div className="bg-linear-to-r from-gray-50 via-white to-gray-50 p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {organization.logo ? (
                                <img src={organization.logo} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-md border border-gray-100 shrink-0" />
                            ) : (
                                <div className={`w-14 h-14 rounded-2xl ${organization.bg} text-white font-extrabold flex items-center justify-center text-base shadow-md shrink-0`}>
                                    {organization.initials}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{organization.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-[10px] border border-blue-100">
                                        {organization.category}
                                    </span>
                                    <span className="text-xs text-gray-400">ID: <strong className="text-gray-600">{organization.id}</strong></span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        
                        {/* 1. Quick Metric Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Plan</span>
                                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                                <div className="text-xs font-bold text-gray-900">{organization.plan}</div>
                            </div>

                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Status</span>
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <div className="text-xs font-bold text-gray-900">{organization.status}</div>
                            </div>

                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Employees</span>
                                    <Users className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <div className="text-xs font-bold text-gray-900">{organization.employees.toLocaleString()}</div>
                            </div>

                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Branches</span>
                                    <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <div className="text-xs font-bold text-gray-900">{organization.branches} Branches</div>
                            </div>
                        </div>

                        {/* 2. Two-Column Detailed Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Contact & Location Info */}
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                <h4 className="text-[11px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">Contact & Location</h4>
                                
                                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="truncate font-medium">{organization.email}</span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-medium">{organization.phone}</span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Globe className="w-3.5 h-3.5" />
                                    </div>
                                    <a href={organization.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate font-medium">
                                        {organization.website}
                                    </a>
                                </div>

                                <div className="flex items-start gap-2.5 text-xs text-gray-700">
                                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-medium">{organization.address}, {organization.country}</span>
                                </div>
                            </div>

                            {/* Localization & Operational Settings */}
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                <h4 className="text-[11px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">Operational & Settings</h4>
                                
                                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Globe2 className="w-3.5 h-3.5 text-teal-500" />
                                        <span>Language:</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">{organization.language}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Currency:</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">{organization.currency}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                                        <span>Time Zone:</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">{organization.timeZone}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs py-1">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                                        <span>Working Days:</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">{organization.workingDays}</span>
                                </div>
                            </div>

                        </div>

                        {/* 3. Office Hours & Revenue Footer Strip Inside Content */}
                        <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Office Hours</div>
                                    <div className="text-xs font-bold text-white mt-0.5">{organization.officeHours}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-between">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Revenue</div>
                                    <div className="text-xs font-bold text-emerald-400 mt-0.5">{organization.revenue}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Joined</div>
                                    <div className="text-xs font-bold text-gray-200 mt-0.5">{organization.joined}</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-all"
                        >
                            Close Details
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};