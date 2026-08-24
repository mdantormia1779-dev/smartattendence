"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { UserCheck, Plus, Loader2 } from "lucide-react";
import { Manager, ManagerFormData } from "@/types/manager";
import ManagerCard from "../Components/Managers/AssignedManagerCard";
import ManagerModal from "../Components/Managers/ManagerModal";
import { api } from "@/lib/api-client";

export default function ManagersPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [managerToEdit, setManagerToEdit] = useState<Manager | null>(null);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await api.managers.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: Manager[] = res.data.map((m: any) => ({
          id: m.id,
          managerId: m.managerId || `MGR-${m.id.substring(0, 4)}`,
          name: m.name || m.fullName,
          profilePic: m.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          email: m.email,
          phone: m.phone || "+880 1800-000000",
          designation: m.designation || "Lead Manager",
          assignedBranch: m.branchName || "Head Office - Dhaka",
          department: m.departmentName || "General",
          status: m.status === "INACTIVE" ? "Inactive" : "Active",
        }));
        setManagers(mapped);
      }
    } catch (e) {
      console.error("Failed to load managers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    if (!loading && gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loading, managers]);

  const handleSaveManager = async (data: ManagerFormData): Promise<void> => {
    try {
      if (managerToEdit) {
        await api.managers.assign(managerToEdit.id, {
          branchName: data.assignedBranch,
          departmentName: data.department,
          status: data.status.toUpperCase(),
        });
      } else {
        await api.managers.create({
          name: data.name,
          email: data.email,
          phone: data.phone,
          designation: data.designation,
          assignedBranch: data.assignedBranch,
          department: data.department,
          status: data.status.toUpperCase(),
        });
      }
      await fetchManagers();
      setIsModalOpen(false);
      setManagerToEdit(null);
    } catch (e) {
      console.error("Failed to save manager", e);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.managers.delete(id);
      await fetchManagers();
    } catch (e) {
      console.error("Failed to remove manager", e);
    }
  };

  return (
    <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#00B050]" />
            Manager Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Total {managers.length} active managers assigned to branches and departments
          </p>
        </div>
        <button 
          onClick={() => { setManagerToEdit(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Manager
        </button>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
          <span>Loading managers...</span>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((manager: Manager) => (
            <ManagerCard 
              key={manager.id} 
              manager={manager} 
              onEdit={(m: Manager) => { setManagerToEdit(m); setIsModalOpen(true); }}
              onDelete={(id: string) => handleDelete(id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ManagerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        managerToEdit={managerToEdit} 
        onSave={handleSaveManager} 
      />
    </div>
  );
}