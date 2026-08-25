"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { 
  UserCheck, 
  Plus, 
  Loader2, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  Building2, 
  Layers, 
  AlertTriangle,
  X 
} from "lucide-react";
import { Manager, ManagerFormData } from "@/types/manager";
import ManagerCard from "../Components/Managers/AssignedManagerCard";
import ManagerModal from "../Components/Managers/ManagerModal";
import { api } from "@/lib/api-client";

interface Branch {
  id: string;
  name: string;
  code?: string;
}

interface Department {
  id: string;
  name: string;
  code?: string;
}

export default function ManagersPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [managers, setManagers] = useState<(Manager & { teamCount?: number })[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [managerToEdit, setManagerToEdit] = useState<Manager | null>(null);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [managerToDelete, setManagerToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [mgrRes, branchRes, deptRes] = await Promise.allSettled([
        api.managers.getAll(),
        api.branches.getAll(),
        api.departments.getAll(),
      ]);

      if (mgrRes.status === "fulfilled" && mgrRes.value.success && Array.isArray(mgrRes.value.data)) {
        const mapped = mgrRes.value.data.map((m: any, index: number) => ({
          id: m.id,
          managerId: m.managerId || `MGR-${m.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || String(index + 1).padStart(3, "0")}`,
          name: m.name || m.fullName,
          profilePic: m.profilePic || m.profilePicture || m.avatar || undefined,
          email: m.email,
          phone: m.phone || "+880 1800-000000",
          designation: m.designation || "Lead Manager",
          assignedBranch: m.assignedBranch || m.branchName || "Main Head Office",
          department: m.department || m.departmentName || "General Operations",
          status: (m.status === "INACTIVE" || m.status === "Inactive" ? "Inactive" : "Active") as "Active" | "Inactive",
          teamCount: m.teamCount || m._count?.employees || 0,
        }));
        setManagers(mapped);
      }

      if (branchRes.status === "fulfilled" && branchRes.value.success && Array.isArray(branchRes.value.data)) {
        setBranches(branchRes.value.data);
      }

      if (deptRes.status === "fulfilled" && deptRes.value.success && Array.isArray(deptRes.value.data)) {
        setDepartments(deptRes.value.data);
      }
    } catch (e) {
      console.error("Failed to load manager dependencies", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered Managers
  const filteredManagers = useMemo(() => {
    return managers.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.managerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.assignedBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || m.status === statusFilter;

      const matchesBranch =
        branchFilter === "ALL" || m.assignedBranch === branchFilter;

      const matchesDept =
        deptFilter === "ALL" || m.department === deptFilter;

      return matchesSearch && matchesStatus && matchesBranch && matchesDept;
    });
  }, [managers, searchQuery, statusFilter, branchFilter, deptFilter]);

  useEffect(() => {
    if (!loading && gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, [loading, filteredManagers]);

  // Save Manager Handler
  const handleSaveManager = async (data: ManagerFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      if (managerToEdit) {
        await api.managers.assign(managerToEdit.id, {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          designation: data.designation.trim(),
          assignedBranch: data.assignedBranch,
          department: data.department,
          profilePic: data.profilePic,
          password: data.password || undefined,
          status: data.status.toUpperCase(),
        });
      } else {
        await api.managers.create({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          designation: data.designation.trim(),
          assignedBranch: data.assignedBranch,
          department: data.department,
          profilePic: data.profilePic,
          password: data.password || "manager123",
          status: data.status.toUpperCase(),
        });
      }
      await fetchAllData();
      setIsModalOpen(false);
      setManagerToEdit(null);
    } catch (e) {
      console.error("Failed to save manager", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const openDeleteModal = (id: string, name: string) => {
    setManagerToDelete({ id, name });
    setIsDeleteOpen(true);
  };

  // Confirm Delete Handler
  const confirmDelete = async (): Promise<void> => {
    if (!managerToDelete) return;
    try {
      await api.managers.delete(managerToDelete.id);
      await fetchAllData();
    } catch (e) {
      console.error("Failed to remove manager", e);
    } finally {
      setIsDeleteOpen(false);
      setManagerToDelete(null);
    }
  };

  // Metrics Calculations
  const totalTeamWorkforce = useMemo(() => {
    return managers.reduce((acc, curr) => acc + (curr.teamCount || 0), 0);
  }, [managers]);

  const activeManagersCount = useMemo(() => {
    return managers.filter(m => m.status === "Active").length;
  }, [managers]);

  return (
    <div className="flex-1 bg-[#FBFBFA] p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-neutral-800">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-[#00B050]" />
            Manager Leadership Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Assign team supervisors, branch leaders, and departmental operations heads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
            title="Refresh managers list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
          </button>
          <button 
            onClick={() => { setManagerToEdit(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Assign Manager
          </button>
        </div>
      </div>

      {/* Metrics Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Total Managers</p>
            <h3 className="text-lg font-bold text-neutral-900">{managers.length} Leaders</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Managed Workforce</p>
            <h3 className="text-lg font-bold text-neutral-900">{totalTeamWorkforce} Members</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Branch Locations</p>
            <h3 className="text-lg font-bold text-neutral-900">{branches.length || 1} Covered</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Departments Led</p>
            <h3 className="text-lg font-bold text-neutral-900">{departments.length || 1} Units</h3>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by manager name, ID, email, designation, branch..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {/* Branch Filter */}
          {branches.length > 0 && (
            <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Department Filter */}
          {departments.length > 0 && (
            <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Managers Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-neutral-400 bg-white rounded-3xl border border-neutral-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
          <span className="text-xs font-medium">Loading leadership managers...</span>
        </div>
      ) : filteredManagers.length === 0 ? (
        <div className="p-20 text-center text-xs text-neutral-400 bg-white rounded-3xl border border-neutral-200/80 space-y-3">
          <UserCheck className="w-10 h-10 text-neutral-300 mx-auto mb-1" />
          <p className="font-bold text-neutral-800 text-sm">
            {searchQuery || statusFilter !== "ALL" || branchFilter !== "ALL" || deptFilter !== "ALL"
              ? "No managers matched your filters" 
              : "No managers assigned yet"}
          </p>
          <p className="text-neutral-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL" || branchFilter !== "ALL" || deptFilter !== "ALL"
              ? "Try resetting your search query or filters to view all managers."
              : "Click 'Assign Manager' to register your first branch manager or department lead."}
          </p>
          {searchQuery || statusFilter !== "ALL" || branchFilter !== "ALL" || deptFilter !== "ALL" ? (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setBranchFilter("ALL"); setDeptFilter("ALL"); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <button 
              onClick={() => { setManagerToEdit(null); setIsModalOpen(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Assign First Manager
            </button>
          )}
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((manager) => (
            <ManagerCard 
              key={manager.id} 
              manager={manager} 
              onEdit={(m: Manager) => { setManagerToEdit(m); setIsModalOpen(true); }}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ManagerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        managerToEdit={managerToEdit} 
        existingManagers={managers}
        branches={branches}
        departments={departments}
        onSave={handleSaveManager} 
      />

      {/* Confirmation Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Remove Manager</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Are you sure you want to remove <strong className="text-neutral-800">"{managerToDelete?.name}"</strong> from managerial leadership? Their managed employees will be unassigned.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => { setIsDeleteOpen(false); setManagerToDelete(null); }} 
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors cursor-pointer active:scale-95"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}