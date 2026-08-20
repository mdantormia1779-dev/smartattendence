"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const chartData = [
    { month: 'Mar', amount: '$8.2k', height: '45%' },
    { month: 'Apr', amount: '$9.5k', height: '55%' },
    { month: 'May', amount: '$10.8k', height: '65%' },
    { month: 'Jun', amount: '$12.1k', height: '75%' },
    { month: 'Jul', amount: '$13.5k', height: '85%' },
    { month: 'Aug', amount: '$16.8k', height: '100%' },
];

export const RevenueChart = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between h-full"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Monthly Recurring Revenue</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Growth trajectory over the last 6 months</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-[#00B050] border border-emerald-100 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 2026
                </span>
            </div>

            <div className="relative h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-dashed border-gray-200">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                    {['$18k', '$13.5k', '$9k', '$4.5k', '$0k'].map((val, idx) => (
                        <div key={idx} className="border-b border-gray-100 w-full text-[10px] text-gray-400 text-right pr-1">{val}</div>
                    ))}
                </div>

                {chartData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full justify-end group">
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: item.height }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="w-full max-w-[48px] bg-gradient-to-t from-emerald-600 to-[#00B050] rounded-t-2xl transition-all shadow-[0_4px_12px_rgba(0,176,80,0.2)] group-hover:brightness-110"
                        />
                        <span className="text-xs font-semibold text-gray-600 mt-1">{item.month}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};