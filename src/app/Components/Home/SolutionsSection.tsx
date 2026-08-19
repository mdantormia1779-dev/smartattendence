'use client';
import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Users, ScanFace, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP ScrollTrigger রেজিস্টার করা হলো
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const solutionsData = [
    {
        icon: <ShieldCheck className="w-6 h-6 text-[#00B050]" />,
        iconBg: "bg-[#00B050]/10",
        title: "Organization Admin",
        description: "Full control over branches, departments, managers, payroll and reports.",
        features: [
            "Create branches & departments",
            "Manage payroll & payslips",
            "Advanced analytics"
        ]
    },
    {
        icon: <Users className="w-6 h-6 text-[#00B050]" />,
        iconBg: "bg-[#00B050]/10",
        title: "Manager",
        description: "Oversee employees, approve leaves, manage shifts and monitor attendance.",
        features: [
            "Approve leave requests",
            "Live attendance monitoring",
            "Shift management"
        ]
    },
    {
        icon: <ScanFace className="w-6 h-6 text-[#00B050]" />,
        iconBg: "bg-[#00B050]/10",
        title: "Employee",
        description: "Check in/out with a scan, apply for leave, and download payslips anytime.",
        features: [
            "Face + GPS check-in",
            "Leave applications",
            "Salary & payslip access"
        ]
    }
];

const SolutionsSection = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // সেকশন হেডার অ্যানিমেশন
            gsap.fromTo(
                ".solutions-header",
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

            // কার্ডগুলোর অ্যাডভান্সড স্ট্যাগারড অ্যানিমেশন (Scale + Fade-in)
            gsap.fromTo(
                ".solutions-card",
                { y: 80, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.9,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".solutions-grid",
                        start: "top 85%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="solutions" className="w-full bg-[#FBF9F5] py-20 px-6 md:px-12">
            
            {/* Section Header */}
            <div className="solutions-header max-w-6xl mx-auto text-center space-y-4 mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    Solutions
                </span>
                
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Built for every role
                </h2>
                
                <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
                    Role-based access keeps each team focused on what matters.
                </p>
            </div>

            {/* Cards Grid (3 Columns) */}
            <div className="solutions-grid max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {solutionsData.map((item, index) => (
                    <div 
                        key={index} 
                        className="solutions-card bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group"
                    >
                        <div className="space-y-6">
                            {/* Icon Box with Smooth Hover Zoom & Rotate */}
                            <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                {item.icon}
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00B050] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            {/* Feature Checklist */}
                            <ul className="space-y-3 pt-2 border-t border-gray-100">
                                {item.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-center gap-3 text-sm text-gray-700">
                                        <span className="w-5 h-5 rounded-full bg-[#00B050]/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-[#00B050]" />
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default SolutionsSection;