"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight } from 'lucide-react';

const payments = [
    { org: 'Bengal Textiles Ltd.', plan: 'Enterprise', amount: '$3,990', date: 'Aug 15, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
    { org: 'Vertex Technologies Ltd.', plan: 'Business', amount: '$1,490', date: 'Aug 12, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
    { org: 'Delta Logistics', plan: 'Business', amount: '$1,490', date: 'Aug 10, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
    { org: 'CareMed Hospital', plan: 'Business', amount: '$1,490', date: 'Aug 09, 2026', status: 'Pending', statusClass: 'bg-amber-50 text-amber-600 border-amber-100' },
    { org: 'GreenMart Superstores', plan: 'Starter', amount: '$49', date: 'Aug 08, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
];

export const RecentPayments = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Recent Payments</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Latest transactions processed across organizations</p>
                </div>
                <button className="text-xs font-semibold text-[#00B050] hover:underline flex items-center gap-1">
                    View all <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/80 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                        <tr>
                            <th className="px-4 py-3 rounded-l-xl">Organization</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 rounded-r-xl">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                        {payments.map((item, i) => (
                            <motion.tr 
                                key={i}
                                whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                                className="transition-colors font-medium"
                            >
                                <td className="px-4 py-4 text-gray-900 font-semibold flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00B050] flex items-center justify-center shrink-0">
                                        <CreditCard className="w-3.5 h-3.5" />
                                    </div>
                                    {item.org}
                                </td>
                                <td className="px-4 py-4 text-gray-500">{item.plan}</td>
                                <td className="px-4 py-4 text-gray-900 font-bold">{item.amount}</td>
                                <td className="px-4 py-4 text-gray-500">{item.date}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${item.statusClass}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};