"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Eye, Edit3, ShieldAlert, Trash2, X, Globe, Mail, Phone, MapPin, Clock, KeyRound } from 'lucide-react';

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
    planName?: string;
    planTier?: string;
    employees: number;
    branches: number;
    revenue: string;
    joined: string;
    status: string;
    initials: string;
    bg: string;
    adminPassword?: string;
    adminEmail?: string;
}

interface OrganizationTableProps {
    organizations: Organization[];
    onView?: (org: Organization) => void;
    onEdit?: (org: Organization) => void;
    onToggleStatus?: (org: Organization) => void;
    onDelete?: (org: Organization) => void;
}

const TableAvatar: React.FC<{ name: string; logo?: string; bg?: string; initials?: string }> = ({
    name,
    logo,
    bg,
    initials
}) => {
    const [imgFailed, setImgFailed] = useState(false);
    const computedInitials = initials || (name || 'Org')
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'OG';

    const isValidUrl = logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'));

    if (isValidUrl && !imgFailed) {
        return (
            <img 
                src={logo} 
                alt={name} 
                className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0 border border-gray-100" 
                onError={() => setImgFailed(true)}
            />
        );
    }

    return (
        <div className={`w-9 h-9 rounded-xl ${bg || 'bg-[#00B050]'} text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0`}>
            {computedInitials}
        </div>
    );
};

export const OrganizationTable: React.FC<OrganizationTableProps> = ({ 
    organizations,
    onView,
    onEdit,
    onToggleStatus,
    onDelete
}) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto min-h-75">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 bg-gray-50/50">
                            <th className="px-6 py-4 font-semibold">Organization</th>
                            <th className="px-6 py-4 font-semibold">Category</th>
                            <th className="px-6 py-4 font-semibold">Plan</th>
                            <th className="px-6 py-4 font-semibold">Employees</th>
                            <th className="px-6 py-4 font-semibold">Country</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <AnimatePresence>
                            {organizations.length > 0 ? (
                                organizations.map((org, index) => {
                                    let planBadge = "bg-gray-50 text-gray-600 border-gray-200/60";
                                    const planLower = (org.planName || org.plan || '').toLowerCase();
                                    if (planLower.includes('enterprise')) planBadge = "bg-amber-50 text-amber-700 border-amber-200/60";
                                    else if (planLower.includes('business')) planBadge = "bg-emerald-50 text-[#00B050] border-emerald-200/60";
                                    else if (planLower.includes('starter')) planBadge = "bg-blue-50 text-blue-600 border-blue-200/60";
                                    else if (planLower.includes('free') || planLower.includes('trial')) planBadge = "bg-purple-50 text-purple-700 border-purple-200/60";

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
                                                <TableAvatar 
                                                    name={org.name}
                                                    logo={org.logo}
                                                    bg={org.bg}
                                                    initials={org.initials}
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-900">{org.name}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">{org.email || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{org.category || 'General'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] border ${planBadge}`}>
                                                    {org.planName || org.plan}
                                                </span>
                                            </td>
                                            {/* Fix: Safely display 0 without converting to empty or breaking */}
                                            <td className="px-6 py-4 text-gray-700 font-semibold">{(org.employees ?? 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600">{org.country || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full font-semibold text-[11px] border ${statusBadge}`}>
                                                    {org.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button 
                                                    onClick={(e) => toggleMenu(org.id, e)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {/* Actions Dropdown */}
                                                {isMenuOpen && (
                                                    <div 
                                                        ref={menuRef}
                                                        className="absolute right-6 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                                                    >
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onView?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-500" />
                                                            View Details
                                                        </button>
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onEdit?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                                        >
                                                            <Edit3 className="w-4 h-4 text-emerald-500" />
                                                            Edit Profile
                                                        </button>
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onEdit?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-amber-50/70 hover:text-amber-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                                                        >
                                                            <KeyRound className="w-4 h-4 text-amber-500" />
                                                            Change Password
                                                        </button>
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onToggleStatus?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                                        >
                                                            <ShieldAlert className="w-4 h-4 text-purple-500" />
                                                            {org.status === 'Suspended' ? 'Restore Access' : 'Suspend'}
                                                        </button>
                                                        <div className="h-px bg-gray-100 my-1"></div>
                                                        <button 
                                                            onClick={() => { setOpenMenuId(null); onDelete?.(org); }}
                                                            className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
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
        </div>
    );
};