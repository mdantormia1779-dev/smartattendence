'use client';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP ScrollTrigger রেজিস্টার করা হলো
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const stepsData = [
    {
        number: "01",
        title: "Face Verification",
        description: "Employees scan their face with anti-spoofing liveness detection."
    },
    {
        number: "02",
        title: "GPS Verification",
        description: "Location confirmed within the branch geo-fence radius."
    },
    {
        number: "03",
        title: "Optional Biometric",
        description: "Fingerprint confirmation for high-security branches."
    },
    {
        number: "04",
        title: "Check-in Recorded",
        description: "Attendance logged instantly with a real-time record."
    }
];

const HowItWorks = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // সেকশন হেডার অ্যানিমেশন
            gsap.fromTo(
                ".how-header",
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

            // ৪টি স্টেপ কার্ড একটার পর একটা স্ট্যাগার ইফেক্টে অ্যানিমেট হবে
            gsap.fromTo(
                ".step-card",
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2, // প্রতিটি কার্ডের মাঝে অ্যানিমেশনের বিরতি
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".steps-grid",
                        start: "top 85%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="how-it-works" className="w-full bg-white py-20 px-6 md:px-12">
            
            {/* Section Header */}
            <div className="how-header max-w-6xl mx-auto text-center space-y-4 mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    How it works
                </span>
                
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    A secure check-in, in seconds
                </h2>
            </div>

            {/* Steps Cards Grid */}
            <div className="steps-grid max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stepsData.map((step, index) => (
                    <div 
                        key={index} 
                        className="step-card bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            {/* Step Number */}
                            <div className="text-3xl md:text-4xl font-bold text-[#00B050]">
                                {step.number}
                            </div>

                            {/* Step Title */}
                            <h3 className="text-xl font-bold text-gray-900">
                                {step.title}
                            </h3>

                            {/* Step Description */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default HowItWorks;