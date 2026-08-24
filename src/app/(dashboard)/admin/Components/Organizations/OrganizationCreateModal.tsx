"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Plus, Loader2, ShieldCheck, Globe, Clock, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';

interface OrganizationCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newOrgData: any) => Promise<void>;
}

export const OrganizationCreateModal: React.FC<OrganizationCreateModalProps> = ({
    isOpen,
    onClose,
    onSave
}) => {
    // 1. Organization Information
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [customLogoUrl, setCustomLogoUrl] = useState('');
    const [industry, setIndustry] = useState('Information Technology');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    
    // 2. Operational & Regional Settings
    const [country, setCountry] = useState('Bangladesh');
    const [language, setLanguage] = useState('English');
    const [currency, setCurrency] = useState('BDT (৳)');
    const [timezone, setTimezone] = useState('Asia/Dhaka (GMT+6)');
    const [workingDays, setWorkingDays] = useState('Sun - Thu');
    const [defaultOfficeStart, setDefaultOfficeStart] = useState('09:00 AM');
    const [defaultOfficeEnd, setDefaultOfficeEnd] = useState('05:00 PM');
    const [planTier, setPlanTier] = useState<'FREE' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE'>('BUSINESS');
    const [defaultGeofenceM, setDefaultGeofenceM] = useState(120);

    // 3. Primary Admin Account Credentials
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setSlug(autoSlug);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!name.trim()) {
            setError('Company / Organization name is required.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setError('Valid official company email is required.');
            return;
        }
        if (adminEmail && (!adminPassword || adminPassword.length < 6)) {
            setError('Admin password must be at least 6 characters.');
            return;
        }

        try {
            setIsSubmitting(true);
            await onSave({
                name: name.trim(),
                slug: slug.trim() || `org-${Date.now()}`,
                customLogoUrl: customLogoUrl.trim() || undefined,
                industry,
                email: email.trim(),
                phone: phone.trim() || undefined,
                website: website.trim() || undefined,
                address: address.trim() || undefined,
                country,
                language,
                currency,
                timezone,
                workingDays,
                defaultOfficeStart,
                defaultOfficeEnd,
                planTier,
                defaultGeofenceM: Number(defaultGeofenceM) || 120,
                adminName: adminName.trim() || undefined,
                adminEmail: adminEmail.trim() || undefined,
                adminPassword: adminPassword || undefined,
            });

            // Reset Form
            setName('');
            setSlug('');
            setCustomLogoUrl('');
            setEmail('');
            setPhone('');
            setWebsite('');
            setAddress('');
            setAdminName('');
            setAdminEmail('');
            setAdminPassword('');
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to create organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0"
                />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 text-left my-6"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Create New Organization</h3>
                                <p className="text-xs text-gray-400">Add a new enterprise tenant with full regional & admin configurations</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
                        {/* Section 1: Organization Information */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#00B050]">
                                <Building2 className="w-4 h-4" /> 1. Organization Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Company Name *</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={handleNameChange}
                                        placeholder="e.g. Apex Technologies Ltd."
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">URL Identifier / Slug *</label>
                                    <input 
                                        type="text" 
                                        value={slug} 
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="e.g. apex-tech"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Company Logo (Image URL)</label>
                                    <input 
                                        type="text" 
                                        value={customLogoUrl} 
                                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Industry / Category *</label>
                                    <select 
                                        value={industry} 
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Software & IT">Software & IT</option>
                                        <option value="Manufacturing">Manufacturing & Garments</option>
                                        <option value="Retail & Superstore">Retail & Superstore</option>
                                        <option value="Healthcare">Healthcare & Hospital</option>
                                        <option value="Education">Education & University</option>
                                        <option value="Banking & Finance">Banking & Finance</option>
                                        <option value="Logistics">Logistics & Supply Chain</option>
                                        <option value="General Corporate">General Corporate</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Official Company Email *</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contact@company.com"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Company Phone *</label>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+880 1700-000000"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Official Website</label>
                                    <input 
                                        type="text" 
                                        value={website} 
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://company.com"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Head Office Address *</label>
                                    <input 
                                        type="text" 
                                        value={address} 
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Level 5, Gulshan-2, Dhaka"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Regional & Operational Parameters */}
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#00B050]">
                                <Globe className="w-4 h-4" /> 2. Regional & Operational Settings
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Country</label>
                                    <select 
                                        value={country} 
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Bangladesh">Bangladesh</option>
                                        <option value="India">India</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="United Arab Emirates">United Arab Emirates</option>
                                        <option value="Singapore">Singapore</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Language</label>
                                    <select 
                                        value={language} 
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="English">English</option>
                                        <option value="Bengali">Bengali</option>
                                        <option value="Arabic">Arabic</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Currency</label>
                                    <select 
                                        value={currency} 
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="BDT (৳)">BDT (৳)</option>
                                        <option value="USD ($)">USD ($)</option>
                                        <option value="EUR (€)">EUR (€)</option>
                                        <option value="GBP (£)">GBP (£)</option>
                                        <option value="AED (د.إ)">AED (د.إ)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Time Zone</label>
                                    <select 
                                        value={timezone} 
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Asia/Dhaka (GMT+6)">GMT+6:00 (Dhaka)</option>
                                        <option value="Asia/Kolkata (GMT+5:30)">GMT+5:30 (India)</option>
                                        <option value="Asia/Dubai (GMT+4)">GMT+4:00 (Dubai)</option>
                                        <option value="Europe/London (GMT+0)">GMT+0:00 (London)</option>
                                        <option value="America/New_York (GMT-5)">GMT-5:00 (New York)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Working Days</label>
                                    <select 
                                        value={workingDays} 
                                        onChange={(e) => setWorkingDays(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Sun - Thu">Sunday – Thursday (Standard)</option>
                                        <option value="Sat - Thu">Saturday – Thursday (6 Days)</option>
                                        <option value="Mon - Fri">Monday – Friday (Global)</option>
                                        <option value="Mon - Sat">Monday – Saturday (Retail)</option>
                                        <option value="Sun - Sat">24/7 Continuous (Hospitality)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">SaaS Plan Tier</label>
                                    <select 
                                        value={planTier} 
                                        onChange={(e) => setPlanTier(e.target.value as any)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="FREE">Free Tier (20 Employees, 1 Branch)</option>
                                        <option value="STARTER">Starter Plan (100 Employees, 5 Branches)</option>
                                        <option value="BUSINESS">Business Plan (500 Employees, 20 Branches)</option>
                                        <option value="ENTERPRISE">Enterprise Plan (Unlimited Quotas)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Office Start Time</label>
                                    <input 
                                        type="text" 
                                        value={defaultOfficeStart} 
                                        onChange={(e) => setDefaultOfficeStart(e.target.value)}
                                        placeholder="09:00 AM"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Office End Time</label>
                                    <input 
                                        type="text" 
                                        value={defaultOfficeEnd} 
                                        onChange={(e) => setDefaultOfficeEnd(e.target.value)}
                                        placeholder="05:00 PM"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Default Geofence Radius (Meters)</label>
                                    <input 
                                        type="number" 
                                        min="20"
                                        max="1000"
                                        value={defaultGeofenceM} 
                                        onChange={(e) => setDefaultGeofenceM(Number(e.target.value))}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Primary Organization Admin Login Credentials */}
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#00B050]">
                                <ShieldCheck className="w-4 h-4" /> 3. Primary Organization Admin Login Account
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Admin Full Name *</label>
                                    <input 
                                        type="text" 
                                        value={adminName} 
                                        onChange={(e) => setAdminName(e.target.value)}
                                        placeholder="e.g. Sarah Rahman"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Admin Sign-in Email *</label>
                                    <input 
                                        type="email" 
                                        value={adminEmail} 
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        placeholder="admin@company.com"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Admin Password * (Min 6 chars)</label>
                                    <input 
                                        type="password" 
                                        value={adminPassword} 
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00B050] hover:bg-[#009845] text-white font-bold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating Organization...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Create & Activate Organization
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
