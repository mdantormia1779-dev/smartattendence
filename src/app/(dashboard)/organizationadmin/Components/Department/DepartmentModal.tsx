"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Building2, Save, User, FileText, ToggleLeft, Phone, Mail, Sparkles, Hash, GitBranch } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

interface Branch {
    id: string;
    name: string;
    code?: string;
}

// Helper to auto-generate meaningful department code
export const generateDepartmentCode = (name: string, existingList?: Department[]): string => {
    const count = (existingList?.length || 0) + 1;
    const clean = (name || "").trim();

    if (!clean) {
        return `DEPT-${String(count).padStart(3, "0")}`;
    }

    // Filter common filler words
    const filtered = clean
        .replace(/\b(department|dept|division|team|unit|section|wing)\b/gi, "")
        .trim();

    const words = (filtered || clean).split(/[\s\-_&]+/).filter(Boolean);

    let prefix = "";
    if (words.length >= 2) {
        prefix = words.map(w => w[0]).join("").toUpperCase().slice(0, 4);
    } else if (words.length === 1) {
        prefix = words[0].slice(0, 4).toUpperCase();
    } else {
        prefix = "GEN";
    }

    prefix = prefix.replace(/[^A-Z0-9]/g, "");
    if (!prefix) prefix = "DPT";

    const numPart = String(count).padStart(2, "0");
    return `DEPT-${prefix}${numPart}`;
};

const departmentSchema = z.object({
    name: z.string().min(1, "Department Name is required"),
    code: z.string().min(1, "Department Code is required"),
    branchId: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    head: z.string().min(1, "Department Head is required"),
    headPhone: z.string().min(1, "Head Phone is required"),
    headEmail: z.string().email("Invalid email address").min(1, "Head Email is required"),
    status: z.enum(["Active", "Inactive"]),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    deptToEdit?: Department | null;
    existingDepartments?: Department[];
    branches?: Branch[];
    onSave: (data: DepartmentFormData) => void;
}

export default function DepartmentModal({ 
    isOpen, 
    onClose, 
    deptToEdit, 
    existingDepartments = [],
    branches = [],
    onSave 
}: DepartmentModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isManualCode, setIsManualCode] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: "",
            code: "",
            branchId: "",
            description: "",
            head: "",
            headPhone: "+880 1700-000000",
            headEmail: "",
            status: "Active",
        },
    });

    const watchedName = watch("name");

    useEffect(() => {
        if (deptToEdit) {
            setIsManualCode(true);
            reset({
                name: deptToEdit.name,
                code: deptToEdit.code,
                branchId: deptToEdit.branchId || "",
                description: deptToEdit.description || `Core organizational department unit for ${deptToEdit.name}.`,
                head: deptToEdit.head || "Ashfaq Ahmed",
                headPhone: deptToEdit.headPhone || "+880 1700-000000",
                headEmail: deptToEdit.headEmail || "dept@vertextech.io",
                status: deptToEdit.status || "Active",
            });
        } else {
            setIsManualCode(false);
            const initialCode = generateDepartmentCode("", existingDepartments);
            reset({
                name: "",
                code: initialCode,
                branchId: "",
                description: "",
                head: "",
                headPhone: "+880 1700-000000",
                headEmail: "",
                status: "Active",
            });
        }
    }, [deptToEdit, isOpen, existingDepartments, reset]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(contentRef.current, { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" });
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Handle Name change to auto-update code and description
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("name", val, { shouldValidate: true });

        if (!isManualCode && !deptToEdit) {
            const autoCode = generateDepartmentCode(val, existingDepartments);
            setValue("code", autoCode, { shouldValidate: true });
        }

        // Auto-fill description if currently blank
        const currentDesc = watch("description");
        if (!currentDesc || currentDesc.startsWith("Core organizational")) {
            setValue("description", val.trim() ? `Core operations and management of ${val.trim()} department.` : "", { shouldValidate: false });
        }
    };

    // Auto-generate button handler
    const handleRegenerateCode = () => {
        const autoCode = generateDepartmentCode(watchedName || "", existingDepartments);
        setValue("code", autoCode, { shouldValidate: true });
        setIsManualCode(false);
    };

    const onSubmit = (data: DepartmentFormData) => {
        onSave({
            ...data,
            code: data.code.trim().toUpperCase(),
        });
        onClose();
    };

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div ref={contentRef} className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#00B050]/10 text-[#00B050] flex items-center justify-center font-bold">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                {deptToEdit ? "Edit Department" : "Create New Department"}
                            </h2>
                            <p className="text-xs text-gray-400">
                                {deptToEdit ? "Update organizational department parameters" : "Add a corporate functional division and configure leadership"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Department Name *</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    {...register("name")}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Software Engineering" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                            {errors.name && <span className="text-[10px] font-medium text-rose-500">{errors.name.message}</span>}
                        </div>

                        {/* Code with Auto Generate */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700">Department Code *</label>
                                <button
                                    type="button"
                                    onClick={handleRegenerateCode}
                                    className="text-[10px] text-[#00B050] hover:text-[#009b46] font-bold flex items-center gap-1 cursor-pointer transition-colors bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60"
                                    title="Auto-generate department code"
                                >
                                    <Sparkles className="w-3 h-3 text-[#00B050]" />
                                    Auto Generate
                                </button>
                            </div>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    {...register("code")}
                                    onChange={(e) => {
                                        setValue("code", e.target.value.toUpperCase(), { shouldValidate: true });
                                        setIsManualCode(true);
                                    }}
                                    placeholder="e.g. DEPT-ENG01" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] uppercase"
                                />
                            </div>
                            {errors.code && <span className="text-[10px] font-medium text-rose-500">{errors.code.message}</span>}
                        </div>
                    </div>

                    {/* Branch Assignment */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Assigned Branch (Office Location)</label>
                        <div className="relative">
                            <GitBranch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <select
                                {...register("branchId")}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] bg-white cursor-pointer"
                            >
                                <option value="">All Branches / Main Headquarters</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.code || "Branch"})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Department Head Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Head of Department (Lead Manager) *</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                {...register("head")}
                                placeholder="e.g. Ashfaq Ahmed" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>
                        {errors.head && <span className="text-[10px] font-medium text-rose-500">{errors.head.message}</span>}
                    </div>

                    {/* Head Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Head Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    {...register("headPhone")}
                                    placeholder="+880 1700-000000" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                            {errors.headPhone && <span className="text-[10px] font-medium text-rose-500">{errors.headPhone.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Head Official Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="email" 
                                    {...register("headEmail")}
                                    placeholder="head@company.com" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                            {errors.headEmail && <span className="text-[10px] font-medium text-rose-500">{errors.headEmail.message}</span>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Department Scope & Description *</label>
                        <div className="relative">
                            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <textarea 
                                rows={2}
                                {...register("description")}
                                placeholder="Core overview of responsibilities and scope..." 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                            />
                        </div>
                        {errors.description && <span className="text-[10px] font-medium text-rose-500">{errors.description.message}</span>}
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Department Status *</label>
                        <div className="relative">
                            <ToggleLeft className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <select
                                {...register("status")}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] bg-white cursor-pointer"
                            >
                                <option value="Active">Active Operational</option>
                                <option value="Inactive">Inactive / Suspended</option>
                            </select>
                        </div>
                        {errors.status && <span className="text-[10px] font-medium text-rose-500">{errors.status.message}</span>}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            {deptToEdit ? "Save Changes" : "Create Department"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}