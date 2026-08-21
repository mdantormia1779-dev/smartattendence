import React from 'react';
import { Search, Filter } from 'lucide-react';

const EmployeeFilters = ({ searchTerm, setSearchTerm, selectedType, setSelectedType, selectedBranch, setSelectedBranch }) => {
  return (
    <div className="anim-filter flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, ID or designation..." 
          className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 placeholder:text-stone-400 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-stone-400 cursor-pointer"
        >
          <option value="All">All</option>
          <option value="Full-time">Full-time</option>
          <option value="Contract">Contract</option>
        </select>

        <select 
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-stone-400 cursor-pointer"
        >
          <option value="All">All Branches</option>
          <option value="Head Office – Dhaka">Head Office – Dhaka</option>
          <option value="Gulshan Branch">Gulshan Branch</option>
          <option value="Chattogram Branch">Chattogram Branch</option>
        </select>

        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </div>
  );
};

export default EmployeeFilters;