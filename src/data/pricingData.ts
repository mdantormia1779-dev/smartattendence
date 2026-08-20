export interface StatItem {
    label: string;
    value: string;
}

export interface Plan {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    periodMonthly: string;
    periodYearly: string;
    popular: boolean;
    stats: StatItem[];
    features: string[];
    buttonText: string;
    buttonStyle: string;
}

export const pricingPlans: Plan[] = [
    {
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        periodMonthly: "forever",
        periodYearly: "forever",
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
        monthlyPrice: 4999,
        yearlyPrice: 47990,
        periodMonthly: "/ month",
        periodYearly: "/ year",
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
        monthlyPrice: 14999,
        yearlyPrice: 143990,
        periodMonthly: "/ month",
        periodYearly: "/ year",
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
        monthlyPrice: 39999,
        yearlyPrice: 383990,
        periodMonthly: "/ month",
        periodYearly: "/ year",
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