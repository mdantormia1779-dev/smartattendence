"use client";
import React, { useState } from 'react';
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

const OrgAvatar: React.FC<{ name: string; logo?: string; bg?: string; initials?: string }> = ({
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
        .toUpperCase() || 'O';

    const isValidUrl = logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'));

    if (isValidUrl && !imgFailed) {
        return (
            <img 
                src={logo} 
                alt={name} 
                className="w-14 h-14 rounded-2xl object-cover shadow-md border border-gray-100 shrink-0" 
                onError={() => setImgFailed(true)}
            />
        );
    }

    return (
        <div className={`w-14 h-14 rounded-2xl ${bg || 'bg-[#00B050]'} text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0`}>
            {computedInitials}
        </div>
    );
};

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
                            <OrgAvatar 
                                name={organization.name}
                                logo={organization.logo}
                                bg={organization.bg}
                                initials={organization.initials}
                            />
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
                            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
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
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Employees</span>
                                    <Users className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <div className="text-xs font-bold text-gray-900">{(organization.employees ?? 0).toLocaleString()} Users</div>
                            </div>

                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Branches</span>
                                    <GitBranch className="w-3.5 h-3.5 text-purple-500" />
                                </div>
                                <div className="text-xs font-bold text-gray-900">{organization.branches ?? 0} Active</div>
                            </div>

                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Status</span>
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#00B050]" />
                                </div>
                                <div className={`text-xs font-bold ${
                                    organization.status === 'Active' ? 'text-[#00B050]' : 
                                    organization.status === 'Trial' ? 'text-amber-600' : 'text-rose-600'
                                }`}>
                                    {organization.status}
                                </div>
                            </div>
                        </div>

                        {/* 2. Contact & Address Grid */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-[#00B050]" /> Contact & Head Office
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-semibold uppercase">Official Email</div>
                                        <div className="text-xs font-medium text-gray-800 break-all">{organization.email || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-semibold uppercase">Phone Number</div>
                                        <div className="text-xs font-medium text-gray-800">{organization.phone || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Globe className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-semibold uppercase">Website</div>
                                        <div className="text-xs font-medium text-[#00B050] truncate">
                                            {organization.website ? (
                                                <a href={organization.website} target="_blank" rel="noreferrer" className="hover:underline">
                                                    {organization.website}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Not configured</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-semibold uppercase">Office Address</div>
                                        <div className="text-xs font-medium text-gray-800">{organization.address || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Operational & Regional Preferences Grid */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <Globe2 className="w-3.5 h-3.5 text-[#00B050]" /> Operations & Regional Settings
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase">Country</div>
                                    <div className="text-xs font-bold text-gray-800 mt-0.5">{organization.country}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase">Language</div>
                                    <div className="text-xs font-bold text-gray-800 mt-0.5">{organization.language}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase">Currency</div>
                                    <div className="text-xs font-bold text-gray-800 mt-0.5">{organization.currency}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase">Time Zone</div>
                                    <div className="text-xs font-bold text-gray-800 mt-0.5">{organization.timeZone}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase">Working Days</div>
                                    <div className="text-xs font-bold text-gray-800 mt-0.5">{organization.workingDays}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase">Office Hours</div>
                                    <div className="text-xs font-bold text-gray-800 mt-0.5">{organization.officeHours}</div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Metadata Details */}
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Registered: {organization.joined}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> MRR Estimate: <strong>{organization.revenue}/mo</strong>
                            </span>
                        </div>

                    </div>

                    {/* Footer Close Button */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                            Close Details
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};