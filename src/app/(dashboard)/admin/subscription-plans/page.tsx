"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Plan } from "@/types/subscription";
import PlanCard from "../Components/subscription/PlanCard";
import PlanModal from "../Components/subscription/PlanModal";
import DeleteModal from "../Components/subscription/DeleteModal";
import gsap from "gsap";
import { api } from "@/lib/api-client";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // GSAP Refs
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.subscriptions.getPlans();
      if (res.success && Array.isArray(res.data)) {
        const mapped: Plan[] = res.data.map((p: any) => {
          const priceNum = Number(p.price || p.monthlyPrice || 0);
          const yearlyNum = Number(p.yearlyPrice || priceNum * 10);
          const typeTier = (p.type || p.tier || "STARTER").toUpperCase();

          return {
            id: p.id || typeTier.toLowerCase(),
            name: p.name || `${typeTier} Plan`,
            priceMonthly: `৳${priceNum.toLocaleString()}`,
            priceYearly: `৳${yearlyNum.toLocaleString()}`,
            period: p.billingCycle || "month",
            limits: [
              { label: "Branches", value: p.maxBranches ? String(p.maxBranches) : "Unlimited" },
              { label: "Managers", value: p.maxManagers ? String(p.maxManagers) : "Unlimited" },
              { label: "Employees", value: p.maxEmployees ? String(p.maxEmployees) : "Unlimited" },
            ],
            features: [
              p.faceRecognition || p.hasFaceRecog ? "Face Recognition" : null,
              p.gpsVerification || p.hasGpsGeofence ? "GPS Verification" : null,
              p.payroll || p.hasPayroll ? "Payroll & Payslips" : null,
              p.analytics || p.hasAnalytics ? "Advanced Analytics" : null,
              p.customDomain || p.hasCustomDomain ? "Custom Domain" : null,
              p.whiteLabel || p.hasWhiteLabel ? "White Label" : null,
              p.prioritySupport ? "24/7 Priority Support" : null,
            ].filter(Boolean) as string[],
            isPopular: typeTier === "BUSINESS",
            usageCount: p.activeSubscribers || 0,
          };
        });
        setPlans(mapped);
      }
    } catch (e) {
      console.error("Failed to load subscription plans", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current && plans.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".animate-header",
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 }
        );

        gsap.fromTo(
          ".animate-card",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.1, delay: 0.1 }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading, plans]);

  // Handlers
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.subscriptions.delete(deleteId);
      await fetchPlans();
    } catch (e) {
      console.error("Failed to delete plan", e);
    } finally {
      setDeleteId(null);
    }
  };

  const handleSavePlan = async (planData: Plan) => {
    try {
      const branchesLimit = planData.limits.find((l) => l.label.toLowerCase().includes("branch"))?.value;
      const managersLimit = planData.limits.find((l) => l.label.toLowerCase().includes("manager"))?.value;
      const employeesLimit = planData.limits.find((l) => l.label.toLowerCase().includes("employee"))?.value;

      const priceNumeric = parseFloat(planData.priceMonthly.replace(/[^0-9.]/g, "")) || 0;

      const payload = {
        name: planData.name,
        price: priceNumeric,
        billingCycle: planData.period || "monthly",
        maxBranches: branchesLimit && branchesLimit !== "Unlimited" ? parseInt(branchesLimit, 10) : null,
        maxManagers: managersLimit && managersLimit !== "Unlimited" ? parseInt(managersLimit, 10) : null,
        maxEmployees: employeesLimit && employeesLimit !== "Unlimited" ? parseInt(employeesLimit, 10) : null,
        faceRecognition: planData.features.some((f) => f.toLowerCase().includes("face")),
        gpsVerification: planData.features.some((f) => f.toLowerCase().includes("gps")),
        payroll: planData.features.some((f) => f.toLowerCase().includes("payroll")),
        analytics: planData.features.some((f) => f.toLowerCase().includes("analytic")),
        customDomain: planData.features.some((f) => f.toLowerCase().includes("domain")),
        whiteLabel: planData.features.some((f) => f.toLowerCase().includes("white")),
        prioritySupport: planData.features.some((f) => f.toLowerCase().includes("priority")),
      };

      if (editingPlan && editingPlan.id) {
        await api.subscriptions.updatePlan(editingPlan.id, payload);
      } else {
        const typeDerived = planData.name.toUpperCase().includes("ENTERPRISE")
          ? "ENTERPRISE"
          : planData.name.toUpperCase().includes("BUSINESS")
          ? "BUSINESS"
          : planData.name.toUpperCase().includes("FREE")
          ? "FREE"
          : "STARTER";
        await api.subscriptions.createPlan({ ...payload, type: typeDerived });
      }

      await fetchPlans();
    } catch (e) {
      console.error("Failed to save plan", e);
    } finally {
      setIsModalOpen(false);
      setEditingPlan(null);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="animate-header">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Subscription & SaaS Plans</h1>
          <p className="text-sm text-neutral-500 mt-1">Configure pricing tiers, employee quota limits, and billing intervals</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 animate-header">
          {/* Monthly / Yearly Toggle */}
          <div className="bg-neutral-200/60 p-1 rounded-xl flex items-center border border-neutral-200 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Yearly Billing
              <span className="bg-[#00B050]/15 text-[#00B050] text-[10px] px-1.5 py-0.5 rounded-md font-bold">Save 20%</span>
            </button>
          </div>

          {/* Add Plan Button */}
          <button
            onClick={handleCreatePlan}
            className="flex items-center gap-2 bg-[#00B050] hover:bg-[#009644] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Plan Tier
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
          <span className="text-xs">Loading subscription plans...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.length === 0 ? (
            <div className="col-span-4 bg-white p-12 rounded-2xl border border-neutral-200 text-center text-xs text-neutral-400">
              No active subscription plans defined. Click &quot;Create Plan Tier&quot; to get started.
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="animate-card h-full flex flex-col">
                <PlanCard
                  plan={plan}
                  billingCycle={billingCycle}
                  onEdit={handleEditPlan}
                  onDelete={handleDeleteClick}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      <PlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        editingPlan={editingPlan}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}