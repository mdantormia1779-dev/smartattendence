"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, ArrowLeft, Copy, Smartphone } from "lucide-react";
import { PaymentRequest } from "@/types/payment";

interface FormData {
    organization: string;
    senderNumber: string;
    transactionId: string;
}

export default function ManualPaymentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawPlan = searchParams.get('plan') || 'business';
    const billingParam = searchParams.get('billing') || 'monthly';
    
    // Capitalize first letter to match nicely or keep keys lowercase for safe lookup
    const planNameParam = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase();

    // Plan mapping with lowercase keys for robust lookup
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
    const bkashNumber = "01318964063";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>();

    const handleCopy = () => {
        navigator.clipboard.writeText(bkashNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onSubmit = (data: FormData) => {
        const newRequest: PaymentRequest = {
            id: `pay-${Date.now()}`,
            organization: data.organization,
            planName: `${planNameParam} Plan`,
            amount: amount,
            billingCycle: isYearly ? "Yearly" : "Monthly",
            date: new Date().toISOString().split('T')[0],
            status: "Pending",
            transactionId: data.transactionId,
            senderNumber: data.senderNumber,
        };

        const existingRequests = JSON.parse(localStorage.getItem("payment_requests") || "[]");
        localStorage.setItem("payment_requests", JSON.stringify([newRequest, ...existingRequests]));

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl border border-neutral-200">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#10b981]">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-neutral-900">Payment Pending Verification</h2>
                        <p className="text-sm text-neutral-500">
                            Your payment for <span className="font-semibold text-neutral-800">{planNameParam} Plan ({amount})</span> is under review. Admin will approve it shortly.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm cursor-pointer text-sm"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFA] py-12 px-6 lg:px-12 text-neutral-800">
            <div className="max-w-4xl mx-auto space-y-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">Manual bKash Payment</h2>
                            <p className="text-xs text-neutral-500 mt-1">Complete payment via bKash and submit details for approval.</p>
                        </div>

                        <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-pink-700 font-semibold text-sm">
                                <Smartphone className="w-4 h-4" /> bKash Send Money Instructions
                            </div>
                            <ol className="text-xs text-neutral-600 space-y-1.5 list-decimal list-inside">
                                <li>Send money to: <span className="font-mono font-bold text-neutral-900">{bkashNumber}</span></li>
                                <li>Amount: <span className="font-mono font-bold text-neutral-900">{amount}</span></li>
                                <li>Copy the <span className="font-semibold text-neutral-900">TrxID</span></li>
                            </ol>
                            <div className="pt-2 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-pink-200">
                                <span className="text-xs font-mono font-bold text-pink-600">{bkashNumber}</span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-pink-600 transition-colors cursor-pointer"
                                >
                                    <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1">
                                    Organization Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. TechCorp Solutions"
                                    {...register("organization", { required: "Organization name is required" })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                />
                                {errors.organization && <p className="text-xs text-rose-500 mt-1">{errors.organization.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1">
                                    Sender bKash Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="017xxxxxxxx"
                                    {...register("senderNumber", { 
                                        required: "Sender number is required",
                                        pattern: { value: /^01[3-9]\d{8}$/, message: "Enter a valid 11-digit bKash number" }
                                    })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                />
                                {errors.senderNumber && <p className="text-xs text-rose-500 mt-1">{errors.senderNumber.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1">
                                    Transaction ID (TrxID)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. TRX-982341"
                                    {...register("transactionId", { required: "Transaction ID is required" })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                                />
                                {errors.transactionId && <p className="text-xs text-rose-500 mt-1">{errors.transactionId.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm cursor-pointer text-sm disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Payment for Verification"}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4 shadow-sm">
                            <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                                Plan Summary
                            </h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-500 font-medium">Selected Plan</span>
                                <span className="font-bold text-neutral-900">{planNameParam} Plan</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-500 font-medium">Billing Cycle</span>
                                <span className="font-bold text-neutral-900">{billingParam}</span>
                            </div>
                            <div className="border-t border-neutral-100 pt-3 flex justify-between items-center">
                                <span className="text-sm font-bold text-neutral-900">Total Payable</span>
                                <span className="text-2xl font-extrabold text-[#10b981]">{amount}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-3 shadow-sm">
                            <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
                                <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0" />
                                <span>Payments are verified manually. Status updates automatically in your portal.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}