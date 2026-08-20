"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Save, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User,
  Key,
  AlertCircle
} from "lucide-react";
import gsap from "gsap";

export default function SettingsPage() {
  // General & System States
  const [systemName, setSystemName] = useState("SaaS Enterprise Portal");
  const [supportEmail, setSupportEmail] = useState("support@saasportal.com");
  const [currency, setCurrency] = useState("USD ($)");
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Admin Profile & Credentials States
  const [adminName, setAdminName] = useState("Super Administrator");
  const [adminEmail, setAdminEmail] = useState("admin@system.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Save Feedback State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("System settings have been updated successfully.");

  const containerRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  // Initial Page Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }
      );

      gsap.fromTo(
        ".animate-card",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1, delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);

    if (toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
      );
    }

    setTimeout(() => {
      if (toastRef.current) {
        gsap.to(toastRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => setShowToast(false),
        });
      }
    }, 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
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

    // Success action
    triggerToast("Admin profile & system settings updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFA] p-8 text-neutral-800 overflow-x-hidden relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-header opacity-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">System Settings & Profile</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage admin credentials, core application preferences, and security policies</p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
        {/* Card 1: Admin Profile & Credentials */}
        <div className="animate-card opacity-0 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10b981] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Admin Credentials & Profile</h3>
              <p className="text-xs text-neutral-500">Update your administrator name, login email, and password</p>
            </div>
          </div>

          {passwordError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {passwordError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Admin Full Name</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Admin Login Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">New Password (Optional)</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: General Configuration */}
        <div className="animate-card opacity-0 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">General Configuration</h3>
              <p className="text-xs text-neutral-500">Basic identification and localization details for the portal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">System Name</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="BDT (৳)">BDT (৳) - Bangladeshi Taka</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
              >
                <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                <option value="Asia/Dhaka">Asia/Dhaka (+6:00)</option>
                <option value="America/New_York">America/New_York (-5:00)</option>
                <option value="Europe/London">Europe/London (+0:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Authentication */}
        <div className="animate-card opacity-0 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Security & Authentication</h3>
              <p className="text-xs text-neutral-500">Protect user accounts and manage strict access rules</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Enforce Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-neutral-500 mt-0.5">Require all admin and staff accounts to use OTP verifications</p>
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
        </div>

        {/* Card 4: System Maintenance */}
        <div className="animate-card opacity-0 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Maintenance Controls</h3>
              <p className="text-xs text-neutral-500">Handle platform availability and updates</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Maintenance Mode</h4>
              <p className="text-xs text-neutral-500 mt-0.5">Temporarily restrict client portal access while performing backend upgrades</p>
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

      {/* Success Toast Notification */}
      {showToast && (
        <div
          ref={toastRef}
          className="fixed bottom-8 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-neutral-800"
        >
          <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          <div className="text-xs font-medium">
            <div className="font-bold">Success!</div>
            <div className="text-neutral-400">{toastMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}