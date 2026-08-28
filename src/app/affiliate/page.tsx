"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Share2,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Building2,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Wallet,
  Sparkles,
  AlertCircle,
  Loader2,
  FileText,
  Smartphone,
  ChevronRight,
  RefreshCw,
  QrCode
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function AffiliatePortalPage() {
  const [viewMode, setViewMode] = useState<"landing" | "dashboard" | "status">("landing");
  const [authEmail, setAuthEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Application Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nidNumber: "",
    nidDocumentUrl: "",
    paymentMethod: "BKASH",
    paymentDetails: "",
    agreedToTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState<any>(null);
  const [formError, setFormError] = useState("");

  // Portal Data State
  const [portalData, setPortalData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"referrals" | "commissions" | "payouts">("referrals");

  // Payout Request Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number | "">("");
  const [payoutMethod, setPayoutMethod] = useState("BKASH");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState("");

  // Auto load if user session email exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("affiliate_email");
      if (stored) {
        setAuthEmail(stored);
        loadPortal(stored);
      }
    }
  }, []);

  const loadPortal = async (emailToFetch: string) => {
    if (!emailToFetch.trim()) return;
    try {
      setIsLoading(true);
      setFormError("");
      const res = await api.affiliate.getPortalData(emailToFetch.trim());
      if (res.success && res.data) {
        setPortalData(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("affiliate_email", emailToFetch.trim());
        }
        if (res.data.profile?.status === "APPROVED") {
          setViewMode("dashboard");
          setPayoutAccount(res.data.profile.paymentDetails || "");
          setPayoutMethod(res.data.profile.paymentMethod || "BKASH");
        } else {
          setViewMode("status");
        }
      } else {
        setFormError(res.message || "No affiliate account found with this email.");
      }
    } catch (e: any) {
      setFormError(e.message || "Failed to load affiliate portal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.fullName || !formData.email || !formData.phone || !formData.paymentDetails) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!formData.agreedToTerms) {
      setFormError("You must agree to the affiliate partner terms and conditions.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.affiliate.apply(formData);
      if (res.success && res.data) {
        setApplicationSuccess(res.data);
        setAuthEmail(formData.email);
        if (typeof window !== "undefined") {
          localStorage.setItem("affiliate_email", formData.email);
        }
        setViewMode("status");
      } else {
        setFormError(res.message || "Failed to submit application");
      }
    } catch (err: any) {
      setFormError(err.message || "Submission failed. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError("");
    setPayoutSuccessMsg("");

    const amt = Number(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayoutError("Please enter a valid payout amount.");
      return;
    }
    if (amt < (portalData?.stats?.minimumPayoutThreshold || 500)) {
      setPayoutError(`Minimum payout threshold is ${portalData?.stats?.minimumPayoutThreshold || 500} BDT.`);
      return;
    }
    if (amt > (portalData?.stats?.balance || 0)) {
      setPayoutError(`Amount exceeds your available balance of ৳${portalData?.stats?.balance?.toFixed(2)}.`);
      return;
    }
    if (!payoutAccount.trim()) {
      setPayoutError("Please provide your payout account number / details.");
      return;
    }

    try {
      setRequestingPayout(true);
      const res = await api.affiliate.requestPayout({
        affiliateId: portalData.profile.id,
        amount: amt,
        payoutMethod,
        accountDetails: payoutAccount.trim(),
      });

      if (res.success) {
        setPayoutSuccessMsg(res.message || "Withdrawal request submitted successfully!");
        setPayoutAmount("");
        setTimeout(() => {
          setIsPayoutModalOpen(false);
          setPayoutSuccessMsg("");
          loadPortal(authEmail);
        }, 2000);
      } else {
        setPayoutError(res.message || "Failed to submit payout request.");
      }
    } catch (e: any) {
      setPayoutError(e.message || "Failed to process withdrawal request.");
    } finally {
      setRequestingPayout(false);
    }
  };

  const copyToClipboard = (text: string, type: "link" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-800 flex flex-col justify-between selection:bg-[#00B050] selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00B050] to-[#009040] flex items-center justify-center text-white shadow-md shadow-[#00B050]/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 text-lg tracking-tight">SmartAttendance</span>
              <span className="ml-2 text-xs uppercase tracking-wider bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Affiliate Partner Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {viewMode !== "landing" && (
              <button
                onClick={() => setViewMode("landing")}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Program Overview
              </button>
            )}
            <Link
              href="/login"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Enterprise Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* ================= LANDING / APPLICATION VIEW ================= */}
        {viewMode === "landing" && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Earn Fixed Bonuses + 10% Lifetime Monthly Passive Income
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                Empower Organizations & Earn <span className="text-[#00B050]">Continuous Revenue</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-600">
                Partner with the leading AI-driven attendance, biometric, and payroll management platform. Receive an instant cash bonus on every organization's first paid invoice plus a recurring monthly revenue share.
              </p>

              {/* Check Status Bar */}
              <div className="pt-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-neutral-200 shadow-sm">
                  <input
                    type="email"
                    placeholder="Enter your affiliate email..."
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-transparent focus:outline-none text-neutral-800 placeholder-neutral-400"
                  />
                  <button
                    onClick={() => loadPortal(authEmail)}
                    disabled={isLoading || !authEmail.trim()}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Access Portal"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {formError && <p className="text-[11px] text-rose-600 mt-2 font-medium">{formError}</p>}
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold text-xl">
                  ৳500+
                </div>
                <h3 className="font-bold text-neutral-900 text-base">Instant First-Invoice Bonus</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Earn an immediate cash bonus as soon as your referred organization activates their first subscription package.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                  10%
                </div>
                <h3 className="font-bold text-neutral-900 text-base">Recurring Passive Income</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Enjoy ongoing monthly passive earnings calculated automatically from every recurring billing cycle.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-neutral-900 text-base">Instant Local Payouts</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Direct disbursements to your preferred Bangladeshi mobile wallet (bKash, Nagad, Rocket) or direct bank transfer.
                </p>
              </div>
            </div>

            {/* Application Form Card */}
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-neutral-900">Partner Application Form</h2>
                <p className="text-xs text-neutral-500">
                  Submit your details and National ID (NID) for compliance review. Once verified, your unique referral link will be generated.
                </p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Rahman"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. partner@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 1700-000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">National ID (NID) Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="NID / Smart Card Number"
                      value={formData.nidNumber}
                      onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">NID Document Upload or Image URL</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/... or cloud document link"
                    value={formData.nidDocumentUrl}
                    onChange={(e) => setFormData({ ...formData, nidDocumentUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Provide a publicly accessible URL of your scanned NID for expedited verification.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Payout Method *</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white font-medium"
                    >
                      <option value="BKASH">bKash (Personal)</option>
                      <option value="NAGAD">Nagad (Personal)</option>
                      <option value="ROCKET">Rocket (Personal)</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Payout Account Details *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 017XXXXXXXX or Bank Name, A/C, Branch"
                      value={formData.paymentDetails}
                      onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-600">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      className="mt-0.5 rounded text-[#00B050] focus:ring-[#00B050]"
                    />
                    <span>
                      I certify that the provided information and NID are accurate. I accept the SmartAttendance Affiliate Terms, anti-fraud guidelines, and minimum payout policies.
                    </span>
                  </label>
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-[#00B050] hover:bg-[#009b46] text-white font-bold text-xs rounded-xl shadow-md shadow-[#00B050]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Affiliate Application
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= APPLICATION STATUS / UNDER REVIEW VIEW ================= */}
        {viewMode === "status" && portalData && (
          <div className="max-w-xl mx-auto py-12 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm text-center space-y-4">
              {portalData.profile.status === "PENDING" ? (
                <>
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-neutral-900">Application Under Review</h2>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Hello <strong className="text-neutral-900">{portalData.profile.fullName}</strong>, your partner application for <strong className="text-neutral-900">{portalData.profile.email}</strong> is currently being reviewed by our compliance team.
                  </p>
                  <div className="p-4 bg-neutral-50 rounded-2xl text-left text-xs space-y-2 border border-neutral-100">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Application Status:</span>
                      <span className="font-bold text-amber-600 uppercase">Pending Verification</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">NID / Document:</span>
                      <span className="font-semibold text-neutral-800">{portalData.profile.nidNumber || "Submitted"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Disbursement Method:</span>
                      <span className="font-semibold text-neutral-800">{portalData.profile.paymentMethod} ({portalData.profile.paymentDetails})</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Verification typically takes 24–48 business hours. You will receive an email upon approval with your unique referral link.
                  </p>
                </>
              ) : portalData.profile.status === "REJECTED" ? (
                <>
                  <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-neutral-900">Application Not Approved</h2>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Your application could not be approved at this time.
                  </p>
                  {portalData.profile.rejectionReason && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-800 text-left font-medium">
                      <strong>Reason:</strong> {portalData.profile.rejectionReason}
                    </div>
                  )}
                  <button
                    onClick={() => setViewMode("landing")}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                  >
                    Re-Apply with Updated Details
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-50 text-[#00B050] rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-neutral-900">Account Approved!</h2>
                  <p className="text-xs text-neutral-600">Your affiliate partner account is active.</p>
                  <button
                    onClick={() => setViewMode("dashboard")}
                    className="px-6 py-2.5 bg-[#00B050] text-white rounded-xl text-xs font-bold hover:bg-[#009b46] shadow-sm cursor-pointer"
                  >
                    Launch Partner Dashboard
                  </button>
                </>
              )}

              <div className="pt-2 border-t border-neutral-100 flex justify-center gap-4 text-xs font-semibold text-neutral-500">
                <button onClick={() => loadPortal(authEmail)} className="hover:text-neutral-800 flex items-center gap-1 cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
                </button>
                <span>•</span>
                <button onClick={() => setViewMode("landing")} className="hover:text-neutral-800 cursor-pointer">
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ACTIVE AFFILIATE DASHBOARD VIEW ================= */}
        {viewMode === "dashboard" && portalData && (
          <div className="space-y-8">
            {/* Top Greeting & Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-neutral-900">
                    Welcome back, {portalData.profile.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                    Verified Partner
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Active Referral Code: <strong className="text-neutral-800 font-mono">{portalData.profile.referralCode}</strong> • Commission: <strong>৳{portalData.stats.oneTimeBonusRate}</strong> bonus + <strong>{portalData.stats.recurringPercentageRate}%</strong> recurring
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadPortal(authEmail)}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
                  title="Refresh metrics"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-all cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  Request Payout
                </button>
              </div>
            </div>

            {/* Referral Link & Promotion Banner Tool */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#00B050]" />
                    Your Official Referral Link
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Share this unique link. Organizations signing up through this link are automatically linked to your account.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(portalData.profile.referralCode, "code")}
                    className="px-3 py-1.5 bg-neutral-700/80 hover:bg-neutral-700 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-[#00B050]" /> : <Copy className="w-3.5 h-3.5" />}
                    Code: {portalData.profile.referralCode}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 bg-neutral-950/60 p-2 rounded-2xl border border-neutral-700">
                <input
                  type="text"
                  readOnly
                  value={portalData.profile.referralLink || ""}
                  className="flex-1 px-3 py-1.5 text-xs bg-transparent text-emerald-400 font-mono focus:outline-none w-full"
                />
                <button
                  onClick={() => copyToClipboard(portalData.profile.referralLink, "link")}
                  className="w-full sm:w-auto px-4 py-2 bg-[#00B050] hover:bg-[#009b46] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? "Copied Link!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Metrics 4-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Available Balance */}
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Available Balance</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-neutral-900">৳{portalData.stats.balance.toFixed(2)}</span>
                  <span className="text-xs text-neutral-400 ml-1.5 font-medium">BDT</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Min payout: ৳{portalData.stats.minimumPayoutThreshold}
                </div>
              </div>

              {/* Total Earnings */}
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Earned</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-blue-600">৳{portalData.stats.totalEarned.toFixed(2)}</span>
                  <span className="text-xs text-neutral-400 ml-1.5 font-medium">Lifetime</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Cumulative rewards</span>
                </div>
              </div>

              {/* Total Referrals */}
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Referrals</span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-neutral-900">{portalData.stats.totalReferrals}</span>
                  <span className="text-xs text-neutral-400 ml-1.5 font-medium">Organizations</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  {portalData.stats.activeSubscriptions} active subscriptions
                </div>
              </div>

              {/* Total Revenue Generated */}
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Client Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-amber-600">৳{portalData.stats.totalRevenueGenerated.toFixed(2)}</span>
                  <span className="text-xs text-neutral-400 ml-1.5 font-medium">Generated</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Client invoice spend
                </div>
              </div>
            </div>

            {/* Detailed Data Tables Section */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex items-center border-b border-neutral-200 px-6 pt-4 gap-6 bg-neutral-50/50">
                <button
                  onClick={() => setActiveTab("referrals")}
                  className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "referrals"
                      ? "border-[#00B050] text-[#00B050]"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Referred Clients ({portalData.referrals.length})
                </button>
                <button
                  onClick={() => setActiveTab("commissions")}
                  className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "commissions"
                      ? "border-[#00B050] text-[#00B050]"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Commission Ledger ({portalData.commissions.length})
                </button>
                <button
                  onClick={() => setActiveTab("payouts")}
                  className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "payouts"
                      ? "border-[#00B050] text-[#00B050]"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Payout History ({portalData.payouts.length})
                </button>
              </div>

              {/* Tab 1: Referred Clients */}
              {activeTab === "referrals" && (
                <div className="overflow-x-auto">
                  {portalData.referrals.length === 0 ? (
                    <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
                      <Users className="w-8 h-8 text-neutral-300 mx-auto" />
                      <p className="font-bold text-neutral-700">No referred clients yet</p>
                      <p>Share your referral link with business owners to begin earning.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100">
                        <tr>
                          <th className="py-3 px-6">Client / Organization</th>
                          <th className="py-3 px-6">Contact Email</th>
                          <th className="py-3 px-6">Joined Date</th>
                          <th className="py-3 px-6">1st Bonus Status</th>
                          <th className="py-3 px-6">Total Invoiced</th>
                          <th className="py-3 px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700">
                        {portalData.referrals.map((ref: any) => (
                          <tr key={ref.id} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="py-3.5 px-6 font-bold text-neutral-900">{ref.organizationName}</td>
                            <td className="py-3.5 px-6 font-mono text-neutral-500">{ref.referredEmail}</td>
                            <td className="py-3.5 px-6 text-neutral-500">{ref.joinedDate}</td>
                            <td className="py-3.5 px-6">
                              {ref.firstPaymentCommissionPaid ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                  <Check className="w-3 h-3" /> Credited
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                  <Clock className="w-3 h-3" /> Pending 1st Invoice
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 font-bold text-neutral-900">৳{ref.totalRevenue.toFixed(2)}</td>
                            <td className="py-3.5 px-6">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {ref.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 2: Commission Ledger */}
              {activeTab === "commissions" && (
                <div className="overflow-x-auto">
                  {portalData.commissions.length === 0 ? (
                    <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
                      <DollarSign className="w-8 h-8 text-neutral-300 mx-auto" />
                      <p className="font-bold text-neutral-700">No commission records yet</p>
                      <p>Commissions will be automatically credited when your referred clients make subscription payments.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100">
                        <tr>
                          <th className="py-3 px-6">Date</th>
                          <th className="py-3 px-6">Source / Organization</th>
                          <th className="py-3 px-6">Commission Type</th>
                          <th className="py-3 px-6">Rate Applied</th>
                          <th className="py-3 px-6">Credited Amount</th>
                          <th className="py-3 px-6">Ledger Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700">
                        {portalData.commissions.map((c: any) => (
                          <tr key={c.id} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="py-3.5 px-6 text-neutral-500">{c.date}</td>
                            <td className="py-3.5 px-6 font-bold text-neutral-900">{c.organizationName}</td>
                            <td className="py-3.5 px-6">
                              {c.commissionType === "ONE_TIME" ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700">
                                  One-Time Onboarding Bonus
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                                  Monthly Passive Share
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-neutral-500 font-medium">
                              {c.ratePercentage ? `${c.ratePercentage}%` : "Fixed Bonus"}
                            </td>
                            <td className="py-3.5 px-6 font-extrabold text-[#00B050] text-sm">+৳{c.amount.toFixed(2)}</td>
                            <td className="py-3.5 px-6">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 3: Payout History */}
              {activeTab === "payouts" && (
                <div className="overflow-x-auto">
                  {portalData.payouts.length === 0 ? (
                    <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
                      <Wallet className="w-8 h-8 text-neutral-300 mx-auto" />
                      <p className="font-bold text-neutral-700">No payout requests submitted</p>
                      <p>You can request withdrawals to bKash, Nagad, Rocket, or Bank once your balance reaches the minimum threshold.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100">
                        <tr>
                          <th className="py-3 px-6">Requested Date</th>
                          <th className="py-3 px-6">Method & Account</th>
                          <th className="py-3 px-6">Amount</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6">Transaction ID / Reason</th>
                          <th className="py-3 px-6">Processed Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700">
                        {portalData.payouts.map((p: any) => (
                          <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="py-3.5 px-6 text-neutral-500">{p.requestedAt}</td>
                            <td className="py-3.5 px-6">
                              <span className="font-bold text-neutral-900">{p.payoutMethod}</span>
                              <p className="text-[11px] text-neutral-400 font-mono">{p.accountDetails}</p>
                            </td>
                            <td className="py-3.5 px-6 font-extrabold text-neutral-900 text-sm">৳{p.amount.toFixed(2)}</td>
                            <td className="py-3.5 px-6">
                              {p.status === "COMPLETED" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  COMPLETED
                                </span>
                              )}
                              {p.status === "REQUESTED" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  UNDER REVIEW
                                </span>
                              )}
                              {p.status === "REJECTED" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  REJECTED (Refunded)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 font-mono text-[11px]">
                              {p.transactionId ? (
                                <span className="text-neutral-800 font-bold">{p.transactionId}</span>
                              ) : p.rejectionReason ? (
                                <span className="text-rose-600">{p.rejectionReason}</span>
                              ) : (
                                <span className="text-neutral-400">Processing...</span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-neutral-500">{p.processedAt || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00B050] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base">Request Withdrawal</h3>
                  <p className="text-[11px] text-neutral-500">Available: ৳{portalData?.stats?.balance?.toFixed(2)} BDT</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Withdrawal Amount (BDT) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    step="1"
                    min={portalData?.stats?.minimumPayoutThreshold || 500}
                    max={portalData?.stats?.balance || 0}
                    required
                    placeholder={`Min. ${portalData?.stats?.minimumPayoutThreshold || 500}`}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none font-bold text-neutral-900"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Minimum withdrawal requirement: ৳{portalData?.stats?.minimumPayoutThreshold || 500} BDT</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Payout Method *</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white font-medium"
                >
                  <option value="BKASH">bKash (Personal)</option>
                  <option value="NAGAD">Nagad (Personal)</option>
                  <option value="ROCKET">Rocket (Personal)</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Account / Number Details *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 017XXXXXXXX or Bank Name, A/C No"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none"
                />
              </div>

              {payoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{payoutError}</span>
                </div>
              )}

              {payoutSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{payoutSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingPayout}
                  className="flex-1 py-2.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {requestingPayout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
