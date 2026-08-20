"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Clock, Search, Smartphone } from "lucide-react";
import gsap from "gsap";

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

const initialPayments: PaymentRequest[] = [
    {
        id: "pay-1",
        organization: "TechCorp Solutions",
        planName: "Business Plan",
        amount: "$149",
        billingCycle: "Monthly",
        date: "2026-06-04",
        status: "Pending",
        transactionId: "TRX-982341",
        senderNumber: "01711223344",
    },
    {
        id: "pay-2",
        organization: "Alpha Industries",
        planName: "Starter Plan",
        amount: "$39",
        billingCycle: "Yearly",
        date: "2026-06-03",
        status: "Pending",
        transactionId: "TRX-883920",
        senderNumber: "01822334455",
    },
    {
        id: "pay-3",
        organization: "Global Logistics",
        planName: "Enterprise Plan",
        amount: "$319",
        billingCycle: "Yearly",
        date: "2026-06-02",
        status: "Approved",
        transactionId: "TRX-774829",
    },
    {
        id: "pay-4",
        organization: "Delta Media",
        planName: "Business Plan",
        amount: "$149",
        billingCycle: "Monthly",
        date: "2026-06-01",
        status: "Rejected",
        transactionId: "TRX-665219",
    },
];

export default function ApprovePaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>(initialPayments);
    const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
    const [searchQuery, setSearchQuery] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    // Load and sync payment requests from localStorage on mount
    useEffect(() => {
        const storedRequests = localStorage.getItem("payment_requests");
        if (storedRequests) {
            try {
                const parsed = JSON.parse(storedRequests);
                // Combine stored requests with initial dummy data, ensuring no duplicate IDs
                const combined = [
                    ...parsed,
                    ...initialPayments.filter((ip) => !parsed.some((p: PaymentRequest) => p.id === ip.id)),
                ];
                setPayments(combined);
            } catch (error) {
                console.error("Failed to parse payment requests from localStorage", error);
            }
        }
    }, []);

    useEffect(() => {
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
    }, [filter, payments]);

    const updatePaymentStatus = (id: string, newStatus: "Approved" | "Rejected") => {
        const updatedPayments = payments.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
        setPayments(updatedPayments);
        // Persist update to localStorage so it stays synced
        localStorage.setItem("payment_requests", JSON.stringify(updatedPayments));
    };

    const handleApprove = (id: string) => {
        updatePaymentStatus(id, "Approved");
    };

    const handleReject = (id: string) => {
        updatePaymentStatus(id, "Rejected");
    };

    const filteredPayments = payments.filter((item) => {
        const matchesFilter = filter === "All" || item.status === filter;
        const matchesSearch =
            item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.senderNumber && item.senderNumber.includes(searchQuery));
        return matchesFilter && matchesSearch;
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800 overflow-x-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-header gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Payment Approvals</h1>
                    <p className="text-sm text-neutral-500 mt-1">Review and manage manual subscription payment requests</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search org, TRX or number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 animate-header">
                {(["Pending", "All", "Approved", "Rejected"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            filter === tab
                                ? "bg-[#10b981] text-white shadow-sm"
                                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                    >
                        {tab} {tab === "Pending" && `(${payments.filter((p) => p.status === "Pending").length})`}
                    </button>
                ))}
            </div>

            {/* Payments Table / Card List */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden animate-header">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">Organization</th>
                                <th className="py-4 px-6">Plan Details</th>
                                <th className="py-4 px-6">Amount</th>
                                <th className="py-4 px-6">Transaction Info</th>
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-sm">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((item) => (
                                    <tr key={item.id} className="animate-table-row hover:bg-neutral-50/60 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-neutral-900">
                                            {item.organization}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-neutral-800">{item.planName}</div>
                                            <div className="text-xs text-neutral-400">{item.billingCycle}</div>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-neutral-900">{item.amount}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-mono text-xs font-semibold text-neutral-800">{item.transactionId}</div>
                                            {item.senderNumber && (
                                                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                                                    <Smartphone className="w-3 h-3 text-pink-500" /> {item.senderNumber}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-neutral-500 text-xs">{item.date}</td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.status === "Approved"
                                                        ? "bg-emerald-50 text-[#10b981]"
                                                        : item.status === "Rejected"
                                                        ? "bg-rose-50 text-rose-600"
                                                        : "bg-amber-50 text-amber-600"
                                                }`}
                                            >
                                                {item.status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {item.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                                                {item.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {item.status === "Pending" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(item.id)}
                                                        className="px-3 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(item.id)}
                                                        className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400 italic">No action needed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-neutral-400 text-sm">
                                        No payment requests found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}