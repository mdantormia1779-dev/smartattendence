"use client";

import React, { useState } from "react";
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
    Building2
} from "lucide-react";

export default function ManagerReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("60");
    const [payoutMethod, setPayoutMethod] = useState("bKash");
    const [payoutDetails, setPayoutDetails] = useState("+880 1712-998877");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [account, setAccount] = useState({
        referralCode: "TANVIR-MGR01",
        referralLink: "https://smartattendance.io/signup?ref=TANVIR-MGR01",
        commissionRate: 20.0,
        totalClicks: 185,
        totalRegistrations: 12,
        totalPaidCustomers: 4,
        availableBalance: 88.5,
        pendingCommission: 40.0,
    });

    const [commissions, setCommissions] = useState([
        { id: "com-1", org: "Smart Retail Group", plan: "Starter ($39/mo)", amt: 7.8, status: "AVAILABLE" },
        { id: "com-2", org: "Apex Engineering", plan: "Business ($149/mo)", amt: 29.8, status: "AVAILABLE" },
        { id: "com-3", org: "InnoSoft Digital", plan: "Business ($149/mo)", amt: 29.8, status: "PENDING" },
    ]);

    const handleCopy = () => {
        navigator.clipboard.writeText(account.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdraw = (e: React.FormEvent) => {
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
            setIsSubmitting(false);
            setIsWithdrawModalOpen(false);
            alert("🎉 Payout request submitted successfully!");
        }, 600);
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3 border border-white/10 font-mono text-xs truncate">
                        {account.referralLink}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="px-5 py-3 rounded-2xl bg-[#00B050] hover:bg-[#009b46] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Clicks</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{account.totalClicks}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{account.totalRegistrations} Signups</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Converted Orgs</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">{account.totalPaidCustomers}</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Paid subscriptions</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending Holding</p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">${account.pendingCommission.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Under 30d verification</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Available Balance</p>
                    <h3 className="text-2xl font-bold text-[#00B050] mt-1 font-mono">${account.availableBalance.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready for payout</p>
                </div>
            </div>

            {/* Commissions List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Your Commission Earnings</h3>
                <div className="divide-y divide-gray-100 text-xs">
                    {commissions.map((c) => (
                        <div key={c.id} className="py-3 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900">{c.org}</p>
                                <span className="text-[11px] text-gray-400">{c.plan}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold font-mono text-[#00B050] text-sm">+${c.amt.toFixed(2)}</span>
                                <p className="text-[10px] text-emerald-600 font-semibold">{c.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm">Request Payout</h3>
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    min={50}
                                    max={account.availableBalance}
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Method</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                                >
                                    <option value="bKash">bKash</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Account Info</label>
                                <input
                                    type="text"
                                    required
                                    value={payoutDetails}
                                    onChange={(e) => setPayoutDetails(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-[#00B050] text-white rounded-xl text-xs font-bold"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
