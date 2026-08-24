"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, Building2, Search, AlertTriangle, CheckCircle2, Lock, Unlock, Loader2 } from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api-client";

interface Organization {
  id: string;
  name: string;
  ownerEmail: string;
  plan: string;
  status: "Active" | "Suspended";
  reason?: string;
}

export default function SuspendOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [suspendReason, setSuspendReason] = useState("Violation of Terms of Service");

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await api.organizations.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: Organization[] = res.data.map((org: any) => ({
          id: org.id,
          name: org.name,
          ownerEmail: org.email || org.ownerEmail || "admin@" + (org.slug || "org.com"),
          plan: org.plan || "Business Plan",
          status: org.status === "SUSPENDED" ? "Suspended" : "Active",
          reason: org.suspensionReason || undefined,
        }));
        setOrganizations(mapped);
      }
    } catch (e) {
      console.error("Failed to load organizations for suspension manager", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading]);

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

  const handleToggleStatus = async () => {
    if (!selectedOrg) return;

    const newStatus = selectedOrg.status === "Active" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.organizations.update(selectedOrg.id, {
        status: newStatus,
        suspensionReason: newStatus === "SUSPENDED" ? suspendReason : null,
      });
      await fetchOrganizations();
    } catch (e) {
      console.error("Failed to toggle organization status", e);
    } finally {
      setIsModalOpen(false);
    }
  };

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-header opacity-0 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Tenant Status & Suspension Control</h1>
            <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
              Compliance Enforcement
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">Manage organization access, apply operational freezes, and lift suspensions</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden animate-row opacity-0">
        {/* Search Bar */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by company name or admin email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50/60 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20"
            />
          </div>
        </div>

        {/* Organizations Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
            <span>Loading organizations...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Organization</th>
                  <th className="py-3.5 px-6">Current Plan</th>
                  <th className="py-3.5 px-6">Access Status</th>
                  <th className="py-3.5 px-6">Reason / Details</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-400 text-xs">
                      No organizations matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-xs">{org.name}</p>
                            <p className="text-[11px] text-neutral-400">{org.ownerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-neutral-600 font-medium">{org.plan}</td>
                      <td className="py-4 px-6">
                        {org.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-neutral-500 max-w-xs truncate">
                        {org.reason || "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenSuspendModal(org)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                            org.status === "Active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {org.status === "Active" ? (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Suspend
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" /> Unsuspend
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && selectedOrg && (
        <div ref={backdropRef} className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-neutral-900">
              <div className={`p-3 rounded-2xl ${selectedOrg.status === "Active" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {selectedOrg.status === "Active" ? "Suspend Organization Access" : "Lift Organization Suspension"}
                </h3>
                <p className="text-xs text-neutral-500">{selectedOrg.name}</p>
              </div>
            </div>

            {selectedOrg.status === "Active" && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Reason for Suspension</label>
                <textarea
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                  placeholder="e.g. Non-payment, violation of terms, suspicious activity..."
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors cursor-pointer ${
                  selectedOrg.status === "Active"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-[#00B050] hover:bg-[#009b46] shadow-[#00B050]/20"
                }`}
              >
                {selectedOrg.status === "Active" ? "Confirm Suspension" : "Lift Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}