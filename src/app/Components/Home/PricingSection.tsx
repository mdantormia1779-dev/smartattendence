'use client';
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pricingPlans, Plan } from '../../../../src/data/pricingData';
import { PricingCard } from './PricingCard';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState<boolean>(false);
    const sectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".pricing-header",
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    }
                }
            );

            gsap.fromTo(
                ".pricing-card",
                { y: 70, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".pricing-grid",
                        start: "top 85%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

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
                {pricingPlans.map((plan: Plan, index: number) => (
                    <PricingCard key={index} plan={plan} isYearly={isYearly} />
                ))}
            </div>
        </section>
    );
};

export default PricingSection;