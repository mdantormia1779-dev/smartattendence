"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
    Sparkles, 
    ArrowRight, 
    Wallet, 
    CheckCircle2, 
    Flame, 
    BadgePercent, 
    Award,
    Calculator,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface PlanOption {
    id: string;
    tier: "STARTER" | "BUSINESS" | "ENTERPRISE";
    name: string;
    price: number;
}

export default function AffiliateSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [referralsCount, setReferralsCount] = useState<number>(10);
    const [selectedTier, setSelectedTier] = useState<"STARTER" | "BUSINESS" | "ENTERPRISE">("BUSINESS");

    // Dynamic State loaded from backend
    const [recurringRate, setRecurringRate] = useState<number>(20); // Default 20%
    const [oneTimeBonus, setOneTimeBonus] = useState<number>(500); // Default ৳500
    const [minPayout, setMinPayout] = useState<number>(500);
    const [plans, setPlans] = useState<PlanOption[]>([
        { id: "plan-starter", tier: "STARTER", name: "Starter", price: 4999 },
        { id: "plan-business", tier: "BUSINESS", name: "Business", price: 14999 },
        { id: "plan-enterprise", tier: "ENTERPRISE", name: "Enterprise", price: 39999 },
    ]);
    const [loadingData, setLoadingData] = useState<boolean>(true);

    // Fetch Live Dynamic Settings and Plans from backend
    useEffect(() => {
        let isMounted = true;

        async function loadDynamicAffiliateData() {
            try {
                // 1. Fetch live Affiliate program settings
                const settingsRes = await fetch(`/api/affiliate/settings?_t=${Date.now()}`, {
                    cache: "no-store",
                    headers: { "Cache-Control": "no-cache" },
                }).then((r) => r.json()).catch(() => null);

                if (isMounted && settingsRes?.success && settingsRes.data) {
                    if (settingsRes.data.recurringPercentage !== undefined) {
                        setRecurringRate(Number(settingsRes.data.recurringPercentage));
                    }
                    if (settingsRes.data.oneTimeBonus !== undefined) {
                        setOneTimeBonus(Number(settingsRes.data.oneTimeBonus));
                    }
                    if (settingsRes.data.minimumPayoutThreshold !== undefined) {
                        setMinPayout(Number(settingsRes.data.minimumPayoutThreshold));
                    }
                }

                // 2. Fetch live Subscription Plans
                const plansRes = await api.subscriptions.getPlans();
                if (isMounted && plansRes.success && Array.isArray(plansRes.data)) {
                    const mappedPlans: PlanOption[] = plansRes.data
                        .filter((p: any) => (p.type || p.tier) !== "FREE" && Number(p.price || p.monthlyPrice || 0) > 0)
                        .map((p: any) => {
                            const rawTier = (p.type || p.tier || "STARTER").toUpperCase();
                            const tier: "STARTER" | "BUSINESS" | "ENTERPRISE" = 
                                rawTier === "ENTERPRISE" ? "ENTERPRISE" : rawTier === "BUSINESS" ? "BUSINESS" : "STARTER";
                            return {
                                id: p.id,
                                tier,
                                name: p.name || tier.charAt(0) + tier.slice(1).toLowerCase(),
                                price: Number(p.price || p.monthlyPrice || (tier === "ENTERPRISE" ? 39999 : tier === "BUSINESS" ? 14999 : 4999)),
                            };
                        });

                    if (mappedPlans.length > 0) {
                        setPlans(mappedPlans);
                    }
                }
            } catch (err) {
                console.error("Failed to load dynamic affiliate data", err);
            } finally {
                if (isMounted) setLoadingData(false);
            }
        }

        loadDynamicAffiliateData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Selected plan price
    const currentSelectedPlan = useMemo(() => {
        return plans.find((p) => p.tier === selectedTier) || plans[0] || { price: 14999 };
    }, [plans, selectedTier]);

    // Live Commission Calculations
    const estimatedMonthly = useMemo(() => {
        const planPrice = currentSelectedPlan.price;
        return Math.round(referralsCount * planPrice * (recurringRate / 100));
    }, [referralsCount, currentSelectedPlan.price, recurringRate]);

    const estimatedYearly = useMemo(() => {
        return (estimatedMonthly * 12) + (referralsCount * oneTimeBonus);
    }, [estimatedMonthly, referralsCount, oneTimeBonus]);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".affiliate-animate",
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.65,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section 
            id="affiliate-program"
            ref={sectionRef} 
            className="w-full py-20 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-[#F9FAF8] via-white to-[#F6FBF7] border-y border-emerald-100/60 relative overflow-hidden"
        >
            {/* Background Glow Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Badge & Title */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs affiliate-animate">
                        <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span>ATTENDANCE ERP PARTNER PROGRAM</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight affiliate-animate">
                        Turn Your Network into <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {recurringRate}% Lifetime Recurring Income
                        </span>
                    </h2>

                    <p className="text-base sm:text-lg text-gray-600 affiliate-animate">
                        Recommend Bangladesh&apos;s leading Smart Attendance &amp; Payroll ERP to companies, factories, institutions, and schools. Earn {recurringRate}% passive income every single month.
                    </p>
                </div>

                {/* 3 Core Highlight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {/* Card 1 */}
                    <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 affiliate-animate">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                            <BadgePercent className="w-6 h-6" />
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
                            Recurring Revenue
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{recurringRate}% Monthly Commission</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            You get {recurringRate}% commission on every subscription invoice paid by your referred organizations, renewed month after month.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/80 backdrop-blur-sm border border-teal-100 rounded-2xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 affiliate-animate">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
                            Instant Bonus
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">৳{oneTimeBonus.toLocaleString()} First Payment Bonus</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Receive an instant ৳{oneTimeBonus.toLocaleString()} activation bounty in your affiliate wallet immediately when your referred client activates their paid plan.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 affiliate-animate">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                            Instant Withdrawals (Min ৳{minPayout.toLocaleString()})
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">bKash, Nagad &amp; Bank Payouts</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Withdraw your earnings directly to your mobile wallet or bank account anytime with 100% transparency and live portal tracking.
                        </p>
                    </div>
                </div>

                {/* Interactive Dynamic Commission Earnings Calculator */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden mb-16 affiliate-animate">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Calculator Controls */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                                <Calculator className="w-3.5 h-3.5" />
                                <span>LIVE EARNINGS CALCULATOR • {recurringRate}% RATE</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                How much could you earn as an Affiliate?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Adjust the slider and plan tier below to calculate your live estimated monthly and annual passive earnings.
                            </p>

                            {/* Slider: Number of Referrals */}
                            <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-300">Active Referred Organizations</span>
                                    <span className="text-emerald-400 font-bold text-lg bg-emerald-500/20 px-3 py-0.5 rounded-lg border border-emerald-400/30">
                                        {referralsCount} Organizations
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="50" 
                                    value={referralsCount}
                                    onChange={(e) => setReferralsCount(Number(e.target.value))}
                                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>1 Org</span>
                                    <span>10 Orgs</span>
                                    <span>25 Orgs</span>
                                    <span>50+ Orgs</span>
                                </div>
                            </div>

                            {/* Plan Tier Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Average Subscription Plan
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {plans.map((p) => (
                                        <button
                                            key={p.tier}
                                            type="button"
                                            onClick={() => setSelectedTier(p.tier)}
                                            className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
                                                selectedTier === p.tier
                                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20 scale-102"
                                                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                                            }`}
                                        >
                                            <div className="capitalize">{p.name}</div>
                                            <div className="text-xs opacity-80 mt-0.5">৳{p.price.toLocaleString()}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Calculator Result Box */}
                        <div className="lg:col-span-5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-7 sm:p-8 backdrop-blur-md text-center space-y-6">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
                                    Your Estimated Monthly Payout
                                </span>
                                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                                    ৳{estimatedMonthly.toLocaleString()}
                                    <span className="text-sm font-normal text-emerald-300 block sm:inline sm:ml-1">/ month</span>
                                </div>
                                <p className="text-xs text-emerald-300/80 mt-2">
                                    {recurringRate}% ongoing monthly recurring commission
                                </p>
                            </div>

                            <div className="border-t border-emerald-500/20 pt-4 pb-2">
                                <div className="text-xs text-gray-300 mb-1">Projected 1st Year Earnings</div>
                                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                                    ৳{estimatedYearly.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Includes ৳{(referralsCount * oneTimeBonus).toLocaleString()} in one-time bonuses
                                </div>
                            </div>

                            <Link href="/affiliate" className="block w-full">
                                <Button className="w-full bg-[#00B050] hover:bg-[#009644] text-white font-bold py-6 text-base rounded-xl shadow-lg shadow-emerald-600/30 transition-transform hover:scale-102 cursor-pointer flex items-center justify-center gap-2">
                                    <span>Apply for Affiliate Program</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* How It Works 3-Step Flow */}
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 affiliate-animate">
                        How the Affiliate Program Works in 3 Simple Steps
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-xs affiliate-animate">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center mb-4">
                                1
                            </div>
                            <h4 className="font-bold text-gray-900 text-base mb-2">Register &amp; Get Your Link</h4>
                            <p className="text-sm text-gray-600">
                                Submit your application in 1 minute. Receive your unique referral link, promo code, and live tracking dashboard.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-xs affiliate-animate">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center mb-4">
                                2
                            </div>
                            <h4 className="font-bold text-gray-900 text-base mb-2">Share with Businesses</h4>
                            <p className="text-sm text-gray-600">
                                Recommend Attendance ERP to companies looking to automate employee attendance, face punch, leaves, and payroll.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-xs affiliate-animate">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center mb-4">
                                3
                            </div>
                            <h4 className="font-bold text-gray-900 text-base mb-2">Get Paid Automatically</h4>
                            <p className="text-sm text-gray-600">
                                When your clients pay their subscription, {recurringRate}% commissions land in your wallet. Request instant payout to bKash/Nagad/Bank.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final Call To Action Banner */}
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 affiliate-animate">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-800 font-bold text-lg">
                            <Award className="w-5 h-5 text-emerald-600" />
                            <span>Ready to start earning passive income?</span>
                        </div>
                        <p className="text-sm text-emerald-700">
                            Join hundreds of affiliate partners, consultants, and IT agencies earning {recurringRate}% with Attendance ERP.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/affiliate">
                            <Button className="bg-[#00B050] hover:bg-[#009644] text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm cursor-pointer">
                                Join Affiliate Program
                            </Button>
                        </Link>
                        <Link href="/affiliate">
                            <Button variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 font-semibold px-5 py-2.5 rounded-xl cursor-pointer">
                                Partner Portal
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
