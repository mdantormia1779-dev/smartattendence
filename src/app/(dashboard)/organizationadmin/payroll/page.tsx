"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    DollarSign, 
    Download, 
    FileText, 
    CheckCircle2, 
    Lock, 
    Search, 
    Filter, 
    Printer, 
    Building2, 
    Sparkles, 
    X, 
    AlertCircle,
    TrendingUp,
    Receipt,
    CreditCard
} from "lucide-react";

interface EmployeePayroll {
    id: string;
    employeeName: string;
    employeeId: string;
    avatar: string;
    designation: string;
    department: string;
    branch: string;
    bankAccount: string;
    basicSalary: number;
    houseRent: number;
    medicalAllowance: number;
    transportAllowance: number;
    foodAllowance: number;
    bonus: number;
    overtimePay: number;
    taxDeduction: number;
    providentFund: number;
    loanDeduction: number;
    lateDeduction: number;
    absentDeduction: number;
    grossEarnings: number;
    totalDeductions: number;
    netSalary: number;
    status: "Draft" | "Approved" | "Paid";
}

const initialPayrollData: EmployeePayroll[] = [
    {
        id: "pr-1",
        employeeName: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        designation: "Senior Software Engineer",
        department: "Information Technology",
        branch: "Head Office – Dhaka",
        bankAccount: "DBBL - 114.120.982341",
        basicSalary: 60000,
        houseRent: 20000,
        medicalAllowance: 5000,
        transportAllowance: 5000,
        foodAllowance: 5000,
        bonus: 0,
        overtimePay: 3117.18,
        taxDeduction: 4500,
        providentFund: 6000,
        loanDeduction: 0,
        lateDeduction: 0,
        absentDeduction: 0,
        grossEarnings: 98117.18,
        totalDeductions: 10500,
        netSalary: 87617.18,
        status: "Approved",
    },
    {
        id: "pr-2",
        employeeName: "Nusrat Jahan",
        employeeId: "EMP-1043",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        designation: "Senior Accountant",
        department: "Accounts & Finance",
        branch: "Head Office – Dhaka",
        bankAccount: "City Bank - 220.105.883920",
        basicSalary: 45000,
        houseRent: 15000,
        medicalAllowance: 5000,
        transportAllowance: 5000,
        foodAllowance: 5000,
        bonus: 5000,
        overtimePay: 0,
        taxDeduction: 2800,
        providentFund: 4500,
        loanDeduction: 0,
        lateDeduction: 0,
        absentDeduction: 0,
        grossEarnings: 80000,
        totalDeductions: 7300,
        netSalary: 72700,
        status: "Approved",
    },
    {
        id: "pr-3",
        employeeName: "Tanvir Ahmed",
        employeeId: "EMP-1044",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        designation: "Digital Marketing Lead",
        department: "Marketing",
        branch: "Gulshan Branch",
        bankAccount: "BRAC Bank - 150.334.774829",
        basicSalary: 52000,
        houseRent: 18000,
        medicalAllowance: 5000,
        transportAllowance: 5000,
        foodAllowance: 5000,
        bonus: 0,
        overtimePay: 5312.50,
        taxDeduction: 3500,
        providentFund: 5200,
        loanDeduction: 0,
        lateDeduction: 850,
        absentDeduction: 0,
        grossEarnings: 90312.50,
        totalDeductions: 9550,
        netSalary: 80762.50,
        status: "Draft",
    },
    {
        id: "pr-4",
        employeeName: "Sabrina Noor",
        employeeId: "EMP-1045",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        designation: "HR Manager",
        department: "Human Resources",
        branch: "Head Office – Dhaka",
        bankAccount: "EBL - 310.229.665219",
        basicSalary: 55000,
        houseRent: 20000,
        medicalAllowance: 5000,
        transportAllowance: 5000,
        foodAllowance: 5000,
        bonus: 0,
        overtimePay: 0,
        taxDeduction: 4000,
        providentFund: 5500,
        loanDeduction: 0,
        lateDeduction: 0,
        absentDeduction: 0,
        grossEarnings: 90000,
        totalDeductions: 9500,
        netSalary: 80500,
        status: "Approved",
    },
];

export default function OrganizationPayrollPage() {
    const [payroll, setPayroll] = useState<EmployeePayroll[]>(initialPayrollData);
    const [selectedMonth, setSelectedMonth] = useState("August 2026");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");

    // Modal state for viewing/printing detailed payslip
    const [activePayslip, setActivePayslip] = useState<EmployeePayroll | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".payroll-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [payroll, selectedStatus, searchQuery, selectedMonth]);

    const handleRunAutoCalculation = () => {
        alert("✨ Automated payroll calculation completed based on shift attendance, approved leaves, and overtime hours!");
    };

    const handleApproveAll = () => {
        setPayroll(payroll.map(p => ({ ...p, status: "Approved" })));
        alert("🎉 All employee payroll records have been approved and locked for disbursement!");
    };

    const filteredPayroll = payroll.filter(item => {
        const matchesSearch = 
            item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const totalGrossPayout = payroll.reduce((acc, curr) => acc + curr.grossEarnings, 0);
    const totalDeductionsAll = payroll.reduce((acc, curr) => acc + curr.totalDeductions, 0);
    const totalNetPayable = payroll.reduce((acc, curr) => acc + curr.netSalary, 0);

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-[#00B050]" />
                        Payroll & Salary Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Automated earnings, overtime calculation, statutory tax & provident fund deductions
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
                    >
                        <option value="August 2026">August 2026</option>
                        <option value="July 2026">July 2026</option>
                        <option value="June 2026">June 2026</option>
                    </select>

                    <button
                        onClick={handleRunAutoCalculation}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4 text-[#00B050]" />
                        Recalculate
                    </button>

                    <button
                        onClick={handleApproveAll}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Lock Payroll
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Gross Salary</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        ৳{totalGrossPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Earnings + OT + Bonus</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Deductions</p>
                    <h3 className="text-2xl font-bold text-rose-600 mt-1">
                        ৳{totalDeductionsAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Tax + PF + Lates</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Net Disbursable Amount</p>
                    <h3 className="text-2xl font-bold text-[#00B050] mt-1">
                        ৳{totalNetPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Bank transfer target</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Processed Staff</p>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-1">{payroll.length} Employees</h3>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">100% calculated</p>
                </div>
            </div>

            {/* Filter and Table Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search employee, ID or dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => alert("Bank salary disbursement sheet (Excel/CSV) downloaded!")}
                        className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" /> Export Bank Advice
                    </button>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">Basic Pay</th>
                                <th className="py-4 px-6">Allowances & OT</th>
                                <th className="py-4 px-6">Gross Pay</th>
                                <th className="py-4 px-6">Total Deductions</th>
                                <th className="py-4 px-6">Net Salary</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Payslip</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredPayroll.map((item) => (
                                <tr key={item.id} className="payroll-row hover:bg-gray-50/60 transition-colors">
                                    {/* Employee */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.avatar}
                                                alt={item.employeeName}
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                                            />
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{item.employeeName}</p>
                                                <p className="text-xs text-gray-400">{item.designation}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Basic Pay */}
                                    <td className="py-4 px-6 font-mono text-xs text-gray-800">
                                        ৳{item.basicSalary.toLocaleString()}
                                    </td>

                                    {/* Allowances & OT */}
                                    <td className="py-4 px-6">
                                        <div className="font-mono text-xs text-gray-800">
                                            ৳{(item.grossEarnings - item.basicSalary).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </div>
                                        {item.overtimePay > 0 && (
                                            <span className="text-[10px] text-[#00B050] font-bold">
                                                incl. OT: ৳{item.overtimePay.toFixed(0)}
                                            </span>
                                        )}
                                    </td>

                                    {/* Gross Pay */}
                                    <td className="py-4 px-6 font-mono text-xs font-bold text-gray-900">
                                        ৳{item.grossEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>

                                    {/* Total Deductions */}
                                    <td className="py-4 px-6 font-mono text-xs font-semibold text-rose-600">
                                        -৳{item.totalDeductions.toLocaleString()}
                                    </td>

                                    {/* Net Salary */}
                                    <td className="py-4 px-6 font-mono text-sm font-bold text-[#00B050]">
                                        ৳{item.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>

                                    {/* Status */}
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            item.status === "Approved"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}>
                                            {item.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                                            {item.status}
                                        </span>
                                    </td>

                                    {/* Payslip View */}
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => setActivePayslip(item)}
                                            className="px-3 py-1.5 bg-gray-50 hover:bg-[#00B050] hover:text-white text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            <Receipt className="w-3.5 h-3.5" />
                                            View Payslip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Printable Payslip Modal */}
            {activePayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-8 space-y-6 my-8 animate-in fade-in zoom-in-95">
                        {/* Header with Print & Close */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-xl text-lg tracking-wider">
                                    VX
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Vertex Technologies Ltd.</h2>
                                    <p className="text-xs text-gray-500">Official Payslip · {selectedMonth}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                    title="Print Payslip"
                                >
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setActivePayslip(null)}
                                    className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Employee Details Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl text-xs">
                            <div>
                                <span className="text-gray-400 font-semibold uppercase text-[10px]">Employee Name</span>
                                <p className="font-bold text-gray-900 mt-0.5">{activePayslip.employeeName}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 font-semibold uppercase text-[10px]">Employee ID</span>
                                <p className="font-mono font-bold text-gray-900 mt-0.5">{activePayslip.employeeId}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 font-semibold uppercase text-[10px]">Department</span>
                                <p className="font-semibold text-gray-900 mt-0.5">{activePayslip.department}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 font-semibold uppercase text-[10px]">Designation</span>
                                <p className="font-semibold text-gray-900 mt-0.5">{activePayslip.designation}</p>
                            </div>
                        </div>

                        {/* Earnings & Deductions Breakdown Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            {/* Earnings Table */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] pb-2 border-b border-gray-100 flex items-center justify-between">
                                    <span>Earnings Description</span>
                                    <span>Amount</span>
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Basic Salary</span>
                                        <span className="font-mono font-semibold">৳{activePayslip.basicSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>House Rent Allowance</span>
                                        <span className="font-mono font-semibold">৳{activePayslip.houseRent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Medical Allowance</span>
                                        <span className="font-mono font-semibold">৳{activePayslip.medicalAllowance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Transport Allowance</span>
                                        <span className="font-mono font-semibold">৳{activePayslip.transportAllowance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Food Allowance</span>
                                        <span className="font-mono font-semibold">৳{activePayslip.foodAllowance.toLocaleString()}</span>
                                    </div>
                                    {activePayslip.overtimePay > 0 && (
                                        <div className="flex justify-between text-[#00B050] font-semibold">
                                            <span>Overtime Payout</span>
                                            <span className="font-mono">৳{activePayslip.overtimePay.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {activePayslip.bonus > 0 && (
                                        <div className="flex justify-between text-indigo-600 font-semibold">
                                            <span>Festival Bonus</span>
                                            <span className="font-mono">৳{activePayslip.bonus.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900">
                                    <span>Gross Earnings</span>
                                    <span className="font-mono text-sm">৳{activePayslip.grossEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {/* Deductions Table */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] pb-2 border-b border-gray-100 flex items-center justify-between">
                                    <span>Deductions Description</span>
                                    <span>Amount</span>
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Income Tax (TDS)</span>
                                        <span className="font-mono font-semibold">৳{activePayslip.taxDeduction.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Provident Fund (PF)</span>
                                        <span className="font-mono font-semibold">৳{activePayslip.providentFund.toLocaleString()}</span>
                                    </div>
                                    {activePayslip.lateDeduction > 0 && (
                                        <div className="flex justify-between text-amber-600">
                                            <span>Late Arrival Penalty</span>
                                            <span className="font-mono font-semibold">৳{activePayslip.lateDeduction.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {activePayslip.absentDeduction > 0 && (
                                        <div className="flex justify-between text-rose-600">
                                            <span>Unexcused Absence Deduction</span>
                                            <span className="font-mono font-semibold">৳{activePayslip.absentDeduction.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-rose-600">
                                    <span>Total Deductions</span>
                                    <span className="font-mono text-sm">-৳{activePayslip.totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay Banner */}
                        <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-[#00B050]/20 rounded-2xl border border-[#00B050]/20 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-[#00B050] uppercase tracking-wider">Net Salary Payable</span>
                                <h4 className="text-2xl font-bold text-gray-900 font-mono mt-0.5">
                                    ৳{activePayslip.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-1">Disbursed to: {activePayslip.bankAccount}</p>
                            </div>
                            <div className="text-right">
                                <span className="px-3 py-1 bg-[#00B050] text-white rounded-xl text-xs font-bold shadow-sm">
                                    Status: {activePayslip.status}
                                </span>
                            </div>
                        </div>

                        {/* Footer Signatures & QR */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <div>
                                <p className="text-[10px]">Computer generated payslip. Authorized signature required on physical copy.</p>
                                <p className="font-mono text-[10px] mt-0.5">Doc ID: {activePayslip.id}-{Date.now()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-700">Vertex HR & Accounts Dept.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
