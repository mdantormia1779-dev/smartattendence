"use client";

import React from 'react';
import { Download, Plus, Users, UserCheck, Briefcase, Lock, AlertTriangle, Zap } from 'lucide-react';

const EmployeeHeader = ({ 
  totalCount = 0, 
  activeCount = 0, 
  fullTimeCount = 0, 
  maxLimit = null,
  planName = "Free Tier",
  isQuotaExceeded = false,
  onAddClick, 
  onExport 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 anim-header bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
              Employee Workforce Directory
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Comprehensive employee database, attendance records, and departmental profiles
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-semibold text-stone-700">
            Total Staff: <strong>{totalCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
            Active: <strong>{activeCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-100">
            Full-Time: <strong>{fullTimeCount}</strong>
          </span>

          {/* Quota Indicator */}
          {maxLimit !== null && (
            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border ${
              isQuotaExceeded 
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" 
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {isQuotaExceeded ? <Lock className="w-3 h-3 text-rose-600" /> : <Zap className="w-3 h-3 text-amber-600" />}
              {planName} Quota: <strong>{totalCount}/{maxLimit}</strong>
              {isQuotaExceeded && <span className="text-[10px] uppercase tracking-wider font-extrabold ml-0.5">(Full)</span>}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-center">
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
          title="Export employee list as CSV"
        >
          <Download className="w-4 h-4 text-stone-500" />
          Export CSV
        </button>
        <button 
          onClick={onAddClick}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95 ${
            isQuotaExceeded
              ? "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-amber-600/20 ring-2 ring-amber-300"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
          }`}
        >
          {isQuotaExceeded ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isQuotaExceeded ? "Add Employee (Quota Full)" : "Add Employee"}
        </button>
      </div>
    </div>
  );
};

export default EmployeeHeader;