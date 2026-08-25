"use client";

import React from "react";
import { Users, Edit3, Trash2, ShieldCheck, Building2, Phone, Mail, GitBranch } from "lucide-react";

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

interface DepartmentCardProps {
    department: Department;
    onEdit: (dept: Department) => void;
    onDelete: (id: string, name: string) => void;
}

export default function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
    const getInitials = (name: string) => {
        if (!name) return "HD";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100/80 shadow-xs hover:shadow-xl hover:border-emerald-100/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-[#00B050] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
                {/* Top Row: Name, Code & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-[#00B050]/20 text-[#00B050] flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/15 group-hover:scale-105 transition-transform">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#00B050] transition-colors leading-tight">
                                {department.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                    {department.code}
                                </span>
                                {department.branchName && (
                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                        <GitBranch className="w-3 h-3 text-emerald-500" />
                                        {department.branchName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                        department.status === "Active" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60" 
                            : "bg-gray-100 text-gray-500"
                    }`}>
                        {department.status === "Active" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        {department.status}
                    </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-3.5 line-clamp-2 leading-relaxed">
                    {department.description}
                </p>

                {/* Head of Department Profile Card */}
                <div className="bg-gray-50/70 rounded-2xl p-3 border border-gray-100/70 space-y-2 mb-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                                {getInitials(department.head)}
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-900 leading-tight truncate max-w-[130px]">
                                    {department.head}
                                </p>
                                <p className="text-[9px] text-gray-400 font-medium">Head of Department</p>
                            </div>
                        </div>
                        <span className="p-1 rounded-md bg-white border border-gray-200/60 text-emerald-600">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200/50 flex flex-col gap-1 text-[11px]">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="flex items-center gap-1 text-gray-400">
                                <Phone className="w-3 h-3" /> Phone:
                            </span>
                            <span className="font-semibold text-gray-700">{department.headPhone}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="flex items-center gap-1 text-gray-400">
                                <Mail className="w-3 h-3" /> Email:
                            </span>
                            <span className="font-semibold text-gray-700 truncate max-w-[140px]">{department.headEmail}</span>
                        </div>
                    </div>
                </div>

                {/* Employee Workforce Pill */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100 text-xs">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" /> Department Workforce:
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-[#00B050] border border-emerald-100 rounded-lg font-bold text-xs">
                        {department.employeeCount} Members
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                    onClick={() => onEdit(department)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-[#00B050]/10 hover:text-[#00B050] transition-colors cursor-pointer active:scale-95"
                >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                    onClick={() => onDelete(department.id, department.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 bg-rose-50/50 hover:bg-rose-100/60 hover:text-rose-600 transition-colors cursor-pointer active:scale-95"
                >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
            </div>
        </div>
    );
}