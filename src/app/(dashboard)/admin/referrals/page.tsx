"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Share2, 
    DollarSign, 
    Users, 
    MousePointerClick, 
    TrendingUp, 
    ShieldAlert, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Sliders, 
    Search, 
    Filter, 
    Check, 
    X, 
    Sparkles, 
    ArrowUpRight,
    Building2,
    RefreshCw,
    Wallet
} from "lucide-react";

export default function AdminReferralsPage() {
    const [activeTab, setActiveTab] = useState<"affiliates" | "commissions" | "withdrawals" | "fraud">("affiliates");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Data State
    const [metrics, setMetrics] = useState<any>({
        totalAffiliates: 3,
        totalClicks: 1705,
        totalRegistrations: 112,
        totalPaidCustomers: 41,
        totalReferralRevenue: 6450.0,
        pendingCommissionsTotal: 455.0,
        availableCommissionsTotal: 797.5,
        totalPayoutsDistributed: 1240.0,
        pendingWithdrawalsCount: 2,
        fraudAlertsCount: 1,
    });
    const [config, setConfig] = useState<any>({
        name: "Standard Growth Affiliate Program",
        status: "ACTIVE",
        commissionType: "RECURRING",
        defaultCommissionRate: 20.0,
        holdingPeriodDays: 30,
        cookieDurationDays: 30,
        minimumWithdrawal: 50.0,
        recurringEnabled: true,
        recurringMonths: 12,
        selfReferralBlocked: true,
    });
    const [accounts, setAccounts] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
    
    // Modals
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/referral/admin");
            const data = await res.json();
            if (data.success) {
                setMetrics(data.metrics);
                setConfig(data.config);
                setAccounts(data.accounts || []);
                setCommissions(data.commissions || []);
                setWithdrawals(data.withdrawals || []);
                setFraudAlerts(data.fraudAlerts || []);
            }
        } catch (e) {
            console.error("Failed to load referral admin data", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".ref-kpi",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [metrics]);

    const handlePayoutAction = async (withdrawalId: string, decision: "APPROVED" | "PAID" | "REJECTED") => {
        try {
            const res = await fetch("/api/referral/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "PROCESS_PAYOUT",
                    withdrawalId,
                    decision,
                    rejectionReason: decision === "REJECTED" ? rejectionReason : undefined,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSelectedWithdrawal(null);
                setRejectionReason("");
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/referral/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "UPDATE_CONFIG",
                    config,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setIsConfigModalOpen(false);
                alert("🎉 Referral program settings updated successfully!");
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Referral & Affiliate Management (Section 32)
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Track affiliate acquisition, commissions, fraud alerts, virtual wallets & automated payout processing
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer"
                    >
                        <Sliders className="w-4 h-4" />
                        Program Rules
                    </button>
                </div>
            </div>

            {/* KPI Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="ref-kpi bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Total Affiliates</span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-[#00B050]"><Users className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{metrics.totalAffiliates} Partners</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{metrics.totalClicks} Total Clicks tracked</p>
                </div>

                <div className="ref-kpi bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Paid Conversions</span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><TrendingUp className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{metrics.totalPaidCustomers} Orgs</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        {((metrics.totalPaidCustomers / (metrics.totalRegistrations || 1)) * 100).toFixed(1)}% Conversion Rate
                    </p>
                </div>

                <div className="ref-kpi bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Referral Revenue</span>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><DollarSign className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-2 font-mono">
                        ${metrics.totalReferralRevenue.toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">${metrics.availableCommissionsTotal.toFixed(2)} Available to Payout</p>
                </div>

                <div className="ref-kpi bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Pending Withdrawals</span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Wallet className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-amber-600 mt-2">{metrics.pendingWithdrawalsCount} Requests</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">${metrics.totalPayoutsDistributed.toLocaleString()} Lifetime Paid</p>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                {[
                    { id: "affiliates", label: `Affiliate Directory (${accounts.length})` },
                    { id: "commissions", label: `Commission Ledger (${commissions.length})` },
                    { id: "withdrawals", label: `Payout Requests (${withdrawals.filter(w => w.status === "PENDING").length} pending)` },
                    { id: "fraud", label: `Fraud & Security Alerts (${fraudAlerts.length})` },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === tab.id
                                ? "bg-[#00B050] text-white shadow-sm"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: Affiliates Directory */}
            {activeTab === "affiliates" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                        <div className="relative w-72">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search affiliate name, email, code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">Affiliate / User</th>
                                    <th className="py-4 px-6">Referral Code</th>
                                    <th className="py-4 px-6">Type & Rate</th>
                                    <th className="py-4 px-6">Clicks / Signups</th>
                                    <th className="py-4 px-6">Paid Customers</th>
                                    <th className="py-4 px-6">Total Revenue</th>
                                    <th className="py-4 px-6">Available Wallet</th>
                                    <th className="py-4 px-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {accounts
                                    .filter((a) =>
                                        a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        a.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        a.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((acc) => (
                                        <tr key={acc.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-900 text-xs">{acc.userName}</p>
                                                <span className="text-[11px] text-gray-400 font-mono">{acc.userEmail}</span>
                                            </td>

                                            <td className="py-4 px-6">
                                                <span className="font-mono text-xs font-bold px-2 py-1 bg-emerald-50 text-[#00B050] rounded-md border border-emerald-200/60">
                                                    {acc.referralCode}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6">
                                                <span className="text-xs font-semibold text-gray-800">{acc.referralType}</span>
                                                <p className="text-[11px] text-emerald-600 font-bold">{acc.commissionRate}% Commission</p>
                                            </td>

                                            <td className="py-4 px-6 text-xs text-gray-700">
                                                <span className="font-bold">{acc.totalClicks}</span> Clicks · <span className="font-bold">{acc.totalRegistrations}</span> Signups
                                            </td>

                                            <td className="py-4 px-6 font-bold text-xs text-emerald-700">
                                                {acc.totalPaidCustomers} Orgs
                                            </td>

                                            <td className="py-4 px-6 font-mono text-xs font-bold text-gray-900">
                                                ${acc.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-6 font-mono text-xs font-bold text-[#00B050]">
                                                ${acc.availableBalance.toFixed(2)}
                                                <p className="text-[10px] text-gray-400 font-normal">Pending: ${acc.pendingCommission.toFixed(2)}</p>
                                            </td>

                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                                    {acc.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: Commission Ledger */}
            {activeTab === "commissions" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">Referred Organization</th>
                                    <th className="py-4 px-6">Affiliate Code</th>
                                    <th className="py-4 px-6">Plan & Cycle</th>
                                    <th className="py-4 px-6">Base Payment</th>
                                    <th className="py-4 px-6">Commission (20%)</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Available Date (30d)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {commissions.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-4 px-6 font-bold text-xs text-gray-900">
                                            {c.organizationName}
                                            <p className="text-[10px] text-gray-400 font-mono">Date: {c.createdAt}</p>
                                        </td>

                                        <td className="py-4 px-6 font-mono text-xs text-[#00B050] font-bold">
                                            {c.referralCode}
                                        </td>

                                        <td className="py-4 px-6 text-xs text-gray-700">
                                            {c.planName} · <span className="font-semibold text-gray-500">{c.billingCycle}</span>
                                        </td>

                                        <td className="py-4 px-6 font-mono text-xs text-gray-800">
                                            ${c.baseAmount.toFixed(2)}
                                        </td>

                                        <td className="py-4 px-6 font-mono text-xs font-bold text-[#00B050]">
                                            +${c.commissionAmount.toFixed(2)}
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                c.status === "AVAILABLE" || c.status === "APPROVED"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : c.status === "REVERSED"
                                                    ? "bg-rose-50 text-rose-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}>
                                                {c.status === "AVAILABLE" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {c.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                                                {c.status}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 font-mono text-xs text-gray-500">
                                            {c.availableAt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: Payout / Withdrawal Requests */}
            {activeTab === "withdrawals" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">Affiliate Name</th>
                                    <th className="py-4 px-6">Requested Amount</th>
                                    <th className="py-4 px-6">Payout Method</th>
                                    <th className="py-4 px-6">Account Details</th>
                                    <th className="py-4 px-6">Requested Date</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {withdrawals.map((w) => (
                                    <tr key={w.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900 text-xs">{w.affiliateName}</p>
                                            <span className="text-[11px] text-gray-400 font-mono">{w.affiliateEmail}</span>
                                        </td>

                                        <td className="py-4 px-6 font-mono text-sm font-bold text-gray-900">
                                            ${w.amount.toFixed(2)} {w.currency}
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700">
                                                {w.paymentMethod}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 font-mono text-xs text-gray-700 max-w-xs truncate">
                                            {w.paymentDetails}
                                        </td>

                                        <td className="py-4 px-6 text-xs text-gray-500">
                                            {w.requestedAt}
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                w.status === "PAID"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : w.status === "REJECTED"
                                                    ? "bg-rose-50 text-rose-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}>
                                                {w.status === "PAID" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {w.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                                                {w.status}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 text-right">
                                            {w.status === "PENDING" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handlePayoutAction(w.id, "PAID")}
                                                        className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Approve & Pay
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedWithdrawal(w);
                                                        }}
                                                        className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: Fraud & Security Alerts */}
            {activeTab === "fraud" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Anti-Fraud & Self-Referral Prevention</h3>
                                <p className="text-xs text-gray-500">Real-time heuristic evaluation on IP subnets, device fingerprint, and self-referrals</p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 text-xs">
                        {fraudAlerts.map((alert) => (
                            <div key={alert.id} className="py-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            {alert.eventType}
                                        </span>
                                        <span className="font-bold text-gray-900">{alert.affiliateName} ({alert.referralCode})</span>
                                    </div>
                                    <p className="text-gray-600">{alert.details}</p>
                                    <span className="text-[10px] text-gray-400 font-mono">{alert.createdAt}</span>
                                </div>

                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                    alert.severity === "CRITICAL" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                                }`}>
                                    Severity: {alert.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {selectedWithdrawal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm">Reject Payout Request</h3>
                            <button onClick={() => setSelectedWithdrawal(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-gray-600">
                            Rejecting payout for <span className="font-bold text-gray-900">{selectedWithdrawal.affiliateName}</span> (${selectedWithdrawal.amount}) will refund funds back to available balance.
                        </p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Rejection</label>
                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Invalid account number or missing routing details..."
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setSelectedWithdrawal(null)}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePayoutAction(selectedWithdrawal.id, "REJECTED")}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Program Rules Configuration Modal */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-[#00B050]" />
                                Referral Program Configuration (Section 32)
                            </h3>
                            <button onClick={() => setIsConfigModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Default Commission Rate (%)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={config.defaultCommissionRate}
                                    onChange={(e) => setConfig({ ...config, defaultCommissionRate: parseFloat(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Holding Period (Days)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={config.holdingPeriodDays}
                                        onChange={(e) => setConfig({ ...config, holdingPeriodDays: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-0.5">Recommended: 30 days for chargeback protection</p>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Minimum Withdrawal ($)</label>
                                    <input
                                        type="number"
                                        min={10}
                                        value={config.minimumWithdrawal}
                                        onChange={(e) => setConfig({ ...config, minimumWithdrawal: parseFloat(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Tracking Cookie Duration (Days)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={config.cookieDurationDays}
                                        onChange={(e) => setConfig({ ...config, cookieDurationDays: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Recurring Duration (Months)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={config.recurringMonths}
                                        onChange={(e) => setConfig({ ...config, recurringMonths: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.selfReferralBlocked}
                                        onChange={(e) => setConfig({ ...config, selfReferralBlocked: e.target.checked })}
                                        className="w-4 h-4 text-[#00B050] rounded focus:ring-[#00B050]"
                                    />
                                    <span className="font-semibold text-gray-800">Strictly block self-referrals (same email/domain)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.refundProtection}
                                        onChange={(e) => setConfig({ ...config, refundProtection: e.target.checked })}
                                        className="w-4 h-4 text-[#00B050] rounded focus:ring-[#00B050]"
                                    />
                                    <span className="font-semibold text-gray-800">Enable automated refund commission reversal</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsConfigModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                                >
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
