"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
    Building2, 
    Network, 
    Briefcase, 
    Users, 
    ShieldCheck, 
    Wallet
} from 'lucide-react';

const platformStats = [
    { title: 'Organizations', count: '63', icon: Building2, color: 'text-emerald-500', glow: 'group-hover:shadow-emerald-500/10', border: 'hover:border-emerald-500/40' },
    { title: 'Branches', count: '214', icon: Network, color: 'text-blue-500', glow: 'group-hover:shadow-blue-500/10', border: 'hover:border-blue-500/40' },
    { title: 'Managers', count: '356', icon: Briefcase, color: 'text-purple-500', glow: 'group-hover:shadow-purple-500/10', border: 'hover:border-purple-500/40' },
    { title: 'Employees', count: '18,402', icon: Users, color: 'text-indigo-500', glow: 'group-hover:shadow-indigo-500/10', border: 'hover:border-indigo-500/40' },
    { title: 'Active Plans', count: '51', icon: ShieldCheck, color: 'text-teal-500', glow: 'group-hover:shadow-teal-500/10', border: 'hover:border-teal-500/40' },
    { title: 'Monthly Revenue', count: '$16,800', icon: Wallet, color: 'text-amber-500', glow: 'group-hover:shadow-amber-500/10', border: 'hover:border-amber-500/40' },
];

export const PlatformOverview = () => {
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