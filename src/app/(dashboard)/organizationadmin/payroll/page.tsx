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
    CreditCard,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

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

export default function OrganizationPayrollPage() {
    const [payroll, setPayroll] = useState<EmployeePayroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState("2026-08");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

    // Modal state for viewing/printing detailed payslip
    const [activePayslip, setActivePayslip] = useState<EmployeePayroll | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const res = await api.payroll.getBatches();
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                const batch = res.data[0];
                setActiveBatchId(batch.id);

                if (Array.isArray(batch.payslips)) {
                    const mapped: EmployeePayroll[] = batch.payslips.map((p: any) => ({
                        id: p.id,
                        employeeName: p.employeeName || p.employeeId,
                        employeeId: p.employeeId,
                        avatar: p.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                        designation: p.designation || "Software Engineer",
                        department: p.department || "Information Technology",
                        branch: p.branch || "Head Office – Dhaka",
                        bankAccount: p.bankAccountNumber || "DBBL - 114.120.982341",
                        basicSalary: p.basicSalary || 60000,
                        houseRent: p.allowances?.houseRent || 20000,
                        medicalAllowance: p.allowances?.medical || 5000,
                        transportAllowance: p.allowances?.conveyance || 5000,
                        foodAllowance: 5000,
                        bonus: p.bonus || 0,
                        overtimePay: p.overtimeAmount || 0,
                        taxDeduction: p.deductions?.tax || 4500,
                        providentFund: p.deductions?.providentFund || 6000,
                        loanDeduction: p.deductions?.loan || 0,
                        lateDeduction: p.deductions?.lateDeduction || 0,
                        absentDeduction: p.deductions?.unpaidLeave || 0,
                        grossEarnings: p.grossSalary || (p.basicSalary + 35000),
                        totalDeductions: p.totalDeductions || 10500,
                        netSalary: p.netSalary || (p.basicSalary + 24500),
                        status: p.status === "APPROVED" ? "Approved" : p.status === "PAID" ? "Paid" : "Draft",
                    }));
                    setPayroll(mapped);
                }
            }
        } catch (e) {
            console.error("Failed to load payroll batches", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, [selectedMonth]);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".payroll-row",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [payroll, selectedStatus, searchQuery, selectedMonth, loading]);

    const handleRunAutoCalculation = async () => {
        try {
            setLoading(true);
            await api.payroll.generate(selectedMonth);
            await fetchPayroll();
            alert("✨ Automated payroll calculation generated and loaded based on real shift attendance, leaves, and overtime!");
        } catch (e) {
            console.error("Failed to generate payroll", e);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAll = async () => {
        if (activeBatchId) {
            try {
                await api.payroll.approve(activeBatchId);
                await api.payroll.finalize(activeBatchId);
                await fetchPayroll();
                alert("🎉 All employee payroll records have been approved and locked for disbursement!");
            } catch (e) {
                console.error("Failed to approve batch", e);
            }
        }
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
                        <option value="2026-08">August 2026</option>
                        <option value="2026-07">July 2026</option>
                        <option value="2026-06">June 2026</option>
                    </select>

                    <button
                        onClick={handleRunAutoCalculation}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4 text-[#00B050]" />
                        Recalculate Batch
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

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Gross Salary Expenditure</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            ৳{totalGrossPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Earnings before deductions</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Statutory Deductions (Tax & PF)</p>
                        <h3 className="text-2xl font-bold text-rose-600 mt-1">
                            ৳{totalDeductionsAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Government & Fund withholdings</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total Net Payable</p>
                        <h3 className="text-2xl font-bold text-[#00B050] mt-1">
                            ৳{totalNetPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Direct bank disbursement</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <CreditCard className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employee, ID or dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span>Loading payroll batch details...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Basic Salary</th>
                                    <th className="px-6 py-4">Allowances & OT</th>
                                    <th className="px-6 py-4">Total Deductions</th>
                                    <th className="px-6 py-4">Net Salary</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {filteredPayroll.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No payroll records found for {selectedMonth}. Click "Recalculate Batch" to generate.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayroll.map((item) => (
                                        <tr key={item.id} className="payroll-row hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.employeeName}
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.employeeName}</p>
                                                        <p className="text-[11px] text-gray-400">{item.employeeId} · {item.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                ৳{item.basicSalary.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <p>Allowances: ৳{(item.houseRent + item.medicalAllowance + item.transportAllowance + item.foodAllowance).toLocaleString()}</p>
                                                {item.overtimePay > 0 && (
                                                    <p className="text-[11px] text-[#00B050] font-bold">OT: +৳{item.overtimePay.toFixed(2)}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-rose-600 font-semibold">
                                                -৳{item.totalDeductions.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-extrabold text-[#00B050]">
                                                    ৳{item.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                    item.status === "Approved" 
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : item.status === "Paid"
                                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                                }`}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setActivePayslip(item)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                                                    Payslip
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

            {/* Payslip View Modal */}
            {activePayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Monthly Salary Payslip</h3>
                                <p className="text-xs text-gray-500">Period: {selectedMonth}</p>
                            </div>
                            <button
                                onClick={() => setActivePayslip(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{activePayslip.employeeName}</p>
                                    <p className="text-gray-500">{activePayslip.designation} · {activePayslip.department}</p>
                                    <p className="text-gray-400 text-[11px] mt-0.5">{activePayslip.bankAccount}</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 text-[#00B050] font-extrabold rounded-full">
                                    {activePayslip.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1.5">
                                    <p className="font-bold text-gray-900 uppercase text-[10px]">Earnings</p>
                                    <div className="flex justify-between text-gray-600"><span>Basic Salary</span><span>৳{activePayslip.basicSalary.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>House Rent</span><span>৳{activePayslip.houseRent.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Medical</span><span>৳{activePayslip.medicalAllowance.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Conveyance</span><span>৳{activePayslip.transportAllowance.toLocaleString()}</span></div>
                                    {activePayslip.overtimePay > 0 && (
                                        <div className="flex justify-between text-[#00B050] font-bold"><span>Overtime</span><span>৳{activePayslip.overtimePay.toFixed(2)}</span></div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <p className="font-bold text-gray-900 uppercase text-[10px]">Deductions</p>
                                    <div className="flex justify-between text-rose-600"><span>Income Tax</span><span>-৳{activePayslip.taxDeduction.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-rose-600"><span>Provident Fund</span><span>-৳{activePayslip.providentFund.toLocaleString()}</span></div>
                                    {activePayslip.lateDeduction > 0 && (
                                        <div className="flex justify-between text-rose-600"><span>Late Penalty</span><span>-৳{activePayslip.lateDeduction.toLocaleString()}</span></div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-3 flex items-center justify-between font-bold text-sm">
                                <span className="text-gray-900">Net Take-Home Pay</span>
                                <span className="text-[#00B050] text-base">
                                    ৳{activePayslip.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => {
                                    alert(`Generating official PDF payslip for ${activePayslip.employeeName}...`);
                                    window.open(`/api/payslips/${activePayslip.id}/download`, "_blank");
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#00B050] text-white hover:bg-[#009b46] rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
