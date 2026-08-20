"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { X, Building2, Save, User, FileText, ToggleLeft, Phone, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

const departmentSchema = z.object({
    name: z.string().min(1, "Department Name is required"),
    code: z.string().min(1, "Department Code is required"),
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
    onSave: (data: DepartmentFormData) => void;
}

export default function DepartmentModal({ isOpen, onClose, deptToEdit, onSave }: DepartmentModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            head: "",
            headPhone: "",
            headEmail: "",
            status: "Active",
        },
    });

    useEffect(() => {
        if (deptToEdit) {
            reset({
                name: deptToEdit.name,
                code: deptToEdit.code,
                description: deptToEdit.description,
                head: deptToEdit.head,
                headPhone: deptToEdit.headPhone,
                headEmail: deptToEdit.headEmail,
                status: deptToEdit.status,
            });
        } else {
            reset({
                name: "",
                code: "",
                description: "",
                head: "",
                headPhone: "",
                headEmail: "",
                status: "Active",
            });
        }
    }, [deptToEdit, isOpen, reset]);

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

    const onSubmit = (data: DepartmentFormData) => {
        onSave(data);
        onClose();
    };

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div ref={contentRef} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {deptToEdit ? "Edit Department" : "Create New Department"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {deptToEdit ? "Update department details" : "Add a new corporate department"}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Department Name *</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    {...register("name")}
                                    placeholder="e.g. Human Resources" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.name && <span className="text-[10px] font-medium text-rose-500">{errors.name.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Department Code *</label>
                            <input 
                                type="text" 
                                {...register("code")}
                                placeholder="e.g. HR-01" 
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                            />
                            {errors.code && <span className="text-[10px] font-medium text-rose-500">{errors.code.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Head of Department (Name) *</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                {...register("head")}
                                placeholder="e.g. Ashfaq Ahmed" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                            />
                        </div>
                        {errors.head && <span className="text-[10px] font-medium text-rose-500">{errors.head.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Head Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    {...register("headPhone")}
                                    placeholder="+880 1700-000000" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.headPhone && <span className="text-[10px] font-medium text-rose-500">{errors.headPhone.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Head Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="email" 
                                    {...register("headEmail")}
                                    placeholder="head@company.com" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.headEmail && <span className="text-[10px] font-medium text-rose-500">{errors.headEmail.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Description *</label>
                        <div className="relative">
                            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <textarea 
                                rows={2}
                                {...register("description")}
                                placeholder="Brief overview of the department..." 
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                            />
                        </div>
                        {errors.description && <span className="text-[10px] font-medium text-rose-500">{errors.description.message}</span>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Status *</label>
                        <div className="relative">
                            <ToggleLeft className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <select
                                {...register("status")}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050] bg-white cursor-pointer"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        {errors.status && <span className="text-[10px] font-medium text-rose-500">{errors.status.message}</span>}
                    </div>

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
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            Save Department
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}