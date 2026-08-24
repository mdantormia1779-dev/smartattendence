"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Tag, 
  Calendar, 
  Users, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2, 
  Sparkles, 
  RefreshCw,
  Percent,
  DollarSign
} from "lucide-react";
import { api } from "@/lib/api-client";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  value: string;
  expiryDate: string;
  validUntil?: string;
  validFrom?: string;
  usageLimit: string;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  status: "Active" | "Expired";
  createdAt?: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.coupons.getAll();
      if (res.success && Array.isArray(res.data)) {
        setCoupons(res.data);
      } else {
        setCoupons([]);
      }
    } catch (err: any) {
      console.error("Failed to load coupons:", err);
      setErrorMsg(err?.message || "Failed to load discount coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setValue("");
    // Default expiry 30 days from today
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setExpiryDate(d.toISOString().split("T")[0]);
    setUsageLimit("100");
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setValue(String(coupon.discountValue || coupon.value.replace(/[^0-9.]/g, "")));
    setExpiryDate(coupon.expiryDate || (coupon.validUntil ? coupon.validUntil.split("T")[0] : ""));
    setUsageLimit(coupon.usageLimit === "Unlimited" ? "" : coupon.usageLimit);
    setIsActive(coupon.isActive);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setErrorMsg(null);

      const numVal = parseFloat(value) || 0;
      const cleanLimit = usageLimit && usageLimit.trim() ? parseInt(usageLimit, 10) : null;

      if (editingCoupon) {
        const res = await api.coupons.update(editingCoupon.id, {
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: numVal,
          expiryDate,
          maxUses: cleanLimit,
          isActive,
        });

        if (res.success && res.data) {
          await fetchCoupons();
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.message || "Failed to update coupon");
        }
      } else {
        const res = await api.coupons.create({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: numVal,
          expiryDate,
          maxUses: cleanLimit,
          isActive,
        });

        if (res.success && res.data) {
          await fetchCoupons();
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.message || "Failed to create coupon");
        }
      }
    } catch (err: any) {
      console.error("Save coupon error:", err);
      setErrorMsg(err?.message || "Failed to save coupon");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessing(true);
      await api.coupons.delete(id);
      setDeleteConfirmId(null);
      await fetchCoupons();
    } catch (err: any) {
      console.error("Delete coupon error:", err);
      setErrorMsg(err?.message || "Failed to delete coupon");
    } finally {
      setProcessing(false);
    }
  };

  const counts = {
    total: coupons.length,
    active: coupons.filter((c) => c.status === "Active").length,
    expired: coupons.filter((c) => c.status === "Expired").length,
    totalRedemptions: coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0),
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discountType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FBFBFA] p-6 md:p-10 text-neutral-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-[#10b981]" /> Discount Coupons
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create, manage promotional codes, and configure custom percentage or fixed-amount discounts
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Refresh Button */}
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#10b981]" : ""}`} />
            Refresh
          </button>

          {/* New Coupon Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Coupons", count: counts.total, color: "text-neutral-900", border: "border-neutral-200", bg: "bg-neutral-50" },
          { label: "Active & Valid", count: counts.active, color: "text-[#10b981]", border: "border-emerald-200", bg: "bg-emerald-50" },
          { label: "Expired", count: counts.expired, color: "text-amber-600", border: "border-amber-200", bg: "bg-amber-50" },
          { label: "Total Redemptions", count: counts.totalRedemptions, color: "text-blue-600", border: "border-blue-200", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-white p-4.5 rounded-2xl border ${stat.border} shadow-[0_2px_10px_rgb(0,0,0,0.02)]`}
          >
            <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
            <p className={`text-2xl font-extrabold mt-1 tracking-tight ${stat.color}`}>
              {loading ? "..." : stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search coupon code or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#10b981] mr-2" />
          <span className="text-xs font-medium">Loading database coupons...</span>
        </div>
      ) : filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-50 text-[#10b981] rounded-2xl">
                      {coupon.discountType === "percentage" ? (
                        <Percent className="w-5 h-5" />
                      ) : (
                        <DollarSign className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 text-base tracking-wider font-mono">
                        {coupon.code}
                      </h3>
                      <p className="text-[11px] text-neutral-400 capitalize">
                        {coupon.discountType === "percentage" ? "Percentage Discount" : "Fixed Discount"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      coupon.status === "Active"
                        ? "bg-emerald-50 text-[#10b981] border border-emerald-200"
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}
                  >
                    {coupon.status === "Active" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {coupon.status}
                  </span>
                </div>

                <div className="text-3xl font-extrabold text-neutral-900 mb-6 flex items-baseline gap-1.5">
                  <span>{coupon.value}</span>
                  <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                    OFF
                  </span>
                </div>

                <div className="space-y-2 text-xs text-neutral-500 border-t border-neutral-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Calendar className="w-4 h-4 text-neutral-400" /> Expires On:
                    </span>
                    <span className="font-medium text-neutral-800">{coupon.expiryDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Users className="w-4 h-4 text-neutral-400" /> Usage:
                    </span>
                    <span className="font-semibold text-neutral-800 font-mono">
                      {coupon.usedCount} / {coupon.usageLimit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
                <button
                  onClick={() => handleOpenEdit(coupon)}
                  className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                  title="Edit Coupon"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(coupon.id)}
                  className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 text-center shadow-xs">
          <Tag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No discount coupons found</h3>
          <p className="text-neutral-400 text-xs mt-1">Create promotional coupons to provide discounts during subscription purchase</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Coupon
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                {editingCoupon ? "Edit Discount Coupon" : "Create New Coupon"}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {editingCoupon ? "Update promotional parameters" : "Generate a fresh promo code for checkout"}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs md:text-sm uppercase font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                    Value {discountType === "percentage" ? "(%)" : "(৳)"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={discountType === "percentage" ? "20" : "500"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs md:text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                    Max Uses (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 text-xs font-semibold bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Delete Coupon?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to permanently delete this coupon? Users will no longer be able to use it during checkout.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}