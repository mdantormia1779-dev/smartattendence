"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Save, Globe, Clock, MapPin, Layers, Loader2 } from 'lucide-react';
import { Organization } from './OrganizationTable';

interface OrganizationEditModalProps {
    organization: Organization | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedOrg: Organization) => Promise<void> | void;
}

export const OrganizationEditModal: React.FC<OrganizationEditModalProps> = ({
    organization,
    isOpen,
    onClose,
    onSave
}) => {
    // Form States
    const [name, setName] = useState('');
    const [logo, setLogo] = useState('');
    const [category, setCategory] = useState('Software & IT');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('Bangladesh');
    const [language, setLanguage] = useState('English');
    const [currency, setCurrency] = useState('BDT (৳)');
    const [timeZone, setTimeZone] = useState('Asia/Dhaka (GMT+6)');
    const [workingDays, setWorkingDays] = useState('Sun - Thu');
    const [plan, setPlan] = useState('Business');
    const [officeStart, setOfficeStart] = useState('09:00 AM');
    const [officeEnd, setOfficeEnd] = useState('05:00 PM');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (organization) {
            setName(organization.name || '');
            setLogo(organization.logo || '');
            setCategory(organization.category || 'Software & IT');
            setEmail(organization.email || '');
            setPhone(organization.phone || '');
            setWebsite(organization.website || '');
            setAddress(organization.address || '');
            setCountry(organization.country || 'Bangladesh');
            setLanguage(organization.language || 'English');
            setCurrency(organization.currency || 'BDT (৳)');
            setTimeZone(organization.timeZone || 'Asia/Dhaka (GMT+6)');
            setWorkingDays(organization.workingDays || 'Sun - Thu');
            setPlan(organization.plan || 'Business');

            if (organization.officeHours && organization.officeHours.includes(' - ')) {
                const parts = organization.officeHours.split(' - ');
                setOfficeStart(parts[0] || '09:00 AM');
                setOfficeEnd(parts[1] || '05:00 PM');
            } else {
                setOfficeStart('09:00 AM');
                setOfficeEnd('05:00 PM');
            }
        }
    }, [organization]);

    if (!isOpen || !organization) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Company Name is required.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            setError('Valid Company Email is required.');
            return;
        }

        try {
            setIsSubmitting(true);
            const updatedOrg: Organization = {
                ...organization,
                name: name.trim(),
                logo: logo.trim() || undefined,
                category,
                email: email.trim(),
                phone: phone.trim(),
                website: website.trim(),
                address: address.trim(),
                country,
                language,
                currency,
                timeZone,
                workingDays,
                plan,
                officeHours: `${officeStart.trim()} - ${officeEnd.trim()}`,
            };

            await onSave(updatedOrg);
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to update organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0"
                />

                {/* Modal Container */}
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
                                <h3 className="text-base font-bold text-gray-900">Edit Organization</h3>
                                <p className="text-xs text-gray-400">Update company profile, operations, and regional parameters</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
                        
                        {/* Section 1: Company Profile */}
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
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Company Logo (Image URL)</label>
                                    <input 
                                        type="text" 
                                        value={logo} 
                                        onChange={(e) => setLogo(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Industry / Category *</label>
                                    <select 
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)}
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
                                    <label className="block font-semibold text-gray-700 mb-1">Subscription Plan Tier</label>
                                    <select 
                                        value={plan} 
                                        onChange={(e) => setPlan(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    >
                                        <option value="Free">Free Tier</option>
                                        <option value="Starter">Starter Plan</option>
                                        <option value="Business">Business Plan</option>
                                        <option value="Enterprise">Enterprise Plan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Official Email *</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
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
                                    <label className="block font-semibold text-gray-700 mb-1">Head Office Address</label>
                                    <input 
                                        type="text" 
                                        value={address} 
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Level 5, Banani, Dhaka"
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
                                        value={timeZone} 
                                        onChange={(e) => setTimeZone(e.target.value)}
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
                                        <option value="Sun - Sat">24/7 Continuous</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Office Start Time</label>
                                    <input 
                                        type="text" 
                                        value={officeStart} 
                                        onChange={(e) => setOfficeStart(e.target.value)}
                                        placeholder="09:00 AM"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Office End Time</label>
                                    <input 
                                        type="text" 
                                        value={officeEnd} 
                                        onChange={(e) => setOfficeEnd(e.target.value)}
                                        placeholder="05:00 PM"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
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
                                className="px-6 py-2.5 rounded-xl bg-[#00B050] hover:bg-[#009845] text-white font-bold shadow-md shadow-[#00B050]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
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