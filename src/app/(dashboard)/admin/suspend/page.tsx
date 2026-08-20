"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, Building2, Search, AlertTriangle, CheckCircle2, Lock, Unlock } from "lucide-react";
import gsap from "gsap";

interface Organization {
  id: string;
  name: string;
  ownerEmail: string;
  plan: string;
  status: "Active" | "Suspended";
  reason?: string;
}

const initialOrganizations: Organization[] = [
  { id: "org-1", name: "TechCorp Solutions", ownerEmail: "admin@techcorp.com", plan: "Business Plan", status: "Active" },
  { id: "org-2", name: "Alpha Industries", ownerEmail: "ceo@alphaind.com", plan: "Starter Plan", status: "Active" },
  { id: "org-3", name: "Global Logistics", ownerEmail: "billing@globallogistics.com", plan: "Enterprise", status: "Suspended", reason: "Policy Violation" },
  { id: "org-4", name: "Delta Media", ownerEmail: "support@deltamedia.io", plan: "Business Plan", status: "Active" },
];

export default function SuspendOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [suspendReason, setSuspendReason] = useState("Violation of Terms of Service");

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }
      );

      gsap.fromTo(
        ".animate-row",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Modal Open Animation
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

  const handleOpenSuspendModal = (org: Organization) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const handleToggleStatus = () => {
    if (!selectedOrg) return;

    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === selectedOrg.id) {
          const newStatus = org.status === "Active" ? "Suspended" : "Active";
          return {
            ...org,
            status: newStatus,
            reason: newStatus === "Suspended" ? suspendReason : undefined,
          };
        }
        return org;
      })
    );
    setIsModalOpen(false);
  };

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-header opacity-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Organization Suspension</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage platform access, handle policy violations, or suspend companies</p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search organization or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden animate-header opacity-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Organization</th>
                <th className="py-4 px-6">Owner Email</th>
                <th className="py-4 px-6">Subscription Plan</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="animate-row opacity-0 hover:bg-neutral-50/60 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">{org.name}</div>
                        {org.reason && <div className="text-[11px] text-rose-500 font-medium">Reason: {org.reason}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-neutral-500 text-xs font-mono">{org.ownerEmail}</td>
                    <td className="py-4 px-6 font-medium text-neutral-700">{org.plan}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          org.status === "Active"
                            ? "bg-emerald-50 text-[#10b981]"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {org.status === "Active" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {org.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {org.status === "Active" ? (
                        <button
                          onClick={() => handleOpenSuspendModal(org)}
                          className="px-3.5 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5" /> Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSuspendModal(org)}
                          className="px-3.5 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Unsuspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 text-sm">
                    No organizations found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal with GSAP Bounce */}
      {isModalOpen && selectedOrg && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-neutral-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedOrg.status === "Active" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-[#10b981]"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  {selectedOrg.status === "Active" ? "Suspend Organization" : "Unsuspend Organization"}
                </h2>
                <p className="text-xs text-neutral-500">{selectedOrg.name}</p>
              </div>
            </div>

            {selectedOrg.status === "Active" ? (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Suspending this organization will instantly block all user access to their dashboard, branches, and active subscription privileges.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Reason for Suspension</label>
                  <select
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="Violation of Terms of Service">Violation of Terms of Service</option>
                    <option value="Unpaid Billing / Invoice Overdue">Unpaid Billing / Invoice Overdue</option>
                    <option value="Fraudulent Activity Detected">Fraudulent Activity Detected</option>
                    <option value="Manual Administrative Action">Manual Administrative Action</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                Are you sure you want to restore platform access for <strong className="text-neutral-900">{selectedOrg.name}</strong>? Their account status will become active immediately.
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer ${
                  selectedOrg.status === "Active" ? "bg-rose-600 hover:bg-rose-700" : "bg-[#10b981] hover:bg-emerald-600"
                }`}
              >
                {selectedOrg.status === "Active" ? "Confirm Suspension" : "Restore Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}