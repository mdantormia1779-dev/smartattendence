"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Building2, Plus, Loader2 } from "lucide-react";
import BranchCard from "../Components/Branches/BranchCard";
import BranchModal from "../Components/Branches/BranchModal";
import DeleteModal from "../Components/Branches/DeleteModal";
import { api } from "@/lib/api-client";

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

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.branches.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: Branch[] = res.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code || "BR-001",
          shortName: b.name?.substring(0, 3).toUpperCase() || "BRN",
          address: b.address || "Dhaka, Bangladesh",
          phone: b.phone || "+880 1712-345678",
          employees: b.totalEmployees || b.employeesCount || 0,
          geoFence: `${b.geofenceRadius || 120}m`,
          latitude: String(b.latitude || 23.7925),
          longitude: String(b.longitude || 90.4078),
          status: b.status === "INACTIVE" ? "Inactive" : "Active",
        }));
        setBranches(mapped);
      }
    } catch (e) {
      console.error("Failed to load branches", e);
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
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
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

    try {
      if (branchToEdit) {
        await api.branches.update(branchToEdit.id, {
          name: data.name,
          code: data.code,
          address: data.address,
          latitude: lat,
          longitude: lng,
          geofenceRadius: radius,
          status: data.status.toUpperCase(),
        });
      } else {
        await api.branches.create({
          name: data.name,
          code: data.code,
          address: data.address,
          latitude: lat,
          longitude: lng,
          geofenceRadius: radius,
          status: data.status.toUpperCase(),
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
        await api.branches.delete(branchToDelete);
        await fetchBranches();
      } catch (e) {
        console.error("Failed to delete branch", e);
      } finally {
        setIsDeleteOpen(false);
        setBranchToDelete(null);
      }
    }
  };

  return (
    <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#00B050]" />
            Branches
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {branches.length} active branches with geo-fenced attendance
          </p>
        </div>
        <button 
          onClick={() => { setBranchToEdit(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
          <span>Loading branch locations...</span>
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
        onSave={handleSaveBranch} 
      />

      <DeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
      />
    </div>
  );
}