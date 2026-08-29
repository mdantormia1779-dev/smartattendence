"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Send,
  Loader2,
  ChevronRight,
  Sparkles,
  Layers,
  Inbox,
  CheckCheck,
  Archive,
  PhoneCall,
  ExternalLink,
  X
} from "lucide-react";
import { api } from "@/lib/api-client";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  category: "GENERAL" | "SALES" | "ENTERPRISE" | "SUPPORT" | "PARTNERSHIP" | "BILLING";
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";
  adminNotes?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Active Message Modal & Actions
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.adminContact.getAll({ limit: 100 });
      if (res.success && res.data) {
        const rawItems = res.data.items || (Array.isArray(res.data) ? res.data : []);
        setMessages(rawItems);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load contact inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Filtered list
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.subject.toLowerCase().includes(q) ||
        (msg.companyName && msg.companyName.toLowerCase().includes(q)) ||
        (msg.phone && msg.phone.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || msg.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || msg.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [messages, searchTerm, statusFilter, categoryFilter]);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setAdminNotesInput(msg.adminNotes || "");

    // If UNREAD, auto mark as READ in backend
    if (msg.status === "UNREAD") {
      try {
        await api.adminContact.updateStatus(msg.id, { status: "READ" });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "READ" } : m))
        );
        setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      } catch (err) {
        console.error("Auto mark read failed", err);
      }
    }
  };

  const handleUpdateStatus = async (newStatus: "UNREAD" | "READ" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED") => {
    if (!selectedMessage) return;
    try {
      setIsUpdatingStatus(true);
      const res = await api.adminContact.updateStatus(selectedMessage.id, {
        status: newStatus,
        adminNotes: adminNotesInput,
      });

      if (res.success) {
        const updatedMsg = { ...selectedMessage, status: newStatus, adminNotes: adminNotesInput };
        setSelectedMessage(updatedMsg);
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMessage.id ? updatedMsg : m))
        );
        setAlertBanner({ type: "success", text: `Inquiry status updated to ${newStatus}` });
        setTimeout(() => setAlertBanner(null), 3000);
        fetchMessages();
      }
    } catch (err: any) {
      setAlertBanner({ type: "error", text: err?.message || "Failed to update inquiry status" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await api.adminContact.delete(deleteTarget.id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        if (selectedMessage?.id === deleteTarget.id) setSelectedMessage(null);
        setDeleteTarget(null);
        setAlertBanner({ type: "success", text: "Inquiry permanently deleted." });
        setTimeout(() => setAlertBanner(null), 3000);
        fetchMessages();
      }
    } catch (err: any) {
      setAlertBanner({ type: "error", text: err?.message || "Failed to delete inquiry" });
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "SALES":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Sales & Pricing</span>;
      case "ENTERPRISE":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Enterprise</span>;
      case "SUPPORT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Tech Support</span>;
      case "PARTNERSHIP":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Affiliate / Partner</span>;
      case "BILLING":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Billing</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">General</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "UNREAD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            NEW / UNREAD
          </span>
        );
      case "READ":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">Read</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">In Progress</span>;
      case "RESOLVED":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      case "ARCHIVED":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 text-neutral-600">Archived</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn ${
            alertBanner.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {alertBanner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{alertBanner.text}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00B050] uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            Inbound Client Communications
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            Client Inquiries & Support Messages
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage incoming contact form submissions, enterprise demo requests, and customer inquiries.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00B050]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Total Received</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">{stats.total}</div>
          <div className="text-[11px] text-neutral-400">All submitted inquiries</div>
        </div>

        {/* Unread Messages */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase">Unread / Action Required</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.unread}</div>
          <div className="text-[11px] text-rose-500 font-medium">Pending initial review</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.inProgress}</div>
          <div className="text-[11px] text-amber-600/80">Follow-up ongoing</div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-600/80">Closed & handled</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by sender name, email, company, subject, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-neutral-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:border-[#00B050] cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="UNREAD">Unread Only</option>
            <option value="READ">Read</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:border-[#00B050] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="SALES">Sales & Pricing</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="SUPPORT">Technical Support</option>
            <option value="PARTNERSHIP">Partner / Affiliate</option>
            <option value="BILLING">Billing</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Messages Table / List */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">Loading inquiries...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800">No contact messages found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "ALL" || categoryFilter !== "ALL"
                ? "Try adjusting your search or filter options."
                : "No customer inquiries have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-100 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Sender & Contact</th>
                  <th className="py-4 px-6">Inquiry Category</th>
                  <th className="py-4 px-6">Subject & Preview</th>
                  <th className="py-4 px-6">Submitted</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredMessages.map((msg) => {
                  const isUnread = msg.status === "UNREAD";
                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`hover:bg-neutral-50/80 transition-colors cursor-pointer ${
                        isUnread ? "bg-emerald-50/30 font-semibold" : ""
                      }`}
                    >
                      {/* Sender Info */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                            <span>{msg.name}</span>
                            {msg.companyName && (
                              <span className="text-[11px] font-normal text-neutral-500">
                                ({msg.companyName})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              {msg.email}
                            </span>
                            {msg.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-neutral-400" />
                                {msg.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        {getCategoryBadge(msg.category)}
                      </td>

                      {/* Subject & Preview */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-neutral-900 truncate">{msg.subject}</div>
                          <div className="text-[11px] text-neutral-500 truncate">{msg.message}</div>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-6 text-neutral-500 text-[11px] whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <div className="text-[10px] text-neutral-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(msg.status)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenMessage(msg)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                            title="View Message"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#00B050] transition-colors"
                            title="Direct Email Reply"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setDeleteTarget(msg)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 bg-neutral-50/80 border-b border-neutral-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(selectedMessage.category)}
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <h3 className="text-lg font-extrabold text-neutral-900 leading-snug">
                  {selectedMessage.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Sender Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Sender Name</span>
                  <div className="font-bold text-neutral-900 mt-0.5">{selectedMessage.name}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Email Address</span>
                  <div className="font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                    <span>{selectedMessage.email}</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-[#00B050] hover:underline">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Phone / WhatsApp</span>
                  <div className="font-bold text-neutral-900 mt-0.5">
                    {selectedMessage.phone ? (
                      <a href={`tel:${selectedMessage.phone}`} className="text-neutral-900 hover:text-[#00B050]">
                        {selectedMessage.phone}
                      </a>
                    ) : (
                      <span className="text-neutral-400">Not provided</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Organization</span>
                  <div className="font-bold text-neutral-900 mt-0.5">
                    {selectedMessage.companyName || <span className="text-neutral-400">Not provided</span>}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-neutral-500">Inquiry Message</span>
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-neutral-500">Super Admin Internal Notes</span>
                <textarea
                  rows={3}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Add internal notes on follow-up, assignee, or client requirements..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-neutral-50/50"
                />
              </div>

              {/* Change Status Fast Actions */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-neutral-500">Update Inquiry Status</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("ARCHIVED")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <button
                onClick={() => setDeleteTarget(selectedMessage)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Delete
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="px-4 py-2 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-neutral-900">Delete Inquiry</h3>
              <p className="text-xs text-neutral-500">
                Are you sure you want to delete inquiry from <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
