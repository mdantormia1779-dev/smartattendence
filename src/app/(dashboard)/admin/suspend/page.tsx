"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Building2, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Loader2, 
  RefreshCw,
  X,
  SlidersHorizontal,
  Users,
  ShieldCheck
} from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api-client";

interface Organization {
  id: string;
  name: string;
  ownerEmail: string;
  plan: string;
  status: "Active" | "Suspended";
  reason?: string;
  totalEmployees?: number;
  totalBranches?: number;
  createdAt?: string;
}

export default function SuspendOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [suspendReason, setSuspendReason] = useState("Violation of Terms of Service");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
          plan: org.planName || org.plan || "Business Plan",
          status: org.isSuspended || org.status === "SUSPENDED" ? "Suspended" : "Active",
          reason: org.suspensionReason || undefined,
          totalEmployees: org.totalEmployees ?? 0,
          totalBranches: org.totalBranches ?? 0,
          createdAt: org.createdAt?.slice(0, 10),
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
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );

        gsap.fromTo(
          ".animate-card",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
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
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.2)" }
      );
    }
  }, [isModalOpen]);

  const handleOpenSuspendModal = (org: Organization) => {
    setSelectedOrg(org);
    setSuspendReason(org.reason || "Violation of Terms of Service");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedOrg) return;

    const isCurrentlyActive = selectedOrg.status === "Active";
    const newStatus = isCurrentlyActive ? "SUSPENDED" : "ACTIVE";
    
    try {
      setIsProcessing(true);
      await api.organizations.update(selectedOrg.id, {
        status: newStatus,
        isSuspended: isCurrentlyActive,
        suspensionReason: isCurrentlyActive ? suspendReason : null,
      });

      setToastMessage(
        isCurrentlyActive 
          ? `Organization "${selectedOrg.name}" has been suspended.`
          : `Suspension lifted for "${selectedOrg.name}". Access restored.`
      );
      setTimeout(() => setToastMessage(null), 3500);

      await fetchOrganizations();
    } catch (e: any) {
      console.error("Failed to toggle organization status", e);
      alert(e?.message || "Failed to update organization status");
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };

  const activeCount = organizations.filter((o) => o.status === "Active").length;
  const suspendedCount = organizations.filter((o) => o.status === "Suspended").length;

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.reason || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "ACTIVE") return matchesSearch && org.status === "Active";
    if (statusFilter === "SUSPENDED") return matchesSearch && org.status === "Suspended";
    return matchesSearch;
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-6 md:p-10 space-y-6 text-neutral-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs animate-header opacity-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-[#10b981]" />
              Tenant Status & Suspension Control
            </h1>
            <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
              Compliance Enforcement
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage organization access, apply operational freezes, and lift suspensions in real time
          </p>
        </div>

        <button
          onClick={fetchOrganizations}
          className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh organizations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#10b981]" : ""}`} />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="animate-card bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Tenants</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-600"><Building2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-neutral-900 mt-2">{organizations.length} Organizations</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Across entire cloud cluster</p>
        </div>

        <div className="animate-card bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Active & Operating</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#10b981]"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#10b981] mt-2">{activeCount} Active</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Full employee check-in & portal access</p>
        </div>

        <div className="animate-card bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Suspended Tenants</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2">{suspendedCount} Suspended</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Login and check-in blocked</p>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> {toastMessage}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Controls Bar: Search & Status Filters */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by company name, email, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {(["ALL", "ACTIVE", "SUSPENDED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-[#10b981] text-white shadow-xs"
                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                {tab === "ALL" ? `All (${organizations.length})` : tab === "ACTIVE" ? `Active (${activeCount})` : `Suspended (${suspendedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Organizations Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#10b981] mr-2" />
            <span className="text-xs">Loading organizations...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Organization & Admin</th>
                  <th className="py-4 px-6">Current Plan</th>
                  <th className="py-4 px-6">Staff Size</th>
                  <th className="py-4 px-6">Access Status</th>
                  <th className="py-4 px-6">Suspension Details</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-neutral-400 text-xs">
                      No organizations matching your query or filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold border border-neutral-200/80">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-xs">{org.name}</p>
                            <p className="text-[11px] text-neutral-400 font-mono">{org.ownerEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {org.plan}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-neutral-700 font-medium">
                        {org.totalEmployees} Employees · {org.totalBranches} Branches
                      </td>

                      <td className="py-4 px-6">
                        {org.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3.5 h-3.5" /> Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-neutral-500 max-w-xs truncate text-[11px]">
                        {org.reason ? (
                          <span className="text-rose-600 font-medium">{org.reason}</span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenSuspendModal(org)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                            org.status === "Active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-50 text-[#10b981] hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {org.status === "Active" ? (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Suspend
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" /> Lift Freeze
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
        <div ref={backdropRef} className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div ref={modalRef} className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 border border-neutral-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${selectedOrg.status === "Active" ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-[#10b981] border border-emerald-200"}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    {selectedOrg.status === "Active" ? "Suspend Organization Access" : "Lift Organization Suspension"}
                  </h3>
                  <p className="text-xs text-neutral-500">{selectedOrg.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedOrg.status === "Active" ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Suspending <strong className="text-neutral-900">{selectedOrg.name}</strong> will immediately freeze login and attendance check-ins for all {selectedOrg.totalEmployees} employees and managers in this organization.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                    Reason for Suspension <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="e.g. Non-payment, violation of terms, suspicious security activity..."
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-600 leading-relaxed">
                Lifting suspension for <strong className="text-neutral-900">{selectedOrg.name}</strong> will restore full access for all associated administrators, branch managers, and employees.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleToggleStatus}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                  selectedOrg.status === "Active"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-[#10b981] hover:bg-emerald-600 shadow-emerald-600/20"
                }`}
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {selectedOrg.status === "Active" ? "Confirm Suspension" : "Lift Suspension & Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}