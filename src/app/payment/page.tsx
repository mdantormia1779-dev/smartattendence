"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Copy, Smartphone, X, Loader2, ArrowRight } from "lucide-react";

interface PaymentFormData {
    organization: string;
    senderNumber: string;
    transactionId: string;
}

function ManualPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawPlan = searchParams.get('plan') || 'business';
    const billingParam = searchParams.get('billing') || 'monthly';
    
    // Capitalize first letter for display (e.g. "starter" -> "Starter")
    const planNameParam = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase();

    // Plan pricing config
    const planPrices: Record<string, { monthly: string; yearly: string }> = {
        starter: { monthly: "৳4,999", yearly: "৳47,990" },
        business: { monthly: "৳14,999", yearly: "৳143,990" },
        enterprise: { monthly: "৳39,999", yearly: "৳383,990" },
    };

    const isYearly = billingParam.toLowerCase() === 'yearly';
    const currentPrices = planPrices[rawPlan.toLowerCase()] || planPrices.business;
    const amount = isYearly ? currentPrices.yearly : currentPrices.monthly;

    const [copied, setCopied] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // bKash Merchant/Personal Number for manual payment
    const bkashNumber = "01318964063";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<PaymentFormData>();

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

    const onSubmit = (data: PaymentFormData) => {
        const newRequest = {
            id: `pay-${Date.now()}`,
            organization: data.organization.trim(),
            planName: `${planNameParam} Plan`,
            amount: amount,
            billingCycle: isYearly ? "Yearly" : "Monthly",
            date: new Date().toISOString().split('T')[0],
            status: "Pending",
            transactionId: data.transactionId.trim(),
            senderNumber: data.senderNumber.trim(),
        };

        const existingRequests = JSON.parse(localStorage.getItem("payment_requests") || "[]");
        localStorage.setItem("payment_requests", JSON.stringify([newRequest, ...existingRequests]));

        setSubmitted(true);
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
                            Your payment request for <span className="font-semibold text-neutral-800">{planNameParam} Plan ({amount})</span> has been received. Our admin team will verify your transaction ID shortly.
                        </p>
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
                            <h2 className="text-xs font-bold text-neutral-900">Manual bKash Checkout</h2>
                            <p className="text-[10px] text-neutral-500">Secure Peer-to-Peer Transfer</p>
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
                                    <li>Enter exact amount: <span className="font-mono font-bold text-neutral-900">{amount}</span></li>
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
                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                        Organization Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TechCorp Solutions"
                                        {...register("organization", { required: "Organization name is required" })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all duration-200"
                                    />
                                    {errors.organization && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.organization.message}</p>
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
                                    disabled={isSubmitting}
                                    className="w-full mt-2 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer text-xs md:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        "Submit Payment for Verification"
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Right Column: Order Summary & Notice */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="bg-neutral-50/80 rounded-2xl p-5 border border-neutral-200/80 space-y-3 shadow-2xs">
                                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2">
                                    Plan Summary
                                </h3>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-neutral-500 font-medium">Selected Plan</span>
                                    <span className="font-bold text-neutral-900">{planNameParam} Plan</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-neutral-500 font-medium">Billing Cycle</span>
                                    <span className="font-bold text-neutral-900 capitalize">{billingParam}</span>
                                </div>

                                <div className="border-t border-neutral-200 pt-3 flex justify-between items-center">
                                    <span className="text-xs font-bold text-neutral-900">Total Payable</span>
                                    <span className="text-xl font-extrabold text-[#10b981]">{amount}</span>
                                </div>
                            </div>

                            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                                <span className="text-[11px] text-neutral-600 font-medium leading-relaxed">
                                    Manual submissions are verified by administrators within 30 minutes during standard office hours.
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default function ManualPaymentPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 text-white text-xs font-medium">
                Loading checkout...
            </div>
        }>
            <ManualPaymentContent />
        </Suspense>
    );
}