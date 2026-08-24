"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

const OrgBadgeAvatar: React.FC<{ name: string; logo?: string }> = ({ name, logo }) => {
    const [failed, setFailed] = useState(false);
    const initials = (name || 'Org')
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'OG';

    const isValid = logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'));

    if (isValid && !failed) {
        return (
            <img 
                src={logo} 
                alt={name} 
                className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 border border-gray-100" 
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
            {initials}
        </div>
    );
};

export const RecentOrganizations: React.FC = () => {
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchOrgs() {
            try {
                setLoading(true);
                const res = await api.organizations.getAll();
                if (isMounted && res.success && Array.isArray(res.data)) {
                    setOrgs(res.data.slice(0, 4));
                }
            } catch (e) {
                console.error("Failed to load recent organizations", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchOrgs();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-full flex flex-col justify-between"
        >
            <div>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-gray-900">Recent Organizations</h3>
                    <Link href="/admin/create-organization" className="text-xs font-semibold text-[#00B050] hover:underline">
                        Manage
                    </Link>
                </div>
                <p className="text-xs text-gray-400 mb-6">Newly onboarded enterprise & business tenants</p>

                {loading ? (
                    <div className="h-44 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-[#00B050]" />
                    </div>
                ) : orgs.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Building2 className="w-8 h-8 stroke-1 text-gray-300" />
                        <p className="text-xs font-medium">No organizations onboarded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orgs.map((org, i) => {
                            const empCount = org.totalEmployees ?? org.employees ?? 0;
                            const planLabel = org.planTier || org.plan || 'Starter';

                            return (
                                <motion.div 
                                    key={org.id || i}
                                    whileHover={{ x: 3 }}
                                    className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <OrgBadgeAvatar name={org.name} logo={org.customLogoUrl || org.logo} />
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-xs font-bold text-gray-900 truncate">{org.name}</h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            <span className="font-semibold text-gray-700">{planLabel}</span> · {empCount.toLocaleString()} {empCount === 1 ? 'employee' : 'employees'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <span className="text-[11px] text-gray-400 font-medium">
                    {loading ? 'Checking records...' : `Showing ${orgs.length} recent live organizations`}
                </span>
            </div>
        </motion.div>
    );
};