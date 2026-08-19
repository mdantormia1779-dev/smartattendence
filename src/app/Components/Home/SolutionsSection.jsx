import React from 'react';
import { ShieldCheck, Users, ScanFace, Check } from 'lucide-react';

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
    return (
        <section className="w-full bg-[#FBF9F5] py-20 px-6 md:px-12">
            
            {/* Section Header */}
            <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
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
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {solutionsData.map((item, index) => (
                    <div 
                        key={index} 
                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                        <div className="space-y-6">
                            {/* Icon Box */}
                            <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                                {item.icon}
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">
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
                                        <span className="w-5 h-5 rounded-full bg-[#00B050]/10 flex items-center justify-center flex-shrink-0">
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