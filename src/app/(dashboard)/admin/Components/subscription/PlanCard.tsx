"use client";

import React from "react";
import { Check, Edit2, Trash2 } from "lucide-react";
import { Plan } from "@/types/subscription";

interface PlanCardProps {
  plan: Plan;
  billingCycle: "monthly" | "yearly";
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}

export default function PlanCard({ plan, billingCycle, onEdit, onDelete }: PlanCardProps) {
  const currentPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

  return (
    <div
      className={`relative bg-white rounded-2xl p-6 flex flex-col justify-between border transition-all ${
        plan.isPopular
          ? "border-[#10b981] ring-2 ring-[#10b981]/20 shadow-lg"
          : "border-neutral-200/80 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Most Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#10b981] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
          Most popular
        </div>
      )}

      <div>
        {/* Plan Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-neutral-900 text-lg">{plan.name}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(plan)}
              className="text-neutral-400 hover:text-neutral-600 p-1 transition-colors"
              title="Edit Plan"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(plan.id)}
              className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
              title="Delete Plan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-3xl font-extrabold text-neutral-900">{currentPrice}</span>
          <span className="text-xs text-neutral-400 font-medium">/ {plan.period}</span>
        </div>

        {/* Limits Grid Box */}
        <div className="bg-[#F8F9FA] rounded-xl p-3 grid grid-cols-2 gap-y-3 gap-x-2 mb-6 border border-neutral-100">
          {plan.limits.map((limit, idx) => (
            <div key={idx}>
              <div className="text-[11px] text-neutral-400 uppercase tracking-wide">{limit.label}</div>
              <div className="text-sm font-bold text-neutral-800 mt-0.5">{limit.value}</div>
            </div>
          ))}
        </div>

        {/* Feature Lists */}
        <div className="space-y-2.5 mb-8">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-600">
              <div className="bg-emerald-50 text-[#10b981] p-0.5 rounded-full mt-0.5 shrink-0">
                <Check className="w-3 h-3 stroke-3" />
              </div>
              <span className="leading-tight">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div>
        <button
          onClick={() => onEdit(plan)}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            plan.isPopular
              ? "bg-[#10b981] hover:bg-emerald-600 text-white shadow-emerald-200"
              : "bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200"
          }`}
        >
          {plan.isPopular ? "Most Popular" : "Edit Plan"}
        </button>
      </div>
    </div>
  );
}