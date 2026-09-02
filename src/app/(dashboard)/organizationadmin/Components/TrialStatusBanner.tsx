"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
    AlertTriangle, 
    Sparkles, 
    ArrowRight, 
    Lock, 
    CheckCircle2, 
    ShieldCheck, 
    X, 
    Clock, 
    Zap,
    Building2,
    CreditCard,
    Calendar,
    Users,
    ChevronRight,
    Loader2,
    Crown,
    Check
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function TrialStatusBanner() {
    const [isTrial, setIsTrial] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState<number>(30);
    const [expiryDateText, setExpiryDateText] = useState<string>("");
    const [planName, setPlanName] = useState("30-Day Free Trial");
    const [planTier, setPlanTier] = useState("FREE");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availablePlans, setAvailablePlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

    // Fetch dynamic plans configured by Super Admin in Database
    const fetchDynamicPlans = async () => {
        try {
            setLoadingPlans(true);
            const res = await api.subscriptions.getPlans();
            if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
                const mapped = res.data.map((p: any) => {
                    const typeTier = (p.type || p.tier || "STARTER").toUpperCase();
                    const isEnterprise = typeTier === "ENTERPRISE";
                    return {
                        ...p,
                        type: typeTier,
                        name: p.name || `${typeTier.charAt(0) + typeTier.slice(1).toLowerCase()} Plan`,
                        price: Number(p.price || p.monthlyPrice || 0),
                        maxManagers: isEnterprise ? null : (p.maxManagers ?? null),
                        maxBranches: isEnterprise ? null : (p.maxBranches ?? null),
                        maxEmployees: isEnterprise ? null : (p.maxEmployees ?? null),
                        popular: p.popular || typeTier === "BUSINESS",
                    };
                });
                setAvailablePlans(mapped);
                return;
            }
        } catch (e) {
            console.warn("Failed to fetch dynamic plans for trial banner:", e);
        } finally {
            setLoadingPlans(false);
        }

        // Fallback standard plans if DB is provisioning
        setAvailablePlans([
            {
                id: "plan-starter",
                name: "Starter Plan",
                type: "STARTER",
                price: 4999,
                maxEmployees: 100,
                maxBranches: 5,
                maxManagers: 5,
                payroll: false,
                analytics: true,
            },
            {
                id: "plan-business",
                name: "Business Plan",
                type: "BUSINESS",
                price: 14999,
                maxEmployees: 500,
                maxBranches: 20,
                maxManagers: 20,
                payroll: true,
                analytics: true,
                popular: true,
            },
            {
                id: "plan-enterprise",
                name: "Enterprise Plan",
                type: "ENTERPRISE",
                price: 39999,
                maxEmployees: null,
                maxBranches: null,
                maxManagers: null,
                payroll: true,
                analytics: true,
                whiteLabel: true,
                customDomain: true,
            },
        ]);
    };

    // Check live organization subscription status & days remaining for ALL plans
    const checkSubscription = async () => {
        try {
            let currentOrgId = "org-1";
            if (typeof window !== "undefined") {
                localStorage.removeItem("simulated_trial_expired");
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        if (parsed.organizationId) currentOrgId = parsed.organizationId;
                    } catch {}
                }
            }

            const res = await api.organizations.getById(currentOrgId).catch(() => null);
            if (res?.success && res.data) {
                const d = res.data;
                const tier = (d.planTier || d.planName || "FREE").toUpperCase();
                const isFreeOrTrial = tier === "FREE" || tier.includes("TRIAL");
                setIsTrial(isFreeOrTrial);
                setPlanTier(tier);

                // Calculate accurate elapsed days and remaining days for current billing cycle (30 days cycle)
                const createdDate = d.createdAt ? new Date(d.createdAt) : new Date();
                const now = new Date();
                const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                
                let remaining = 30;
                if (isFreeOrTrial) {
                    remaining = Math.max(0, 30 - diffDays);
                } else {
                    remaining = Math.max(0, 30 - (diffDays % 30));
                }
                setDaysRemaining(remaining);

                const expiryDate = new Date(now.getTime() + remaining * 24 * 60 * 60 * 1000);
                setExpiryDateText(expiryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));

                if (d.subscriptionStatus === "EXPIRED" || d.isSuspended || (isFreeOrTrial && remaining === 0)) {
                    setIsExpired(true);
                    setDaysRemaining(0);
                } else {
                    setIsExpired(false);
                }
                if (d.planName) setPlanName(d.planName);
            }
        } catch (e) {
            console.warn("Subscription banner check fallback:", e);
        }
    };

    useEffect(() => {
        checkSubscription();
        fetchDynamicPlans();

        const handleOpenModal = () => setIsModalOpen(true);
        window.addEventListener("open-subscription-modal", handleOpenModal);
        return () => window.removeEventListener("open-subscription-modal", handleOpenModal);
    }, []);

    return (
        <>
            {/* Top Interactive Warning / Countdown Banner for ALL plans */}
            <div className={`w-full py-2.5 px-4 sm:px-6 transition-all duration-200 border-b flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                isExpired
                    ? "bg-linear-to-r from-rose-600 via-rose-700 to-rose-800 text-white border-rose-800 shadow-md"
                    : isTrial
                        ? "bg-linear-to-r from-amber-500 via-amber-600 to-orange-600 text-white border-amber-600 shadow-xs"
                        : "bg-linear-to-r from-slate-900 via-stone-900 to-emerald-950 text-white border-stone-800 shadow-xs"
            }`}>
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        {isExpired ? (
                            <Lock className="w-3.5 h-3.5 text-white" />
                        ) : isTrial ? (
                            <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
                        ) : (
                            <Crown className="w-3.5 h-3.5 text-[#00B050]" />
                        )}
                    </div>
                    <div>
                        <span className="font-black tracking-wide uppercase">
                            {isExpired 
                                ? `⚠️ ${planName} Expired` 
                                : isTrial 
                                    ? `⚡ 30-Day Free Trial (${daysRemaining} Days Left)` 
                                    : `⭐ Active Subscription: ${planName} (${daysRemaining} Days Left)`}
                        </span>
                        <span className="mx-2 opacity-70">|</span>
                        <span>
                            {isExpired
                                ? "Your subscription billing cycle has completed. Upgrade or renew to resume full operations. All data is safe."
                                : isTrial
                                    ? `You have ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining in your free trial (Ends ${expiryDateText}). Full access enabled.`
                                    : `Your current billing cycle has ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining (Next renewal on ${expiryDateText}).`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            isExpired
                                ? "bg-white text-rose-700 hover:bg-rose-50"
                                : isTrial
                                    ? "bg-white text-amber-800 hover:bg-amber-50"
                                    : "bg-[#00B050] text-white hover:bg-[#009b46]"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isExpired ? "Reactivate & Upgrade" : isTrial ? "Upgrade Plan" : "Change / Renew Plan"}
                    </button>
                </div>
            </div>

            {/* Plan Upgrade & Renewal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6 text-stone-800">
                        {/* Modal Header */}
                        <div className={`p-6 md:p-8 text-white relative ${
                            isExpired 
                                ? "bg-linear-to-br from-rose-600 via-rose-700 to-rose-800" 
                                : "bg-linear-to-br from-[#00B050] to-emerald-800"
                        }`}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    {isExpired ? <Lock className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                                        {isExpired ? "Subscription Expired" : `Active Plan: ${daysRemaining} Days Left`}
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-black mt-1">
                                        {isExpired ? "Your Subscription Has Completed" : "Manage & Upgrade Subscription Plan"}
                                    </h2>
                                </div>
                            </div>
                            <p className="text-xs text-white/90 mt-2 leading-relaxed">
                                {isExpired 
                                    ? "Select an active SaaS plan below configured by system administration to reactivate your portal operations immediately."
                                    : `Your subscription has ${daysRemaining} days remaining in this billing cycle (renewal date: ${expiryDateText}). You can upgrade or modify quotas anytime.`}
                            </p>
                        </div>

                        {/* Preserved Data Reassurance Box */}
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs">
                                <CheckCircle2 className="w-5 h-5 text-[#00B050] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-emerald-900">Your Data is 100% Safe & Preserved</h4>
                                    <p className="text-emerald-700 mt-0.5">
                                        None of your employee records, biometric logs, or payroll reports are deleted. Upgrading will immediately unlock operations with all historical records intact.
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic Plan Options Grid from Super Admin */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                        Subscription Plans (Configured in Super Admin):
                                    </h4>
                                    <span className="text-[11px] text-stone-400 font-medium">Real-time dynamic rates</span>
                                </div>

                                {loadingPlans ? (
                                    <div className="p-12 flex items-center justify-center text-stone-400 gap-2 text-xs">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#00B050]" />
                                        <span>Loading subscription plans...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                        {availablePlans.map((plan) => {
                                            const planType = (plan.type || plan.tier || "STARTER").toUpperCase();
                                            const isPopular = plan.popular || planType === "BUSINESS";
                                            const priceNum = Number(plan.price || plan.monthlyPrice || 0);

                                            return (
                                                <div 
                                                    key={plan.id || planType}
                                                    className={`p-4 rounded-2xl transition-all space-y-3 flex flex-col justify-between relative ${
                                                        isPopular 
                                                            ? "border-2 border-[#00B050] bg-emerald-50/30 shadow-md ring-2 ring-[#00B050]/15" 
                                                            : "border border-stone-200 hover:border-stone-400 bg-stone-50/70 hover:bg-white"
                                                    }`}
                                                >
                                                    {isPopular && (
                                                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#00B050] text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs">
                                                            Recommended
                                                        </span>
                                                    )}

                                                    <div>
                                                        <span className="text-xs font-bold text-stone-800">{plan.name || `${planType} Plan`}</span>
                                                        <div className="mt-1">
                                                            <span className="text-2xl font-black text-stone-900">৳{priceNum.toLocaleString()}</span>
                                                            <span className="text-[11px] text-stone-500"> / month</span>
                                                        </div>

                                                        <ul className="text-[11px] text-stone-600 space-y-1.5 mt-3">
                                                            <li className="flex items-center gap-1.5">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                                                <span>{plan.maxEmployees ? `${plan.maxEmployees} Employees` : "Unlimited Employees"}</span>
                                                            </li>
                                                            <li className="flex items-center gap-1.5">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                                                <span>{plan.maxBranches ? `${plan.maxBranches} Branches & GPS` : "Unlimited Branches"}</span>
                                                            </li>
                                                            <li className="flex items-center gap-1.5">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                                                <span>{plan.maxManagers ? `${plan.maxManagers} Branch Managers` : "Unlimited Managers"}</span>
                                                            </li>
                                                            {plan.payroll && (
                                                                <li className="flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                                                    <span>Automated Payroll & TDS</span>
                                                                </li>
                                                            )}
                                                            {plan.whiteLabel && (
                                                                <li className="flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00B050] shrink-0" />
                                                                    <span>White-Label Branding</span>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>

                                                    <Link
                                                        href={`/payment?plan=${encodeURIComponent(planType.toLowerCase())}&billing=monthly&amount=${encodeURIComponent(priceNum)}`}
                                                        className={`w-full py-2.5 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
                                                            isPopular
                                                                ? "bg-[#00B050] hover:bg-[#009644] text-white shadow-md shadow-[#00B050]/20"
                                                                : "bg-stone-900 hover:bg-black text-white"
                                                        }`}
                                                    >
                                                        <span>{isExpired ? "Reactivate Now" : "Select Plan"}</span>
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 px-6 md:px-8 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
                            <span className="text-stone-400 font-medium text-[11px]">
                                Invoicing & custom requirements? Contact billing support
                            </span>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-stone-500 hover:text-stone-800 font-bold cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
