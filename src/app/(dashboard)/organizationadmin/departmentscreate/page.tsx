"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Building2, Plus } from "lucide-react";
import DepartmentCard from "../Components/Department/DepartmentCard";
import DepartmentModal from "../Components/Department/DepartmentModal";

// ইন্টারফেস ডিফাইন করা
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

    const [departments, setDepartments] = useState<Department[]>([
        { id: "1", name: "Human Resources", code: "HR", description: "Manages recruitment, employee welfare, and company culture.", head: "Nusrat Jahan", headPhone: "+880 1711-100001", headEmail: "nusrat.hr@vertex.com", employeeCount: 12, status: "Active" },
        { id: "2", name: "Information Technology", code: "IT", description: "Handles software engineering, infrastructure, and tech support.", head: "Tanvir Ahmed", headPhone: "+880 1822-200002", headEmail: "tanvir.it@vertex.com", employeeCount: 35, status: "Active" },
        { id: "3", name: "Accounts & Finance", code: "ACC", description: "Handles payroll, budgeting, auditing, and financial records.", head: "Rahim Uddin", headPhone: "+880 1933-300003", headEmail: "rahim.acc@vertex.com", employeeCount: 8, status: "Active" },
        { id: "4", name: "Marketing", code: "MKT", description: "Executes campaigns, brand strategy, and social media outreach.", head: "Sabrina Noor", headPhone: "+880 1644-400004", headEmail: "sabrina.mkt@vertex.com", employeeCount: 15, status: "Active" },
        { id: "5", name: "Sales", code: "SALES", description: "Drives business growth, client acquisition, and revenue targets.", head: "Imran Khan", headPhone: "+880 1555-500005", headEmail: "imran.sales@vertex.com", employeeCount: 22, status: "Active" },
        { id: "6", name: "Operations", code: "OPS", description: "Ensures seamless daily workflow, logistics, and resource management.", head: "Farhan Hossain", headPhone: "+880 1766-600006", headEmail: "farhan.ops@vertex.com", employeeCount: 18, status: "Active" },
        { id: "7", name: "Customer Support", code: "CS", description: "Provides 24/7 assistance and resolves client inquiries effectively.", head: "Mehnaz Tabassum", headPhone: "+880 1877-700007", headEmail: "mehnaz.cs@vertex.com", employeeCount: 25, status: "Active" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);

    useEffect(() => {
        if (gridRef.current) {
            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
            );
        }
    }, [departments]);

    const handleSaveDepartment = (data: DepartmentFormData): void => {
        if (deptToEdit) {
            setDepartments((prev: Department[]) => 
                prev.map((d: Department) => d.id === deptToEdit.id ? { ...d, ...data } : d)
            );
        } else {
            const newDept: Department = {
                id: Date.now().toString(),
                ...data,
                employeeCount: 0,
            };
            setDepartments((prev: Department[]) => [newDept, ...prev]);
        }
        setDeptToEdit(null);
    };

    const handleDelete = (id: string): void => {
        setDepartments((prev: Department[]) => prev.filter((d: Department) => d.id !== id));
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
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept: Department) => (
                    <DepartmentCard 
                        key={dept.id} 
                        department={dept} 
                        onEdit={(d: Department) => { setDeptToEdit(d); setIsModalOpen(true); }}
                        onDelete={(id: string) => handleDelete(id)}
                    />
                ))}
            </div>

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