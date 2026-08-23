"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Share2, 
    Copy, 
    Check, 
    DollarSign, 
    Users, 
    MousePointerClick, 
    TrendingUp, 
    Building2, 
    Wallet, 
    ArrowUpRight, 
    Clock, 
    CheckCircle2, 
    X,
    Sparkles
} from "lucide-react";

export default function OrgAdminReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("100");
    const [payoutMethod, setPayoutMethod] = useState<"Bank Transfer" | "bKash" | "PayPal">("bKash");
    const [payoutDetails, setPayoutDetails] = useState("+880 1711-223344 (Merchant)");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [account, setAccount] = useState<any>({
        referralCode: "VERTEX2026",
        referralLink: "https://smartattendance.io/signup?ref=VERTEX2026",
        commissionRate: 20.0,
        totalClicks: 320,
        totalRegistrations: 18,
        totalPaidCustomers: 6,
        totalRevenue: 1200.0,
        pendingCommission: 90.0,
        availableBalance: 150.0,
        paidCommission: 0.0,
    });

    const [commissions, setCommissions] = useState<any[]>([
        {
            id: "com-1",
            orgName: "Apex Logistics Ltd.",
            plan: "Starter Plan ($39/mo)",
            amount: 7.8,
            date: "2026-08-10",
            status: "AVAILABLE",
        },
        {
            id: "com-2",
            orgName: "Dhaka Digital Lab",
            plan: "Business Plan ($149/mo)",
            amount: 29.8,
            date: "2026-08-01",
            status: "AVAILABLE",
        },
        {
            id: "com-3",
            orgName: "Sylhet Tea Exports",
            plan: "Business Plan ($149/mo)",
            amount: 29.8,
            date: "2026-08-18",
            status: "PENDING",
        },
    ]);

    const [withdrawals, setWithdrawals] = useState<any[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(account.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdrawSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(withdrawAmount);
        if (amt < 50) {
            alert("Minimum withdrawal is $50");
            return;
        }
        if (amt > account.availableBalance) {
            alert(`Insufficient balance. You have $${account.availableBalance} available.`);
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setAccount({
                ...account,
                availableBalance: account.availableBalance - amt,
            });
            setWithdrawals([
                {
                    id: `wth-${Date.now()}`,
                    amount: amt,
                    paymentMethod: payoutMethod,
                    paymentDetails: payoutDetails,
                    status: "PENDING",
                    requestedAt: new Date().toISOString().split("T")[0],
                },
                ...withdrawals,
            ]);
            setIsSubmitting(false);
            setIsWithdrawModalOpen(false);
            alert("🎉 Withdrawal request submitted! Super Admin will process payout.");
        }, 800);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Organization Referral & Affiliate Rewards
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Invite partner companies to Smart Attendance and earn 20% recurring monthly commission
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 transition-transform hover:scale-105 cursor-pointer"
                    >
                        <Wallet className="w-4 h-4" />
                        Request Payout
                    </button>
                </div>
            </div>

            {/* Referral Link & Sharing Hero Banner */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute right-0 top-0 w-96 h-96 bg-[#00B050]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00B050]/20 text-[#00B050] border border-[#00B050]/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        20% Lifetime Recurring Commission
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Share Vertex Tech's Invitation Link
                    </h2>
                    <p className="text-xs text-gray-300 leading-relaxed">
                        When another business registers and purchases any paid plan with your referral link, your organization earns 20% commission on every renewal for 12 months.
                    </p>

                    {/* Copy Box */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 font-mono text-xs text-white truncate">
                            {account.referralLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="px-5 py-3 rounded-2xl bg-[#00B050] hover:bg-[#009b46] text-white font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied Link!" : "Copy Link"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Link Clicks</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{account.totalClicks} Visits</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{account.totalRegistrations} Signups generated</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Active Subscriptions</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-2">{account.totalPaidCustomers} Orgs</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Recurring active</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending Holding</p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-2 font-mono">${account.pendingCommission.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">30-day fraud holding period</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Available Wallet</p>
                    <h3 className="text-2xl font-bold text-[#00B050] mt-2 font-mono">${account.availableBalance.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready for payout withdrawal</p>
                </div>
            </div>

            {/* Commissions & Invited Companies Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Referred Organizations & Earnings</h3>
                        <p className="text-xs text-gray-500">Live commission earnings generated through your referral link</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold uppercase tracking-wider">
                                <th className="py-3.5 px-4">Invited Organization</th>
                                <th className="py-3.5 px-4">Plan Subscribed</th>
                                <th className="py-3.5 px-4">Commission (20%)</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {commissions.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        {c.orgName}
                                    </td>
                                    <td className="py-3.5 px-4 text-gray-700">{c.plan}</td>
                                    <td className="py-3.5 px-4 font-bold font-mono text-[#00B050]">+${c.amount.toFixed(2)}</td>
                                    <td className="py-3.5 px-4 text-gray-500 font-mono">{c.date}</td>
                                    <td className="py-3.5 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                            c.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                        }`}>
                                            {c.status === "AVAILABLE" && <CheckCircle2 className="w-3 h-3" />}
                                            {c.status === "PENDING" && <Clock className="w-3 h-3" />}
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-[#00B050]" />
                                Request Referral Commission Payout
                            </h3>
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/60 flex items-center justify-between text-xs">
                            <span className="text-emerald-900 font-semibold">Available Balance:</span>
                            <span className="font-bold text-lg text-[#00B050] font-mono">${account.availableBalance.toFixed(2)}</span>
                        </div>

                        <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Withdrawal Amount ($)</label>
                                <input
                                    type="number"
                                    min={50}
                                    max={account.availableBalance}
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                                <p className="text-[10px] text-gray-400 mt-0.5">Minimum withdrawal limit: $50.00</p>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                                >
                                    <option value="bKash">bKash Mobile Banking</option>
                                    <option value="Nagad">Nagad Mobile Banking</option>
                                    <option value="Bank Transfer">Direct Bank Wire</option>
                                    <option value="PayPal">PayPal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Account & Routing Details</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. +880 1711-223344 or Bank Name, A/C No"
                                    value={payoutDetails}
                                    onChange={(e) => setPayoutDetails(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Payout Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
