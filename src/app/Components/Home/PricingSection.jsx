import React from 'react';
import { Check } from 'lucide-react';

const pricingPlans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        popular: false,
        stats: [
            { label: "Organizations", value: "1" },
            { label: "Branches", value: "1" },
            { label: "Managers", value: "1" },
            { label: "Employees", value: "20" }
        ],
        features: [
            "Face Recognition",
            "GPS Verification",
            "Basic Reports",
            "Attendance Logs"
        ],
        buttonText: "Start Free",
        buttonStyle: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
    },
    {
        name: "Starter",
        price: "$49",
        period: "/ month",
        popular: false,
        stats: [
            { label: "Branches", value: "5" },
            { label: "Managers", value: "5" },
            { label: "Employees", value: "100" }
        ],
        features: [
            "Everything in Free",
            "Leave Management",
            "Shift Management",
            "Email Notification"
        ],
        buttonText: "Choose Plan",
        buttonStyle: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
    },
    {
        name: "Business",
        price: "$149",
        period: "/ month",
        popular: true,
        stats: [
            { label: "Branches", value: "20" },
            { label: "Managers", value: "20" },
            { label: "Employees", value: "500" }
        ],
        features: [
            "Everything in Starter",
            "Payroll & Payslips",
            "Fingerprint Support",
            "Advanced Analytics",
            "API Access"
        ],
        buttonText: "Choose Plan",
        buttonStyle: "bg-[#00B050] hover:bg-[#009644] text-white"
    },
    {
        name: "Enterprise",
        price: "$399",
        period: "/ month",
        popular: false,
        stats: [
            { label: "Branches", value: "Unlimited" },
            { label: "Managers", value: "Unlimited" },
            { label: "Employees", value: "Unlimited" }
        ],
        features: [
            "Everything in Business",
            "White Label",
            "Custom Domain",
            "Priority Support",
            "Dedicated Manager"
        ],
        buttonText: "Choose Plan",
        buttonStyle: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
    }
];

const PricingSection = () => {
    return (
        <section className="w-full bg-white py-20 px-6 md:px-12">
            
            {/* Section Header */}
            <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    Pricing
                </span>
                
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Simple plans that scale with you
                </h2>
                
                <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
                    Start free and upgrade as your team grows. No hidden fees.
                </p>
            </div>

            {/* Pricing Cards Grid (4 Columns) */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {pricingPlans.map((plan, index) => (
                    <div 
                        key={index} 
                        className={`bg-white rounded-2xl p-6 flex flex-col justify-between relative transition-all ${
                            plan.popular 
                                ? 'border-2 border-[#00B050] shadow-lg ring-1 ring-[#00B050]/20' 
                                : 'border border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                    >
                        {/* Most Popular Badge */}
                        {plan.popular && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00B050] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                Most popular
                            </span>
                        )}

                        <div className="space-y-6">
                            {/* Plan Name & Price */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                    <span className="text-sm text-gray-500">{plan.period}</span>
                                </div>
                            </div>

                            {/* Stats Box inside Card */}
                            <div className="bg-[#FBF9F5] rounded-xl p-4 grid grid-cols-2 gap-3 border border-gray-100">
                                {plan.stats.map((stat, sIndex) => (
                                    <div key={sIndex} className="space-y-0.5">
                                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">{stat.label}</p>
                                        <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 pt-2">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-center gap-3 text-sm text-gray-700">
                                        <span className="w-5 h-5 rounded-full bg-[#00B050]/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-[#00B050]" />
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Button */}
                        <div className="pt-8">
                            <button className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all shadow-sm ${plan.buttonStyle}`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default PricingSection;