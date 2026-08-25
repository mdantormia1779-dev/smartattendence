"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
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
    Loader2,
    RefreshCw,
    Clock,
    ArrowUpRight,
    Send,
    ExternalLink,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function ManagerReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("50");
    const [payoutMethod, setPayoutMethod] = useState("bKash");
    const [payoutDetails, setPayoutDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [account, setAccount] = useState({
        id: "",
        referralCode: "",
        referralLink: "",
        commissionRate: 20.0,
        totalClicks: 0,
        totalRegistrations: 0,
        totalPaidCustomers: 0,
        availableBalance: 0,
        pendingCommission: 0,
        totalEarnings: 0,
    });

    const [commissions, setCommissions] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"commissions" | "withdrawals">("commissions");

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchReferralAccount = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const [accRes, linkRes, withRes] = await Promise.allSettled([
                api.referrals.getAccount(),
                api.referrals.getLink(),
                api.referrals.getWithdrawals(),
            ]);

            let code = "MGR-REF";
            let link = "";

            if (linkRes.status === "fulfilled" && linkRes.value?.success && linkRes.value.data) {
                link = linkRes.value.data.link || linkRes.value.data.referralLink || "";
                code = linkRes.value.data.code || linkRes.value.data.referralCode || code;
            }

            if (accRes.status === "fulfilled" && accRes.value?.success && accRes.value.data) {
                const data = accRes.value.data;
                code = data.code || data.referralCode || code;
                if (!link) {
                    const origin = typeof window !== "undefined" ? window.location.origin : "https://smartattendance.io";
                    link = `${origin}/signup?ref=${code}`;
                }

                setAccount({
                    id: data.id || "",
                    referralCode: code,
                    referralLink: link,
                    commissionRate: data.commissionRate || 20.0,
                    totalClicks: data.totalClicks || 0,
                    totalRegistrations: data.totalRegistrations || data.conversions?.length || 0,
                    totalPaidCustomers: data.totalPaidCustomers || data.conversions?.filter((c: any) => c.status === "PAID").length || 0,
                    availableBalance: data.balance || data.availableBalance || 0,
                    pendingCommission: data.pendingCommission || data.pendingBalance || 0,
                    totalEarnings: data.totalEarnings || data.lifetimeEarnings || 0,
                });

                if (Array.isArray(data.commissions)) {
                    setCommissions(data.commissions);
                } else if (Array.isArray(data.conversions)) {
                    setCommissions(data.conversions);
                }

                if (Array.isArray(data.withdrawals)) {
                    setWithdrawals(data.withdrawals);
                }
            } else {
                const origin = typeof window !== "undefined" ? window.location.origin : "https://smartattendance.io";
                setAccount((prev) => ({
                    ...prev,
                    referralCode: code,
                    referralLink: `${origin}/signup?ref=${code}`,
                }));
            }

            if (withRes.status === "fulfilled" && withRes.value?.success && Array.isArray(withRes.value.data)) {
                setWithdrawals(withRes.value.data);
            }
        } catch (e) {
            console.error("Failed to load manager referral account:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReferralAccount();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".stat-card",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [account, loading]);

    const handleCopy = () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(account.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        const amt = parseFloat(withdrawAmount);

        if (isNaN(amt) || amt < 50) {
            setErrorMessage("Minimum withdrawal amount is $50.00");
            return;
        }
        if (amt > account.availableBalance) {
            setErrorMessage(`Insufficient balance. You have $${account.availableBalance.toFixed(2)} available.`);
            return;
        }
        if (!payoutDetails.trim()) {
            setErrorMessage("Please provide valid account / wallet details for payout.");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await api.referrals.requestWithdrawal({
                referralAccountId: account.id || undefined,
                amount: amt,
                paymentMethod: payoutMethod,
                paymentDetails: payoutDetails,
            });

            if (res.success) {
                setSuccessMessage("🎉 Withdrawal request submitted successfully! Admin will review and process payout.");
                setTimeout(() => setSuccessMessage(null), 5000);
                setIsWithdrawModalOpen(false);
                setWithdrawAmount("50");
                setPayoutDetails("");
                await fetchReferralAccount();
            } else {
                setErrorMessage(res.message || "Failed to submit withdrawal request");
            }
        } catch (e: any) {
            setErrorMessage(e.message || "Error processing withdrawal request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen">
            {/* Feedback Alerts */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B050]" />
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Manager Referral & Affiliate Program
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Recommend Smart Attendance to other companies and earn recurring 20% commission on every subscription
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => fetchReferralAccount(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh wallet balance and referrals"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        onClick={() => {
                            setErrorMessage(null);
                            setIsWithdrawModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 cursor-pointer transition-colors"
                    >
                        <Wallet className="w-4 h-4" />
                        Withdraw Earnings
                    </button>
                </div>
            </div>

            {/* Share Card */}
            <div className="bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl border border-neutral-700/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00B050]/20 text-[#00B050] border border-[#00B050]/30">
                        <Sparkles className="w-3.5 h-3.5" /> {account.commissionRate}% Recurring Reward
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">Referral Code: <strong className="text-white">{account.referralCode}</strong></span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold">Your Unique Partner Referral Link</h2>
                <p className="text-xs text-neutral-300 max-w-xl">
                    Share your link with HR directors, business owners, or organizations. When they sign up and subscribe to any plan, you receive 20% recurring monthly payout.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 font-mono text-xs sm:text-sm tracking-wider text-white w-full truncate select-all">
                        {account.referralLink}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="w-full sm:w-auto px-6 py-3 bg-[#00B050] hover:bg-[#009b46] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00B050]/30 cursor-pointer shrink-0"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied Link!" : "Copy Link"}
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Available Balance</p>
                    <h3 className="text-2xl font-bold text-emerald-600 font-mono">${account.availableBalance.toFixed(2)}</h3>
                    <p className="text-[11px] text-neutral-400">Ready for instant payout</p>
                </div>

                <div className="stat-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending Clearance</p>
                    <h3 className="text-2xl font-bold text-amber-600 font-mono">${account.pendingCommission.toFixed(2)}</h3>
                    <p className="text-[11px] text-neutral-400">Clears within 14-day hold</p>
                </div>

                <div className="stat-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Referred Organizations</p>
                    <h3 className="text-2xl font-bold text-neutral-900">{account.totalRegistrations} Companies</h3>
                    <p className="text-[11px] text-neutral-400">{account.totalPaidCustomers} Active Paid Subscriptions</p>
                </div>

                <div className="stat-card bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Link Visits</p>
                    <h3 className="text-2xl font-bold text-indigo-600 font-mono">{account.totalClicks} Clicks</h3>
                    <p className="text-[11px] text-neutral-400">Real-time click tracker</p>
                </div>
            </div>

            {/* Ledger Tabs */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab("commissions")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === "commissions"
                                    ? "bg-neutral-900 text-white shadow-2xs"
                                    : "text-neutral-500 hover:bg-neutral-100"
                            }`}
                        >
                            Commissions & Conversions ({commissions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("withdrawals")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === "withdrawals"
                                    ? "bg-neutral-900 text-white shadow-2xs"
                                    : "text-neutral-500 hover:bg-neutral-100"
                            }`}
                        >
                            Payout History ({withdrawals.length})
                        </button>
                    </div>
                </div>

                {activeTab === "commissions" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-6">Company / User</th>
                                    <th className="py-3.5 px-6">Plan / Amount</th>
                                    <th className="py-3.5 px-6">Your Reward (20%)</th>
                                    <th className="py-3.5 px-6">Date</th>
                                    <th className="py-3.5 px-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium">
                                {commissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-neutral-400">
                                            No referral conversions recorded yet. Share your link above to begin earning!
                                        </td>
                                    </tr>
                                ) : (
                                    commissions.map((c, i) => (
                                        <tr key={c.id || i} className="hover:bg-neutral-50/60 transition-colors">
                                            <td className="py-4 px-6 font-bold text-neutral-900">
                                                {c.referredUserName || c.organizationName || c.name || `Partner #${i + 1}`}
                                            </td>
                                            <td className="py-4 px-6 text-neutral-700 font-mono">
                                                ${c.amount || c.planAmount || "99.00"}
                                            </td>
                                            <td className="py-4 px-6 font-bold text-emerald-600 font-mono">
                                                +${c.commissionAmount || ((c.amount || 99) * 0.2).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-neutral-500">
                                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recent"}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    c.status === "PAID" || c.status === "APPROVED"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : c.status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-neutral-100 text-neutral-600 border-neutral-200"
                                                }`}>
                                                    {c.status || "CLEARED"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-6">Request ID</th>
                                    <th className="py-3.5 px-6">Amount</th>
                                    <th className="py-3.5 px-6">Payout Method</th>
                                    <th className="py-3.5 px-6">Account Details</th>
                                    <th className="py-3.5 px-6">Requested On</th>
                                    <th className="py-3.5 px-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium">
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-neutral-400">
                                            No withdrawal history found.
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w, i) => (
                                        <tr key={w.id || i} className="hover:bg-neutral-50/60 transition-colors">
                                            <td className="py-4 px-6 font-mono text-neutral-500">
                                                {w.id?.substring(0, 8) || `WD-${100 + i}`}
                                            </td>
                                            <td className="py-4 px-6 font-bold text-neutral-900 font-mono">
                                                ${Number(w.amount).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-neutral-700 font-semibold">
                                                {w.paymentMethod || w.payoutMethod || "bKash"}
                                            </td>
                                            <td className="py-4 px-6 text-neutral-500 font-mono max-w-xs truncate" title={w.paymentDetails || w.payoutDetails}>
                                                {w.paymentDetails || w.payoutDetails || "—"}
                                            </td>
                                            <td className="py-4 px-6 text-neutral-500">
                                                {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "Recent"}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    w.status === "PAID" || w.status === "APPROVED"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : w.status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                                }`}>
                                                    {w.status || "PENDING"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="font-bold text-neutral-900 text-base">Request Manager Payout</h3>
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Available for Payout</p>
                                    <p className="text-lg font-bold text-emerald-600 font-mono">${account.availableBalance.toFixed(2)}</p>
                                </div>
                                <span className="text-[10px] font-semibold text-neutral-500 bg-white px-2.5 py-1 rounded-lg border border-neutral-200">
                                    Min $50.00
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Withdraw Amount ($)</label>
                                <input
                                    type="number"
                                    min="50"
                                    max={account.availableBalance}
                                    step="1"
                                    required
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Payout Channel</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] cursor-pointer"
                                >
                                    <option value="bKash">bKash (Personal / Merchant)</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Rocket">Rocket</option>
                                    <option value="Bank Transfer">Bank Wire Transfer</option>
                                    <option value="PayPal">PayPal</option>
                                    <option value="USDT">USDT (Crypto TRC-20)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Account Info / Wallet Address</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={
                                        payoutMethod === "bKash" || payoutMethod === "Nagad" || payoutMethod === "Rocket"
                                            ? "e.g. +880 1712-XXXXXX"
                                            : payoutMethod === "Bank Transfer"
                                            ? "Bank Name, Branch, A/C No, Routing No"
                                            : "Wallet Address / Email"
                                    }
                                    value={payoutDetails}
                                    onChange={(e) => setPayoutDetails(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || account.availableBalance < 50}
                                    className="px-5 py-2 text-xs font-bold bg-[#00B050] text-white rounded-xl hover:bg-[#009b46] shadow-md shadow-[#00B050]/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                                >
                                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Confirm Payout</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
