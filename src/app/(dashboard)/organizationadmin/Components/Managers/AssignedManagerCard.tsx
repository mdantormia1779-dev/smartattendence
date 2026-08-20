"use client";

import React from "react";
import Image from "next/image";
import { Manager } from "@/types/manager";
import { Mail, Phone, Building2, Layers, Edit, Trash2 } from "lucide-react";

interface ManagerCardProps {
    manager: Manager;
    onEdit: (manager: Manager) => void;
    onDelete: (id: string) => void;
}

export default function AssignedManagerCard({ manager, onEdit, onDelete }: ManagerCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            {/* Top Section */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00B050]/20 shrink-0">
                        <Image 
                            src={manager.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
                            alt={manager.name || "Manager profile picture"} 
                            fill
                            sizes="48px"
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{manager.name}</h3>
                        <p className="text-xs text-gray-500 font-medium">{manager.designation}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {manager.managerId}
                        </span>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    manager.status === "Active" ? "bg-emerald-50 text-[#00B050]" : "bg-rose-50 text-rose-500"
                }`}>
                    {manager.status}
                </span>
            </div>

            {/* Details Section */}
            <div className="space-y-2 pt-2 border-t border-gray-50 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{manager.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{manager.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{manager.assignedBranch}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{manager.department}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-50 flex items-center justify-end gap-2">
                <button 
                    onClick={() => onEdit(manager)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                </button>
                <button 
                    onClick={() => onDelete(manager.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                </button>
            </div>
        </div>
    );
}