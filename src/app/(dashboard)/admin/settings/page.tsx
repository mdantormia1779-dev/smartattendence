"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save, 
  Shield,
  Globe, 
  Database, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User,
  Key,
  AlertCircle,
  RefreshCw,
  Loader2,
  Bell
} from "lucide-react";
import gsap from "gsap";

export default function SettingsPage() {
  // General & System States
  const [systemName, setSystemName] = useState("Smart Attendance ERP Platform");
  const [supportEmail, setSupportEmail] = useState("support@smartattendance.io");
  const [currency, setCurrency] = useState("BDT (৳)");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Admin Profile & Credentials States
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI & Loading States
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("System settings have been updated successfully.");

  const containerRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  // Fetch real settings from database
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/settings?_t=${Date.now()}`, {
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

      if (json.success || data.admin) {
        if (data.admin) {
          setAdminName(data.admin.name || "Super Administrator");
          setAdminEmail(data.admin.email || "superadmin@erp.com");
        }
        if (data.config) {
          setSystemName(data.config.systemName || "Smart Attendance ERP Platform");
          setSupportEmail(data.config.supportEmail || "support@smartattendance.io");
          setCurrency(data.config.defaultCurrency || "BDT (৳)");
          setTimezone(data.config.timezone || "Asia/Dhaka");
          setEnforce2FA(data.config.enforce2FA !== undefined ? data.config.enforce2FA : true);
          setMaintenanceMode(data.config.maintenanceMode !== undefined ? data.config.maintenanceMode : false);
          setEmailAlerts(data.config.emailAlerts !== undefined ? data.config.emailAlerts : true);
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Initial Page Animations
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".animate-header",
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );

        gsap.fromTo(
          ".animate-card",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08, delay: 0.1 }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);

    if (toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" }
      );
    }

    setTimeout(() => {
      if (toastRef.current) {
        gsap.to(toastRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.25,
          onComplete: () => setShowToast(false),
        });
      }
    }, 3500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate password change if user typed a new password
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError("New passwords do not match!");
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters long.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": "SUPER_ADMIN",
          Authorization: "Bearer super-admin-token",
        },
        body: JSON.stringify({
          adminName,
          adminEmail,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
          systemName,
          supportEmail,
          currency,
          timezone,
          enforce2FA,
          maintenanceMode,
          emailAlerts,
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Broadcast profile update to Header
        if (typeof window !== "undefined") {
          const updatedUser = {
            id: json.data?.admin?.id || "user-super-1",
            name: json.data?.admin?.name || adminName,
            fullName: json.data?.admin?.name || adminName,
            email: json.data?.admin?.email || adminEmail,
            role: "SUPER_ADMIN",
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          window.dispatchEvent(new CustomEvent("admin-profile-updated", { detail: updatedUser }));
          window.dispatchEvent(new CustomEvent("user-profile-updated", { detail: updatedUser }));
        }

        triggerToast("Admin profile & system configuration updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await fetchSettings();
      } else {
        setPasswordError(json.error || json.message || "Failed to update settings");
      }
    } catch (err: any) {
      console.error(err);
      setPasswordError(err?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-6 md:p-10 text-neutral-800 overflow-x-hidden relative space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs animate-header opacity-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">System Settings & Admin Profile</h1>
          <p className="text-xs text-neutral-500 mt-1">Manage database-backed admin credentials, core platform preferences, and security policies</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSettings}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
            title="Reload settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#10b981]" : ""}`} />
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#10b981] mr-2" />
          <span className="text-xs">Loading database configurations...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
          {/* Card 1: Admin Profile & Credentials */}
          <div className="animate-card opacity-0 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10b981] flex items-center justify-center font-bold border border-emerald-200/80">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Admin Credentials & Profile</h3>
                <p className="text-xs text-neutral-500">Update your administrator name, login email, and secure password</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" /> {passwordError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Admin Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Admin Login Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  New Password (Optional)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: General Platform Configuration */}
          <div className="animate-card opacity-0 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200/80">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">General Platform Configuration</h3>
                <p className="text-xs text-neutral-500">Core enterprise branding, currency, and localization details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  System Name
                </label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Support Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Default Platform Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                >
                  <option value="BDT (৳)">BDT (৳) - Bangladeshi Taka</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Default Server Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (+6:00 BST)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (-5:00 EST)</option>
                  <option value="Europe/London">Europe/London (+0:00 GMT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Security & 2FA */}
          <div className="animate-card opacity-0 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-200/80">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Security & Multi-Factor Authentication</h3>
                <p className="text-xs text-neutral-500">Protect administrator accounts and enforce compliance policies</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200/60">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Enforce Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Require all organization admins and managers to verify identity on login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforce2FA}
                  onChange={(e) => setEnforce2FA(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
              </label>
            </div>
          </div>

          {/* Card 4: System Maintenance */}
          <div className="animate-card opacity-0 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200/80">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Platform Maintenance Controls</h3>
                <p className="text-xs text-neutral-500">Handle platform availability and scheduled downtime</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200/60">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Maintenance Mode</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Temporarily show maintenance banner across tenant portals during database upgrades</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div
          ref={toastRef}
          className="fixed bottom-8 right-8 z-50 bg-neutral-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-neutral-800"
        >
          <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">Settings Saved!</div>
            <div className="text-neutral-400">{toastMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}