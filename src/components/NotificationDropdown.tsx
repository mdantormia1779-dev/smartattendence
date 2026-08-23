"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  X
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
  userId = "user-super-1",
  role = "SUPER_ADMIN",
  organizationId = null,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (role) params.append("role", role);
      if (organizationId) params.append("organizationId", organizationId);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [userId, role, organizationId]);

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

  const handleMarkAsRead = async (id: string) => {
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, userId, role, organizationId }),
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
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case "LEAVE":
      case "ATTENDANCE":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "PAYROLL":
        return <DollarSign className="w-4 h-4 text-indigo-600" />;
      case "SECURITY":
      case "ALERT":
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-[#00B050] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white rounded-3xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#00B050]/15 text-[#00B050] text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#00B050] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    item.isRead ? "bg-white hover:bg-gray-50/70" : "bg-emerald-50/40 hover:bg-emerald-50/70"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-gray-100 shadow-xs shrink-0 mt-0.5">
                    {getCategoryIcon(item.category, item.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs truncate ${item.isRead ? "font-semibold text-gray-800" : "font-bold text-gray-900"}`}>
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#00B050] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.senderName} · {item.createdAt.slice(11, 16)}
                      </span>

                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-bold text-[#00B050] hover:underline flex items-center gap-0.5"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400">
              Live Scoped Enterprise Notifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
