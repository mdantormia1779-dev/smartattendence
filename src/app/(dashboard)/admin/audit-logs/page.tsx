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
  History,
  Loader2
} from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api-client";

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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ActionType>("All");

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.auditLogs.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: AuditLog[] = res.data.map((l: any) => {
          let actType: ActionType = "Login Activity";
          if (l.action?.includes("EMPLOYEE_CREATE")) actType = "Employee Creation";
          else if (l.action?.includes("EMPLOYEE_UPDATE")) actType = "Employee Update";
          else if (l.action?.includes("EMPLOYEE_DELETE")) actType = "Employee Deletion";
          else if (l.action?.includes("LEAVE")) actType = "Leave Approval";
          else if (l.action?.includes("PAYROLL")) actType = "Payroll Changes";
          else if (l.action?.includes("ATTENDANCE")) actType = "Attendance Activity";

          return {
            id: l.id,
            timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Recently",
            user: l.user?.fullName || l.userName || "System User",
            email: l.user?.email || l.userEmail || "user@system.com",
            actionType: actType,
            details: l.details || l.description || `${l.action} performed on ${l.resource || "resource"}`,
            ipAddress: l.ipAddress || "127.0.0.1",
          };
        });
        setLogs(mapped);
      }
    } catch (e) {
      console.error("Failed to load audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading, filterType, searchQuery]);

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
      default: return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,User,Email,Action,Details,IP Address\n";
    const rows = filteredLogs.map(l => `"${l.timestamp}","${l.user}","${l.email}","${l.actionType}","${l.details}","${l.ipAddress}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `security_audit_logs.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="animate-header opacity-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Security Audit Logs</h1>
          <p className="text-sm text-neutral-500 mt-1">Track compliance, user modifications, privileged access, and system events</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200/80 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all animate-header opacity-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-neutral-500" />
          Export Audit Trail
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center animate-header opacity-0">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by user or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50/60 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1 hidden md:block" />
          {[
            "All",
            "Login Activity",
            "Attendance Activity",
            "Employee Creation",
            "Leave Approval",
            "Payroll Changes",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as ActionType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === type
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden animate-header opacity-0">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mr-2" />
            <span className="text-xs">Loading immutable audit logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Actor</th>
                  <th className="py-3.5 px-6">Event Type</th>
                  <th className="py-3.5 px-6">Audit Description</th>
                  <th className="py-3.5 px-6">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                      No security audit events recorded.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/60 transition-colors animate-row opacity-0">
                      <td className="py-4 px-6 text-neutral-500 font-mono text-xs whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-neutral-900 text-xs">{log.user}</div>
                        <div className="text-[11px] text-neutral-400">{log.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getActionBadgeClass(log.actionType)}`}>
                          {getActionIcon(log.actionType)}
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-neutral-700 text-xs font-medium max-w-md">
                        {log.details}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-neutral-400">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}