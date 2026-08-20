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
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Manager, ManagerFormData } from "@/types/manager";

const managerSchema = z.object({
    managerId: z.string().min(1, "Manager ID is required"),
    name: z.string().min(1, "Name is required"),
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

interface ManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    managerToEdit?: Manager | null;
    onSave: (data: ManagerFormData) => void;
}

export default function ManagerModal({
    isOpen,
    onClose,
    managerToEdit,
    onSave,
}: ManagerModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<ManagerFormData>({
        resolver: zodResolver(managerSchema),
        defaultValues: {
            managerId: "",
            name: "",
            profilePic: "",
            email: "",
            phone: "",
            designation: "",
            assignedBranch: "Head Office - Dhaka",
            department: "Information Technology",
            status: "Active",
            password: "",
        },
    });

    useEffect(() => {
        if (managerToEdit) {
            reset({
                managerId: managerToEdit.managerId,
                name: managerToEdit.name,
                profilePic: managerToEdit.profilePic || "",
                email: managerToEdit.email,
                phone: managerToEdit.phone,
                designation: managerToEdit.designation,
                assignedBranch: managerToEdit.assignedBranch,
                department: managerToEdit.department,
                status: managerToEdit.status,
                password: "",
            });
            setImagePreview(managerToEdit.profilePic || "");
        } else {
            reset({
                managerId: "MGR-" + Math.floor(1000 + Math.random() * 9000),
                name: "",
                profilePic: "",
                email: "",
                phone: "",
                designation: "",
                assignedBranch: "Head Office - Dhaka",
                department: "Information Technology",
                status: "Active",
                password: "",
            });
            setImagePreview("");
        }
    }, [managerToEdit, isOpen, reset]);

    // Handle Image File Upload & Convert to Base64
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

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            gsap.fromTo(
                modalRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );
            gsap.fromTo(
                contentRef.current,
                { scale: 0.9, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
            );
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
        <div
            ref={modalRef}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <div
                ref={contentRef}
                className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {managerToEdit ? "Edit Manager" : "Add New Manager"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {managerToEdit
                                ? "Update manager details"
                                : "Register a new manager in the system"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 space-y-4 overflow-y-auto flex-1"
                >
                    {/* Profile Picture Upload Section */}
                    <div className="flex flex-col items-center justify-center space-y-2 pb-2">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#00B050]/30 shadow-inner bg-gray-50 flex items-center justify-center">
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Profile Preview"
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            ) : (
                                <User className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            Upload Photo
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Manager ID *
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("managerId")}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.managerId && (
                                <span className="text-[10px] font-medium text-rose-500">
                                    {errors.managerId.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("name")}
                                    placeholder="e.g. Tanvir Ahmed"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.name && (
                                <span className="text-[10px] font-medium text-rose-500">
                                    {errors.name.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    {...register("email")}
                                    placeholder="manager@vertex.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.email && (
                                <span className="text-[10px] font-medium text-rose-500">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("phone")}
                                    placeholder="+880 1800-000000"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.phone && (
                                <span className="text-[10px] font-medium text-rose-500">
                                    {errors.phone.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Designation *
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("designation")}
                                    placeholder="e.g. Senior Tech Lead"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.designation && (
                                <span className="text-[10px] font-medium text-rose-500">
                                    {errors.designation.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.password && (
                                <span className="text-[10px] font-medium text-rose-500">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Assigned Branch *
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <select
                                    {...register("assignedBranch")}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050] bg-white cursor-pointer"
                                >
                                    <option value="Head Office - Dhaka">
                                        Head Office - Dhaka
                                    </option>
                                    <option value="Gulshan Branch">Gulshan Branch</option>
                                    <option value="Uttara Branch">Uttara Branch</option>
                                    <option value="Chattogram Branch">Chattogram Branch</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Department *
                            </label>
                            <div className="relative">
                                <Layers className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <select
                                    {...register("department")}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050] bg-white cursor-pointer"
                                >
                                    <option value="Information Technology">
                                        Information Technology
                                    </option>
                                    <option value="Human Resources">Human Resources</option>
                                    <option value="Accounts & Finance">Accounts & Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Customer Support">Customer Support</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Status *</label>
                        <select
                            {...register("status")}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050] bg-white cursor-pointer"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
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
                            Save Manager
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}