"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, PieChart, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';

interface PlanItem {
    name: string;
    tier: string;
    count: number;
    percentage: string;
    color: string;
}

export const PlanDistribution: React.FC = () => {
    const [plans, setPlans] = useState<PlanItem[]>([
        { name: 'Free Tier', tier: 'FREE', count: 0, percentage: '0%', color: 'bg-gray-400' },
        { name: 'Starter Plan', tier: 'STARTER', count: 0, percentage: '0%', color: 'bg-blue-500' },
        { name: 'Business Plan', tier: 'BUSINESS', count: 0, percentage: '0%', color: 'bg-[#00B050]' },
        { name: 'Enterprise Plan', tier: 'ENTERPRISE', count: 0, percentage: '0%', color: 'bg-amber-500' },
    ]);
    const [churnRate, setChurnRate] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        const fetchPlanData = async () => {
            try {
                setIsLoading(true);
                const res = await api.analytics.admin();
                if (isMounted && res.success && res.data) {
                    if (Array.isArray(res.data.planDistribution) && res.data.planDistribution.length > 0) {
                        setPlans(res.data.planDistribution);
                    }
                    if (typeof res.data.churnRate === 'number') {
                        setChurnRate(res.data.churnRate);
                    }
                }
            } catch (err) {
                console.error("Failed to load plan distribution", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchPlanData();
        return () => {
            isMounted = false;
        };
    }, []);

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
                    <PieChart className="w-4 h-4 text-[#00B050]" />
                </div>

                {isLoading ? (
                    <div className="h-40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-[#00B050]" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {plans.map((plan, index) => (
                            <div key={plan.tier || index} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-gray-600">{plan.name}</span>
                                    <span className="text-gray-900 font-bold">
                                        {plan.count} ({plan.percentage})
                                    </span>
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
                )}
            </div>

            {/* Churn Rate Widget */}
            <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-medium text-gray-500">Platform Inactivity / Churn Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-2xl font-extrabold text-gray-900">{churnRate}%</h4>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#00B050] font-semibold mt-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Real-time subscription status</span>
                </div>
            </div>
        </motion.div>
    );
};