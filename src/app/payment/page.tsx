"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Smartphone, 
  X, 
  Loader2, 
  ArrowRight,
  Tag,
  Percent,
  Check,
  Building2,
  Users,
  ChevronDown
} from "lucide-react";
import { api } from "@/lib/api-client";

interface PaymentFormData {
    organization: string;
    organizationId?: string;
    senderNumber: string;
    transactionId: string;
}

interface AppliedCoupon {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountAmount: number;
    finalAmount: number;
}

interface OrgOption {
    id: string;
    name: string;
    slug: string;
    email: string;
    totalEmployees: number;
    totalBranches: number;
    planTier: string;
    subscriptionStatus?: string;
}

function ManualPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawPlan = (searchParams.get("plan") || "business").toLowerCase();
    const billingParam = (searchParams.get("billing") || "monthly").toLowerCase();
    const urlAmount = searchParams.get("amount");
    const prefilledOrg = searchParams.get("org") || searchParams.get("organization") || "";

    const isYearly = billingParam === "yearly";

    // Organizations List State
    const [organizationsList, setOrganizationsList] = useState<OrgOption[]>([]);
    const [orgsLoading, setOrgsLoading] = useState(true);
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");
    const [selectedOrgName, setSelectedOrgName] = useState<string>("");
    const [customOrgMode, setCustomOrgMode] = useState<boolean>(false);

    // Dynamic Plan Data from API
    const [livePlan, setLivePlan] = useState<{
        name: string;
        monthlyPrice: number;
        yearlyPrice: number;
    } | null>(null);
    const [plansLoading, setPlansLoading] = useState(true);

    // Coupon / Promo Code States
    const [couponInput, setCouponInput] = useState("");
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    const [copied, setCopied] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // bKash Merchant/Personal Number for manual payment
    const bkashNumber = "01318964063";

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<PaymentFormData>();

    // Fetch registered organizations for selection
    useEffect(() => {
        let isMounted = true;
        const loadOrganizations = async () => {
            try {
                setOrgsLoading(true);
                const res = await fetch("/api/organizations?for=payment&_t=" + Date.now(), {
                    cache: "no-store",
                });
                const json = await res.json();
                if (isMounted && json.success && Array.isArray(json.data)) {
                    setOrganizationsList(json.data);

                    // Auto-select based on user session or query param
                    let defaultOrgId = "";
                    let defaultOrgName = "";

                    if (typeof window !== "undefined") {
                        const storedOrgId = localStorage.getItem("organizationId");
                        const storedUser = localStorage.getItem("user");
                        if (storedOrgId) {
                            const match = json.data.find((o: OrgOption) => o.id === storedOrgId);
                            if (match) {
                                defaultOrgId = match.id;
                                defaultOrgName = match.name;
                            }
                        } else if (storedUser) {
                            try {
                                const parsed = JSON.parse(storedUser);
                                const userOrgId = parsed.organizationId || parsed.orgId;
                                const match = json.data.find((o: OrgOption) => o.id === userOrgId || o.name?.toLowerCase() === parsed.companyName?.toLowerCase());
                                if (match) {
                                    defaultOrgId = match.id;
                                    defaultOrgName = match.name;
                                }
                            } catch {}
                        }
                    }

                    if (!defaultOrgId && prefilledOrg) {
                        const match = json.data.find((o: OrgOption) => 
                            o.name.toLowerCase() === prefilledOrg.toLowerCase() || 
                            o.id === prefilledOrg ||
                            o.slug === prefilledOrg
                        );
                        if (match) {
                            defaultOrgId = match.id;
                            defaultOrgName = match.name;
                        } else {
                            defaultOrgName = prefilledOrg;
                            setCustomOrgMode(true);
                        }
                    }

                    if (!defaultOrgId && json.data.length > 0 && !customOrgMode) {
                        defaultOrgId = json.data[0].id;
                        defaultOrgName = json.data[0].name;
                    }

                    if (defaultOrgId) {
                        setSelectedOrgId(defaultOrgId);
                        setSelectedOrgName(defaultOrgName);
                        setValue("organization", defaultOrgName);
                        setValue("organizationId", defaultOrgId);
                    } else if (defaultOrgName) {
                        setSelectedOrgName(defaultOrgName);
                        setValue("organization", defaultOrgName);
                    }
                }
            } catch (err) {
                console.warn("Could not fetch organizations list:", err);
            } finally {
                if (isMounted) setOrgsLoading(false);
            }
        };

        loadOrganizations();
        return () => {
            isMounted = false;
        };
    }, [prefilledOrg, setValue]);

    // Fetch dynamic plan price from database / SubscriptionService API
    useEffect(() => {
        let isMounted = true;
        const fetchPlanDetails = async () => {
            try {
                setPlansLoading(true);
                const res = await api.subscriptions.getPlans();
                if (isMounted && res.success && Array.isArray(res.data)) {
                    const found = res.data.find(
                        (p: any) =>
                            p.id?.toLowerCase() === rawPlan ||
                            p.tier?.toLowerCase() === rawPlan ||
                            p.name?.toLowerCase().replace(/\s+plan/g, "").trim() === rawPlan ||
                            p.name?.toLowerCase().includes(rawPlan)
                    );

                    if (found) {
                        setLivePlan({
                            name: found.name || "Plan",
                            monthlyPrice: Number(found.monthlyPrice ?? found.price ?? 0),
                            yearlyPrice: Number(found.yearlyPrice ?? (found.price ? found.price * 10 : 0)),
                        });
                    }
                }
            } catch (err) {
                console.warn("Could not fetch live plan details, using query parameters:", err);
            } finally {
                if (isMounted) setPlansLoading(false);
            }
        };

        fetchPlanDetails();
        return () => {
            isMounted = false;
        };
    }, [rawPlan]);

    // Fallback static pricing map
    const defaultPrices: Record<string, { name: string; monthly: number; yearly: number }> = {
        starter: { name: "Starter Plan", monthly: 4999, yearly: 47990 },
        business: { name: "Business Plan", monthly: 14999, yearly: 143990 },
        enterprise: { name: "Enterprise Plan", monthly: 39999, yearly: 383990 },
    };

    const fallback = defaultPrices[rawPlan] || defaultPrices.business;
    const displayName = livePlan?.name || fallback.name;

    // Calculate base plan price before discount
    const baseNumberAmount: number = (() => {
        if (urlAmount && !isNaN(Number(urlAmount)) && Number(urlAmount) > 0) {
            return Number(urlAmount);
        }
        if (livePlan) {
            return isYearly ? livePlan.yearlyPrice : livePlan.monthlyPrice;
        }
        return isYearly ? fallback.yearly : fallback.monthly;
    })();

    // Final amount after coupon deduction
    const finalPayableAmount: number = appliedCoupon
        ? appliedCoupon.finalAmount
        : baseNumberAmount;

    const formattedFinalAmount = `৳${finalPayableAmount.toLocaleString()}`;
    const formattedBaseAmount = `৳${baseNumberAmount.toLocaleString()}`;

    // Apply Coupon Code via API
    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        try {
            setValidatingCoupon(true);
            setCouponError(null);

            const res = await api.coupons.validate(couponInput.trim().toUpperCase(), baseNumberAmount);
            if (res.success && res.data && res.data.valid) {
                setAppliedCoupon({
                    code: res.data.coupon.code,
                    discountType: res.data.coupon.discountType,
                    discountValue: res.data.coupon.discountValue,
                    discountAmount: res.data.discountAmount,
                    finalAmount: res.data.finalAmount,
                });
                setCouponInput("");
            } else {
                setCouponError(res.message || "Invalid or expired coupon code");
            }
        } catch (err: any) {
            setCouponError(err?.message || "Failed to validate coupon code");
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
        setCouponInput("");
    };

    // Handle ESC key press & background click to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.back();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    const handleCopy = () => {
        navigator.clipboard.writeText(bkashNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Organization Selection Handler
    const handleOrgSelect = (orgId: string) => {
        if (orgId === "CUSTOM") {
            setCustomOrgMode(true);
            setSelectedOrgId("");
            setSelectedOrgName("");
            setValue("organizationId", undefined);
            setValue("organization", "");
        } else {
            setCustomOrgMode(false);
            const found = organizationsList.find((o) => o.id === orgId);
            if (found) {
                setSelectedOrgId(found.id);
                setSelectedOrgName(found.name);
                setValue("organizationId", found.id);
                setValue("organization", found.name);
            }
        }
    };

    const currentSelectedOrg = organizationsList.find((o) => o.id === selectedOrgId);

    const onSubmit = async (data: PaymentFormData) => {
        try {
            setSubmitError(null);
            const finalOrgName = (customOrgMode ? data.organization : selectedOrgName || data.organization).trim();
            const finalOrgId = customOrgMode ? undefined : selectedOrgId || data.organizationId;

            const res = await api.payments.create({
                organizationId: finalOrgId,
                organization: finalOrgName,
                organizationName: finalOrgName,
                planName: displayName,
                amount: finalPayableAmount,
                billingCycle: isYearly ? "Yearly" : "Monthly",
                transactionId: data.transactionId.trim(),
                senderNumber: data.senderNumber.trim(),
                provider: "bKash",
                couponCode: appliedCoupon?.code || null,
                referralCode: appliedCoupon?.code || null,
            });

            if (res && (res.success || res.data)) {
                setSubmitted(true);
            } else {
                setSubmitError(res?.message || "Failed to record payment verification. Please try again.");
            }
        } catch (err: any) {
            console.error("Payment submission failed:", err);
            setSubmitError(err?.message || "Failed to connect to verification server. Please try again.");
        }
    };

    // Close Handler
    const handleClose = () => {
        router.back();
    };

    if (submitted) {
        return (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
                onClick={handleClose}
            >
                <div 
                    className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-300 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => router.push('/')}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#10b981] shadow-inner">
                        <CheckCircle2 className="w-10 h-10 animate-bounce duration-1000" />
                    </div>

                    <div className="space-y-2">
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                            Verification Pending
                        </span>
                        <h2 className="text-xl font-bold text-neutral-900">Payment Submitted Successfully</h2>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            Your payment request for <span className="font-semibold text-neutral-800">{displayName} ({formattedFinalAmount})</span> for organization <strong className="text-neutral-900">{selectedOrgName || "Selected Organization"}</strong> has been received and added to the admin verification queue.
                        </p>
                        {appliedCoupon && (
                            <p className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-lg inline-block mt-2">
                                Promo Code Applied: {appliedCoupon.code} (-৳{appliedCoupon.discountAmount.toLocaleString()})
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                        Go to Home Page <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-neutral-100 overflow-hidden relative animate-in zoom-in-95 duration-300 my-8"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            bK
                        </div>
                        <div>
                            <h2 className="text-xs font-bold text-neutral-900">Manual bKash Checkout & Subscription</h2>
                            <p className="text-[10px] text-neutral-500">Select Organization & Verify Transaction</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-neutral-400 hover:text-neutral-700 p-2 rounded-full hover:bg-neutral-200/60 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Scrollable Content Area */}
                <div className="p-6 md:p-8 max-h-[calc(85vh-70px)] overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Left Column: Instructions & Form */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* bKash Instructions Card */}
                            <div className="bg-linear-to-br from-pink-50/80 to-pink-50/30 border border-pink-100/80 rounded-2xl p-4 space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-pink-700 font-semibold text-xs">
                                        <Smartphone className="w-4 h-4 text-pink-600 animate-pulse" /> Send Money Steps
                                    </div>
                                    <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-md">
                                        Personal / Merchant
                                    </span>
                                </div>

                                <ol className="text-xs text-neutral-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                                    <li>Open bKash App or dial <span className="font-mono font-bold text-neutral-900">*247#</span></li>
                                    <li>Select <span className="font-semibold text-neutral-900">Send Money</span></li>
                                    <li>Enter bKash Number: <span className="font-mono font-bold text-neutral-900">{bkashNumber}</span></li>
                                    <li>
                                        Enter exact amount:{" "}
                                        <span className="font-mono font-bold text-neutral-900">
                                            {plansLoading ? "Loading..." : formattedFinalAmount}
                                        </span>
                                        {appliedCoupon && (
                                            <span className="ml-1.5 line-through text-[11px] text-neutral-400">
                                                {formattedBaseAmount}
                                            </span>
                                        )}
                                    </li>
                                    <li>Save the <span className="font-semibold text-neutral-900">TrxID</span> after completion</li>
                                </ol>

                                <div className="pt-1 flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-pink-200 shadow-2xs">
                                    <div>
                                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Target Number</p>
                                        <span className="text-xs font-mono font-extrabold text-pink-600">{bkashNumber}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-pink-600 bg-neutral-50 hover:bg-pink-50 px-3 py-1.5 rounded-lg border border-neutral-200 transition-all cursor-pointer active:scale-95"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy Number"}
                                    </button>
                                </div>
                            </div>

                            {/* Form Input Fields */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {submitError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                                        {submitError}
                                    </div>
                                )}

                                {/* Organization Selection with List & Employee Scoping */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                                            Target Organization <span className="text-rose-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setCustomOrgMode(!customOrgMode)}
                                            className="text-[10px] text-[#10b981] hover:underline font-bold cursor-pointer"
                                        >
                                            {customOrgMode ? "← Select from registered list" : "+ Enter custom / unlisted name"}
                                        </button>
                                    </div>

                                    {!customOrgMode ? (
                                        <div className="relative">
                                            <select
                                                value={selectedOrgId}
                                                onChange={(e) => handleOrgSelect(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] font-semibold text-neutral-800 appearance-none cursor-pointer"
                                            >
                                                {orgsLoading ? (
                                                    <option value="">Loading registered organizations...</option>
                                                ) : organizationsList.length === 0 ? (
                                                    <option value="">No organizations found (Enter manually)</option>
                                                ) : (
                                                    organizationsList.map((org) => (
                                                        <option key={org.id} value={org.id}>
                                                            {org.name} ({org.totalEmployees} Employees) • {org.email}
                                                        </option>
                                                    ))
                                                )}
                                                <option value="CUSTOM">+ Enter New / Unlisted Organization</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3 pointer-events-none" />
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="e.g. TechCorp Solutions"
                                            {...register("organization", { required: "Organization name is required" })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all duration-200"
                                        />
                                    )}

                                    {/* Organization Active Workforce Badge */}
                                    {currentSelectedOrg && !customOrgMode && (
                                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-[#10b981]" />
                                                <div>
                                                    <span className="font-bold text-neutral-900">{currentSelectedOrg.name}</span>
                                                    <span className="text-[10px] text-neutral-500 ml-1.5">({currentSelectedOrg.email})</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-emerald-200 font-bold text-emerald-800 text-[11px] shadow-2xs">
                                                <Users className="w-3.5 h-3.5 text-[#10b981]" />
                                                <span>{currentSelectedOrg.totalEmployees} Employees</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                        Sender bKash Number <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="017xxxxxxxx"
                                        maxLength={11}
                                        {...register("senderNumber", {
                                            required: "Sender bKash number is required",
                                            pattern: {
                                                value: /^01[3-9]\d{8}$/,
                                                message: "Please enter a valid 11-digit bKash number",
                                             },
                                        })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all duration-200"
                                    />
                                    {errors.senderNumber && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.senderNumber.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                        Transaction ID (TrxID) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 9G8H7F6E"
                                        {...register("transactionId", { required: "Transaction ID is required" })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm font-mono uppercase bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all duration-200"
                                    />
                                    {errors.transactionId && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.transactionId.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || plansLoading}
                                    className="w-full mt-2 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer text-xs md:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting to Admin...
                                        </>
                                    ) : (
                                        `Submit Payment for Verification (${formattedFinalAmount})`
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Right Column: Order Summary & Coupon Promo Code */}
                        <div className="lg:col-span-5 space-y-4">
                            {/* Promo Code Card */}
                            <div className="bg-white rounded-2xl p-4.5 border border-neutral-200/80 shadow-2xs space-y-3">
                                <div className="flex items-center gap-2 text-neutral-800 font-bold text-xs uppercase tracking-wider">
                                    <Tag className="w-4 h-4 text-[#10b981]" /> Promo / Coupon Code
                                </div>

                                {appliedCoupon ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-emerald-800 font-mono">
                                                    {appliedCoupon.code}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 font-medium">
                                                    {appliedCoupon.discountType === "percentage"
                                                        ? `${appliedCoupon.discountValue}% OFF (-৳${appliedCoupon.discountAmount.toLocaleString()})`
                                                        : `Fixed ৳${appliedCoupon.discountValue.toLocaleString()} OFF`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="text-neutral-400 hover:text-rose-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                                            title="Remove coupon"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon (e.g. LAUNCH50)"
                                                value={couponInput}
                                                onChange={(e) => {
                                                    setCouponInput(e.target.value.toUpperCase());
                                                    setCouponError(null);
                                                }}
                                                className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-neutral-50 rounded-xl border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={validatingCoupon || !couponInput.trim()}
                                                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                                            >
                                                {validatingCoupon ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    "Apply"
                                                )}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Order Breakdown Card */}
                            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-4">
                                <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                                    Summary of Charges
                                </h3>

                                <div className="space-y-2.5 text-xs">
                                    <div className="flex justify-between items-center text-neutral-600">
                                        <span>Plan Package</span>
                                        <span className="font-semibold text-neutral-900">{displayName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-neutral-600">
                                        <span>Billing Interval</span>
                                        <span className="font-semibold text-neutral-900">{isYearly ? "Annual (Save 20%)" : "Monthly"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-neutral-600">
                                        <span>Base Price</span>
                                        <span className="font-mono text-neutral-900">{formattedBaseAmount}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between items-center text-emerald-600 font-medium">
                                            <span>Discount ({appliedCoupon.code})</span>
                                            <span className="font-mono">-৳{appliedCoupon.discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
                                        <span className="font-bold text-neutral-900">Total Payable</span>
                                        <span className="font-mono font-extrabold text-base text-[#10b981]">
                                            {formattedFinalAmount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="flex items-start gap-2 text-[11px] text-neutral-500 bg-white p-3 rounded-xl border border-neutral-200">
                                <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                                <p>
                                    All transactions are secured and reviewed within 10–30 minutes during standard business hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-950/20">
                <Loader2 className="w-8 h-8 text-[#10b981] animate-spin" />
            </div>
        }>
            <ManualPaymentContent />
        </Suspense>
    );
}