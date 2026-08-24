"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Plan } from "@/types/subscription";
import gsap from "gsap";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
  editingPlan?: Plan | null;
}

export default function PlanModal({ isOpen, onClose, onSave, editingPlan }: PlanModalProps) {
  const [name, setName] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [priceYearly, setPriceYearly] = useState("");
  const [branches, setBranches] = useState("10");
  const [managers, setManagers] = useState("20");
  const [employees, setEmployees] = useState("100");
  const [features, setFeatures] = useState("");
  const [isPopular, setIsPopular] = useState(false);

  // GSAP Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name || "");
      setPriceMonthly(editingPlan.priceMonthly ? editingPlan.priceMonthly.replace(/[^0-9.]/g, "") : "");
      setPriceYearly(editingPlan.priceYearly ? editingPlan.priceYearly.replace(/[^0-9.]/g, "") : "");
      setFeatures(editingPlan.features ? editingPlan.features.join(", ") : "");
      setIsPopular(!!editingPlan.isPopular);

      const bVal = editingPlan.limits?.find(l => l.label.toLowerCase().includes("branch"))?.value || "10";
      const mVal = editingPlan.limits?.find(l => l.label.toLowerCase().includes("manager"))?.value || "20";
      const eVal = editingPlan.limits?.find(l => l.label.toLowerCase().includes("employee"))?.value || "100";
      setBranches(bVal);
      setManagers(mVal);
      setEmployees(eVal);
    } else {
      setName("");
      setPriceMonthly("");
      setPriceYearly("");
      setBranches("10");
      setManagers("20");
      setEmployees("100");
      setFeatures("Face Recognition, GPS Verification, Payroll & Payslips, Advanced Analytics");
      setIsPopular(false);
    }
  }, [editingPlan, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Backdrop Fade In
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Modal Scale & Bounce Entrance
      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: Plan = {
      id: editingPlan ? editingPlan.id : name.toLowerCase().replace(/\s+/g, "-"),
      name,
      priceMonthly: `৳${Number(priceMonthly || 0).toLocaleString()}`,
      priceYearly: `৳${Number(priceYearly || (Number(priceMonthly || 0) * 10)).toLocaleString()}`,
      period: "month",
      limits: [
        { label: "Branches", value: branches.trim() || "Unlimited" },
        { label: "Managers", value: managers.trim() || "Unlimited" },
        { label: "Employees", value: employees.trim() || "Unlimited" },
      ],
      features: features.split(",").map((f) => f.trim()).filter(Boolean),
      isPopular,
      usageCount: editingPlan ? editingPlan.usageCount : 0,
    };
    onSave(newPlan);
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 my-8"
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-neutral-900">
            {editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 text-neutral-400 hover:text-neutral-600 flex items-center justify-center cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Business Plan"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Monthly Price (৳) *</label>
              <input
                type="number"
                required
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                placeholder="e.g. 99"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Yearly Price (৳)</label>
              <input
                type="number"
                value={priceYearly}
                onChange={(e) => setPriceYearly(e.target.value)}
                placeholder="Auto-calculated if blank"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Max Branches</label>
              <input
                type="text"
                value={branches}
                onChange={(e) => setBranches(e.target.value)}
                placeholder="e.g. 10 or Unlimited"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Max Managers</label>
              <input
                type="text"
                value={managers}
                onChange={(e) => setManagers(e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Max Employees</label>
              <input
                type="text"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                placeholder="e.g. 300"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Features (Comma separated)</label>
            <textarea
              rows={3}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Face Recognition, GPS Verification, Payroll & Payslips, Advanced Analytics, Custom Domain"
              className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPopular"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 text-[#00B050] rounded border-neutral-300 focus:ring-[#00B050] cursor-pointer"
            />
            <label htmlFor="isPopular" className="text-xs font-semibold text-neutral-700 cursor-pointer">
              Mark as Most Popular Plan
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00B050] hover:bg-[#009845] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 transition-all cursor-pointer"
            >
              {editingPlan ? "Update Plan" : "Save Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}