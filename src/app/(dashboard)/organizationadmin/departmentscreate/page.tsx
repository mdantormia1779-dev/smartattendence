"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Building2, Plus, Loader2 } from "lucide-react";
import DepartmentCard from "../Components/Department/DepartmentCard";
import DepartmentModal from "../Components/Department/DepartmentModal";
import { api } from "@/lib/api-client";

interface Department {
  id: string;
  name: string;
  code: string;
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
  description: string;
  head: string;
  headPhone: string;
  headEmail: string;
  status: "Active" | "Inactive";
}

export default function DepartmentsPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.departments.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: Department[] = res.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          code: d.code || "DEPT",
          description: d.description || "Core organizational department unit.",
          head: d.headName || d.managerName || "Unassigned",
          headPhone: d.headPhone || "+880 1700-000000",
          headEmail: d.headEmail || "dept@vertextech.io",
          employeeCount: d.totalEmployees || d.employeesCount || 0,
          status: d.status === "INACTIVE" ? "Inactive" : "Active",
        }));
        setDepartments(mapped);
      }
    } catch (e) {
      console.error("Failed to load departments", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!loading && gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loading, departments]);

  const handleSaveDepartment = async (data: DepartmentFormData): Promise<void> => {
    try {
      if (deptToEdit) {
        await api.departments.update(deptToEdit.id, {
          name: data.name,
          code: data.code,
          description: data.description,
          status: data.status.toUpperCase(),
        });
      } else {
        await api.departments.create({
          name: data.name,
          code: data.code,
          description: data.description,
          status: data.status.toUpperCase(),
        });
      }
      await fetchDepartments();
      setIsModalOpen(false);
      setDeptToEdit(null);
    } catch (e) {
      console.error("Failed to save department", e);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.departments.delete(id);
      await fetchDepartments();
    } catch (e) {
      console.error("Failed to delete department", e);
    }
  };

  return (
    <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#00B050]" />
            Departments Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Total {departments.length} active departments configured in the organization
          </p>
        </div>
        <button 
          onClick={() => { setDeptToEdit(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
          <span>Loading departments...</span>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <DepartmentCard 
              key={dept.id} 
              department={dept} 
              onEdit={(d: Department) => { setDeptToEdit(d); setIsModalOpen(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <DepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        deptToEdit={deptToEdit} 
        onSave={handleSaveDepartment} 
      />
    </div>
  );
}