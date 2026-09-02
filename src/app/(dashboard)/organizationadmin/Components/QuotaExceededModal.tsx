"use client";

import React, { useEffect, useRef } from "react";
import { 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Zap, 
  ShieldAlert,
  AlertTriangle,
  Building2,
  Users,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceName: "Employees" | "Managers" | "Branches" | string;
  currentCount: number;
  maxLimit: number;
  planName?: string;
  onUpgrade?: () => void;
}

export default function QuotaExceededModal({
  isOpen,
  onClose,
  resourceName = "Employees",
  currentCount = 20,
  maxLimit = 20,
  planName = "30-Day Free Trial",
  onUpgrade
}: QuotaExceededModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: "power2.out" }
        );
      }
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.9, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.5)" }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getResourceIcon = () => {
    if (resourceName.toLowerCase().includes("employee")) return <Users className="w-5 h-5 text-amber-500" />;
    if (resourceName.toLowerCase().includes("manager")) return <UserCheck className="w-5 h-5 text-amber-500" />;
    return <Building2 className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div 
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-100 overflow-hidden relative"
      >
        {/* Top Decorative Gradient Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-15">
            <Lock className="w-32 h-32 -mr-8 -mt-8" />
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>

          <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10.5px] font-extrabold uppercase tracking-widest text-amber-200 mb-1.5 border border-white/10">
            Subscription Limit Reached
          </span>

          <h2 className="text-xl font-black tracking-tight text-white">
            {planName} Quota Exhausted
          </h2>
          <p className="text-xs text-white/90 font-medium mt-1 max-w-sm mx-auto">
            You have reached the maximum allowed {resourceName.toLowerCase()} quota ({currentCount}/{maxLimit}) for your current plan.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Quota Progress Bar Card */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700 flex items-center gap-2">
                {getResourceIcon()} {resourceName} Quota Usage
              </span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
                {currentCount} of {maxLimit} Used (100%)
              </span>
            </div>

            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-full animate-pulse" />
            </div>

            <p className="text-[11px] text-stone-500 leading-tight">
              To add more {resourceName.toLowerCase()}, please upgrade to a higher tier plan such as <strong className="text-stone-800 font-bold">Business</strong> or <strong className="text-stone-800 font-bold">Enterprise</strong> for unlimited quotas.
            </p>
          </div>

          {/* Upgrade Benefits */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Unlock with an Upgrade:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited Branch Managers & Staff</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited Branch Locations</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated Payroll Engine</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Priority 24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors text-center cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={() => {
                if (onUpgrade) {
                  onUpgrade();
                } else if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-subscription-modal"));
                }
                onClose();
              }}
              className="w-full sm:w-auto flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00B050] hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Upgrade Plan Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
