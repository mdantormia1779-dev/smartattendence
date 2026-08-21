"use client";

import React, { useState } from "react";
import { 
    DollarSign, 
    Download, 
    Printer, 
    Receipt, 
    CheckCircle2, 
    X, 
    FileText, 
    Building2, 
    CreditCard,
    TrendingUp
} from "lucide-react";

interface EmployeePayslipItem {
    id: string;
    month: string;
    grossPay: number;
    deductions: number;
    netPay: number;
    payDate: string;
    bankRef: string;
    status: "Paid";
}

const payslipArchive: EmployeePayslipItem[] = [
    { id: "PS-2026-07", month: "July 2026", grossPay: 98117.18, deductions: 10500, netPay: 87617.18, payDate: "Aug 05, 2026", bankRef: "EFT-8892341", status: "Paid" },
    { id: "PS-2026-06", month: "June 2026", grossPay: 95000.00, deductions: 10500, netPay: 84500.00, payDate: "Jul 05, 2026", bankRef: "EFT-7748291", status: "Paid" },
    { id: "PS-2026-05", month: "May 2026", grossPay: 95000.00, deductions: 10500, netPay: 84500.00, payDate: "Jun 05, 2026", bankRef: "EFT-6639201", status: "Paid" },
];

export default function EmployeeSalaryPage() {
    const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayslipItem | null>(null);

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-[#00B050]" />
                        My Salary & Payslips
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        View monthly earnings, allowances, statutory tax/PF deductions & download official payslips
                    </p>
                </div>
            </div>

            {/* Current Salary Structure Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Basic Salary</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1 font-mono">৳60,000.00</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Grade 8 base rate</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Allowances</p>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-1 font-mono">৳35,000.00</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">House + Med + Trans + Food</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Monthly Deductions</p>
                    <h3 className="text-2xl font-bold text-rose-600 mt-1 font-mono">-৳10,500.00</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Tax (৳4,500) + PF (৳6,000)</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Net Monthly Take-Home</p>
                    <h3 className="text-2xl font-bold text-[#00B050] mt-1 font-mono">৳84,500.00</h3>
                    <p className="text-[11px] text-[#00B050] font-semibold mt-0.5">+ overtime bonus</p>
                </div>
            </div>

            {/* Monthly Payslips History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Disbursed Payslip Archive</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Salary Month</th>
                                <th className="py-4 px-6">Gross Pay</th>
                                <th className="py-4 px-6">Deductions</th>
                                <th className="py-4 px-6">Net Take-Home</th>
                                <th className="py-4 px-6">Disbursed Date</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {payslipArchive.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-4 px-6 font-bold text-xs text-gray-900">
                                        {item.month}
                                        <p className="text-[10px] text-gray-400 font-mono">{item.bankRef}</p>
                                    </td>

                                    <td className="py-4 px-6 font-mono text-xs text-gray-700">
                                        ৳{item.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className="py-4 px-6 font-mono text-xs font-semibold text-rose-600">
                                        -৳{item.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className="py-4 px-6 font-mono text-sm font-bold text-[#00B050]">
                                        ৳{item.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className="py-4 px-6 text-xs text-gray-500">
                                        {item.payDate}
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                            <CheckCircle2 className="w-3 h-3" /> Paid
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => setSelectedPayslip(item)}
                                            className="px-3.5 py-1.5 bg-gray-50 hover:bg-[#00B050] hover:text-white text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            <Receipt className="w-3.5 h-3.5" /> View Payslip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Official Payslip Modal */}
            {selectedPayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-8 space-y-6 my-8 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-xl text-lg tracking-wider">
                                    VX
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Vertex Technologies Ltd.</h2>
                                    <p className="text-xs text-gray-500">Employee Payslip · {selectedPayslip.month}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.print()} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600">
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button onClick={() => setSelectedPayslip(null)} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl text-xs">
                            <div><span className="text-gray-400 uppercase text-[10px] font-bold">Employee</span><p className="font-bold text-gray-900">Arif Chowdhury</p></div>
                            <div><span className="text-gray-400 uppercase text-[10px] font-bold">ID & Dept</span><p className="font-mono text-gray-800">EMP-1042 · IT</p></div>
                            <div><span className="text-gray-400 uppercase text-[10px] font-bold">Designation</span><p className="font-semibold text-gray-800">Sr. Software Engineer</p></div>
                            <div><span className="text-gray-400 uppercase text-[10px] font-bold">Bank Account</span><p className="font-mono text-gray-800">DBBL-114.120.98</p></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 uppercase text-[11px] pb-2 border-b border-gray-100">Earnings</h4>
                                <div className="flex justify-between"><span>Basic Salary</span><span className="font-mono font-semibold">৳60,000.00</span></div>
                                <div className="flex justify-between"><span>House Rent</span><span className="font-mono font-semibold">৳20,000.00</span></div>
                                <div className="flex justify-between"><span>Medical Allowance</span><span className="font-mono font-semibold">৳5,000.00</span></div>
                                <div className="flex justify-between"><span>Transport Allowance</span><span className="font-mono font-semibold">৳5,000.00</span></div>
                                <div className="flex justify-between"><span>Food Allowance</span><span className="font-mono font-semibold">৳5,000.00</span></div>
                                {selectedPayslip.grossPay > 95000 && (
                                    <div className="flex justify-between text-[#00B050] font-semibold">
                                        <span>Overtime (3.5h OT)</span>
                                        <span className="font-mono">৳3,117.18</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-gray-900">
                                    <span>Gross Earnings</span>
                                    <span className="font-mono">৳{selectedPayslip.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 uppercase text-[11px] pb-2 border-b border-gray-100">Deductions</h4>
                                <div className="flex justify-between"><span>Income Tax (TDS)</span><span className="font-mono font-semibold">৳4,500.00</span></div>
                                <div className="flex justify-between"><span>Provident Fund (PF)</span><span className="font-mono font-semibold">৳6,000.00</span></div>
                                <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-rose-600">
                                    <span>Total Deductions</span>
                                    <span className="font-mono">-৳{selectedPayslip.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-[#00B050] uppercase">Net Salary Disbursed</span>
                                <h4 className="text-2xl font-bold text-gray-900 font-mono mt-0.5">
                                    ৳{selectedPayslip.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h4>
                            </div>
                            <span className="px-3 py-1 bg-[#00B050] text-white rounded-xl text-xs font-bold shadow-sm">
                                Status: Paid
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
