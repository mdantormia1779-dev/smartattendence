"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Plan } from "@/types/subscription";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
  editingPlan?: Plan | null;
}

export default function PlanModal({ isOpen, onClose, onSave, editingPlan }: PlanModalProps) {
  // Initialize state directly from props without useEffect
  const [name, setName] = useState(editingPlan?.name || "");
  const [priceMonthly, setPriceMonthly] = useState(editingPlan?.priceMonthly || "");
  const [priceYearly, setPriceYearly] = useState(editingPlan?.priceYearly || "");
  const [features, setFeatures] = useState(editingPlan?.features.join(", ") || "");
  const [isPopular, setIsPopular] = useState(!!editingPlan?.isPopular);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: Plan = {
      id: editingPlan ? editingPlan.id : name.toLowerCase().replace(/\s+/g, "-"),
      name,
      priceMonthly,
      priceYearly,
      period: "month",
      limits: [
        { label: "Branches", value: "10" },
        { label: "Employees", value: "100" },
      ],
      features: features.split(",").map((f) => f.trim()).filter(Boolean),
      isPopular,
      usageCount: editingPlan ? editingPlan.usageCount : 0,
    };
    onSave(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-neutral-900">
            {editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Advanced"
              className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Monthly Price</label>
              <input
                type="text"
                required
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                placeholder="e.g. $99"
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Yearly Price</label>
              <input
                type="text"
                required
                value={priceYearly}
                onChange={(e) => setPriceYearly(e.target.value)}
                placeholder="e.g. $79"
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Features (Comma separated)</label>
            <input
              type="text"
              value={features}
              onChange={(e) =>setFeatures(e.target.value)}
              placeholder="Feature 1, Feature 2, Feature 3"
              className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPopular"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 text-[#10b981] rounded border-neutral-300 focus:ring-[#10b981]"
            />
            <label htmlFor="isPopular" className="text-xs font-medium text-neutral-700 cursor-pointer">
              Mark as Most Popular Plan
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              {editingPlan ? "Update Plan" : "Save Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}