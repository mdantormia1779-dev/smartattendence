import React from 'react';
import { ChevronRight } from 'lucide-react';

const EmployeeTable = ({ employees, onRowClick }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 text-[11px] md:text-xs font-semibold text-stone-500 uppercase tracking-wider bg-stone-50/50">
              <th className="py-3 px-3 md:px-6">Employee</th>
              <th className="py-3 px-2 md:px-4">ID</th>
              <th className="py-3 px-2 md:px-4 hidden lg:table-cell">Department</th>
              <th className="py-3 px-2 md:px-4">Designation</th>
              <th className="py-3 px-2 md:px-4 hidden xl:table-cell">Branch</th>
              <th className="py-3 px-2 md:px-4">Type</th>
              <th className="py-3 px-2 md:px-4">Status</th>
              <th className="py-3 px-2 md:px-4">Today</th>
              <th className="py-3 px-3 md:px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs md:text-sm">
            {employees.length > 0 ? (
              employees.map((emp, index) => (
                <tr 
                  key={emp.id || index} 
                  onClick={() => onRowClick && onRowClick(emp)}
                  className="anim-row hover:bg-stone-50/50 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-3 md:px-6 flex items-center gap-2.5">
                    <img src={emp.image} alt={emp.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-stone-100 shadow-xs flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900 group-hover:text-emerald-600 transition-colors truncate">{emp.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{emp.email}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 md:px-4 text-stone-600 font-mono text-[11px] md:text-xs">{emp.id}</td>
                  <td className="py-3.5 px-2 md:px-4 text-stone-700 hidden lg:table-cell">{emp.department}</td>
                  <td className="py-3.5 px-2 md:px-4 text-stone-700 truncate max-w-[150px]">{emp.designation}</td>
                  <td className="py-3.5 px-2 md:px-4 text-stone-700 hidden xl:table-cell">{emp.branch}</td>
                  <td className="py-3.5 px-2 md:px-4">
                    <span className={`inline-block px-2 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${emp.type === 'Full-time' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-700'}`}>
                      {emp.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 md:px-4">
                    <span className="inline-block px-2 md:px-2.5 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-medium rounded-full">
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 md:px-4">
                    <span className={`inline-block px-2 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${emp.todayColor || 'bg-emerald-100 text-emerald-700'}`}>
                      {emp.today}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 md:px-6 text-right text-stone-400 group-hover:text-stone-700 transition-colors">
                    <ChevronRight className="w-4 h-4 inline" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-stone-500">
                  No employees found matching your criteria.
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