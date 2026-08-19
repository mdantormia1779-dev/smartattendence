"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP ScrollTrigger রেজিস্টার করা হলো
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const faqsData = [
    {
        question: "How does face recognition prevent fraud?",
        answer: "Every scan runs anti-spoofing with liveness detection, blink and head-movement checks, and returns a confidence score."
    },
    {
        question: "Can attendance be verified by location?",
        answer: "Yes, attendance can be strictly verified using GPS geo-fencing to ensure employees are within the designated branch radius."
    },
    {
        question: "Is payroll calculation automatic?",
        answer: "Yes, salary, overtime, and deductions are calculated automatically based on attendance logs, generating one-click payslips."
    },
    {
        question: "Can we add multiple branches?",
        answer: "Depending on your pricing plan, you can easily add, manage, and monitor multiple branches and departments from a single dashboard."
    }
];

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(0);
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // সেকশন হেডার অ্যানিমেশন
            gsap.fromTo(
                ".faq-header",
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

            // FAQ আইটেমগুলোর স্ট্যাগারড অ্যানিমেশন
            gsap.fromTo(
                ".faq-item",
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".faq-container",
                        start: "top 85%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" ref={sectionRef} className="w-full bg-[#FBF9F5] py-20 px-6 md:px-12">
            
            {/* Section Header */}
            <div className="faq-header max-w-3xl mx-auto text-center space-y-4 mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    FAQ
                </span>
                
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Frequently asked questions
                </h2>
                </div>

            {/* FAQ Items Container */}
            <div className="faq-container max-w-3xl mx-auto space-y-4">
                {faqsData.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div 
                            key={index} 
                            className={`faq-item bg-white rounded-2xl transition-all duration-300 border ${
                                isOpen 
                                    ? 'border-gray-900 shadow-md' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {/* Question Header (Clickable) */}
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                            >
                                <span className="font-semibold text-gray-900 text-base md:text-lg">
                                    {faq.question}
                                </span>
                                <span className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gray-900' : 'rotate-0'}`}>
                                    <ChevronDown className="w-5 h-5" />
                                </span>
                            </button>

                            {/* Answer (Collapsible with smooth transition look) */}
                            {isOpen && (
                                <div className="px-6 pb-6 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-4 animate-fadeIn">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </section>
    );
};

export default FaqSection;