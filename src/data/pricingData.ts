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
        name: "30-Day Free Trial",
        monthlyPrice: 0,
        yearlyPrice: 0,
        periodMonthly: "for 30 days",
        periodYearly: "for 30 days",
        popular: false,
        stats: [
            { label: "Organizations", value: "1" },
            { label: "Branches", value: "2" },
            { label: "Managers", value: "3" },
            { label: "Employees", value: "30" }
        ],
        features: [
            "30 Days Full Access",
            "Up to 3 Branch Managers",
            "Face Recognition AI",
            "GPS Geofence Verification",
            "Shift & Leave Management",
            "Payroll & Payslips Preview",
            "No Credit Card Required"
        ],
        buttonText: "Start 30-Day Free Trial",
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
            "Up to 5 Branch Managers",
            "100 Employee Capacity",
            "Everything in Free Trial",
            "Automated Payroll",
            "Email Notifications",
            "Standard Priority Support"
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
            "Up to 20 Branch Managers",
            "500 Employee Capacity",
            "Everything in Starter",
            "Full Automated Payroll & Tax",
            "Fingerprint & Multi-Branch AI",
            "Advanced Executive Analytics",
            "REST API Access"
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
            "Unlimited Branch Managers",
            "Unlimited Staff & Branches",
            "Everything in Business",
            "White-Label Portal Branding",
            "Custom Subdomain Support",
            "Dedicated Account Manager",
            "24/7 Priority SLA"
        ],
        buttonText: "Choose Plan",
        buttonStyle: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
    }
];