"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export const SuspensionNoticeCard = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-emerald-50/60 border border-emerald-200/60 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-[#00B050] shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-900">Suspend / restore organizations</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Manage access for non-paying or violating tenants.</p>
                </div>
            </div>
            <button className="bg-white hover:bg-emerald-50 text-gray-700 font-semibold text-xs px-4 py-2 rounded-xl border border-emerald-200/80 shadow-sm transition-colors whitespace-nowrap">
                View Suspension Log
            </button>
        </motion.div>
    );
};