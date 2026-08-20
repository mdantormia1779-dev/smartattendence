"use client";
import React from 'react';
import { motion } from 'framer-motion';

const organizations = [
    { name: 'Vertex Technologies Ltd.', plan: 'Business', employees: '291 employees', initials: 'VT', bg: 'bg-emerald-600' },
    { name: 'Bengal Textiles Ltd.', plan: 'Enterprise', employees: '1240 employees', initials: 'BT', bg: 'bg-amber-600' },
    { name: 'GreenMart Superstores', plan: 'Starter', employees: '84 employees', initials: 'GS', bg: 'bg-teal-600' },
    { name: 'CareMed Hospital', plan: 'Business', employees: '460 employees', initials: 'CH', bg: 'bg-indigo-600' },
];

export const RecentOrganizations = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-full flex flex-col justify-between"
        >
            <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Recent Organizations</h3>
                <p className="text-xs text-gray-400 mb-6">Newly onboarded enterprise clients</p>

                <div className="space-y-4">
                    {organizations.map((org, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ x: 3 }}
                            className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100"
                        >
                            <div className={`w-10 h-10 rounded-xl ${org.bg} text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0`}>
                                {org.initials}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="text-xs font-bold text-gray-900 truncate">{org.name}</h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    <span className="font-semibold text-gray-600">{org.plan}</span> · {org.employees}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <span className="text-[11px] text-gray-400 font-medium">Showing 4 of 63 active organizations</span>
            </div>
        </motion.div>
    );
};