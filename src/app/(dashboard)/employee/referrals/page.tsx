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
    Building2,
    Send
} from "lucide-react";

export default function EmployeeReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("50");
    const [payoutMethod, setPayoutMethod] = useState<"bKash" | "Nagad" | "Bank Transfer">("bKash");
    const [payoutDetails, setPayoutDetails] = useState("+880 1712-100201 (Personal)");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [account, setAccount] = useState({
        referralCode: "ARIF-EMP1042",
        referralLink: "https://smartattendance.io/signup?ref=ARIF-EMP1042",
        commissionRate: 15.0,
        totalClicks: 145,
        totalRegistrations: 8,
        totalPaidCustomers: 3,
        availableBalance: 67.5,
        pendingCommission: 45.0,
        paidCommission: 0.0,
    });

    const [commissions, setCommissions] = useState([
        { id: "com-1", org: "CloudTech Software", plan: "Business Plan ($149/mo)", amt: 22.35, date: "2026-08-05", status: "AVAILABLE" },
        { id: "com-2", org: "Alpha Retail Store", plan: "Starter Plan ($39/mo)", amt: 5.85, date: "2026-07-28", status: "AVAILABLE" },
        { id: "com-3", org: "Dhaka Creative Studio", plan: "Business Plan ($149/mo)", amt: 22.35, date: "2026-08-15", status: "PENDING" },
    ]);

    const handleCopy = () => {
        navigator.clipboard.writeText(account.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(
            `Automate your office attendance, GPS tracking, and payroll with Smart Attendance ERP! Start your free trial here: ${account.referralLink}`
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(withdrawAmount);
        if (amt < 50) {
            alert("Minimum withdrawal is $50.00");
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
                availableBalance: Number((account.availableBalance - amt).toFixed(2)),
            });
            setIsSubmitting(false);
            setIsWithdrawModalOpen(false);
            alert("🎉 Payout request submitted! Admin will disburse to your mobile wallet.");
        }, 700);
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Employee Refer & Earn Program
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Share Smart Attendance with companies in your network and earn 15% recurring passive commission
                    </p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 cursor-pointer"
                >
                    <Wallet className="w-4 h-4" />
                    Withdraw to bKash / Bank
                </button>
            </div>

            {/* Sharing Hero Card */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute right-0 top-0 w-96 h-96 bg-[#00B050]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00B050]/20 text-[#00B050] border border-[#00B050]/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        15% Extra Monthly Passive Earnings
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Your Personal Employee Referral Link
                    </h2>
                    <p className="text-xs text-gray-300 leading-relaxed">
                        Earn rewards for every business that adopts Smart Attendance through your link. Payments can be directly withdrawn to your bKash, Nagad, or Bank account!
                    </p>

                    {/* Copy Box & WhatsApp button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 font-mono text-xs text-white truncate">
                            {account.referralLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="px-5 py-3 rounded-2xl bg-[#00B050] hover:bg-[#009b46] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                            onClick={handleShareWhatsApp}
                            className="px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Send className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Link Clicks</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{account.totalClicks}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{account.totalRegistrations} Signups</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Paid Companies</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">{account.totalPaidCustomers}</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Earning recurring</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending Holding</p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">${account.pendingCommission.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">30-day clearance</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Available Wallet</p>
                    <h3 className="text-2xl font-bold text-[#00B050] mt-1 font-mono">${account.availableBalance.toFixed(2)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready for payout</p>
                </div>
            </div>

            {/* Commissions History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Your Earned Referral Rewards</h3>
                        <p className="text-xs text-gray-500">History of commissions credited from referred subscriptions</p>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 text-xs">
                    {commissions.map((c) => (
                        <div key={c.id} className="py-3.5 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                    {c.org}
                                </p>
                                <span className="text-[11px] text-gray-400">{c.plan} · {c.date}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold font-mono text-[#00B050] text-sm">+${c.amt.toFixed(2)}</span>
                                <p className="text-[10px] text-emerald-600 font-semibold">{c.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-[#00B050]" />
                                Withdraw Commission Balance
                            </h3>
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/60 flex items-center justify-between text-xs">
                            <span className="text-emerald-900 font-semibold">Available for Payout:</span>
                            <span className="font-bold text-lg text-[#00B050] font-mono">${account.availableBalance.toFixed(2)}</span>
                        </div>

                        <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Amount to Withdraw ($)</label>
                                <input
                                    type="number"
                                    min={50}
                                    max={account.availableBalance}
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                />
                                <p className="text-[10px] text-gray-400 mt-0.5">Minimum payout: $50.00</p>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                                >
                                    <option value="bKash">bKash Mobile Wallet</option>
                                    <option value="Nagad">Nagad Mobile Wallet</option>
                                    <option value="Bank Transfer">Bank Account</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">bKash/Account Number</label>
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
                                    className="px-4 py-2 bg-[#00B050] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
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
