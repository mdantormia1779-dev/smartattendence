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
  Loader2, 
  RefreshCw,
  Building2,
  Lock,
  KeyRound
} from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api-client";

type ActionType = 
  | "All"
  | "Auth & Login"
  | "Attendance Activity"
  | "Employee Management"
  | "Leave Approval"
  | "Payroll Changes"
  | "Security & Policy";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  actionType: ActionType;
  details: string;
  ipAddress: string;
  organizationName?: string | null;
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
      const res = await fetch(`/api/audit-logs?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          "x-user-role": "SUPER_ADMIN",
          Authorization: "Bearer super-admin-token",
        },
      });
      const json = await res.json();
      const data = json.data || json;

      if (json.success || Array.isArray(data)) {
        const rawLogs = Array.isArray(data) ? data : (data.data || []);
        const mapped: AuditLog[] = rawLogs.map((l: any) => {
          let actType: ActionType = "Auth & Login";
          const act = (l.action || "").toUpperCase();
          const mod = (l.module || l.entityType || "").toUpperCase();

          if (act.includes("LOGIN") || act.includes("AUTH") || mod.includes("AUTH")) actType = "Auth & Login";
          else if (act.includes("ATTENDANCE") || mod.includes("ATTENDANCE") || act.includes("CHECKIN") || act.includes("CHECKOUT")) actType = "Attendance Activity";
          else if (act.includes("EMPLOYEE") || mod.includes("EMPLOYEE") || act.includes("USER")) actType = "Employee Management";
          else if (act.includes("LEAVE") || mod.includes("LEAVE")) actType = "Leave Approval";
          else if (act.includes("PAYROLL") || mod.includes("PAYROLL") || act.includes("SALARY")) actType = "Payroll Changes";
          else if (act.includes("SUSPEND") || act.includes("POLICY") || act.includes("SECURITY") || mod.includes("SECURITY")) actType = "Security & Policy";

          return {
            id: l.id,
            timestamp: l.createdAt ? l.createdAt.slice(0, 16) : "Recently",
            user: l.userName || l.actorEmail?.split("@")[0] || "System Actor",
            email: l.userEmail || l.actorEmail || "system@platform.io",
            actionType: actType,
            details: l.details || `${l.action} performed on ${l.module || "System"}`,
            ipAddress: l.ipAddress || "127.0.0.1",
            organizationName: l.organizationName || null,
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
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 }
        );

        gsap.fromTo(
          ".animate-row",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading, filterType, searchQuery]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.organizationName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || log.actionType === filterType;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case "Auth & Login": return <KeyRound className="w-3.5 h-3.5 text-blue-500" />;
      case "Attendance Activity": return <Clock className="w-3.5 h-3.5 text-indigo-500" />;
      case "Employee Management": return <UserPlus className="w-3.5 h-3.5 text-[#10b981]" />;
      case "Leave Approval": return <CheckSquare className="w-3.5 h-3.5 text-teal-500" />;
      case "Payroll Changes": return <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case "Security & Policy": return <Shield className="w-3.5 h-3.5 text-rose-500" />;
      default: return <History className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  const getActionBadgeClass = (type: ActionType) => {
    switch (type) {
      case "Auth & Login": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Attendance Activity": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Employee Management": return "bg-emerald-50 text-[#10b981] border-emerald-200";
      case "Leave Approval": return "bg-teal-50 text-teal-700 border-teal-200";
      case "Payroll Changes": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Security & Policy": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,User,Email,Organization,Action,Details,IP Address\n";
    const rows = filteredLogs.map(l => `"${l.timestamp}","${l.user}","${l.email}","${l.organizationName || 'Global'}","${l.actionType}","${l.details}","${l.ipAddress}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-6 md:p-10 space-y-6 text-neutral-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs animate-header opacity-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#10b981]" />
            Security & Compliance Audit Trail
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track user access, payroll locks, attendance regularizations, tenant modifications, and privileged events
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
            title="Refresh audit logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#10b981]" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export CSV ({filteredLogs.length})
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Category Filters */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center animate-header opacity-0">
        <div className="relative w-full md:w-84">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by actor, email, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1 hidden md:block shrink-0" />
          {[
            "All",
            "Auth & Login",
            "Attendance Activity",
            "Employee Management",
            "Leave Approval",
            "Payroll Changes",
            "Security & Policy",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as ActionType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === type
                  ? "bg-[#10b981] text-white shadow-xs"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#10b981] mr-2" />
            <span className="text-xs">Loading tamper-evident audit logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Actor / User</th>
                  <th className="py-4 px-6">Event Type</th>
                  <th className="py-4 px-6">Audit Description</th>
                  <th className="py-4 px-6">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-neutral-400 text-xs space-y-2">
                      <Shield className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="font-semibold text-neutral-700">No security audit events recorded yet</p>
                      <p className="text-[11px] text-neutral-400">Privileged actions like employee creation, payroll locking, and login events will be logged here automatically.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/60 transition-colors animate-row">
                      <td className="py-4 px-6 text-neutral-500 font-mono text-xs whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-neutral-900 text-xs">{log.user}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{log.email}</div>
                        {log.organizationName && (
                          <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Building2 className="w-2.5 h-2.5 text-neutral-400" /> {log.organizationName}
                          </span>
                        )}
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