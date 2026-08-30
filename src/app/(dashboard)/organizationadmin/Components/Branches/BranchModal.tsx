"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Building, MapPin, Phone, Save, ToggleLeft, Sparkles, Hash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

// Helper to auto-generate meaningful branch code
export const generateBranchCode = (name: string, existingList?: Branch[]): string => {
    const count = (existingList?.length || 0) + 1;
    const clean = (name || "").trim();

    if (!clean) {
        return `BR-${String(count).padStart(3, "0")}`;
    }

    // Filter filler words
    const filteredWords = clean
        .replace(/\b(branch|office|hub|center|centre|point|location|tower|floor)\b/gi, "")
        .trim();

    const words = (filteredWords || clean).split(/[\s\-_]+/).filter(Boolean);

    let prefix = "";
    if (words.length >= 2) {
        prefix = words.map(w => w[0]).join("").toUpperCase().slice(0, 4);
    } else if (words.length === 1) {
        prefix = words[0].slice(0, 4).toUpperCase();
    } else {
        prefix = "LOC";
    }

    prefix = prefix.replace(/[^A-Z0-9]/g, "");
    if (!prefix) prefix = "BRN";

    const numPart = String(count).padStart(2, "0");
    return `BR-${prefix}${numPart}`;
};

// Zod Validation Schema
const branchSchema = z.object({
    name: z.string().min(1, "Branch Name is required"),
    code: z.string().min(1, "Branch Code is required"),
    shortName: z.string().optional(),
    address: z.string().min(1, "Branch Address is required"),
    phone: z.string().min(1, "Phone Number is required"),
    geoFence: z.string().min(1, "Geo-Fence Radius is required"),
    latitude: z.string().min(1, "Latitude is required"),
    longitude: z.string().min(1, "Longitude is required"),
    status: z.enum(["Active", "Inactive"]),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchToEdit?: Branch | null;
    existingBranches?: Branch[];
    onSave: (branchData: BranchFormData) => void;
}

export default function BranchModal({ isOpen, onClose, branchToEdit, existingBranches = [], onSave }: BranchModalProps) {
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
    } = useForm<BranchFormData>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: "",
            code: "",
            shortName: "",
            address: "",
            phone: "",
            geoFence: "120m",
            latitude: "",
            longitude: "",
            status: "Active",
        },
    });

    const watchedName = watch("name");

    useEffect(() => {
        if (branchToEdit) {
            setIsManualCode(true);
            reset({
                name: branchToEdit.name,
                code: branchToEdit.code,
                shortName: branchToEdit.shortName,
                address: branchToEdit.address,
                phone: branchToEdit.phone,
                geoFence: branchToEdit.geoFence,
                latitude: branchToEdit.latitude,
                longitude: branchToEdit.longitude,
                status: branchToEdit.status,
            });
        } else {
            setIsManualCode(false);
            const initialCode = generateBranchCode("", existingBranches);
            reset({
                name: "",
                code: initialCode,
                shortName: "",
                address: "",
                phone: "",
                geoFence: "120m",
                latitude: "",
                longitude: "",
                status: "Active",
            });
        }
    }, [branchToEdit, isOpen, existingBranches, reset]);

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

    // Handle Branch Name input change to auto-update branch code
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("name", val, { shouldValidate: true });
        
        if (!isManualCode && !branchToEdit) {
            const autoCode = generateBranchCode(val, existingBranches);
            setValue("code", autoCode, { shouldValidate: true });
        }
    };

    // Manual re-generate button
    const handleRegenerateCode = () => {
        const autoCode = generateBranchCode(watchedName || "", existingBranches);
        setValue("code", autoCode, { shouldValidate: true });
        setIsManualCode(false);
    };

    const onSubmit = (data: BranchFormData) => {
        onSave({
            ...data,
            code: data.code.trim().toUpperCase(),
        });
        onClose();
    };

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div ref={contentRef} className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {branchToEdit ? "Edit Branch" : "Create New Branch"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {branchToEdit ? "Update branch location and details" : "Add a new office branch with auto-generated code and geofencing"}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Branch Name *</label>
                            <div className="relative">
                                <Building className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    {...register("name")}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Uttara Branch" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.name && <span className="text-[10px] font-medium text-rose-500">{errors.name.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700">Branch Code *</label>
                                <button
                                    type="button"
                                    onClick={handleRegenerateCode}
                                    className="text-[10px] text-[#00B050] hover:text-[#009b46] font-bold flex items-center gap-1 cursor-pointer transition-colors bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60"
                                    title="Auto-generate branch code"
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
                                    placeholder="e.g. BR-UTTA01" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#00B050] uppercase"
                                />
                            </div>
                            {errors.code && <span className="text-[10px] font-medium text-rose-500">{errors.code.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Branch Address *</label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                {...register("address")}
                                placeholder="House 12, Road 7, Dhaka" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                            />
                        </div>
                        {errors.address && <span className="text-[10px] font-medium text-rose-500">{errors.address.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    {...register("phone")}
                                    placeholder="+880 1700-000000" 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                                />
                            </div>
                            {errors.phone && <span className="text-[10px] font-medium text-rose-500">{errors.phone.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Geo-Fence Radius *</label>
                            <input 
                                type="text" 
                                {...register("geoFence")}
                                placeholder="120m" 
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                            />
                            {errors.geoFence && <span className="text-[10px] font-medium text-rose-500">{errors.geoFence.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700">Office GPS Coordinates (Latitude & Longitude) *</label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== "undefined" && navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                setValue("latitude", pos.coords.latitude.toFixed(7), { shouldValidate: true });
                                                setValue("longitude", pos.coords.longitude.toFixed(7), { shouldValidate: true });
                                                alert(`Location detected successfully! Accuracy: ±${Math.round(pos.coords.accuracy)} meters.`);
                                            },
                                            (err) => {
                                                alert(`GPS detection error: ${err.message}. Please ensure location permission is allowed.`);
                                            },
                                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                                        );
                                    } else {
                                        alert("Geolocation is not supported by your browser.");
                                    }
                                }}
                                className="text-[11px] text-[#00B050] hover:text-[#009b46] font-bold flex items-center gap-1 cursor-pointer transition-colors bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-xs"
                                title="Get exact GPS coordinates of current office location"
                            >
                                <MapPin className="w-3.5 h-3.5 text-[#00B050]" />
                                📍 Use Current Location
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Latitude *</label>
                            <input 
                                type="text" 
                                {...register("latitude")}
                                placeholder="e.g. 23.7493000" 
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                            />
                            {errors.latitude && <span className="text-[10px] font-medium text-rose-500">{errors.latitude.message}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Longitude *</label>
                            <input 
                                type="text" 
                                {...register("longitude")}
                                placeholder="e.g. 90.3929000" 
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#00B050]"
                            />
                            {errors.longitude && <span className="text-[10px] font-medium text-rose-500">{errors.longitude.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Branch Status *</label>
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
                            Save Branch
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}