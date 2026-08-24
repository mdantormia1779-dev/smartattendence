'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Plan, StatItem } from '@/data/pricingData';

interface PricingCardProps {
    plan: Plan;
    isYearly: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isYearly }) => {
    const router = useRouter();

    const isFree = plan.name.toLowerCase().includes("free") || plan.monthlyPrice === 0;

    const currentPrice = isFree
        ? "৳0" 
        : isYearly 
            ? `৳${Number(plan.yearlyPrice || 0).toLocaleString()}` 
            : `৳${Number(plan.monthlyPrice || 0).toLocaleString()}`;
    
    const currentPeriod = isFree 
        ? plan.periodMonthly 
        : isYearly 
            ? plan.periodYearly 
            : plan.periodMonthly;

    const handlePlanSelect = () => {
        const billingCycle = isYearly ? 'yearly' : 'monthly';
        const planSlug = plan.name.toLowerCase().replace(/\s+plan/g, "").trim();
        const selectedAmount = isYearly ? (plan.yearlyPrice || 0) : (plan.monthlyPrice || 0);
        
        if (isFree) {
            router.push(`/signup?plan=free`);
        } else {
            router.push(`/payment?plan=${encodeURIComponent(planSlug)}&billing=${billingCycle}&amount=${encodeURIComponent(selectedAmount)}`);
        }
    };

    return (
        <div className={`pricing-card bg-white rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-2 ${
            plan.popular 
                ? 'border-2 border-[#00B050] shadow-xl ring-2 ring-[#00B050]/20 lg:-translate-y-2' 
                : 'border border-gray-200 shadow-sm hover:shadow-lg'
        }`}>
            {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00B050] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Most popular
                </span>
            )}

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-gray-900">{currentPrice}</span>
                        <span className="text-sm text-gray-500">{currentPeriod}</span>
                    </div>
                </div>

                {Array.isArray(plan.stats) && plan.stats.length > 0 && (
                    <div className="bg-[#FBF9F5] rounded-xl p-4 grid grid-cols-2 gap-3 border border-gray-100">
                        {plan.stats.map((stat: StatItem, sIndex: number) => (
                            <div key={sIndex} className="space-y-0.5">
                                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <ul className="space-y-3 pt-2">
                        {plan.features.map((feature: string, fIndex: number) => (
                            <li key={fIndex} className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="w-5 h-5 rounded-full bg-[#00B050]/10 flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5 text-[#00B050]" />
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="pt-8">
                <button 
                    onClick={handlePlanSelect}
                    className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer ${plan.buttonStyle}`}
                >
                    {plan.buttonText || (isFree ? "Start Free" : "Choose Plan")}
                </button>
            </div>
        </div>
    );
};