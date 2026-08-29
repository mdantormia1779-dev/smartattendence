"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    Share2, 
    DollarSign, 
    Users, 
    TrendingUp, 
    ShieldAlert, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Sliders, 
    Search, 
    Check, 
    X, 
    RefreshCw,
    Wallet,
    Loader2,
    Building2,
    ExternalLink,
    AlertCircle,
    Copy,
    Save,
    FileText,
    CreditCard,
    Trash2
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function AdminReferralsPage() {
    const [activeTab, setActiveTab] = useState<"applications" | "payouts" | "ledger" | "settings">("applications");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [isLoading, setIsLoading] = useState(false);
    
    // Database State
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalEarnedSum: 0,
        totalBalanceSum: 0,
    });
    const [settings, setSettings] = useState<any>({
        oneTimeBonus: 500,
        recurringPercentage: 10,
        minimumPayoutThreshold: 500,
        cookieDays: 30,
        autoApprovePayouts: false,
    });

    // Modals & Actions State
    const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
    const [customRefCode, setCustomRefCode] = useState("");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    
    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [affiliateToDelete, setAffiliateToDelete] = useState<any>(null);
    const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");
    
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [payoutModalOpen, setPayoutModalOpen] = useState(false);
    const [payoutDecision, setPayoutDecision] = useState<"COMPLETED" | "REJECTED">("COMPLETED");
    const [transactionId, setTransactionId] = useState("");
    const [payoutRejectReason, setPayoutRejectReason] = useState("");

    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch All Data
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [affRes, payoutRes, setRes] = await Promise.all([
                api.adminAffiliates.getAll({ status: statusFilter, search: searchQuery }),
                api.adminAffiliates.getPayouts(),
                api.adminAffiliates.getSettings(),
            ]);

            if (affRes.success && affRes.data) {
                setAffiliates(affRes.data.affiliates || []);
                if (affRes.data.metrics) setMetrics(affRes.data.metrics);
            }
            if (payoutRes.success && payoutRes.data) {
                setPayouts(payoutRes.data.payouts || []);
            }
            if (setRes.success && setRes.data) {
                setSettings(setRes.data);
            }
        } catch (e) {
            console.error("Failed to load affiliate admin data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    // Approve Affiliate
    const handleApproveAffiliate = async (id: string) => {
        try {
            setActionLoading(true);
            const res = await api.adminAffiliates.approve(id, customRefCode || undefined);
            if (res.success) {
                setSelectedAffiliate(null);
                setCustomRefCode("");
                fetchData();
            } else {
                alert(res.message || "Failed to approve affiliate");
            }
        } catch (e: any) {
            alert(e.message || "Approval failed");
        } finally {
            setActionLoading(false);
        }
    };

    // Reject Affiliate
    const handleRejectAffiliate = async () => {
        if (!selectedAffiliate) return;
        try {
            setActionLoading(true);
            const res = await api.adminAffiliates.reject(selectedAffiliate.id, rejectionReason);
            if (res.success) {
                setRejectModalOpen(false);
                setSelectedAffiliate(null);
                setRejectionReason("");
                fetchData();
            } else {
                alert(res.message || "Failed to reject affiliate");
            }
        } catch (e: any) {
            alert(e.message || "Rejection failed");
        } finally {
            setActionLoading(false);
        }
    };

    // Delete Affiliate Partner
    const handleDeleteAffiliate = async () => {
        if (!affiliateToDelete) return;
        try {
            setActionLoading(true);
            const res = await api.adminAffiliates.delete(affiliateToDelete.id);
            if (res.success) {
                setDeleteModalOpen(false);
                setDeleteSuccessMsg(`Affiliate partner "${affiliateToDelete.fullName}" was successfully deleted.`);
                setAffiliateToDelete(null);
                setTimeout(() => setDeleteSuccessMsg(""), 4000);
                fetchData();
            } else {
                alert(res.message || "Failed to delete affiliate partner");
            }
        } catch (e: any) {
            alert(e.message || "Delete failed");
        } finally {
            setActionLoading(false);
        }
    };

    // Process Payout Request
    const handleProcessPayout = async () => {
        if (!selectedPayout) return;
        try {
            setActionLoading(true);
            const res = await api.adminAffiliates.processPayout(
                selectedPayout.id,
                payoutDecision,
                transactionId,
                payoutRejectReason
            );

            if (res.success) {
                setPayoutModalOpen(false);
                setSelectedPayout(null);
                setTransactionId("");
                setPayoutRejectReason("");
                fetchData();
            } else {
                alert(res.message || "Failed to process payout");
            }
        } catch (e: any) {
            alert(e.message || "Process payout failed");
        } finally {
            setActionLoading(false);
        }
    };

    // Save Settings
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSavingSettings(true);
            setSettingsSuccessMsg("");
            const res = await api.adminAffiliates.updateSettings(settings);
            if (res.success) {
                setSettingsSuccessMsg("Affiliate commission rates & thresholds updated successfully!");
                setTimeout(() => setSettingsSuccessMsg(""), 3000);
            }
        } catch (e: any) {
            alert(e.message || "Failed to save settings");
        } finally {
            setIsSavingSettings(false);
        }
    };

    return (
        <div className="flex-1 bg-[#FBF9F5] p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-neutral-800">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
                        <Share2 className="w-6 h-6 text-[#00B050]" />
                        Affiliate & Referral Network Management
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Verify NID partner applications, manage recurring commission logic, and process mobile wallet payouts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <a
                        href="/affiliate"
                        target="_blank"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-[#00B050]" />
                        Public Partner Portal
                    </a>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Partners */}
                <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Partners</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-extrabold text-neutral-900">{metrics.total}</span>
                        <span className="text-xs text-neutral-400 ml-1.5 font-medium">registered</span>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-emerald-700 font-semibold">
                        {metrics.approved} approved & active
                    </div>
                </div>

                {/* Pending Applications */}
                <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Pending Review</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-extrabold text-amber-600">{metrics.pending}</span>
                        <span className="text-xs text-neutral-400 ml-1.5 font-medium">applications</span>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-amber-700 font-semibold">
                        Awaiting NID compliance check
                    </div>
                </div>

                {/* Total Paid Out */}
                <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Cumulative Rewards</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-extrabold text-blue-600">৳{metrics.totalEarnedSum?.toFixed(2) || "0.00"}</span>
                        <span className="text-xs text-neutral-400 ml-1.5 font-medium">BDT</span>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                        Total partner commissions
                    </div>
                </div>

                {/* Pending Payout Requests */}
                <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Pending Withdrawals</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-extrabold text-purple-600">
                            {payouts.filter((p) => p.status === "REQUESTED").length}
                        </span>
                        <span className="text-xs text-neutral-400 ml-1.5 font-medium">requests</span>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-purple-700 font-semibold">
                        bKash / Nagad / Bank
                    </div>
                </div>
            </div>

            {/* Success Toast / Banner for Deletion */}
            {deleteSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B050] shrink-0" />
                        <span>{deleteSuccessMsg}</span>
                    </div>
                    <button
                        onClick={() => setDeleteSuccessMsg("")}
                        className="text-emerald-600 hover:text-emerald-900 cursor-pointer text-xs p-1"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="flex items-center border-b border-neutral-200 px-6 pt-4 gap-6 bg-neutral-50/50">
                    <button
                        onClick={() => setActiveTab("applications")}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                            activeTab === "applications"
                                ? "border-[#00B050] text-[#00B050]"
                                : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}
                    >
                        Partners & Applications ({affiliates.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("payouts")}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                            activeTab === "payouts"
                                ? "border-[#00B050] text-[#00B050]"
                                : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}
                    >
                        Withdrawal Requests ({payouts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                            activeTab === "settings"
                                ? "border-[#00B050] text-[#00B050]"
                                : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}
                    >
                        Program Commission Rates & Thresholds
                    </button>
                </div>

                {/* TAB 1: Partners & Applications */}
                {activeTab === "applications" && (
                    <div className="p-6 space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
                                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone, referral code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00B050]"
                                />
                            </form>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-500 font-semibold">Status:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white font-medium focus:outline-none"
                                >
                                    <option value="ALL">All Partners</option>
                                    <option value="PENDING">Pending Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>

                        {/* Affiliates Table */}
                        <div className="overflow-x-auto custom-scrollbar">
                            {affiliates.length === 0 ? (
                                <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
                                    <Users className="w-8 h-8 text-neutral-300 mx-auto" />
                                    <p className="font-bold text-neutral-700">No partner records found</p>
                                    <p>Applications submitted through the public portal will appear here.</p>
                                </div>
                            ) : (
                                <table className="w-full min-w-[850px] text-left text-xs">
                                    <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100">
                                        <tr>
                                            <th className="py-3 px-4">Partner Details</th>
                                            <th className="py-3 px-4">NID / Verification</th>
                                            <th className="py-3 px-4">Referral Code</th>
                                            <th className="py-3 px-4">Disbursement Method</th>
                                            <th className="py-3 px-4">Referrals & Rev</th>
                                            <th className="py-3 px-4">Balance / Earned</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                                        {affiliates.map((aff) => (
                                            <tr key={aff.id} className="hover:bg-neutral-50/60 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-neutral-900">{aff.fullName}</div>
                                                    <div className="text-[11px] text-neutral-500 font-mono">{aff.email}</div>
                                                    <div className="text-[11px] text-neutral-400">{aff.phone}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-neutral-800">{aff.nidNumber || "Not Provided"}</div>
                                                    {aff.nidDocumentUrl ? (
                                                        <a
                                                            href={aff.nidDocumentUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                                        >
                                                            <FileText className="w-3 h-3" /> View NID Document
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] text-neutral-400">No doc upload</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {aff.referralCode ? (
                                                        <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-xs border border-emerald-200">
                                                            {aff.referralCode}
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-400 italic text-[11px]">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-bold text-neutral-800">{aff.paymentMethod}</span>
                                                    <p className="text-[11px] text-neutral-500 font-mono">{aff.paymentDetails}</p>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-neutral-900">{aff.totalReferrals} referred</div>
                                                    <div className="text-[10px] text-neutral-400">৳{aff.totalRevenueGenerated.toFixed(2)} invoiced</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-emerald-700">৳{aff.balance.toFixed(2)}</div>
                                                    <div className="text-[10px] text-neutral-400">৳{aff.totalEarned.toFixed(2)} lifetime</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {aff.status === "APPROVED" && (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                                            APPROVED
                                                        </span>
                                                    )}
                                                    {aff.status === "PENDING" && (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 animate-pulse">
                                                            PENDING REVIEW
                                                        </span>
                                                    )}
                                                    {aff.status === "REJECTED" && (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                                                            REJECTED
                                                        </span>
                                                    )}
                                                    {aff.status === "SUSPENDED" && (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-neutral-200 text-neutral-700">
                                                            SUSPENDED
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {aff.status === "PENDING" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApproveAffiliate(aff.id)}
                                                                    disabled={actionLoading}
                                                                    className="px-2.5 py-1 bg-[#00B050] hover:bg-[#009b46] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                                                    title="Approve Application"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedAffiliate(aff);
                                                                        setRejectModalOpen(true);
                                                                    }}
                                                                    disabled={actionLoading}
                                                                    className="px-2.5 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                                                    title="Reject Application"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setAffiliateToDelete(aff);
                                                                setDeleteModalOpen(true);
                                                            }}
                                                            disabled={actionLoading}
                                                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                                                            title="Delete Affiliate Partner"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: Payout Requests */}
                {activeTab === "payouts" && (
                    <div className="p-6 space-y-4">
                        <div className="overflow-x-auto custom-scrollbar">
                            {payouts.length === 0 ? (
                                <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
                                    <Wallet className="w-8 h-8 text-neutral-300 mx-auto" />
                                    <p className="font-bold text-neutral-700">No withdrawal requests</p>
                                    <p>Affiliate withdrawal requests will appear here for processing.</p>
                                </div>
                            ) : (
                                <table className="w-full min-w-[850px] text-left text-xs">
                                    <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100">
                                        <tr>
                                            <th className="py-3 px-4">Requested Date</th>
                                            <th className="py-3 px-4">Partner Name</th>
                                            <th className="py-3 px-4">Amount</th>
                                            <th className="py-3 px-4">Disbursement Method</th>
                                            <th className="py-3 px-4">Account Number</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">TrxID / Reason</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                                        {payouts.map((p) => (
                                            <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                                                <td className="py-3.5 px-4 text-neutral-500">{p.requestedAt}</td>
                                                <td className="py-3.5 px-4 font-bold text-neutral-900">{p.affiliateName}</td>
                                                <td className="py-3.5 px-4 font-extrabold text-neutral-900 text-sm">৳{p.amount.toFixed(2)}</td>
                                                <td className="py-3.5 px-4 font-bold text-neutral-800">{p.payoutMethod}</td>
                                                <td className="py-3.5 px-4 font-mono text-neutral-600">{p.accountDetails}</td>
                                                <td className="py-3.5 px-4">
                                                    {p.status === "COMPLETED" && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                            COMPLETED
                                                        </span>
                                                    )}
                                                    {p.status === "REQUESTED" && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                                                            PENDING DISBURSEMENT
                                                        </span>
                                                    )}
                                                    {p.status === "REJECTED" && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                                            REJECTED (Refunded)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono text-[11px]">
                                                    {p.transactionId ? (
                                                        <span className="text-neutral-800 font-bold">{p.transactionId}</span>
                                                    ) : p.rejectionReason ? (
                                                        <span className="text-rose-600">{p.rejectionReason}</span>
                                                    ) : (
                                                        <span className="text-neutral-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    {p.status === "REQUESTED" && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayout(p);
                                                                setPayoutDecision("COMPLETED");
                                                                setTransactionId(`BKASH-${Date.now().toString().slice(-6)}`);
                                                                setPayoutModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                        >
                                                            Process Payout
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: Settings */}
                {activeTab === "settings" && (
                    <div className="p-6 max-w-2xl space-y-6">
                        <div>
                            <h3 className="font-bold text-neutral-900 text-base">Global Affiliate Commission Policies</h3>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                Configure system-wide fixed one-time onboarding bonuses, recurring percentage rev-shares, and minimum withdrawal thresholds.
                            </p>
                        </div>

                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                                        One-Time First Invoice Bonus (BDT)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold text-xs">৳</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="10"
                                            value={settings.oneTimeBonus}
                                            onChange={(e) => setSettings({ ...settings, oneTimeBonus: Number(e.target.value) })}
                                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1">Instant bonus credited on client's first paid invoice.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                                        Recurring Monthly Commission (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={settings.recurringPercentage}
                                            onChange={(e) => setSettings({ ...settings, recurringPercentage: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                                        />
                                        <span className="absolute right-3.5 top-2.5 text-neutral-400 font-bold text-xs">%</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1">Passive percentage share on every renewal invoice.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                                        Minimum Withdrawal Threshold (BDT)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold text-xs">৳</span>
                                        <input
                                            type="number"
                                            min="100"
                                            step="50"
                                            value={settings.minimumPayoutThreshold}
                                            onChange={(e) => setSettings({ ...settings, minimumPayoutThreshold: Number(e.target.value) })}
                                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1">Minimum balance required to request a payout.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                                        Tracking Cookie Duration (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={settings.cookieDays}
                                        onChange={(e) => setSettings({ ...settings, cookieDays: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                                    />
                                    <p className="text-[10px] text-neutral-400 mt-1">Days referral attribution persists before expiration.</p>
                                </div>
                            </div>

                            {settingsSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>{settingsSuccessMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSavingSettings}
                                className="px-6 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00B050]/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                                {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Program Settings
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectModalOpen && selectedAffiliate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="font-extrabold text-neutral-900 text-base">Reject Partner Application</h3>
                        <p className="text-xs text-neutral-500">
                            Rejecting application for <strong>{selectedAffiliate.fullName}</strong> ({selectedAffiliate.email}). Please provide a clear compliance reason.
                        </p>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Rejection Reason</label>
                            <textarea
                                rows={3}
                                required
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. NID could not be verified or invalid contact information."
                                className="w-full p-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="flex-1 py-2.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectAffiliate}
                                disabled={actionLoading || !rejectionReason.trim()}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60"
                            >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Payout Modal */}
            {payoutModalOpen && selectedPayout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="font-extrabold text-neutral-900 text-base">Process Withdrawal Disbursement</h3>
                        <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1.5 border border-neutral-100">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Partner:</span>
                                <span className="font-bold text-neutral-800">{selectedPayout.affiliateName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Amount:</span>
                                <span className="font-extrabold text-emerald-700 text-sm">৳{selectedPayout.amount.toFixed(2)} BDT</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Disbursement Method:</span>
                                <span className="font-bold text-neutral-800">{selectedPayout.payoutMethod} ({selectedPayout.accountDetails})</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">Decision</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPayoutDecision("COMPLETED")}
                                        className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                                            payoutDecision === "COMPLETED"
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                        }`}
                                    >
                                        ✓ Mark Paid (Complete)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPayoutDecision("REJECTED")}
                                        className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                                            payoutDecision === "REJECTED"
                                                ? "bg-rose-50 border-rose-300 text-rose-800"
                                                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                        }`}
                                    >
                                        ✕ Reject & Refund Balance
                                    </button>
                                </div>
                            </div>

                            {payoutDecision === "COMPLETED" ? (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">bKash / Nagad / Bank Transaction ID *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. BKASH8X99214 or Trx ID"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Rejection Reason *</label>
                                    <textarea
                                        rows={2}
                                        required
                                        placeholder="e.g. Invalid bKash wallet number. Balance has been refunded."
                                        value={payoutRejectReason}
                                        onChange={(e) => setPayoutRejectReason(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setPayoutModalOpen(false)}
                                className="flex-1 py-2.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleProcessPayout}
                                disabled={actionLoading}
                                className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60 ${
                                    payoutDecision === "COMPLETED"
                                        ? "bg-[#00B050] hover:bg-[#009b46]"
                                        : "bg-rose-600 hover:bg-rose-700"
                                }`}
                            >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm & Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Partner Confirmation Modal */}
            {deleteModalOpen && affiliateToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="font-extrabold text-neutral-900 text-base">Delete Affiliate Partner?</h3>
                            <p className="text-xs text-neutral-500">
                                Are you sure you want to permanently delete <strong>{affiliateToDelete.fullName}</strong>?
                            </p>
                        </div>

                        <div className="p-3.5 bg-neutral-50 rounded-2xl text-xs space-y-1.5 border border-neutral-100">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Email:</span>
                                <span className="font-bold text-neutral-800">{affiliateToDelete.email}</span>
                            </div>
                            {affiliateToDelete.referralCode && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Referral Code:</span>
                                    <span className="font-mono font-bold text-emerald-700">{affiliateToDelete.referralCode}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Current Balance:</span>
                                <span className="font-bold text-neutral-800">৳{Number(affiliateToDelete.balance || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Status:</span>
                                <span className="font-bold text-neutral-800">{affiliateToDelete.status}</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 leading-relaxed">
                            ⚠️ <strong>Warning:</strong> This will permanently delete this affiliate user account and any associated referral links and records.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setAffiliateToDelete(null);
                                }}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAffiliate}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                            >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete Partner"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
