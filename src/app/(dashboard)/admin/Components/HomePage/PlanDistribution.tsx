"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, PieChart } from 'lucide-react';

const plans = [
    { name: 'Free', count: 12, percentage: '30%', color: 'bg-gray-400' },
    { name: 'Starter', count: 18, percentage: '45%', color: 'bg-blue-500' },
    { name: 'Business', count: 24, percentage: '75%', color: 'bg-[#00B050]' },
    { name: 'Enterprise', count: 9, percentage: '25%', color: 'bg-amber-500' },
];

export const PlanDistribution = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between h-full space-y-6"
        >
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-bold text-gray-900">Plan Distribution</h3>
                    <PieChart className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-4">
                    {plans.map((plan, index) => (
                        <div key={index} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-gray-600">{plan.name}</span>
                                <span className="text-gray-900 font-bold">{plan.count}</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: plan.percentage }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`h-full rounded-full ${plan.color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Churn Rate Widget */}
            <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-medium text-gray-500">Platform Churn Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-2xl font-extrabold text-gray-900">2.4%</h4>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#00B050] font-semibold mt-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>0.3% decrease from last month</span>
                </div>
            </div>
        </motion.div>
    );
};