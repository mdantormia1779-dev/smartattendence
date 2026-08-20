"use client";

import React from "react";
import { Users, Edit3, Trash2, ShieldCheck, Building, Phone, Mail } from "lucide-react";

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

interface DepartmentCardProps {
    department: Department;
    onEdit: (dept: Department) => void;
    onDelete: (id: string) => void;
}

export default function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
                {/* Top Row: Name & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00B050]/10 text-[#00B050] flex items-center justify-center font-bold text-sm shrink-0">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#00B050] transition-colors">
                                {department.name}
                            </h3>
                            <span className="text-[11px] font-semibold text-gray-400">
                                Code: {department.code}
                            </span>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        department.status === "Active" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-gray-100 text-gray-500"
                    }`}>
                        {department.status}
                    </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {department.description}
                </p>

                {/* Dept Head & Contact Info */}
                <div className="space-y-2.5 py-3 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00B050]" /> Head:
                        </span>
                        <span className="font-bold text-gray-800">{department.head}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone:
                        </span>
                        <span className="font-medium text-gray-600">{department.headPhone}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> Email:
                        </span>
                        <span className="font-medium text-gray-600 truncate max-w-37.5">{department.headEmail}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-gray-100">
                        <span className="text-gray-400 font-medium flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-gray-400" /> Total Employees:
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md font-bold text-gray-700">
                            {department.employeeCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-50 flex items-center justify-end gap-2">
                <button
                    onClick={() => onEdit(department)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-[#00B050]/10 hover:text-[#00B050] transition-colors cursor-pointer"
                >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                    onClick={() => onDelete(department.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
            </div>
        </div>
    );
}