"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Plan } from "@/types/subscription";
import PlanCard from "../Components/subscription/PlanCard";
import PlanModal from "../Components/subscription/PlanModal";
import DeleteModal from "../Components/subscription/DeleteModal";
import gsap from "gsap";

const initialPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: "৳0",
    priceYearly: "৳0",
    period: "forever",
    limits: [
      { label: "Organizations", value: "1" },
      { label: "Branches", value: "1" },
      { label: "Managers", value: "1" },
      { label: "Employees", value: "20" },
    ],
    features: ["Face Recognition", "GPS Verification", "Basic Reports", "Attendance Logs"],
    usageCount: 12,
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: "৳4,999",
    priceYearly: "৳47,990",
    period: "month",
    limits: [
      { label: "Branches", value: "5" },
      { label: "Managers", value: "5" },
      { label: "Employees", value: "100" },
    ],
    features: ["Everything in Free", "Leave Management", "Shift Management", "Email Notification"],
    usageCount: 18,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: "৳14,999",
    priceYearly: "৳143,990",
    period: "month",
    limits: [
      { label: "Branches", value: "20" },
      { label: "Managers", value: "20" },
      { label: "Employees", value: "500" },
    ],
    features: ["Everything in Starter", "Payroll & Payslips", "Fingerprint Support", "Advanced Analytics", "API Access"],
    isPopular: true,
    usageCount: 24,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: "৳39,999",
    priceYearly: "৳383,990",
    period: "month",
    limits: [
      { label: "Branches", value: "Unlimited" },
      { label: "Managers", value: "Unlimited" },
      { label: "Employees", value: "Unlimited" },
    ],
    features: ["Everything in Business", "White Label", "Custom Domain", "Priority Support", "Dedicated Manager"],
    usageCount: 9,
  },
];

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // GSAP Refs
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Page load stagger animation for header and cards
      gsap.from(".animate-header", {
        opacity: 0,
        y: -20,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
      });

      gsap.from(".animate-card", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.2,
      });

      gsap.from(".animate-usage", {
        opacity: 0,
        scale: 0.98,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.5,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = (savedPlan: Plan) => {
    if (editingPlan) {
      setPlans(plans.map((p) => (p.id === savedPlan.id ? savedPlan : p)));
    } else {
      setPlans([...plans, savedPlan]);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      setPlans(plans.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-6 md:p-8 text-neutral-800 overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Subscription Plans</h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">Define tiers, limits, and pricing in BDT</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all shadow-sm cursor-pointer hover:shadow active:scale-95 duration-200 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Sub-header / Toggle & Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-header">
        <div className="inline-flex bg-neutral-200/70 p-1 rounded-full w-fit">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "monthly" ? "bg-[#10b981] text-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "yearly" ? "bg-[#10b981] text-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Yearly <span className="opacity-90 font-normal">(-20% saving)</span>
          </button>
        </div>

        <span className="text-xs text-neutral-400 font-medium">
          Prices displayed per {billingCycle === "monthly" ? "month" : "year"}
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <div key={plan.id} className="animate-card h-full">
            <PlanCard
              plan={plan}
              billingCycle={billingCycle}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          </div>
        ))}
      </div>

      {/* Plan Usage Section */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs animate-usage">
        <h2 className="text-xs md:text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">Plan Usage Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={`usage-${plan.id}`} className="bg-neutral-50/50 rounded-xl p-4 border border-neutral-200/60 shadow-2xs hover:border-[#10b981]/40 transition-colors">
              <div className="text-xs text-neutral-500 font-semibold mb-1">{plan.name}</div>
              <div className="text-2xl font-extrabold text-neutral-900 mb-0.5">{plan.usageCount}</div>
              <div className="text-[11px] text-neutral-400 font-medium">Active Organizations</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PlanModal
        key={editingPlan ? editingPlan.id : "create-new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlan}
        editingPlan={editingPlan}
      />

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}