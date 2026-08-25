"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import {
    X,
    Save,
    User,
    Mail,
    Phone,
    Building2,
    Layers,
    Hash,
    Briefcase,
    Lock,
    Upload,
    Sparkles,
    Eye,
    EyeOff,
    GitBranch,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Manager, ManagerFormData } from "@/types/manager";

const managerSchema = z.object({
    managerId: z.string().min(1, "Manager ID is required"),
    name: z.string().min(1, "Full Name is required"),
    profilePic: z.string().optional().or(z.literal("")),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    designation: z.string().min(1, "Designation is required"),
    assignedBranch: z.string().min(1, "Assigned Branch is required"),
    department: z.string().min(1, "Department is required"),
    status: z.enum(["Active", "Inactive"]),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .or(z.literal("")),
});

interface BranchOption {
    id: string;
    name: string;
    code?: string;
}

interface DepartmentOption {
    id: string;
    name: string;
    code?: string;
}

interface ManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    managerToEdit?: Manager | null;
    existingManagers?: Manager[];
    branches?: BranchOption[];
    departments?: DepartmentOption[];
    onSave: (data: ManagerFormData) => void;
}

export const generateManagerId = (name: string, existingList?: Manager[]): string => {
    const count = (existingList?.length || 0) + 1;
    const clean = (name || "").trim();
    if (!clean) return `MGR-${String(count).padStart(3, "0")}`;

    const parts = clean.split(/\s+/).filter(Boolean);
    let prefix = "";
    if (parts.length >= 2) {
        prefix = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
        prefix = clean.slice(0, 3).toUpperCase();
    }
    return `MGR-${prefix}${String(count).padStart(2, "0")}`;
};

export default function ManagerModal({
    isOpen,
    onClose,
    managerToEdit,
    existingManagers = [],
    branches = [],
    departments = [],
    onSave,
}: ManagerModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);

    const defaultBranch = branches[0]?.name || "Main Head Office";
    const defaultDepartment = departments[0]?.name || "General Operations";

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ManagerFormData>({
        resolver: zodResolver(managerSchema),
        defaultValues: {
            managerId: "",
            name: "",
            profilePic: "",
            email: "",
            phone: "",
            designation: "Lead Manager",
            assignedBranch: defaultBranch,
            department: defaultDepartment,
            status: "Active",
            password: "",
        },
    });

    const watchedName = watch("name");

    useEffect(() => {
        if (managerToEdit) {
            reset({
                managerId: managerToEdit.managerId || `MGR-${managerToEdit.id.slice(-4).toUpperCase()}`,
                name: managerToEdit.name,
                profilePic: managerToEdit.profilePic || "",
                email: managerToEdit.email,
                phone: managerToEdit.phone || "+880 1800-000000",
                designation: managerToEdit.designation || "Lead Manager",
                assignedBranch: managerToEdit.assignedBranch || defaultBranch,
                department: managerToEdit.department || defaultDepartment,
                status: managerToEdit.status || "Active",
                password: "",
            });
            setImagePreview(managerToEdit.profilePic || "");
        } else {
            const autoId = generateManagerId("", existingManagers);
            reset({
                managerId: autoId,
                name: "",
                profilePic: "",
                email: "",
                phone: "+880 1800-000000",
                designation: "Department Manager",
                assignedBranch: defaultBranch,
                department: defaultDepartment,
                status: "Active",
                password: "manager123",
            });
            setImagePreview("");
        }
    }, [managerToEdit, isOpen, branches, departments, existingManagers, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setValue("profilePic", result, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("name", val, { shouldValidate: true });
        if (!managerToEdit) {
            const autoId = generateManagerId(val, existingManagers);
            setValue("managerId", autoId, { shouldValidate: true });
        }
    };

    const handleRegenerateId = () => {
        const autoId = generateManagerId(watchedName || "", existingManagers);
        setValue("managerId", autoId, { shouldValidate: true });
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(contentRef.current, { scale: 0.92, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.2)" });
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const onSubmit = (data: ManagerFormData) => {
        onSave({ ...data, profilePic: imagePreview });
        onClose();
    };

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div ref={contentRef} className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#00B050]/10 text-[#00B050] flex items-center justify-center font-bold">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                {managerToEdit ? "Edit Manager Profile" : "Assign New Manager"}
                            </h2>
                            <p className="text-xs text-gray-400">
                                {managerToEdit
                                    ? "Update leadership roles and assignments"
                                    : "Register a managerial supervisor for your organization"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Profile Picture Upload Section */}
                    <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-2xs bg-emerald-50 text-[#00B050] font-bold flex items-center justify-center text-base shrink-0">
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Profile Preview"
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : (
                                <span>{watchedName ? watchedName.slice(0, 2).toUpperCase() : "MGR"}</span>
                            )}
                        </div>
                        <div>
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or WEBP (Max 2MB)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Full Name *</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("name")}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Tanvir Ahmed"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                            {errors.name && <span className="text-[10px] font-medium text-rose-500">{errors.name.message}</span>}
                        </div>

                        {/* Manager ID */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700">Manager ID *</label>
                                <button
                                    type="button"
                                    onClick={handleRegenerateId}
                                    className="text-[10px] text-[#00B050] hover:text-[#009b46] font-bold flex items-center gap-1 cursor-pointer transition-colors bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60"
                                >
                                    <Sparkles className="w-3 h-3" /> Auto
                                </button>
                            </div>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("managerId")}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] uppercase"
                                />
                            </div>
                            {errors.managerId && <span className="text-[10px] font-medium text-rose-500">{errors.managerId.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Email Address (Login Username) *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    {...register("email")}
                                    placeholder="manager@vertextech.io"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                            {errors.email && <span className="text-[10px] font-medium text-rose-500">{errors.email.message}</span>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("phone")}
                                    placeholder="+880 1800-000000"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                            {errors.phone && <span className="text-[10px] font-medium text-rose-500">{errors.phone.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Designation */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Designation / Role Title *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("designation")}
                                    placeholder="e.g. Engineering Lead / Area Head"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                            </div>
                            {errors.designation && <span className="text-[10px] font-medium text-rose-500">{errors.designation.message}</span>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                {managerToEdit ? "Change Password (Optional)" : "Login Password *"}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder={managerToEdit ? "Leave blank to keep current" : "••••••••"}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <span className="text-[10px] font-medium text-rose-500">{errors.password.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Assigned Branch */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Assigned Branch (Office Location) *</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <select
                                    {...register("assignedBranch")}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] bg-white cursor-pointer"
                                >
                                    {branches.length > 0 ? (
                                        branches.map((b) => (
                                            <option key={b.id} value={b.name}>
                                                {b.name} ({b.code || "Branch"})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="Main Head Office">Main Head Office</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Assigned Department */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Department Unit *</label>
                            <div className="relative">
                                <Layers className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <select
                                    {...register("department")}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] bg-white cursor-pointer"
                                >
                                    {departments.length > 0 ? (
                                        departments.map((d) => (
                                            <option key={d.id} value={d.name}>
                                                {d.name} ({d.code || "DEPT"})
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="Information Technology">Information Technology</option>
                                            <option value="Human Resources">Human Resources</option>
                                            <option value="Accounts & Finance">Accounts & Finance</option>
                                            <option value="Operations">Operations</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Account Status *</label>
                        <select
                            {...register("status")}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050] bg-white cursor-pointer"
                        >
                            <option value="Active">Active Leadership</option>
                            <option value="Inactive">Inactive / On Leave</option>
                        </select>
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
                            {managerToEdit ? "Save Manager" : "Assign Manager"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}