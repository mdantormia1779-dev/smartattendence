"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
    Loader2,
    RefreshCw
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // Compute default month string YYYY-MM
    const currentMonthString = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }, []);

    const [selectedMonth, setSelectedMonth] = useState(currentMonthString);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
    const [batchStatus, setBatchStatus] = useState<"Draft" | "Approved" | "Paid">("Draft");

    // Modal state for viewing/printing detailed payslip
    const [activePayslip, setActivePayslip] = useState<EmployeePayroll | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Generate Month Options dynamically
    const monthOptions = useMemo(() => {
        const options: { value: string; label: string }[] = [];
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const label = date.toLocaleString("en-US", { month: "long", year: "numeric" });
            options.push({ value: val, label });
        }
        return options;
    }, []);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const res = await api.payroll.getBatches();
            if (res.success && Array.isArray(res.data)) {
                // Find batch matching selectedMonth
                const match = res.data.find((b: any) => b.month === selectedMonth) || res.data[0];

                if (match) {
                    setActiveBatchId(match.id);
                    setBatchStatus(match.status === "APPROVED" ? "Approved" : match.status === "PAID" ? "Paid" : "Draft");

                    if (Array.isArray(match.payslips)) {
                        const mapped: EmployeePayroll[] = match.payslips.map((p: any) => ({
                            id: p.id,
                            employeeName: p.employeeName || p.employeeId,
                            employeeId: p.employeeId,
                            avatar: p.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                            designation: p.designation || "Executive",
                            department: p.department || "General",
                            branch: p.branch || "Main Branch",
                            bankAccount: p.bankAccount || "DBBL - 114.120.982341",
                            basicSalary: Number(p.basicSalary || 50000),
                            houseRent: Number(p.houseRent || 10000),
                            medicalAllowance: Number(p.medicalAllowance || 4000),
                            transportAllowance: Number(p.transportAllowance || 2500),
                            foodAllowance: Number(p.foodAllowance || 2000),
                            bonus: Number(p.bonus || 0),
                            overtimePay: Number(p.overtimePay || 0),
                            taxDeduction: Number(p.taxDeduction || p.tax || 4000),
                            providentFund: Number(p.providentFund || 2500),
                            loanDeduction: Number(p.loanDeduction || 0),
                            lateDeduction: Number(p.lateDeduction || 0),
                            absentDeduction: Number(p.absentDeduction || 0),
                            grossEarnings: Number(p.grossEarnings || (p.basicSalary + 18500)),
                            totalDeductions: Number(p.totalDeductions || (p.taxDeduction + p.providentFund)),
                            netSalary: Number(p.netSalary || (p.grossEarnings - p.totalDeductions)),
                            status: p.status === "APPROVED" ? "Approved" : p.status === "PAID" ? "Paid" : "Draft",
                        }));
                        setPayroll(mapped);
                    } else {
                        setPayroll([]);
                    }
                } else {
                    setPayroll([]);
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
        if (!loading && containerRef.current) {
            const rows = containerRef.current.querySelectorAll(".payroll-row");
            if (rows.length > 0) {
                const ctx = gsap.context(() => {
                    gsap.fromTo(
                        rows,
                        { opacity: 0, y: 12 },
                        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
                    );
                }, containerRef);
                return () => ctx.revert();
            }
        }
    }, [payroll, selectedStatus, searchQuery, selectedMonth, loading]);

    const handleRunAutoCalculation = async () => {
        try {
            setIsGenerating(true);
            await api.payroll.generate(selectedMonth);
            await fetchPayroll();
        } catch (e) {
            console.error("Failed to generate payroll", e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApproveAll = async () => {
        if (activeBatchId) {
            try {
                setIsApproving(true);
                await api.payroll.approve(activeBatchId);
                await api.payroll.finalize(activeBatchId);
                await fetchPayroll();
            } catch (e) {
                console.error("Failed to approve batch", e);
            } finally {
                setIsApproving(false);
            }
        }
    };

    const filteredPayroll = useMemo(() => {
        return payroll.filter((item) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                item.employeeName.toLowerCase().includes(q) ||
                item.employeeId.toLowerCase().includes(q) ||
                item.department.toLowerCase().includes(q) ||
                item.branch.toLowerCase().includes(q);

            const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [payroll, searchQuery, selectedStatus]);

    const totalGrossPayout = useMemo(() => payroll.reduce((acc, curr) => acc + curr.grossEarnings, 0), [payroll]);
    const totalDeductionsAll = useMemo(() => payroll.reduce((acc, curr) => acc + curr.totalDeductions, 0), [payroll]);
    const totalNetPayable = useMemo(() => payroll.reduce((acc, curr) => acc + curr.netSalary, 0), [payroll]);

    const handleExportCSV = () => {
        const headers = ["Employee Name", "Employee ID", "Designation", "Department", "Branch", "Basic Salary (BDT)", "Allowances (BDT)", "Overtime (BDT)", "Gross Earnings (BDT)", "Total Deductions (BDT)", "Net Salary (BDT)", "Status"];
        const rows = filteredPayroll.map((p) => [
            `"${p.employeeName}"`,
            `"${p.employeeId}"`,
            `"${p.designation}"`,
            `"${p.department}"`,
            `"${p.branch}"`,
            `"${p.basicSalary.toFixed(2)}"`,
            `"${(p.houseRent + p.medicalAllowance + p.transportAllowance + p.foodAllowance).toFixed(2)}"`,
            `"${p.overtimePay.toFixed(2)}"`,
            `"${p.grossEarnings.toFixed(2)}"`,
            `"${p.totalDeductions.toFixed(2)}"`,
            `"${p.netSalary.toFixed(2)}"`,
            `"${p.status}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payroll_batch_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <DollarSign className="w-6 h-6 text-[#00B050]" />
                        Payroll & Salary Management
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Automated earnings, overtime calculation, statutory tax & provident fund deductions
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    >
                        {monthOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleRunAutoCalculation}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#00B050]" />
                        ) : (
                            <Sparkles className="w-4 h-4 text-[#00B050]" />
                        )}
                        Recalculate Batch
                    </button>

                    <button
                        onClick={handleApproveAll}
                        disabled={isApproving || batchStatus === "Paid" || payroll.length === 0}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 ${
                            batchStatus === "Paid"
                                ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                                : "bg-[#00B050] hover:bg-[#009b46] text-white shadow-[#00B050]/20"
                        }`}
                    >
                        {isApproving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        {batchStatus === "Paid" ? "Payroll Locked & Paid" : "Approve & Lock Payroll"}
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                        title="Export CSV"
                    >
                        <Download className="w-4 h-4 text-stone-500" />
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Gross Salary Expenditure</p>
                        <h3 className="text-2xl font-extrabold text-stone-900 mt-1">
                            ৳{totalGrossPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Earnings before deductions</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold border border-emerald-100">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Statutory Deductions (Tax & PF)</p>
                        <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
                            ৳{totalDeductionsAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Withholdings & fund transfers</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Net Payable</p>
                        <h3 className="text-2xl font-extrabold text-[#00B050] mt-1">
                            ৳{totalNetPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Direct bank disbursement</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                        <CreditCard className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search employee, ID, branch or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-stone-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span className="text-xs font-semibold">Loading payroll batch from database...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-50/80 border-b border-stone-200/70 text-stone-500 font-bold uppercase tracking-wider">
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
                            <tbody className="divide-y divide-stone-100 font-medium">
                                {filteredPayroll.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-stone-400">
                                            No payroll records found for {selectedMonth}. Click "Recalculate Batch" to generate.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayroll.map((item) => (
                                        <tr key={item.id} className="payroll-row hover:bg-stone-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.employeeName}
                                                        className="w-9 h-9 rounded-full object-cover border border-stone-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-stone-900 leading-tight">{item.employeeName}</p>
                                                        <p className="text-[11px] text-stone-400 font-medium">{item.employeeId} · {item.department} ({item.branch})</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-stone-800">
                                                ৳{item.basicSalary.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600">
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
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
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
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer active:scale-95"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-stone-500" />
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

            {/* Payslip Detailed Modal */}
            {activePayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-4 border border-stone-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="font-bold text-stone-900 text-base">Monthly Salary Payslip</h3>
                                <p className="text-xs text-stone-500">Billing Period: {selectedMonth}</p>
                            </div>
                            <button
                                onClick={() => setActivePayslip(null)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-stone-50/80 p-3.5 rounded-2xl flex items-center justify-between border border-stone-100">
                                <div>
                                    <p className="font-bold text-stone-900 text-sm leading-tight">{activePayslip.employeeName}</p>
                                    <p className="text-stone-500 mt-0.5">{activePayslip.designation} · {activePayslip.department} ({activePayslip.branch})</p>
                                    <p className="text-stone-400 text-[11px] mt-0.5">{activePayslip.bankAccount}</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 text-[#00B050] font-extrabold rounded-full border border-emerald-100">
                                    {activePayslip.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100/60">
                                    <p className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">Earnings</p>
                                    <div className="flex justify-between text-stone-600"><span>Basic Salary</span><span className="font-bold">৳{activePayslip.basicSalary.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-stone-600"><span>House Rent</span><span>৳{activePayslip.houseRent.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-stone-600"><span>Medical</span><span>৳{activePayslip.medicalAllowance.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-stone-600"><span>Conveyance</span><span>৳{activePayslip.transportAllowance.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-stone-600"><span>Food</span><span>৳{activePayslip.foodAllowance.toLocaleString()}</span></div>
                                    {activePayslip.overtimePay > 0 && (
                                        <div className="flex justify-between text-[#00B050] font-bold"><span>Overtime</span><span>+৳{activePayslip.overtimePay.toFixed(2)}</span></div>
                                    )}
                                </div>

                                <div className="space-y-1.5 p-3 rounded-2xl bg-rose-50/30 border border-rose-100/60">
                                    <p className="font-bold text-rose-900 uppercase text-[10px] tracking-wider">Deductions</p>
                                    <div className="flex justify-between text-rose-600"><span>Income Tax</span><span>-৳{activePayslip.taxDeduction.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-rose-600"><span>Provident Fund</span><span>-৳{activePayslip.providentFund.toLocaleString()}</span></div>
                                    {activePayslip.lateDeduction > 0 && (
                                        <div className="flex justify-between text-rose-600"><span>Late Penalty</span><span>-৳{activePayslip.lateDeduction.toLocaleString()}</span></div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-stone-100 pt-3 flex items-center justify-between font-bold text-sm">
                                <span className="text-stone-900">Net Take-Home Pay</span>
                                <span className="text-[#00B050] text-base font-extrabold">
                                    ৳{activePayslip.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => window.open(`/api/payslips/${activePayslip.id}/download?print=true`, "_blank")}
                                className="flex items-center gap-1.5 px-4 py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition-colors cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5 text-stone-500" />
                                Official Print
                            </button>
                            <button
                                onClick={() => window.open(`/api/payslips/${activePayslip.id}/download`, "_blank")}
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#00B050] text-white hover:bg-[#009b46] rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download PDF / Slip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
