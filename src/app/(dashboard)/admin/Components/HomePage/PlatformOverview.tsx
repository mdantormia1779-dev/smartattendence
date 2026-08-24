"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Building2, 
    Network, 
    Briefcase, 
    Users, 
    ShieldCheck, 
    Wallet,
    Loader2
} from 'lucide-react';
import { api } from '@/lib/api-client';

export const PlatformOverview = () => {
    const [stats, setStats] = useState({
        totalOrganizations: 0,
        totalBranches: 0,
        totalManagers: 0,
        totalEmployees: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOverview() {
            try {
                const res = await api.analytics.admin();
                if (res.success && res.data) {
                    setStats({
                        totalOrganizations: res.data.totalOrganizations ?? 0,
                        totalBranches: res.data.totalBranches ?? 0,
                        totalManagers: res.data.totalManagers ?? 0,
                        totalEmployees: res.data.totalEmployees ?? 0,
                        activeSubscriptions: res.data.activeSubscriptions ?? 0,
                        monthlyRevenue: res.data.monthlyRevenue ?? 0,
                    });
                }
            } catch (e) {
                console.error("Failed to load admin analytics", e);
            } finally {
                setLoading(false);
            }
        }

        fetchOverview();
    }, []);

    const platformStats = [
        { title: 'Organizations', count: stats.totalOrganizations.toString(), icon: Building2, color: 'text-emerald-500', glow: 'group-hover:shadow-emerald-500/10', border: 'hover:border-emerald-500/40' },
        { title: 'Branches', count: stats.totalBranches.toString(), icon: Network, color: 'text-blue-500', glow: 'group-hover:shadow-blue-500/10', border: 'hover:border-blue-500/40' },
        { title: 'Managers', count: stats.totalManagers.toString(), icon: Briefcase, color: 'text-purple-500', glow: 'group-hover:shadow-purple-500/10', border: 'hover:border-purple-500/40' },
        { title: 'Employees', count: stats.totalEmployees.toLocaleString(), icon: Users, color: 'text-indigo-500', glow: 'group-hover:shadow-indigo-500/10', border: 'hover:border-indigo-500/40' },
        { title: 'Active Plans', count: stats.activeSubscriptions.toString(), icon: ShieldCheck, color: 'text-teal-500', glow: 'group-hover:shadow-teal-500/10', border: 'hover:border-teal-500/40' },
        { title: 'Monthly Revenue', count: `$${stats.monthlyRevenue.toLocaleString()}`, icon: Wallet, color: 'text-amber-500', glow: 'group-hover:shadow-amber-500/10', border: 'hover:border-amber-500/40' },
    ];

    return (
        <div className="space-y-4 pt-4">
            <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Platform Overview</h2>
                <p className="text-xs text-gray-500 mt-0.5">Real-time health metrics of all organizations, subscriptions, and revenue.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {platformStats.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className={`bg-white p-5 rounded-[24px] border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex flex-col justify-between group transition-all duration-300 ${item.border} hover:shadow-xl ${item.glow} relative overflow-hidden`}
                        >
                            {/* Decorative top border gradient line */}
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gray-200 group-hover:via-current opacity-40 transition-all" />

                            <div className="flex items-center justify-between gap-2">
                                <div className={`w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-300 shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-600 transition-colors">Live</span>
                            </div>

                            <div className="mt-5">
                                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{item.count}</h3>
                                <p className="text-xs font-medium text-gray-500 mt-1">{item.title}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlatformOverview;