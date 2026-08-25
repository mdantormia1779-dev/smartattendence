'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pricingPlans, Plan } from '@/data/pricingData';
import { PricingCard } from './PricingCard';
import { api } from '@/lib/api-client';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const PricingSection: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>(pricingPlans);
    const [isYearly, setIsYearly] = useState<boolean>(false);
    const sectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchLivePlans() {
            try {
                const res = await api.subscriptions.getPlans();
                if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const mapped: Plan[] = res.data.map((p: any) => {
                        const typeTier = (p.type || p.tier || 'STARTER').toUpperCase();
                        const monthlyPrice = Number(p.price || p.monthlyPrice || 0);
                        const yearlyPrice = Number(p.yearlyPrice || monthlyPrice * 10);
                        const isFree = typeTier === 'FREE' || monthlyPrice === 0;

                        return {
                            name: p.name || (typeTier.charAt(0) + typeTier.slice(1).toLowerCase()),
                            monthlyPrice,
                            yearlyPrice,
                            periodMonthly: isFree ? 'for 30 days' : '/ month',
                            periodYearly: isFree ? 'for 30 days' : '/ year',
                            popular: typeTier === 'BUSINESS',
                            stats: [
                                { label: 'Branches', value: p.maxBranches ? String(p.maxBranches) : 'Unlimited' },
                                { label: 'Managers', value: p.maxManagers ? String(p.maxManagers) : 'Unlimited' },
                                { label: 'Employees', value: p.maxEmployees ? String(p.maxEmployees) : 'Unlimited' },
                            ],
                            features: [
                                p.faceRecognition || p.hasFaceRecog ? 'Face Recognition' : null,
                                p.gpsVerification || p.hasGpsGeofence ? 'GPS Verification' : null,
                                p.payroll || p.hasPayroll ? 'Payroll & Payslips' : null,
                                p.analytics || p.hasAnalytics ? 'Advanced Analytics' : null,
                                p.whiteLabel || p.hasWhiteLabel ? 'White Label' : null,
                                p.customDomain || p.hasCustomDomain ? 'Custom Domain' : null,
                                p.prioritySupport ? '24/7 Priority Support' : null,
                            ].filter(Boolean) as string[],
                            buttonText: isFree ? 'Start 30-Day Free Trial' : 'Choose Plan',
                            buttonStyle: typeTier === 'BUSINESS'
                                ? 'bg-[#00B050] hover:bg-[#009644] text-white'
                                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
                        };
                    });

                    if (mapped.length > 0) {
                        setPlans(mapped);
                    }
                }
            } catch (e) {
                console.error('Failed to load dynamic pricing plans', e);
            }
        }

        fetchLivePlans();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".pricing-header",
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                    }
                }
            );

            gsap.fromTo(
                ".pricing-card",
                { y: 60, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".pricing-grid",
                        start: "top 90%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, [plans]);

    return (
        <section ref={sectionRef} id="pricing" className="w-full bg-white py-20 px-6 md:px-12">
            <div className="pricing-header max-w-6xl mx-auto text-center space-y-4 mb-12">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    Pricing
                </span>
                
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Simple plans that scale with you
                </h2>
                
                <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
                    Start free and upgrade as your team grows. No hidden fees.
                </p>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <span className={`text-sm font-semibold ${!isYearly ? "text-gray-900" : "text-gray-500"}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className={`w-14 h-8 rounded-full p-1 relative transition-colors duration-300 focus:outline-none cursor-pointer ${
                            isYearly ? "bg-[#00B050]" : "bg-gray-200"
                        }`}
                        aria-label="Toggle annual billing"
                    >
                        <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                isYearly ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                    </button>
                    <span className={`text-sm font-semibold flex items-center gap-2 ${isYearly ? "text-gray-900" : "text-gray-500"}`}>
                        Yearly
                        <span className="bg-[#00B050]/10 text-[#00B050] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Save 20%
                        </span>
                    </span>
                </div>
            </div>

            <div className="pricing-grid max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map((plan: Plan, index: number) => (
                    <PricingCard key={`${plan.name}-${index}`} plan={plan} isYearly={isYearly} />
                ))}
            </div>
        </section>
    );
};

export default PricingSection;