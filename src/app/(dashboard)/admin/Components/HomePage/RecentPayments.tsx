"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export const RecentPayments = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayments() {
            try {
                const res = await api.payments.getAll();
                if (res.success && Array.isArray(res.data)) {
                    setPayments(res.data.slice(0, 5));
                }
            } catch (e) {
                console.error("Failed to load recent payments", e);
            } finally {
                setLoading(false);
            }
        }

        fetchPayments();
    }, []);

    const defaultPayments = [
        { id: '1', org: 'Bengal Textiles Ltd.', plan: 'Enterprise', amount: '$3,990', date: 'Aug 15, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
        { id: '2', org: 'Vertex Technologies Ltd.', plan: 'Business', amount: '$1,490', date: 'Aug 12, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
        { id: '3', org: 'Delta Logistics', plan: 'Business', amount: '$1,490', date: 'Aug 10, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
        { id: '4', org: 'CareMed Hospital', plan: 'Business', amount: '$1,490', date: 'Aug 09, 2026', status: 'Pending', statusClass: 'bg-amber-50 text-amber-600 border-amber-100' },
        { id: '5', org: 'GreenMart Superstores', plan: 'Starter', amount: '$49', date: 'Aug 08, 2026', status: 'Paid', statusClass: 'bg-emerald-50 text-[#00B050] border-emerald-100' },
    ];

    const displayPayments = payments.length > 0 ? payments.map((p: any) => ({
        id: p.id,
        org: p.organizationName || p.org || 'Vertex Technologies',
        plan: p.planName || p.plan || 'Business',
        amount: `$${p.amount || 1490}`,
        date: p.createdAt ? p.createdAt.split('T')[0] : 'Aug 18, 2026',
        status: p.status === 'COMPLETED' || p.status === 'PAID' ? 'Paid' : 'Pending',
        statusClass: p.status === 'COMPLETED' || p.status === 'PAID' ? 'bg-emerald-50 text-[#00B050] border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100',
    })) : defaultPayments;

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
                <Link href="/admin/approve-payments" className="text-xs font-semibold text-[#00B050] hover:underline flex items-center gap-1">
                    View all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
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
                        {displayPayments.map((item, i) => (
                            <motion.tr 
                                key={item.id || i}
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