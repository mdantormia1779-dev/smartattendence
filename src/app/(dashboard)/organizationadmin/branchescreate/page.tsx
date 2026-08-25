"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Building2, Plus, Loader2, MapPin, RefreshCw, Lock, Zap } from "lucide-react";
import BranchCard from "../Components/Branches/BranchCard";
import BranchModal from "../Components/Branches/BranchModal";
import DeleteModal from "../Components/Branches/DeleteModal";
import QuotaExceededModal from "../Components/QuotaExceededModal";

interface Branch {
  id: string;
  name: string;
  code: string;
  shortName: string;
  address: string;
  phone: string;
  employees: number;
  geoFence: string;
  latitude: string;
  longitude: string;
  status: "Active" | "Inactive";
}

interface BranchFormData {
  name: string;
  code: string;
  shortName?: string;
  address: string;
  phone: string;
  geoFence: string;
  latitude: string;
  longitude: string;
  status: "Active" | "Inactive";
}

export default function BranchesPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  // Quota Modal State
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const [branchRes, subRes] = await Promise.allSettled([
        fetch(`/api/branches?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
        fetch(`/api/subscription?_t=${Date.now()}`, {
          cache: "no-store",
        }),
      ]);

      if (subRes.status === "fulfilled") {
        const subJson = await subRes.value.json();
        if (subJson.success && subJson.data) {
          setSubscription(subJson.data);
        }
      }

      if (branchRes.status === "fulfilled") {
        const json = await branchRes.value.json();
        const data = json.data || json;

        if (json.success || Array.isArray(data)) {
          const rawList = Array.isArray(data) ? data : (data.data || []);
          const mapped: Branch[] = rawList.map((b: any) => ({
            id: b.id,
            name: b.name,
            code: b.code || "BR-001",
            shortName: b.name?.substring(0, 3).toUpperCase() || "BRN",
            address: b.address || "Dhaka, Bangladesh",
            phone: b.phone || "+880 1712-345678",
            employees: b.totalEmployees || b.employeesCount || 0,
            geoFence: `${b.geofenceRadius || b.geoFenceRadius || 120}m`,
            latitude: String(b.latitude || 23.7925),
            longitude: String(b.longitude || 90.4078),
            status: b.status === "INACTIVE" ? "Inactive" : "Active",
          }));
          setBranches(mapped);
        }
      }
    } catch (e) {
      console.error("Failed to load branches:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (!loading && gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loading, branches]);

  const handleSaveBranch = async (data: BranchFormData) => {
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    const radius = parseInt(data.geoFence.replace(/\D/g, ""), 10) || 120;

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert("Invalid Latitude: Latitude must be a numeric coordinate between -90 and 90.");
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert("Invalid Longitude: Longitude must be a numeric coordinate between -180 and 180.");
      return;
    }
    if (radius < 20 || radius > 1000) {
      alert("Invalid Geofence Radius: Geofence must be between 20 meters and 1000 meters.");
      return;
    }

    const branchCode = (data.code || `BR-${String(branches.length + 1).padStart(3, "0")}`).trim().toUpperCase();

    try {
      if (branchToEdit) {
        await fetch(`/api/branches/${branchToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name.trim(),
            code: branchCode,
            address: data.address.trim(),
            phone: data.phone.trim(),
            latitude: lat,
            longitude: lng,
            geofenceRadius: radius,
            status: data.status.toUpperCase(),
          }),
        });
      } else {
        await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name.trim(),
            code: branchCode,
            address: data.address.trim(),
            phone: data.phone.trim(),
            latitude: lat,
            longitude: lng,
            geofenceRadius: radius,
            status: data.status.toUpperCase(),
          }),
        });
      }
      await fetchBranches();
      setIsModalOpen(false);
      setBranchToEdit(null);
    } catch (e) {
      console.error("Failed to save branch", e);
    }
  };

  const confirmDelete = async () => {
    if (branchToDelete) {
      try {
        await fetch(`/api/branches/${branchToDelete}`, {
          method: "DELETE",
        });
        await fetchBranches();
      } catch (e) {
        console.error("Failed to delete branch", e);
      } finally {
        setIsDeleteOpen(false);
        setBranchToDelete(null);
      }
    }
  };

  // Quota Computations
  const maxBranches = subscription?.limits?.maxBranches ?? 1;
  const planName = subscription?.planName || "Free Tier";
  const isQuotaExceeded = maxBranches !== null && branches.length >= maxBranches;

  const handleOpenAddBranch = () => {
    if (isQuotaExceeded) {
      setIsQuotaModalOpen(true);
    } else {
      setBranchToEdit(null);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex-1 bg-[#FBFBFA] p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-neutral-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#10b981]" />
            Branch Locations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {branches.length} office locations with active GPS geofenced perimeter
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {maxBranches !== null && (
            <span className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border text-xs ${
              isQuotaExceeded 
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" 
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {isQuotaExceeded ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Zap className="w-3.5 h-3.5 text-amber-600" />}
              {planName} Quota: <strong>{branches.length}/{maxBranches}</strong>
              {isQuotaExceeded && <span className="text-[10px] uppercase tracking-wider font-extrabold ml-0.5">(Full)</span>}
            </span>
          )}
          <button
            onClick={fetchBranches}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
            title="Refresh branches list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleOpenAddBranch}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 ${
              isQuotaExceeded
                ? "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-amber-600/20 ring-2 ring-amber-300"
                : "bg-[#10b981] text-white hover:bg-emerald-600"
            }`}
          >
            {isQuotaExceeded ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isQuotaExceeded ? "Add Branch (Quota Full)" : "Add Branch"}
          </button>
        </div>
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-neutral-400 bg-white rounded-3xl border border-neutral-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-[#10b981] mb-2" />
          <span className="text-xs">Loading branch locations...</span>
        </div>
      ) : branches.length === 0 ? (
        <div className="p-20 text-center text-xs text-neutral-400 bg-white rounded-3xl border border-neutral-200/80 space-y-3">
          <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-1" />
          <p className="font-bold text-neutral-800 text-sm">No branch locations created yet</p>
          <p className="text-neutral-400 max-w-sm mx-auto">Click "Add Branch" to set up your primary office location and GPS geofence radius for employee clock-ins.</p>
          <button 
            onClick={handleOpenAddBranch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#10b981] text-white shadow-xs hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create First Branch
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard 
              key={branch.id} 
              branch={branch} 
              onEdit={(b: Branch) => { setBranchToEdit(b); setIsModalOpen(true); }}
              onDelete={(id: string) => { setBranchToDelete(id); setIsDeleteOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BranchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        branchToEdit={branchToEdit} 
        existingBranches={branches}
        onSave={handleSaveBranch} 
      />

      <DeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
      />

      {/* Quota Limit Exceeded Alert Modal */}
      <QuotaExceededModal 
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        resourceName="Branch Locations"
        currentCount={branches.length}
        maxLimit={maxBranches}
        planName={planName}
      />
    </div>
  );
}