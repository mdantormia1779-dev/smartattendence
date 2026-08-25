"use client";

import React from "react";
import Image from "next/image";
import { Manager } from "@/types/manager";
import { Mail, Phone, Building2, Layers, Edit, Trash2, ShieldCheck, Users } from "lucide-react";

interface ManagerCardProps {
    manager: Manager & { teamCount?: number };
    onEdit: (manager: Manager) => void;
    onDelete: (id: string, name: string) => void;
    onView?: (manager: Manager & { teamCount?: number }) => void;
}

export default function AssignedManagerCard({ manager, onEdit, onDelete, onView }: ManagerCardProps) {
    const getInitials = (name: string) => {
        if (!name) return "MG";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100/80 p-5 shadow-xs hover:shadow-xl hover:border-emerald-100/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-[#00B050] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div 
                className="space-y-3.5 cursor-pointer"
                onClick={() => onView && onView(manager)}
            >
                {/* Top Section: Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/20 bg-emerald-50 text-[#00B050] font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                            {manager.profilePic ? (
                                <Image 
                                    src={manager.profilePic} 
                                    alt={manager.name || "Manager profile"} 
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                />
                            ) : (
                                <span>{getInitials(manager.name)}</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#00B050] transition-colors leading-tight">
                                {manager.name}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">{manager.designation || "Lead Manager"}</p>
                            <span className="inline-block mt-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                {manager.managerId || `MGR-${manager.id.slice(-4).toUpperCase()}`}
                            </span>
                        </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                        manager.status === "Active" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60" 
                            : "bg-rose-50 text-rose-500 border border-rose-100"
                    }`}>
                        {manager.status === "Active" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        {manager.status}
                    </span>
                </div>

                {/* Details Section */}
                <div className="space-y-2 py-2.5 px-3 rounded-2xl bg-gray-50/70 border border-gray-100/70 text-xs font-medium text-gray-600">
                    <div className="flex items-center justify-between text-gray-500">
                        <span className="flex items-center gap-1.5 text-gray-400">
                            <Mail className="w-3.5 h-3.5 shrink-0" /> Email:
                        </span>
                        <span className="font-semibold text-gray-700 truncate max-w-[150px]">{manager.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-500">
                        <span className="flex items-center gap-1.5 text-gray-400">
                            <Phone className="w-3.5 h-3.5 shrink-0" /> Phone:
                        </span>
                        <span className="font-semibold text-gray-700">{manager.phone || "+880 1800-000000"}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-500 pt-1 border-t border-gray-200/50">
                        <span className="flex items-center gap-1.5 text-gray-400">
                            <Building2 className="w-3.5 h-3.5 shrink-0" /> Branch:
                        </span>
                        <span className="font-semibold text-gray-700 truncate max-w-[140px]">{manager.assignedBranch}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-500">
                        <span className="flex items-center gap-1.5 text-gray-400">
                            <Layers className="w-3.5 h-3.5 shrink-0" /> Department:
                        </span>
                        <span className="font-semibold text-gray-700 truncate max-w-[140px]">{manager.department}</span>
                    </div>
                </div>

                {/* Team Workforce Count */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100 text-xs">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" /> Managed Team:
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-[#00B050] border border-emerald-100 rounded-lg font-bold text-xs">
                        {manager.teamCount || 0} Employees
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {onView && (
                    <button 
                        onClick={() => onView(manager)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                        ID Card 🪪
                    </button>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                    <button 
                        onClick={() => onEdit(manager)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-[#00B050]/10 hover:text-[#00B050] transition-colors cursor-pointer active:scale-95"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                    </button>
                    <button 
                        onClick={() => onDelete(manager.id, manager.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50/50 text-rose-500 hover:bg-rose-100/60 hover:text-rose-600 transition-colors cursor-pointer active:scale-95"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}