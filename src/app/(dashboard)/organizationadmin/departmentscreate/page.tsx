"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { 
  Building2, 
  Plus, 
  Loader2, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  ShieldCheck, 
  GitBranch, 
  AlertTriangle,
  X
} from "lucide-react";
import DepartmentCard from "../Components/Department/DepartmentCard";
import DepartmentModal from "../Components/Department/DepartmentModal";
import { api } from "@/lib/api-client";

interface Department {
  id: string;
  name: string;
  code: string;
  branchId?: string;
  branchName?: string;
  description: string;
  head: string;
  headPhone: string;
  headEmail: string;
  employeeCount: number;
  status: "Active" | "Inactive";
}

interface DepartmentFormData {
  name: string;
  code: string;
  branchId?: string;
  description: string;
  head: string;
  headPhone: string;
  headEmail: string;
  status: "Active" | "Inactive";
}

interface Branch {
  id: string;
  name: string;
  code?: string;
}

export default function DepartmentsPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deptToDelete, setDeptToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchDepartmentsAndBranches = async () => {
    try {
      setLoading(true);
      const [deptRes, branchRes] = await Promise.allSettled([
        api.departments.getAll(),
        api.branches.getAll(),
      ]);

      if (deptRes.status === "fulfilled" && deptRes.value.success && Array.isArray(deptRes.value.data)) {
        const mapped: Department[] = deptRes.value.data.map((d: any, index: number) => ({
          id: d.id,
          name: d.name,
          code: d.code || `DEPT-${d.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "GEN"}${String(index + 1).padStart(2, "0")}`,
          branchId: d.branchId || undefined,
          branchName: d.branchName || (d.branchId ? "Assigned Branch" : "All Branches"),
          description: d.description || `Core operational department unit for ${d.name}.`,
          head: d.head || d.headOfDept || d.headName || d.managerName || "Ashfaq Ahmed",
          headPhone: d.headPhone || "+880 1700-000000",
          headEmail: d.headEmail || "head@vertextech.io",
          employeeCount: d.totalMembers || d.totalEmployees || d.employeesCount || d.employeeCount || 0,
          status: d.status === "INACTIVE" || d.status === "Inactive" ? "Inactive" : "Active",
        }));
        setDepartments(mapped);
      }

      if (branchRes.status === "fulfilled" && branchRes.value.success && Array.isArray(branchRes.value.data)) {
        setBranches(branchRes.value.data);
      }
    } catch (e) {
      console.error("Failed to load departments or branches", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsAndBranches();
  }, []);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        !searchQuery.trim() ||
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.head.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.branchName && dept.branchName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || dept.status === statusFilter;

      const matchesBranch =
        branchFilter === "ALL" || dept.branchId === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [departments, searchQuery, statusFilter, branchFilter]);

  useEffect(() => {
    if (!loading && gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, [loading, filteredDepartments]);

  // Save Department Handler
  const handleSaveDepartment = async (data: DepartmentFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      if (deptToEdit) {
        await api.departments.update(deptToEdit.id, {
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
          branchId: data.branchId || null,
          description: data.description.trim(),
          headOfDept: data.head.trim(),
          headPhone: data.headPhone.trim(),
          headEmail: data.headEmail.trim(),
          status: data.status.toUpperCase(),
        });
      } else {
        await api.departments.create({
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
          branchId: data.branchId || null,
          description: data.description.trim(),
          headOfDept: data.head.trim(),
          headPhone: data.headPhone.trim(),
          headEmail: data.headEmail.trim(),
          status: data.status.toUpperCase(),
        });
      }
      await fetchDepartmentsAndBranches();
      setIsModalOpen(false);
      setDeptToEdit(null);
    } catch (e) {
      console.error("Failed to save department", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const openDeleteModal = (id: string, name: string) => {
    setDeptToDelete({ id, name });
    setIsDeleteOpen(true);
  };

  // Confirm Delete Handler
  const confirmDelete = async (): Promise<void> => {
    if (!deptToDelete) return;
    try {
      await api.departments.delete(deptToDelete.id);
      await fetchDepartmentsAndBranches();
    } catch (e) {
      console.error("Failed to delete department", e);
    } finally {
      setIsDeleteOpen(false);
      setDeptToDelete(null);
    }
  };

  // Metrics Calculations
  const totalEmployeesCount = useMemo(() => {
    return departments.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0);
  }, [departments]);

  const activeDeptCount = useMemo(() => {
    return departments.filter(d => d.status === "Active").length;
  }, [departments]);

  return (
    <div className="flex-1 bg-[#FBFBFA] p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-neutral-800">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#00B050]" />
            Departments & Divisions
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure functional departments, leadership heads, and branch assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDepartmentsAndBranches}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
            title="Refresh departments list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
          </button>
          <button 
            onClick={() => { setDeptToEdit(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      {/* Metrics Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Total Departments</p>
            <h3 className="text-lg font-bold text-neutral-900">{departments.length} Units</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Total Workforce</p>
            <h3 className="text-lg font-bold text-neutral-900">{totalEmployeesCount} Employees</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Active Divisions</p>
            <h3 className="text-lg font-bold text-neutral-900">{activeDeptCount} Active</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400">Branch Locations</p>
            <h3 className="text-lg font-bold text-neutral-900">{branches.length || 1} Offices</h3>
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
            placeholder="Search by department name, code, head, or branch..."
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
        <div className="flex items-center gap-2.5">
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
              <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Departments Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-neutral-400 bg-white rounded-3xl border border-neutral-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
          <span className="text-xs font-medium">Loading organizational departments...</span>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="p-20 text-center text-xs text-neutral-400 bg-white rounded-3xl border border-neutral-200/80 space-y-3">
          <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-1" />
          <p className="font-bold text-neutral-800 text-sm">
            {searchQuery || statusFilter !== "ALL" || branchFilter !== "ALL" 
              ? "No departments matched your filters" 
              : "No departments configured yet"}
          </p>
          <p className="text-neutral-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL" || branchFilter !== "ALL"
              ? "Try resetting your search query or filters to view all departments."
              : "Click 'Add Department' to create your first corporate department division."}
          </p>
          {searchQuery || statusFilter !== "ALL" || branchFilter !== "ALL" ? (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setBranchFilter("ALL"); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <button 
              onClick={() => { setDeptToEdit(null); setIsModalOpen(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create First Department
            </button>
          )}
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <DepartmentCard 
              key={dept.id} 
              department={dept} 
              onEdit={(d: Department) => { setDeptToEdit(d); setIsModalOpen(true); }}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Department Create / Edit Modal */}
      <DepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        deptToEdit={deptToEdit} 
        existingDepartments={departments}
        branches={branches}
        onSave={handleSaveDepartment} 
      />

      {/* Confirmation Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Delete Department</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Are you sure you want to delete <strong className="text-neutral-800">"{deptToDelete?.name}"</strong>? This will detach any associated workforce allocations.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => { setIsDeleteOpen(false); setDeptToDelete(null); }} 
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors cursor-pointer active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}