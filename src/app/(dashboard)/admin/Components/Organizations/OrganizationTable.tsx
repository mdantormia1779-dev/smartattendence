"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Eye, Edit3, ShieldAlert, Trash2, X, Globe, Mail, Phone, MapPin, Clock } from 'lucide-react';

export interface Organization {
    id: string;
    name: string; // Company Name
    logo?: string; // Company Logo URL
    category: string; // Industry
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

interface OrganizationTableProps {
    organizations: Organization[];
    onView?: (org: Organization) => void;
    onEdit?: (org: Organization) => void;
    onToggleStatus?: (org: Organization) => void;
    onDelete?: (org: Organization) => void;
}

export const OrganizationTable: React.FC<OrganizationTableProps> = ({ 
    organizations,
    onEdit,
    onToggleStatus,
    onDelete
}) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null); // View details modal-এর জন্য
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto min-h-75">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/80 text-gray-400 uppercase text-[10px] tracking-wider font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3.5">Organization</th>
                            <th className="px-6 py-3.5">Industry</th>
                            <th className="px-6 py-3.5">Plan</th>
                            <th className="px-6 py-3.5">Employees</th>
                            <th className="px-6 py-3.5">Country</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-medium">
                        <AnimatePresence>
                            {organizations.length > 0 ? (
                                organizations.map((org, index) => {
                                    let planBadge = "bg-gray-100 text-gray-600 border-gray-200";
                                    if (org.plan === 'Enterprise') planBadge = "bg-amber-50 text-amber-700 border-amber-200/60";
                                    else if (org.plan === 'Business') planBadge = "bg-emerald-50 text-[#00B050] border-emerald-200/60";
                                    else if (org.plan === 'Starter') planBadge = "bg-blue-50 text-blue-600 border-blue-200/60";

                                    let statusBadge = "bg-emerald-50 text-[#00B050] border-emerald-200/60";
                                    if (org.status === 'Trial') statusBadge = "bg-amber-50 text-amber-600 border-amber-200/60";
                                    if (org.status === 'Suspended') statusBadge = "bg-rose-50 text-rose-600 border-rose-200/60";

                                    const isMenuOpen = openMenuId === org.id;

                                    return (
                                        <motion.tr 
                                            key={org.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className="transition-colors relative hover:bg-gray-50/50"
                                        >
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                {org.logo ? (
                                                    <Image 
                                                        src={org.logo} 
                                                        alt={org.name} 
                                                        width={36} 
                                                        height={36} 
                                                        className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0" 
                                                    />
                                                ) : (
                                                    <div className={`w-9 h-9 rounded-xl ${org.bg || 'bg-blue-600'} text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0`}>
                                                        {org.initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900">{org.name}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">{org.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{org.category}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] border ${planBadge}`}>
                                                    {org.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-semibold">{org.employees?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600">{org.country}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full font-semibold text-[11px] border ${statusBadge}`}>
                                                    {org.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button 
                                                    onClick={() => setOpenMenuId(isMenuOpen ? null : org.id)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ml-auto transition-colors ${
                                                        isMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                    }`}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {/* Action Dropdown Menu */}
                                                {isMenuOpen && (
                                                    <div 
                                                        ref={menuRef}
                                                        className="absolute right-10 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-left"
                                                    >
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); setSelectedOrg(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-500" />
                                                            View Details
                                                        </button>
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onEdit?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4 text-amber-500" />
                                                            Edit Organization
                                                        </button>
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onToggleStatus?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <ShieldAlert className="w-4 h-4 text-purple-500" />
                                                            {org.status === 'Suspended' ? 'Restore Access' : 'Suspend'}
                                                        </button>
                                                        <div className="h-px bg-gray-100 my-1"></div>
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onDelete?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-500" />
                                                            Delete Tenant
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400 text-xs font-semibold">
                                        No organizations found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* --- ORGANIZATION DETAILS MODAL --- */}
            {selectedOrg && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 text-left"
                    >
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                {selectedOrg.logo ? (
                                    <Image 
                                        src={selectedOrg.logo} 
                                        alt={selectedOrg.name} 
                                        width={48} 
                                        height={48} 
                                        className="w-12 h-12 rounded-2xl object-cover shadow" 
                                    />
                                ) : (
                                    <div className={`w-12 h-12 rounded-2xl ${selectedOrg.bg || 'bg-blue-600'} text-white font-bold flex items-center justify-center text-base shadow`}>
                                        {selectedOrg.initials}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedOrg.name}</h3>
                                    <p className="text-xs text-gray-400">ID: {selectedOrg.id} · {selectedOrg.category}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedOrg(null)}
                                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2">Basic & Contact Info</h4>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span>{selectedOrg.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{selectedOrg.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <a href={selectedOrg.website} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate">{selectedOrg.website}</a>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{selectedOrg.address}, {selectedOrg.country}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2">Localization & Operational</h4>
                                <div className="flex justify-between py-1 border-b border-gray-200/50">
                                    <span className="text-gray-400">Language:</span>
                                    <span className="font-semibold text-gray-800">{selectedOrg.language}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200/50">
                                    <span className="text-gray-400">Currency:</span>
                                    <span className="font-semibold text-gray-800">{selectedOrg.currency}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200/50">
                                    <span className="text-gray-400">Time Zone:</span>
                                    <span className="font-semibold text-gray-800">{selectedOrg.timeZone}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-400">Working Days:</span>
                                    <span className="font-semibold text-gray-800">{selectedOrg.workingDays}</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Office Hours</div>
                                        <div className="font-semibold text-gray-800">{selectedOrg.officeHours}</div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block text-right">Current Plan</span>
                                    <span className="font-bold text-blue-600">{selectedOrg.plan}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    onEdit?.(selectedOrg);
                                    setSelectedOrg(null);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Edit Organization
                            </button>
                            <button
                                onClick={() => setSelectedOrg(null)}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};