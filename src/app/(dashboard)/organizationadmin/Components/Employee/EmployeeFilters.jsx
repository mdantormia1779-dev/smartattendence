"use client";

import React from 'react';
import { Search, Filter, Building2, Layers, RotateCcw, X } from 'lucide-react';

const EmployeeFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedType, 
  setSelectedType, 
  selectedBranch, 
  setSelectedBranch,
  selectedDepartment,
  setSelectedDepartment,
  selectedStatus,
  setSelectedStatus,
  branches = [],
  departments = [],
  onReset
}) => {
  return (
    <div className="anim-filter flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by employee name, ID, email, designation, phone..." 
          className="w-full pl-10 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-stone-400 transition-colors"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Employment Type */}
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
        >
          <option value="All">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Intern">Intern</option>
        </select>

        {/* Branch Filter */}
        <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs">
          <Building2 className="w-3.5 h-3.5 text-stone-400" />
          <select 
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b.id || b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus && setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Suspended">Suspended</option>
          <option value="Resigned">Resigned</option>
        </select>

        {/* Reset Filter Button */}
        {onReset && (
          <button 
            onClick={onReset}
            title="Reset Filters"
            className="p-2 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-xl text-stone-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeFilters;