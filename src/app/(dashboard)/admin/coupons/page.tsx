"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Tag, Calendar, Users, Trash2, Edit, CheckCircle2, XCircle, Search } from "lucide-react";
import gsap from "gsap";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: string;
  expiryDate: string;
  usageLimit: string;
  usedCount: number;
  status: "Active" | "Expired";
}

const initialCoupons: Coupon[] = [
  {
    id: "coup-1",
    code: "WELCOME20",
    discountType: "percentage",
    value: "20%",
    expiryDate: "2026-12-31",
    usageLimit: "100",
    usedCount: 42,
    status: "Active",
  },
  {
    id: "coup-2",
    code: "SUMMER50",
    discountType: "fixed",
    value: "$50",
    expiryDate: "2026-08-30",
    usageLimit: "50",
    usedCount: 50,
    status: "Expired",
  },
  {
    id: "coup-3",
    code: "STARTUP10",
    discountType: "percentage",
    value: "10%",
    expiryDate: "2026-10-15",
    usageLimit: "200",
    usedCount: 18,
    status: "Active",
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form States
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Initial Page Load Animations (Flicker fixed with initial opacity 0 set via CSS/GSAP)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }
      );

      gsap.fromTo(
        ".animate-card",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1, delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Modal Open GSAP Animation
  useEffect(() => {
    if (isModalOpen) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }
      );
    }
  }, [isModalOpen]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setValue("");
    setExpiryDate("");
    setUsageLimit("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setValue(coupon.value.replace(/[%$]/g, ""));
    setExpiryDate(coupon.expiryDate);
    setUsageLimit(coupon.usageLimit);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      setCoupons(
        coupons.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: code.toUpperCase(),
                discountType,
                value: discountType === "percentage" ? `${value}%` : `$${value}`,
                expiryDate,
                usageLimit,
              }
            : c
        )
      );
    } else {
      const newCoupon: Coupon = {
        id: `coup-${Date.now()}`,
        code: code.toUpperCase(),
        discountType,
        value: discountType === "percentage" ? `${value}%` : `$${value}`,
        expiryDate,
        usageLimit,
        usedCount: 0,
        status: "Active",
      };
      setCoupons([newCoupon, ...coupons]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-header opacity-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Discount Coupons</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage promotional codes and discounts for subscription plans</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>
      </div>

      {/* Coupons Grid or Empty Message */}
      {filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="animate-card opacity-0 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-[#10b981]/40 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10b981] flex items-center justify-center font-bold">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono font-extrabold text-lg text-neutral-900 tracking-wider">
                        {coupon.code}
                      </span>
                      <div className="text-xs text-neutral-400">
                        {coupon.discountType === "percentage" ? "Percentage Discount" : "Fixed Amount"}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      coupon.status === "Active"
                        ? "bg-emerald-50 text-[#10b981]"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {coupon.status === "Active" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {coupon.status}
                  </span>
                </div>

                {/* Discount Value Display */}
                <div className="my-4 p-3 bg-neutral-50 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">Discount Value</span>
                  <span className="text-xl font-extrabold text-[#10b981]">{coupon.value}</span>
                </div>

                {/* Details Meta */}
                <div className="space-y-2 text-xs text-neutral-500 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Expires On:
                    </span>
                    <span className="font-medium text-neutral-800">{coupon.expiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" /> Usage Limit:
                    </span>
                    <span className="font-medium text-neutral-800">
                      {coupon.usedCount} / {coupon.usageLimit} used
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => handleOpenEdit(coupon)}
                  className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Edit Coupon"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#10b981] flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">No coupons found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            {searchQuery ? "No coupon matches your search query." : "You don't have any active discount coupons right now."}
          </p>
        </div>
      )}

      {/* Create / Edit Modal with GSAP Bounce Animation */}
      {isModalOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-neutral-100"
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </h2>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SAVE30"
                  className="w-full px-3.5 py-2 uppercase border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Value {discountType === "percentage" ? "(%)" : "($)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "e.g. 25" : "e.g. 50"}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Usage Limit (Max Uses)</label>
                <input
                  type="number"
                  required
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {editingCoupon ? "Update Coupon" : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}