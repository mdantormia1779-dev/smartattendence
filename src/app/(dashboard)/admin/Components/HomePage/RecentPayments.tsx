"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, Loader2, Inbox } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export const RecentPayments: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchPayments() {
            try {
                setLoading(true);
                const res = await api.payments.getAll();
                if (isMounted && res.success && Array.isArray(res.data)) {
                    setPayments(res.data.slice(0, 5));
                }
            } catch (e) {
                console.error("Failed to load recent payments", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchPayments();
        return () => {
            isMounted = false;
        };
    }, []);

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
                    <p className="text-xs text-gray-400 mt-0.5">Latest live transactions processed across organizations</p>
                </div>
                <Link href="/admin/approve-payments" className="text-xs font-semibold text-[#00B050] hover:underline flex items-center gap-1">
                    View all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {loading ? (
                <div className="h-44 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#00B050]" />
                </div>
            ) : payments.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2 border-b border-gray-50">
                    <Inbox className="w-8 h-8 stroke-1 text-gray-300" />
                    <p className="text-xs font-medium">No recent payment transactions recorded yet.</p>
                </div>
            ) : (
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
                            {payments.map((p, i) => {
                                const isApproved = p.status === 'APPROVED' || p.status === 'COMPLETED' || p.status === 'PAID';
                                const statusClass = isApproved
                                    ? 'bg-emerald-50 text-[#00B050] border-emerald-100'
                                    : p.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                    : 'bg-amber-50 text-amber-600 border-amber-100';

                                const formattedDate = p.createdAt
                                    ? (p.createdAt.includes('T') ? p.createdAt.split('T')[0] : p.createdAt)
                                    : 'N/A';

                                return (
                                    <motion.tr 
                                        key={p.id || i}
                                        whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                                        className="transition-colors font-medium"
                                    >
                                        <td className="px-4 py-4 text-gray-900 font-semibold flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00B050] flex items-center justify-center shrink-0">
                                                <CreditCard className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="truncate max-w-[180px]">{p.organizationName || p.org || 'Organization'}</span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">{p.planName || p.plan || 'Starter'}</td>
                                        <td className="px-4 py-4 text-gray-900 font-bold">${Number(p.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-gray-500">{formattedDate}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 rounded-full font-semibold border ${statusClass}`}>
                                                {p.status || 'PENDING'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};