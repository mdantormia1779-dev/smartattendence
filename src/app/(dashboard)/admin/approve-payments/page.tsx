"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Clock, Search, Smartphone, Loader2 } from "lucide-react";
import gsap from "gsap";
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
}

export default function ApprovePaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
    const [searchQuery, setSearchQuery] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.payments.getAll();
            if (res.success && Array.isArray(res.data)) {
                const mapped: PaymentRequest[] = res.data.map((p: any) => {
                    let formattedStatus: PaymentRequest["status"] = "Pending";
                    if (p.status?.toUpperCase() === "APPROVED" || p.status?.toUpperCase() === "SUCCESS") {
                        formattedStatus = "Approved";
                    } else if (p.status?.toUpperCase() === "REJECTED" || p.status?.toUpperCase() === "FAILED") {
                        formattedStatus = "Rejected";
                    }

                    return {
                        id: p.id,
                        organization: p.organizationName || p.organization || "Company",
                        planName: p.plan || "Business Plan",
                        amount: `$${p.amount || 149}`,
                        billingCycle: p.billingCycle || "Monthly",
                        date: p.date || (p.createdAt ? p.createdAt.split("T")[0] : "2026-08-20"),
                        status: formattedStatus,
                        transactionId: p.transactionId || `TRX-${p.id?.substring(0, 6)}`,
                        senderNumber: p.senderNumber || "+880 1711-000000",
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

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.from(".animate-header", {
                    opacity: 0,
                    y: -20,
                    duration: 0.7,
                    ease: "power3.out",
                    stagger: 0.1,
                });

                gsap.from(".animate-table-row", {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    ease: "power2.out",
                    stagger: 0.08,
                    delay: 0.2,
                });
            }, containerRef);

            return () => ctx.revert();
        }
    }, [loading, filter]);

    const handleApprove = async (id: string) => {
        try {
            await api.payments.updateStatus(id, "APPROVED");
            await fetchPayments();
        } catch (e) {
            console.error("Failed to approve payment", e);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.payments.updateStatus(id, "REJECTED");
            await fetchPayments();
        } catch (e) {
            console.error("Failed to reject payment", e);
        }
    };

    const filteredPayments = payments.filter((payment) => {
        const matchesFilter = filter === "All" || payment.status === filter;
        const matchesSearch =
            payment.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (payment.senderNumber && payment.senderNumber.includes(searchQuery));
        return matchesFilter && matchesSearch;
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="animate-header opacity-0">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Subscription Payment Verifications</h1>
                    <p className="text-sm text-neutral-500 mt-1">Review manual bKash/Nagad/Bank wire proofs, verify transaction IDs, and activate SaaS plans</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 animate-header opacity-0">
                    {/* Status Filter Buttons */}
                    <div className="bg-neutral-200/60 p-1 rounded-xl flex items-center border border-neutral-200 text-xs font-semibold">
                        {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    filter === status
                                        ? "bg-white text-neutral-900 shadow-xs"
                                        : "text-neutral-500 hover:text-neutral-900"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden animate-table-row opacity-0">
                {/* Search Header */}
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by company name, TRX ID, or mobile number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50/60 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                        />
                    </div>
                </div>

                {/* Payments Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-neutral-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span className="text-xs">Loading payment records...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Organization</th>
                                    <th className="py-3.5 px-6">Plan & Amount</th>
                                    <th className="py-3.5 px-6">Transaction Details</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-sm">
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-neutral-400 text-xs">
                                            No payment records matching your filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-neutral-50/60 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-neutral-900 text-xs">{payment.organization}</p>
                                                <p className="text-[11px] text-neutral-400">{payment.date}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-neutral-800 text-xs">{payment.planName} ({payment.billingCycle})</p>
                                                <p className="text-xs font-bold text-[#00B050] font-mono">{payment.amount}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md font-bold">
                                                    {payment.transactionId}
                                                </span>
                                                {payment.senderNumber && (
                                                    <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                                                        <Smartphone className="w-3 h-3 text-[#00B050]" /> {payment.senderNumber}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {payment.status === "Approved" && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3 h-3" /> Approved & Active
                                                    </span>
                                                )}
                                                {payment.status === "Pending" && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3 h-3" /> Pending Verification
                                                    </span>
                                                )}
                                                {payment.status === "Rejected" && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle className="w-3 h-3" /> Rejected
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {payment.status === "Pending" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleReject(payment.id)}
                                                            className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(payment.id)}
                                                            className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                                        >
                                                            Approve & Activate
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400 font-medium">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}