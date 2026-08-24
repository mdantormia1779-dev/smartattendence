"use client";

import React, { useState, useEffect } from "react";
import { 
    Share2, 
    Copy, 
    Check, 
    DollarSign, 
    TrendingUp, 
    Wallet, 
    Sparkles, 
    CheckCircle2, 
    X, 
    Building2,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function ManagerReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("60");
    const [payoutMethod, setPayoutMethod] = useState("bKash");
    const [payoutDetails, setPayoutDetails] = useState("+880 1712-998877");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [account, setAccount] = useState({
        referralCode: "MGR-REF",
        referralLink: "https://smartattendance.io/signup?ref=MGR-REF",
        commissionRate: 20.0,
        totalClicks: 0,
        totalRegistrations: 0,
        totalPaidCustomers: 0,
        availableBalance: 0,
        pendingCommission: 0,
    });

    const [commissions, setCommissions] = useState<any[]>([]);

    const fetchReferralAccount = async () => {
        try {
            setLoading(true);
            const [accRes, linkRes] = await Promise.all([
                api.referrals.getAccount(),
                api.referrals.getLink(),
            ]);

            if (accRes.success && accRes.data) {
                setAccount((prev) => ({
                    ...prev,
                    ...accRes.data,
                    referralLink: linkRes.data?.link || prev.referralLink,
                    referralCode: linkRes.data?.code || accRes.data.code || prev.referralCode,
                }));
                if (Array.isArray(accRes.data.commissions)) {
                    setCommissions(accRes.data.commissions);
                }
            }
        } catch (e) {
            console.error("Failed to load manager referral account", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralAccount();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(account.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdraw = async (e: React.FormEvent) => {
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
                alert("🎉 Payout request submitted successfully!");
                await fetchReferralAccount();
                setIsWithdrawModalOpen(false);
            } else {
                alert(res.message || "Failed to submit withdrawal");
            }
        } catch (e: any) {
            alert(e.message || "Error processing withdrawal request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Manager Referral & Commission Program
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Recommend Smart Attendance to professional connections and earn 20% recurring monthly rewards
                    </p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 cursor-pointer"
                >
                    <Wallet className="w-4 h-4" />
                    Withdraw Earnings
                </button>
            </div>

            {/* Share Card */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 text-white space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00B050]/20 text-[#00B050] border border-[#00B050]/30">
                    <Sparkles className="w-3.5 h-3.5" /> 20% Recurring Reward
                </span>
                <h2 className="text-xl sm:text-2xl font-bold">Your Unique Manager Referral Code</h2>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 font-mono text-sm tracking-wider text-white w-full sm:w-auto">
                        {account.referralLink}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="w-full sm:w-auto px-5 py-3 bg-[#00B050] hover:bg-[#009b46] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00B050]/30 cursor-pointer"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied Link!" : "Copy Link"}
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Available Balance</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">${account.availableBalance.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready for payout</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending Clearance</p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">${account.pendingCommission.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">14-day hold</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Referred Organizations</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{account.totalRegistrations} Companies</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{account.totalPaidCustomers} Paid</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Link Clicks</p>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-1">{account.totalClicks} Visits</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Tracking conversions</p>
                </div>
            </div>

            {/* Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">Request Manager Payout</h3>
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Withdraw Amount ($)</label>
                                <input
                                    type="number"
                                    min="50"
                                    max={account.availableBalance}
                                    required
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Payout Channel</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                                >
                                    <option value="bKash">bKash</option>
                                    <option value="Bank Transfer">Bank Wire</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Account Info</label>
                                <input
                                    type="text"
                                    required
                                    value={payoutDetails}
                                    onChange={(e) => setPayoutDetails(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl hover:bg-[#009b46] cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? "Submitting..." : "Confirm Withdrawal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
