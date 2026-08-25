"use client";

import React, { useState, useEffect } from "react";
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
    TrendingUp,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

interface EmployeePayslipItem {
    id: string;
    month: string;
    grossPay: number;
    deductions: number;
    netPay: number;
    payDate: string;
    bankRef: string;
    status: "Paid" | "Approved";
}

export default function EmployeeSalaryPage() {
    const [payslips, setPayslips] = useState<EmployeePayslipItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayslipItem | null>(null);

    useEffect(() => {
        async function fetchPayslips() {
            try {
                const res = await api.payroll.getBatches();
                if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const allSlips: EmployeePayslipItem[] = [];
                    res.data.forEach((batch: any) => {
                        if (Array.isArray(batch.payslips)) {
                            batch.payslips.forEach((p: any) => {
                                allSlips.push({
                                    id: p.id,
                                    month: batch.month || "2026-08",
                                    grossPay: p.grossSalary || 98117.18,
                                    deductions: p.totalDeductions || 10500,
                                    netPay: p.netSalary || 87617.18,
                                    payDate: batch.createdAt ? batch.createdAt.split("T")[0] : "2026-08-05",
                                    bankRef: p.bankAccountNumber || "EFT-8892341",
                                    status: p.status === "PAID" ? "Paid" : "Approved",
                                });
                            });
                        }
                    });
                    setPayslips(allSlips);
                }
            } catch (e) {
                console.error("Failed to load employee payslips", e);
            } finally {
                setLoading(false);
            }
        }

        fetchPayslips();
    }, []);

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

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading payslip archive...</span>
                    </div>
                ) : (
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
                                {payslips.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No payslips available in archive yet.
                                        </td>
                                    </tr>
                                ) : (
                                    payslips.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-4 px-6 font-bold text-xs text-gray-900">
                                                {item.month}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-gray-700">
                                                ৳{item.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-rose-600">
                                                -৳{item.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs font-bold text-[#00B050]">
                                                ৳{item.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-500">
                                                {item.payDate}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                                    <CheckCircle2 className="w-3 h-3" /> {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => setSelectedPayslip(item)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payslip Modal */}
            {selectedPayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Monthly Salary Payslip</h3>
                                <p className="text-xs text-gray-500">Period: {selectedPayslip.month}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPayslip(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                            <div>
                                <p className="font-bold text-gray-900">Arif Chowdhury (EMP-1042)</p>
                                <p className="text-gray-500">Senior Software Engineer · Information Technology</p>
                                <p className="text-gray-400 text-[11px] mt-0.5">DBBL Account: {selectedPayslip.bankRef}</p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-full">
                                {selectedPayslip.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                            <div className="space-y-1">
                                <p className="font-bold text-gray-800 uppercase text-[10px]">Earnings Breakdown</p>
                                <div className="flex justify-between text-gray-600"><span>Basic Salary</span><span>৳60,000.00</span></div>
                                <div className="flex justify-between text-gray-600"><span>House Rent</span><span>৳20,000.00</span></div>
                                <div className="flex justify-between text-gray-600"><span>Medical</span><span>৳5,000.00</span></div>
                                <div className="flex justify-between text-gray-600"><span>Conveyance</span><span>৳5,000.00</span></div>
                                <div className="flex justify-between text-gray-600"><span>Food Allowance</span><span>৳5,000.00</span></div>
                                {selectedPayslip.grossPay > 95000 && (
                                    <div className="flex justify-between text-[#00B050] font-bold"><span>Overtime Pay</span><span>+৳{(selectedPayslip.grossPay - 95000).toFixed(2)}</span></div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-gray-800 uppercase text-[10px]">Deductions Breakdown</p>
                                <div className="flex justify-between text-rose-600"><span>Income Tax (TDS)</span><span>-৳4,500.00</span></div>
                                <div className="flex justify-between text-rose-600"><span>Provident Fund</span><span>-৳6,000.00</span></div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between font-bold text-sm">
                            <span className="text-gray-900">Net Take-Home Pay</span>
                            <span className="text-[#00B050] text-lg font-mono">
                                ৳{selectedPayslip.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => window.open(`/api/payslips/${selectedPayslip.id}/download?print=true`, "_blank")}
                                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5 text-gray-500" />
                                Print
                            </button>
                            <button
                                onClick={() => window.open(`/api/payslips/${selectedPayslip.id}/download`, "_blank")}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#00B050] text-white hover:bg-[#009b46] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-[#00B050]/20"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
