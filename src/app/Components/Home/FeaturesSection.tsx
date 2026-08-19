'use client';
import React, { useEffect, useRef } from 'react';
import { ScanFace, MapPin, Fingerprint, WalletCards, CalendarDays, BarChart3 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP ScrollTrigger রেজিস্টার করা হলো
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const featuresData = [
    {
        icon: <ScanFace className="w-6 h-6 text-[#00B050]" />,
        iconBg: "bg-[#00B050]/10",
        title: "Face Recognition",
        description: "Anti-spoofing face verification with liveness detection and confidence scoring for instant check-ins."
    },
    {
        icon: <MapPin className="w-6 h-6 text-[#00A8CC]" />,
        iconBg: "bg-[#00A8CC]/10",
        title: "GPS Geo-Fencing",
        description: "Verify attendance only within branch radius with location and branch-based checks."
    },
    {
        icon: <Fingerprint className="w-6 h-6 text-[#D97706]" />,
        iconBg: "bg-[#D97706]/10",
        title: "Fingerprint & Devices",
        description: "Biometric device integration and external hardware support for factory floors."
    },
    {
        icon: <WalletCards className="w-6 h-6 text-[#00B050]" />,
        iconBg: "bg-[#00B050]/10",
        title: "Payroll & Payslips",
        description: "Automatic salary, overtime and deduction calculation with one-click payslips."
    },
    {
        icon: <CalendarDays className="w-6 h-6 text-[#00A8CC]" />,
        iconBg: "bg-[#00A8CC]/10",
        title: "Leave & Shifts",
        description: "Full leave workflow and flexible, rotational, and overtime-aware shift management."
    },
    {
        icon: <BarChart3 className="w-6 h-6 text-[#D97706]" />,
        iconBg: "bg-[#D97706]/10",
        title: "Reports & Analytics",
        description: "Daily, weekly and monthly reports plus a live analytics dashboard for every role."
    }
];

const FeaturesSection = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // সেকশন হেডার অ্যানিমেশন
            gsap.fromTo(
                ".feature-header",
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

            // ফিচার কার্ডগুলো একটার পর একটা (Stagger) অ্যানিমেট হবে
            gsap.fromTo(
                ".feature-card",
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.15, // প্রতিটি কার্ডের মাঝে সামান্য বিরতি
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".features-grid",
                        start: "top 85%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="features" className="w-full bg-[#FBF9F5] py-20 px-6 md:px-12">
            <div className="feature-header max-w-6xl mx-auto text-center space-y-4 mb-16">
                {/* Small Top Tag */}
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    Features
                </span>
                
                {/* Main Heading */}
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Everything attendance needs, in one <br className="hidden sm:inline" /> place
                </h2>
                
                {/* Subtitle */}
                <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
                    From face scan to payslip, manage the full employee journey without juggling tools.
                </p>
            </div>

            {/* Cards Grid (3 columns on desktop, 1 on mobile) */}
            <div className="features-grid max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuresData.map((feature, index) => (
                    <div 
                        key={index} 
                        className="feature-card bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                    >
                        <div className="space-y-4">
                            {/* Icon Box with Hover Scale Effect */}
                            <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                {feature.icon}
                            </div>

                            {/* Card Title */}
                            <h3 className="text-xl font-bold text-gray-900">
                                {feature.title}
                            </h3>

                            {/* Card Description */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;