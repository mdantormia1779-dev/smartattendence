"use client";

import React from "react";
import { MapPin, Phone, Users, Edit3, Trash2 } from "lucide-react";

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

interface BranchCardProps {
    branch: Branch;
    onEdit: (branch: Branch) => void;
    onDelete: (id: string) => void;
}

export default function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div>
                <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center border border-emerald-100">
                        <MapPin className="w-5 h-5" />
                    </div>
                    {/* Branch Status */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        branch.status === "Active" 
                            ? "bg-emerald-50 text-[#00B050] border border-emerald-100" 
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}>
                        {branch.status}
                    </span>
                </div>

                {/* Branch Name & Code */}
                <div className="mt-4">
                    <h3 className="text-base font-bold text-gray-900">{branch.name}</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                        {branch.shortName} <span className="mx-1">•</span> Code: {branch.code}
                    </p>
                </div>

                {/* Branch Address & Phone Number */}
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                    <p className="flex items-center gap-2 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{branch.address}</span>
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{branch.phone}</span>
                    </p>
                </div>

                {/* Grid Info: Employees, Geo-Fence Radius, Latitude, Longitude */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <div>
                        <span className="text-[11px] font-medium text-gray-400 block">Employees</span>
                        <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">{branch.employees}</span>
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-gray-400 block">Geo-Fence Radius</span>
                        <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">{branch.geoFence}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200/60">
                        <span className="text-[10px] font-medium text-gray-400 block">Latitude</span>
                        <span className="text-xs font-bold text-gray-700">{branch.latitude}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200/60">
                        <span className="text-[10px] font-medium text-gray-400 block">Longitude</span>
                        <span className="text-xs font-bold text-gray-700">{branch.longitude}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    Staff
                </button>
                <button 
                    onClick={() => onEdit(branch)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    Edit
                </button>
                <button 
                    onClick={() => onDelete(branch.id)}
                    className="w-9 h-9 rounded-xl border border-rose-100 bg-rose-50/50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer shrink-0" 
                    title="Delete Branch"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}