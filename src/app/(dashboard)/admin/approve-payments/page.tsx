"use client";

import React, { useState, useEffect } from "react";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Smartphone, 
    Loader2, 
    CreditCard, 
    Building2,
    ShieldCheck,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api-client";

interface PaymentRequest {
    id: string;
    organization: string;
    planName: string;
    amount: string;
    billingCycle: string;
    date: string;
    status: "Pending" | "Approved" | "Rejected";
    transactionId: string;
    senderNumber?: string;
    provider?: string;
}

export default function ApprovePaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.payments.getAll();
            console.log(res)
            if (res.success && Array.isArray(res.data)) {
                const mapped: PaymentRequest[] = res.data.map((p: any) => {
                    let formattedStatus: PaymentRequest["status"] = "Pending";
                    const upperStatus = String(p.status || "").toUpperCase();
                    if (upperStatus === "APPROVED" || upperStatus === "SUCCESS" || upperStatus === "COMPLETED" || upperStatus === "PAID") {
                        formattedStatus = "Approved";
                    } else if (upperStatus === "REJECTED" || upperStatus === "FAILED") {
                        formattedStatus = "Rejected";
                    }

                    const currSymbol = p.currency === "BDT" || p.provider === "bKash" || p.provider === "Nagad" ? "৳" : "$";
                    return {
                        id: p.id,
                        organization: p.organizationName || p.organization || "Enterprise Tenant",
                        planName: p.planName || p.plan || "Standard Plan",
                        amount: `${currSymbol}${Number(p.amount || 0).toLocaleString()}`,
                        billingCycle: p.billingCycle || "Monthly",
                        date: p.date || (p.createdAt ? (p.createdAt.includes("T") ? p.createdAt.split("T")[0] : p.createdAt) : "2026-08-24"),
                        status: formattedStatus,
                        transactionId: p.transactionId || `TRX-${p.id?.substring(0, 8).toUpperCase()}`,
                        senderNumber: p.senderNumber || "+880 1700-000000",
                        provider: p.provider || "bKash",
                    };
                });
                setPayments(mapped);
            }
        } catch (e) {
            console.error("Failed to load payment requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            setProcessingId(id);
            await api.payments.updateStatus(id, "APPROVED");
            await fetchPayments();
        } catch (e) {
            console.error("Failed to approve payment", e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        try {
            setProcessingId(id);
            await api.payments.updateStatus(id, "REJECTED");
            await fetchPayments();
        } catch (e) {
            console.error("Failed to reject payment", e);
        } finally {
            setProcessingId(null);
        }
    };

    const counts = {
        all: payments.length,
        pending: payments.filter((p) => p.status === "Pending").length,
        approved: payments.filter((p) => p.status === "Approved").length,
        rejected: payments.filter((p) => p.status === "Rejected").length,
    };

    const filteredPayments = payments.filter((payment) => {
        const matchesFilter = filter === "All" || payment.status === filter;
        const matchesSearch =
            payment.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (payment.senderNumber && payment.senderNumber.includes(searchQuery)) ||
            payment.planName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#FBFBFA] p-6 md:p-10 text-neutral-800">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
                        <CreditCard className="w-6 h-6 text-[#00B050]" />
                        Subscription Payment Verifications
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Review manual bKash/Nagad/Bank wire proofs, verify transaction IDs, and activate SaaS plans
                    </p>
                </div>

                <button
                    onClick={fetchPayments}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer transition-colors"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Requests", count: counts.all, color: "text-gray-900", border: "border-gray-200", bg: "bg-gray-50" },
                    { label: "Pending Verification", count: counts.pending, color: "text-amber-600", border: "border-amber-200", bg: "bg-amber-50" },
                    { label: "Approved & Active", count: counts.approved, color: "text-[#00B050]", border: "border-emerald-200", bg: "bg-emerald-50" },
                    { label: "Rejected Proofs", count: counts.rejected, color: "text-rose-600", border: "border-rose-200", bg: "bg-rose-50" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`bg-white p-4.5 rounded-2xl border ${stat.border} shadow-[0_2px_10px_rgb(0,0,0,0.02)]`}
                    >
                        <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                        <p className={`text-2xl font-extrabold mt-1 tracking-tight ${stat.color}`}>
                            {loading ? "..." : stat.count}
                        </p>
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                {/* Search & Filter Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by company name, TRX ID, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200 text-xs font-semibold self-start md:self-auto">
                        {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    filter === status
                                        ? "bg-white text-neutral-900 shadow-xs font-bold"
                                        : "text-neutral-500 hover:text-neutral-900"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payments Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-neutral-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span className="text-xs font-medium">Loading payment verification records...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="py-4 px-6">Organization</th>
                                    <th className="py-4 px-6">Plan & Amount</th>
                                    <th className="py-4 px-6">Transaction Details</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-sm">
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-neutral-400 text-xs font-medium">
                                            No payment records found matching your filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => {
                                        const isProcessing = processingId === payment.id;
                                        return (
                                            <tr key={payment.id} className="hover:bg-neutral-50/60 transition-colors">
                                                <td className="py-4.5 px-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold text-xs shrink-0">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-neutral-900 text-xs">{payment.organization}</p>
                                                            <p className="text-[11px] text-neutral-400">{payment.date}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4.5 px-6">
                                                    <p className="font-semibold text-neutral-800 text-xs">
                                                        {payment.planName}{" "}
                                                        <span className="text-neutral-400 font-normal">({payment.billingCycle})</span>
                                                    </p>
                                                    <p className="text-xs font-bold text-[#00B050] font-mono mt-0.5">{payment.amount}</p>
                                                </td>
                                                <td className="py-4.5 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md font-bold">
                                                            {payment.transactionId}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                            {payment.provider}
                                                        </span>
                                                    </div>
                                                    {payment.senderNumber && (
                                                        <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                                                            <Smartphone className="w-3 h-3 text-[#00B050]" /> {payment.senderNumber}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-4.5 px-6">
                                                    {payment.status === "Approved" && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Active
                                                        </span>
                                                    )}
                                                    {payment.status === "Pending" && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Clock className="w-3.5 h-3.5" /> Pending Verification
                                                        </span>
                                                    )}
                                                    {payment.status === "Rejected" && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            <XCircle className="w-3.5 h-3.5" /> Rejected
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4.5 px-6 text-right">
                                                    {payment.status === "Pending" ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                disabled={isProcessing}
                                                                onClick={() => handleReject(payment.id)}
                                                                className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                                            >
                                                                {isProcessing ? "..." : "Reject"}
                                                            </button>
                                                            <button
                                                                disabled={isProcessing}
                                                                onClick={() => handleApprove(payment.id)}
                                                                className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                                                                Approve & Activate
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-neutral-400 font-medium">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}