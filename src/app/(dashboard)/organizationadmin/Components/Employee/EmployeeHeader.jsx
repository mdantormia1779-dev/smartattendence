import React from 'react';
import { Download, Plus } from 'lucide-react';

const EmployeeHeader = ({ totalCount, onAddClick }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 anim-header">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Employees</h1>
        <p className="text-sm text-stone-500 mt-1">{totalCount} active staff across all branches</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition shadow-sm cursor-pointer active:scale-95">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>
    </div>
  );
};

export default EmployeeHeader;