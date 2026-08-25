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
    Loader2, 
    ExternalLink, 
    History, 
    CreditCard, 
    AlertCircle, 
    ArrowDownRight,
    BadgePercent
} from "lucide-react";
import { api } from "@/lib/api-client";

interface ReferralAccountState {
    id?: string;
    referralCode: string;
    referralLink: string;
    commissionRate: number;
    totalClicks: number;
    totalRegistrations: number;
    totalPaidCustomers: number;
    totalRevenue: number;
    pendingCommission: number;
    availableBalance: number;
    paidCommission: number;
}

export default function OrgAdminReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("50");
    const [payoutMethod, setPayoutMethod] = useState<"Bank Transfer" | "bKash" | "Nagad" | "PayPal" | "Wise">("bKash");
    const [payoutDetails, setPayoutDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"commissions" | "withdrawals">("commissions");

    const [account, setAccount] = useState<ReferralAccountState>({
        referralCode: "ORGREF",
        referralLink: "https://smartattendance.io/signup?ref=ORGREF",
        commissionRate: 20.0,
        totalClicks: 0,
        totalRegistrations: 0,
        totalPaidCustomers: 0,
        totalRevenue: 0.0,
        pendingCommission: 0.0,
        availableBalance: 0.0,
        paidCommission: 0.0,
    });

    const [commissions, setCommissions] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const [accRes, linkRes, analyticsRes] = await Promise.all([
                api.referrals.getAccount().catch(() => ({ success: false, data: null })),
                api.referrals.getLink().catch(() => ({ success: false, data: null })),
                api.referrals.getAnalytics().catch(() => ({ success: false, data: null })),
            ]);

            if (accRes && accRes.success && accRes.data) {
                const accData = accRes.data;
                const linkData = linkRes?.data;
                const analyticsData = analyticsRes?.data;

                const code = linkData?.referralCode || accData.referralCode || "ORGREF";
                const link = linkData?.referralLink || accData.referralLink || `${window.location.origin}/signup?ref=${code}`;

                setAccount({
                    id: accData.id,
                    referralCode: code,
                    referralLink: link,
                    commissionRate: accData.commissionRate || linkData?.commissionRate || 20.0,
                    totalClicks: analyticsData?.totalClicks ?? accData.totalClicks ?? 0,
                    totalRegistrations: analyticsData?.totalRegistrations ?? accData.totalRegistrations ?? 0,
                    totalPaidCustomers: analyticsData?.totalConversions ?? accData.totalPaidCustomers ?? 0,
                    totalRevenue: analyticsData?.totalRevenue ?? accData.totalRevenue ?? 0.0,
                    pendingCommission: analyticsData?.pendingBalance ?? accData.pendingBalance ?? accData.pendingCommission ?? 0.0,
                    availableBalance: analyticsData?.availableBalance ?? accData.availableBalance ?? 0.0,
                    paidCommission: analyticsData?.lifetimePaid ?? accData.lifetimePaid ?? accData.paidCommission ?? 0.0,
                });

                if (Array.isArray(accData.commissions)) {
                    setCommissions(accData.commissions);
                }
                if (Array.isArray(accData.withdrawals)) {
                    setWithdrawals(accData.withdrawals);
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

    useEffect(() => {
        if (!loading && containerRef.current) {
            const cards = containerRef.current.querySelectorAll(".metric-card");
            if (cards.length > 0) {
                const ctx = gsap.context(() => {
                    gsap.fromTo(
                        cards,
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
                    );
                }, containerRef);
                return () => ctx.revert();
            }
        }
    }, [loading]);

    const handleCopy = () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(account.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWithdrawSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(withdrawAmount);
        if (amt < 50) {
            alert("Minimum withdrawal amount is $50.00");
            return;
        }
        if (amt > account.availableBalance) {
            alert(`Insufficient balance. You have $${account.availableBalance.toFixed(2)} available.`);
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await api.referrals.requestWithdrawal({
                referralAccountId: account.id,
                amount: amt,
                paymentMethod: payoutMethod,
                paymentDetails: payoutDetails,
            });

            if (res.success) {
                alert("🎉 Withdrawal request submitted successfully! Payout will be processed within 2-3 business days.");
                await fetchReferralData();
                setIsWithdrawModalOpen(false);
                setWithdrawAmount("50");
                setPayoutDetails("");
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
        <div ref={containerRef} className="flex-1 bg-stone-50/50 p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Referral & Affiliate Commission Hub
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Share your unique referral tracking link, earn recurring commissions, and withdraw payouts directly
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        disabled={account.availableBalance < 50}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 ${
                            account.availableBalance >= 50
                                ? "bg-[#00B050] hover:bg-[#009b46] text-white shadow-[#00B050]/20"
                                : "bg-stone-200 text-stone-500 cursor-not-allowed shadow-none"
                        }`}
                    >
                        <Wallet className="w-4 h-4" />
                        Request Payout ({account.availableBalance >= 50 ? `$${account.availableBalance.toFixed(2)}` : "Min $50"})
                    </button>
                </div>
            </div>

            {/* Referral Link Showcase Hero Banner */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
                <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/25">
                        <BadgePercent className="w-3.5 h-3.5" />
                        Active Tier: Standard Affiliate ({account.commissionRate}% Commission)
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight">
                        Your Unique Referral Code: <span className="font-mono underline text-emerald-200">{account.referralCode}</span>
                    </h2>
                    <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
                        Earn recurring monthly commissions for every business or organization that signs up and subscribes using your link.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/25 w-full md:w-auto shadow-inner">
                    <input
                        type="text"
                        readOnly
                        value={account.referralLink}
                        className="bg-transparent text-xs text-white px-3 py-1 font-mono outline-none w-full md:w-80 select-all"
                    />
                    <button
                        onClick={handleCopy}
                        className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 active:scale-95"
                    >
                        {copied ? <Check className="w-4 h-4 text-[#00B050]" /> : <Copy className="w-4 h-4 text-emerald-800" />}
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                </div>
            </div>

            {/* Financial & Conversion Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="metric-card bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Available Wallet Balance</p>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#00B050] mt-2 font-mono">
                        ${account.availableBalance.toFixed(2)}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Ready for withdrawal</p>
                </div>

                <div className="metric-card bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pending Holding Balance</p>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-amber-600 mt-2 font-mono">
                        ${account.pendingCommission.toFixed(2)}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-medium">14-day clearance hold</p>
                </div>

                <div className="metric-card bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Referred Organizations</p>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-stone-900 mt-2 font-mono">
                        {account.totalRegistrations}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                        {account.totalPaidCustomers} paid subscribers
                    </p>
                </div>

                <div className="metric-card bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Link Clicks</p>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <MousePointerClick className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-stone-900 mt-2 font-mono">
                        {account.totalClicks}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                        {account.totalClicks > 0 
                            ? `${((account.totalPaidCustomers / account.totalClicks) * 100).toFixed(1)}% conversion`
                            : "0.0% conversion rate"}
                    </p>
                </div>
            </div>

            {/* Commissions & Withdrawals Ledger Section */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-stone-100 px-6 pt-4">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveTab("commissions")}
                            className={`pb-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === "commissions"
                                    ? "border-[#00B050] text-[#00B050]"
                                    : "border-transparent text-stone-400 hover:text-stone-700"
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Commissions Ledger ({commissions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("withdrawals")}
                            className={`pb-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === "withdrawals"
                                    ? "border-[#00B050] text-[#00B050]"
                                    : "border-transparent text-stone-400 hover:text-stone-700"
                            }`}
                        >
                            <History className="w-4 h-4" />
                            Payout Requests & History ({withdrawals.length})
                        </button>
                    </div>

                    <div className="pb-4 text-xs font-semibold text-stone-400">
                        Lifetime Paid: <span className="font-bold text-stone-800">${account.paidCommission.toFixed(2)}</span>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-stone-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
                        <span className="text-xs font-semibold">Loading ledger transactions...</span>
                    </div>
                ) : activeTab === "commissions" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-50/80 border-b border-stone-200/70 text-stone-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Referred Client</th>
                                    <th className="px-6 py-4">Subscription Plan</th>
                                    <th className="px-6 py-4">Billing Base</th>
                                    <th className="px-6 py-4">Commission</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium">
                                {commissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-stone-400">
                                            No commission records yet. Share your referral link to start earning!
                                        </td>
                                    </tr>
                                ) : (
                                    commissions.map((c) => (
                                        <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-stone-900 leading-tight">{c.organizationName || "Referred Organization"}</p>
                                                <p className="text-[11px] text-stone-400">Ref Code: {c.referralCode}</p>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-stone-700">
                                                {c.planName || "Enterprise Plan"} ({c.billingCycle || "Monthly"})
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-stone-800">
                                                ${Number(c.baseAmount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-extrabold text-[#00B050]">
                                                +${Number(c.commissionAmount || 0).toFixed(2)} ({c.commissionRate || 20}%)
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                    c.status === "AVAILABLE" || c.status === "APPROVED" || c.status === "PAID"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : c.status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                                                }`}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-stone-500 font-mono text-[11px]">
                                                {c.createdAt ? c.createdAt.split("T")[0] : "Recent"}
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
                            <thead className="bg-stone-50/80 border-b border-stone-200/70 text-stone-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Request ID</th>
                                    <th className="px-6 py-4">Payout Amount</th>
                                    <th className="px-6 py-4">Payment Method</th>
                                    <th className="px-6 py-4">Recipient Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Date Requested</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium">
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-stone-400">
                                            No payout requests submitted yet.
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w) => (
                                        <tr key={w.id} className="hover:bg-stone-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-stone-700">
                                                {w.id}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-extrabold text-stone-900 text-sm">
                                                ${Number(w.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-stone-700">
                                                {w.paymentMethod}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 font-mono text-[11px]">
                                                {w.paymentDetails}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                    w.status === "PAID"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : w.status === "APPROVED" || w.status === "PROCESSING"
                                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                        : w.status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                                                }`}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-stone-500 font-mono text-[11px]">
                                                {w.requestedAt ? w.requestedAt.split("T")[0] : "Recent"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payout Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 border border-stone-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="font-bold text-stone-900 text-base">Request Commission Payout</h3>
                                <p className="text-xs text-stone-500">Direct disbursement to your verified payout account</p>
                            </div>
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Withdrawal Amount ($ USD)
                                </label>
                                <input
                                    type="number"
                                    min="50"
                                    max={account.availableBalance}
                                    step="1"
                                    required
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                                <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
                                    <span>Available Balance: <strong className="text-emerald-700 font-mono">${account.availableBalance.toFixed(2)}</strong></span>
                                    <span>Minimum Payout: $50.00</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Payout Channel / Method</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                >
                                    <option value="bKash">bKash (Personal / Merchant)</option>
                                    <option value="Nagad">Nagad Mobile Banking</option>
                                    <option value="Bank Transfer">Direct Bank Wire (EFT / BEFTN)</option>
                                    <option value="PayPal">PayPal</option>
                                    <option value="Wise">Wise (TransferWise)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Account & Disbursement Details</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 017XXXXXXXX / Bank Name, AC No, Routing No"
                                    value={payoutDetails}
                                    onChange={(e) => setPayoutDetails(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || account.availableBalance < 50}
                                    className="px-5 py-2.5 text-xs font-bold bg-[#00B050] text-white rounded-xl shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Submitting Request...
                                        </>
                                    ) : (
                                        "Submit Payout Request"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
