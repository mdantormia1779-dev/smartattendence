"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Download, 
  Shield, 
  UserPlus, 
  UserCog, 
  UserMinus, 
  Clock, 
  CheckSquare, 
  CircleDollarSign,
  Filter,
  History
} from "lucide-react";
import gsap from "gsap";

type ActionType = 
  | "Login Activity"
  | "Attendance Activity"
  | "Employee Creation"
  | "Employee Update"
  | "Employee Deletion"
  | "Leave Approval"
  | "Payroll Changes"
  | "All";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  actionType: ActionType;
  details: string;
  ipAddress: string;
}

const initialLogs: AuditLog[] = [
  { id: "log-001", timestamp: "Aug 20, 2026 - 10:45 AM", user: "Admin User", email: "admin@system.com", actionType: "Payroll Changes", details: "Updated base salary for employee ID EMP-8942", ipAddress: "192.168.1.42" },
  { id: "log-002", timestamp: "Aug 20, 2026 - 09:30 AM", user: "HR Manager", email: "hr@system.com", actionType: "Employee Creation", details: "Onboarded new software engineer: Sarah Jenkins", ipAddress: "192.168.1.105" },
  { id: "log-003", timestamp: "Aug 19, 2026 - 04:15 PM", user: "System Auto", email: "system@bot.com", actionType: "Attendance Activity", details: "Processed daily auto-checkout for 45 inactive users", ipAddress: "Localhost" },
  { id: "log-004", timestamp: "Aug 19, 2026 - 02:10 PM", user: "Admin User", email: "admin@system.com", actionType: "Leave Approval", details: "Approved 3 days sick leave for Michael Scott", ipAddress: "192.168.1.42" },
  { id: "log-005", timestamp: "Aug 18, 2026 - 11:20 AM", user: "HR Manager", email: "hr@system.com", actionType: "Employee Update", details: "Changed department for David Wallace to 'Management'", ipAddress: "192.168.1.105" },
  { id: "log-006", timestamp: "Aug 18, 2026 - 09:05 AM", user: "Admin User", email: "admin@system.com", actionType: "Login Activity", details: "Successful login via Web Portal", ipAddress: "103.112.54.12" },
  { id: "log-007", timestamp: "Aug 17, 2026 - 03:45 PM", user: "Admin User", email: "admin@system.com", actionType: "Employee Deletion", details: "Archived employee record for ID EMP-1023", ipAddress: "192.168.1.42" },
];

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ActionType>("All");

  const containerRef = useRef<HTMLDivElement>(null);

  // Initial Page Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }
      );

      gsap.fromTo(
        ".animate-row",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.05, delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [filterType, searchQuery]); // Re-animate slightly on filter change for smoothness

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || log.actionType === filterType;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case "Login Activity": return <Shield className="w-4 h-4 text-blue-500" />;
      case "Attendance Activity": return <Clock className="w-4 h-4 text-indigo-500" />;
      case "Employee Creation": return <UserPlus className="w-4 h-4 text-[#10b981]" />;
      case "Employee Update": return <UserCog className="w-4 h-4 text-amber-500" />;
      case "Employee Deletion": return <UserMinus className="w-4 h-4 text-rose-500" />;
      case "Leave Approval": return <CheckSquare className="w-4 h-4 text-teal-500" />;
      case "Payroll Changes": return <CircleDollarSign className="w-4 h-4 text-emerald-600" />;
      default: return <History className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getActionBadgeClass = (type: ActionType) => {
    switch (type) {
      case "Login Activity": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Attendance Activity": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Employee Creation": return "bg-emerald-50 text-[#10b981] border-emerald-100";
      case "Employee Update": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Employee Deletion": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Leave Approval": return "bg-teal-50 text-teal-600 border-teal-100";
      case "Payroll Changes": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-100";
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-header opacity-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Audit Logs</h1>
          <p className="text-sm text-neutral-500 mt-1">Track system activities, administrative changes, and user events</p>
        </div>

        <button className="flex items-center gap-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-header opacity-0">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by user or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] shadow-sm"
          />
        </div>

        <div className="relative w-full md:w-56">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActionType)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] shadow-sm appearance-none cursor-pointer"
          >
            <option value="All">All Activities</option>
            <option value="Login Activity">Login Activity</option>
            <option value="Attendance Activity">Attendance Activity</option>
            <option value="Employee Creation">Employee Creation</option>
            <option value="Employee Update">Employee Update</option>
            <option value="Employee Deletion">Employee Deletion</option>
            <option value="Leave Approval">Leave Approval</option>
            <option value="Payroll Changes">Payroll Changes</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden animate-header opacity-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp & User</th>
                <th className="py-4 px-6">Event Category</th>
                <th className="py-4 px-6">Activity Details</th>
                <th className="py-4 px-6 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="animate-row opacity-0 hover:bg-neutral-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-900">{log.user}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{log.timestamp}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getActionBadgeClass(log.actionType)}`}>
                        {getActionIcon(log.actionType)}
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-600 font-medium">
                      {log.details}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[11px] text-neutral-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-neutral-50 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                      <History className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">No logs found</h3>
                    <p className="text-xs text-neutral-500 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}