"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  ExternalLink,
  X,
  Loader2,
  Trash2
} from "lucide-react";

interface NotificationItem {
  id: string;
  senderName: string;
  senderRole: string;
  title: string;
  message: string;
  category: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  userId?: string;
  role?: string;
  organizationId?: string | null;
}

export default function NotificationDropdown({
  userId: propUserId,
  role: propRole,
  organizationId: propOrgId,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive active session context
  const getContext = () => {
    let resolvedUserId = propUserId || "user-super-1";
    let resolvedRole = propRole || "SUPER_ADMIN";
    let resolvedOrgId = propOrgId ?? null;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.id || parsed.userId) resolvedUserId = parsed.id || parsed.userId;
          if (parsed.role) resolvedRole = parsed.role;
          if (parsed.organizationId !== undefined) resolvedOrgId = parsed.organizationId;
        } catch {}
      }
    }

    return {
      userId: propUserId || resolvedUserId,
      role: propRole || resolvedRole,
      organizationId: propOrgId !== undefined ? propOrgId : resolvedOrgId,
    };
  };

  const fetchNotifications = async () => {
    try {
      const ctx = getContext();
      const params = new URLSearchParams();
      if (ctx.userId) params.append("userId", ctx.userId);
      if (ctx.role) params.append("role", ctx.role);
      if (ctx.organizationId) params.append("organizationId", ctx.organizationId);
      params.append("_t", Date.now().toString());

      const res = await fetch(`/api/notifications?${params.toString()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          "x-user-role": ctx.role,
          "x-user-id": ctx.userId,
        },
      });

      const json = await res.json();
      const data = json.data || json;
      if (json.success || data.notifications) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, [propUserId, propRole, propOrgId]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const ctx = getContext();
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, ...ctx }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryIcon = (category: string, type: string) => {
    switch (category) {
      case "REFERRAL":
      case "PAYROLL":
        return <DollarSign className="w-4 h-4 text-[#10b981]" />;
      case "LEAVE":
      case "ATTENDANCE":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "SECURITY":
      case "ALERT":
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Open notifications"
        className="relative p-2.5 rounded-2xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 bg-[#10b981] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white rounded-3xl border border-neutral-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-50 text-[#10b981] border border-emerald-200/80 text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#10b981] hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs space-y-2">
                <Bell className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="font-semibold text-neutral-700">No notifications right now</p>
                <p className="text-[11px] text-neutral-400">You are all caught up with platform broadcasts & updates.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.link)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    item.isRead ? "bg-white hover:bg-neutral-50/80" : "bg-emerald-50/35 hover:bg-emerald-50/70"
                  }`}
                >
                  <div className="p-2 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs shrink-0 mt-0.5">
                    {getCategoryIcon(item.category, item.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs truncate ${item.isRead ? "font-semibold text-neutral-800" : "font-bold text-neutral-900"}`}>
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-400">
                      <span className="font-mono">
                        {item.senderName || "System"} · {item.createdAt?.slice(11, 16) || "Today"}
                      </span>

                      {item.link && (
                        <span className="text-[10px] font-bold text-[#10b981] flex items-center gap-0.5">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-neutral-50/80 border-t border-neutral-100 text-center">
            <span className="text-[11px] font-semibold text-neutral-400">
              Live Scoped Enterprise Notifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
