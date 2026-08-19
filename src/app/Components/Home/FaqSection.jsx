"use client"
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
    // প্রথম কোয়েশ্চেনটি ডিফল্টভাবে ওপেন রাখা হয়েছে (ইমেজের মতো)
    const [openIndex, setOpenIndex] = useState(0);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="w-full bg-[#FBF9F5] py-20 px-6 md:px-12">
            
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    FAQ
                </span>
                
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Frequently asked questions
                </h2>
            </div>

            {/* FAQ Items Container */}
            <div className="max-w-3xl mx-auto space-y-4">
                {faqsData.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div 
                            key={index} 
                            className={`bg-white rounded-2xl transition-all border ${
                                isOpen 
                                    ? 'border-gray-900 shadow-sm' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {/* Question Header (Clickable) */}
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                            >
                                <span className="font-semibold text-gray-900 text-base md:text-lg">
                                    {faq.question}
                                </span>
                                <span className="text-gray-500">
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-900" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </span>
                            </button>

                            {/* Answer (Collapsible) */}
                            {isOpen && (
                                <div className="px-6 pb-6 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
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