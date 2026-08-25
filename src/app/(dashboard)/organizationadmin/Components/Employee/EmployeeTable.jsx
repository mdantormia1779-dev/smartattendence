"use client";

import React from 'react';
import { ChevronRight, User } from 'lucide-react';

const EmployeeTable = ({ employees, onRowClick }) => {
  const getInitials = (name) => {
    if (!name) return "EM";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/60">
              <th className="py-4 px-4 md:px-6">Employee Profile</th>
              <th className="py-4 px-3 md:px-4">Employee ID</th>
              <th className="py-4 px-3 md:px-4 hidden lg:table-cell">Department</th>
              <th className="py-4 px-3 md:px-4">Designation</th>
              <th className="py-4 px-3 md:px-4 hidden xl:table-cell">Branch</th>
              <th className="py-4 px-3 md:px-4">Employment</th>
              <th className="py-4 px-3 md:px-4">Status</th>
              <th className="py-4 px-3 md:px-4">Live Today</th>
              <th className="py-4 px-4 md:px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {employees.length > 0 ? (
              employees.map((emp, index) => (
                <tr 
                  key={emp.id || emp.dbId || index} 
                  onClick={() => onRowClick && onRowClick(emp)}
                  className="anim-row hover:bg-stone-50/70 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-4 md:px-6 flex items-center gap-3">
                    {emp.image && !emp.image.includes("unsplash") ? (
                      <img 
                        src={emp.image} 
                        alt={emp.name} 
                        className="w-10 h-10 rounded-2xl object-cover border border-emerald-500/20 shadow-2xs flex-shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-xs border border-emerald-100/60 shadow-2xs flex-shrink-0 group-hover:scale-105 transition-transform">
                        {getInitials(emp.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 group-hover:text-emerald-600 transition-colors truncate">
                        {emp.name}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">{emp.email}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 md:px-4 text-stone-600 font-mono font-bold text-xs uppercase">
                    {emp.id}
                  </td>

                  <td className="py-3.5 px-3 md:px-4 text-stone-700 hidden lg:table-cell font-medium">
                    {emp.department}
                  </td>

                  <td className="py-3.5 px-3 md:px-4 text-stone-700 truncate max-w-[140px] font-medium">
                    {emp.designation}
                  </td>

                  <td className="py-3.5 px-3 md:px-4 text-stone-700 hidden xl:table-cell font-medium">
                    {emp.branch}
                  </td>

                  <td className="py-3.5 px-3 md:px-4">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg ${
                      emp.type === 'Full-time' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {emp.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 md:px-4">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      emp.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                        : emp.status === 'On Leave'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {emp.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 md:px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-lg ${emp.todayColor || 'bg-stone-100 text-stone-700'}`}>
                      {emp.today === 'Present' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {emp.today}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 md:px-6 text-right text-stone-400 group-hover:text-emerald-600 transition-colors">
                    <ChevronRight className="w-4 h-4 inline group-hover:translate-x-0.5 transition-transform" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-12 text-center text-xs text-stone-400">
                  No employee profiles matched your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;