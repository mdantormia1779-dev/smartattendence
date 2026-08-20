"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Plan } from "@/types/subscription";
import PlanCard from "../Components/subscription/PlanCard";
import PlanModal from "../Components/subscription/PlanModal";
import DeleteModal from "../Components/subscription/DeleteModal";

const initialPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: "$0",
    priceYearly: "$0",
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
    priceMonthly: "$49",
    priceYearly: "$39",
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
    priceMonthly: "$149",
    priceYearly: "$119",
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
    priceMonthly: "$399",
    priceYearly: "$319",
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
  
  // Delete States
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Subscription Plans</h1>
          <p className="text-sm text-neutral-500 mt-1">Define tiers, limits, and pricing</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Sub-header / Toggle & Notice */}
      <div className="flex justify-between items-center mb-8">
        <div className="inline-flex bg-neutral-200/70 p-1 rounded-full">
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
            Yearly <span className="opacity-80 font-normal">-20%</span>
          </button>
        </div>

        <span className="text-xs text-neutral-400">
          Prices shown per {billingCycle === "monthly" ? "month" : "year"}
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            onEdit={handleOpenEdit}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}
      </div>

      {/* Plan Usage Section */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-900 mb-4">Plan Usage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={`usage-${plan.id}`} className="bg-white rounded-xl p-4 border border-neutral-200/60 shadow-xs">
              <div className="text-xs text-neutral-400 font-medium mb-1">{plan.name}</div>
              <div className="text-2xl font-extrabold text-neutral-900 mb-0.5">{plan.usageCount}</div>
              <div className="text-xs text-neutral-400 lowercase">organizations</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PlanModal
        key={editingPlan ? editingPlan.id : "create-new"} // <-- Eta add kore deben
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