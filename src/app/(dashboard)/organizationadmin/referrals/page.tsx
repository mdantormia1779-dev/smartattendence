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
    Sparkles,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function OrgAdminReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("100");
    const [payoutMethod, setPayoutMethod] = useState<"Bank Transfer" | "bKash" | "PayPal">("bKash");
    const [payoutDetails, setPayoutDetails] = useState("+880 1711-223344 (Merchant)");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

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

    const [commissions, setCommissions] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const [accRes, linkRes, analyticsRes] = await Promise.all([
                api.referrals.getAccount(),
                api.referrals.getLink(),
                api.referrals.getAnalytics(),
            ]);

            if (accRes.success && accRes.data) {
                setAccount((prev: any) => ({
                    ...prev,
                    ...accRes.data,
                    referralLink: linkRes.data?.link || prev.referralLink,
                    referralCode: linkRes.data?.code || accRes.data.code || prev.referralCode,
                }));
                if (Array.isArray(accRes.data.commissions)) {
                    setCommissions(accRes.data.commissions);
                }
                if (Array.isArray(accRes.data.withdrawals)) {
                    setWithdrawals(accRes.data.withdrawals);
                }
            }
        } catch (e) {
            console.error("Failed to load referral data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, []);

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

        try {
            setIsSubmitting(true);
            const res = await api.referrals.requestWithdrawal({
                amount: amt,
                payoutMethod,
                payoutDetails,
            });

            if (res.success) {
                alert("Withdrawal request submitted successfully!");
                await fetchReferralData();
                setIsWithdrawModalOpen(false);
            } else {
                alert(res.message || "Failed to submit withdrawal request");
            }
        } catch (e: any) {
            alert(e.message || "Error submitting withdrawal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Referral & Affiliate Commission Hub
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Share your unique referral link, earn up to 30% recurring commissions, and withdraw payouts
                    </p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                >
                    <Wallet className="w-4 h-4" />
                    Request Payout
                </button>
            </div>

            {/* Referral Link Bar */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Active Tier: Silver ({account.commissionRate}% Commission)
                    </span>
                    <h2 className="text-xl font-bold">Your Tracking Code: <span className="font-mono underline">{account.referralCode}</span></h2>
                    <p className="text-xs text-emerald-100">Earn monthly recurring revenue for every company you invite.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 w-full md:w-auto">
                    <input
                        type="text"
                        readOnly
                        value={account.referralLink}
                        className="bg-transparent text-xs text-white px-3 py-1 font-mono outline-none w-full md:w-72"
                    />
                    <button
                        onClick={handleCopy}
                        className="bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Available Wallet Balance</p>
                    <h3 className="text-2xl font-bold text-[#00B050] mt-1 font-mono">${account.availableBalance.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready for withdrawal</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending Holding Commission</p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">${account.pendingCommission.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">14-day clearance hold</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Referred Organizations</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{account.totalRegistrations} Companies</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{account.totalPaidCustomers} paid subscribers</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Referral Link Clicks</p>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-1">{account.totalClicks} Clicks</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">5.6% conversion rate</p>
                </div>
            </div>

            {/* Payout Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">Request Commission Payout</h3>
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Withdrawal Amount ($)</label>
                                <input
                                    type="number"
                                    min="50"
                                    max={account.availableBalance}
                                    step="1"
                                    required
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                                <span className="text-[10px] text-gray-400">Available: ${account.availableBalance.toFixed(2)} (Min: $50)</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                >
                                    <option value="bKash">bKash Merchant / Personal</option>
                                    <option value="Bank Transfer">Direct Bank Wire (EFT)</option>
                                    <option value="PayPal">PayPal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Account / Payout Details</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Bank Account No, Branch, Routing or Mobile Number"
                                    value={payoutDetails}
                                    onChange={(e) => setPayoutDetails(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer disabled:opacity-50"
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
