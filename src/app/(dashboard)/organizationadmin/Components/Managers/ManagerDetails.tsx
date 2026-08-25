"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Printer, 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  Layers, 
  Phone, 
  Mail, 
  Users, 
  AlertTriangle,
  Award,
  ExternalLink,
  Lock,
  Calendar
} from "lucide-react";
import { Manager } from "@/types/manager";

interface ManagerDetailsProps {
  manager: Manager & { teamCount?: number };
  onBack: () => void;
  onEdit: (manager: Manager) => void;
  onDelete: (id: string, name: string) => void;
}

export default function ManagerDetails({
  manager,
  onBack,
  onEdit,
  onDelete
}: ManagerDetailsProps) {
  const [activeTab, setActiveTab] = useState<"Overview" | "ID Card">("ID Card");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "MG";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const managerCode = manager.managerId || `MGR-${manager.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}`;

  const handlePrintIdCard = () => {
    const printWindow = window.open("", "_blank", "width=900,height=950");
    if (!printWindow) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "https://smartattendance.io";
    const verifyUrl = `${origin}/verify/manager/${encodeURIComponent(manager.id)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}&color=065f46`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Manager Leadership ID Card - ${manager.name} (${managerCode})</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f5f5f4;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .no-print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1c1917;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    .btn-print {
      background: #059669;
      color: white;
      border: none;
      padding: 8px 20px;
      font-weight: 700;
      font-size: 13px;
      border-radius: 8px;
      cursor: pointer;
    }
    .sheet-title {
      font-size: 14px;
      font-weight: 700;
      color: #78716c;
      margin-top: 40px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cards-container {
      display: flex;
      gap: 30px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .id-card {
      width: 260px;
      height: 420px;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      border: 1px solid #e7e5e4;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    /* Front Card Styling */
    .card-header-front {
      background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
      color: white;
      padding: 16px 12px 20px;
      text-align: center;
      position: relative;
    }
    .lanyard-hole {
      width: 32px;
      height: 6px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      margin: 0 auto 10px;
    }
    .org-brand {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .org-sub {
      font-size: 8.5px;
      opacity: 0.9;
      margin-top: 1px;
      color: #a7f3d0;
      font-weight: 700;
    }
    .avatar-wrapper {
      margin-top: -24px;
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 2;
    }
    .avatar-img {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      object-fit: cover;
      background: #ecfdf5;
    }
    .avatar-placeholder {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      background: #ecfdf5;
      color: #065f46;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
    }
    .emp-info {
      text-align: center;
      padding: 6px 14px;
    }
    .emp-name {
      font-size: 15px;
      font-weight: 800;
      color: #1c1917;
      margin: 0;
    }
    .emp-designation {
      font-size: 11px;
      font-weight: 700;
      color: #047857;
      margin: 2px 0 0;
    }
    .emp-department {
      font-size: 9px;
      color: #78716c;
      margin: 1px 0 6px;
    }
    .badge-code {
      display: inline-block;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 3px 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 11px;
      font-weight: 800;
      color: #065f46;
    }
    .emp-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      padding: 8px 14px;
      background: #fafaf9;
      margin: 0 12px;
      border-radius: 8px;
      font-size: 9px;
      border: 1px solid #f5f5f4;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-lbl { color: #a8a29e; font-size: 7.5px; text-transform: uppercase; font-weight: 600; }
    .meta-val { color: #292524; font-weight: 700; }
    .card-footer-front {
      background: #064e3b;
      height: 12px;
      width: 100%;
    }

    /* Back Card Styling */
    .card-header-back {
      background: #1c1917;
      color: white;
      padding: 12px;
      text-align: center;
    }
    .card-body-back {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
      justify-content: space-between;
    }
    .qr-box {
      background: #ffffff;
      padding: 6px;
      border-radius: 10px;
      border: 1px solid #e7e5e4;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .qr-img { width: 90px; height: 90px; display: block; }
    .emergency-box {
      font-size: 8.5px;
      color: #57534e;
      line-height: 1.4;
      margin: 6px 0;
    }
    .barcode-lines {
      font-family: monospace;
      letter-spacing: 3px;
      font-size: 14px;
      color: #292524;
      font-weight: 800;
      margin-top: 4px;
    }
    .terms-text {
      font-size: 7px;
      color: #a8a29e;
      line-height: 1.3;
      border-top: 1px dashed #e7e5e4;
      padding-top: 6px;
      margin-top: 4px;
    }

    @media print {
      .no-print-bar { display: none; }
      body { background: white; padding: 0; }
      .sheet-title { margin-top: 0; }
    }
  </style>
</head>
<body style="padding-top: 50px;">
  <div class="no-print-bar">
    <div><strong>Executive Manager ID Card</strong> — ${manager.name} (${managerCode})</div>
    <button class="btn-print" onclick="window.print()">🖨️ Print ID Card (Front & Back)</button>
  </div>

  <div class="sheet-title">Executive Management Identification Badge</div>

  <div class="cards-container">
    
    <!-- FRONT SIDE -->
    <div class="id-card">
      <div>
        <div class="card-header-front">
          <div class="lanyard-hole"></div>
          <div class="org-brand">SMART ATTENDANCE</div>
          <div class="org-sub">EXECUTIVE LEADERSHIP BADGE</div>
        </div>

        <div class="avatar-wrapper">
          ${manager.profilePic ? (
            `<img src="${manager.profilePic}" class="avatar-img" alt="Photo" />`
          ) : (
            `<div class="avatar-placeholder">${getInitials(manager.name)}</div>`
          )}
        </div>

        <div class="emp-info">
          <h2 class="emp-name">${manager.name}</h2>
          <div class="emp-designation">${manager.designation || "Lead Manager"}</div>
          <div class="emp-department">${manager.department}</div>
          <div class="badge-code">${managerCode}</div>
        </div>

        <div class="emp-meta-grid">
          <div class="meta-item"><span class="meta-lbl">Role</span><span class="meta-val" style="color:#047857;">Supervisor</span></div>
          <div class="meta-item"><span class="meta-lbl">Branch</span><span class="meta-val truncate">${manager.assignedBranch || "HQ"}</span></div>
          <div class="meta-item"><span class="meta-lbl">Team Size</span><span class="meta-val">${manager.teamCount || 0} Members</span></div>
          <div class="meta-item"><span class="meta-lbl">Status</span><span class="meta-val" style="color:#059669;">${manager.status}</span></div>
        </div>
      </div>

      <div class="card-footer-front"></div>
    </div>

    <!-- BACK SIDE -->
    <div class="id-card">
      <div class="card-header-back">
        <div class="lanyard-hole" style="background: rgba(255,255,255,0.2);"></div>
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color:#34d399;">LEADERSHIP VERIFICATION</div>
      </div>

      <div class="card-body-back">
        <div class="qr-box">
          <img src="${qrUrl}" class="qr-img" alt="QR Code" />
        </div>
        <div style="font-size:8px; font-weight:700; color:#047857; text-transform:uppercase;">Scan to Verify Leadership</div>

        <div class="emergency-box">
          <div><strong>Official Phone:</strong> ${manager.phone || "+880 1800-000000"}</div>
          <div><strong>Official Email:</strong> ${manager.email}</div>
          <div><strong>Assigned Branch:</strong> ${manager.assignedBranch}</div>
        </div>

        <div>
          <div class="barcode-lines">||| | || |||| | ||| ||</div>
          <div style="font-size: 8px; font-family: monospace; color:#78716c;">${managerCode}</div>
        </div>

        <div class="terms-text">
          Authorized for managerial approvals, attendance regularization, and personnel supervision. If found, please return to HQ HR.
        </div>
      </div>

      <div style="background: #1c1917; height: 10px; width: 100%;"></div>
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="bg-[#FAF7F0] min-h-screen text-stone-800 font-sans p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation / Back & Actions */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-emerald-600 transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Managers Directory
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={handlePrintIdCard}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> Print Manager ID Card
            </button>
            <button 
              onClick={() => onEdit(manager)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> Edit Profile
            </button>
            <button 
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden border-2 border-emerald-500/30 bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-2xl shadow-inner shrink-0">
                {manager.profilePic ? (
                  <img src={manager.profilePic} alt={manager.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(manager.name)}</span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-stone-900 leading-tight">
                    {manager.name}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    manager.status === "Active" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}>
                    {manager.status}
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> {manager.designation || "Lead Manager"} <span className="text-stone-300">•</span> <span className="text-stone-600">{manager.department}</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap pt-1 font-mono">
                  <span>ID: <strong className="text-stone-800">{managerCode}</strong></span>
                  <span>•</span>
                  <span>Branch: <strong className="text-stone-800">{manager.assignedBranch}</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 text-right w-full md:w-auto">
              <span className="text-[11px] text-stone-400 font-medium">Direct Team Workforce</span>
              <p className="text-sm font-bold text-stone-800 flex items-center justify-end gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-emerald-600" />
                {manager.teamCount || 0} Team Members
              </p>
              <p className="text-[10px] text-stone-400 mt-1">Authorized Department Lead</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 mt-8 -mb-2 overflow-x-auto">
            {(["ID Card", "Overview"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === tab 
                    ? "border-emerald-600 text-emerald-700" 
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                {tab === "ID Card" ? "Leadership Digital ID Card 🪪" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Contact Info */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Manager Contact Info
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-stone-400">Official Email</span><span className="font-semibold text-stone-800 truncate max-w-[200px]">{manager.email}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Official Phone</span><span className="font-semibold text-stone-800">{manager.phone || "+880 1800-000000"}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Account Status</span><span className="font-semibold text-emerald-600">{manager.status}</span></div>
              </div>
            </div>

            {/* 2. Assignment Info */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> Operational Assignment
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-stone-400">Assigned Branch</span><span className="font-semibold text-stone-800">{manager.assignedBranch}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Assigned Department</span><span className="font-semibold text-stone-800">{manager.department}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Supervised Team</span><span className="font-semibold text-stone-800">{manager.teamCount || 0} Members</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Digital ID Card Tab */}
        {activeTab === "ID Card" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Manager Executive ID Badge
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Dual-sided executive identity badge with scannable leadership QR code.
                </p>
              </div>
              <button
                onClick={handlePrintIdCard}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <Printer className="w-4 h-4" /> Print Manager ID Card (Front & Back)
              </button>
            </div>

            {/* ID Card Display Grid (Side by Side) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
              
              {/* 1. FRONT SIDE BADGE */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-3 py-0.5 rounded-full">Front Side</span>
                <div className="w-[270px] h-[430px] bg-white rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200">
                  
                  <div>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-700 text-white px-3 py-4 text-center relative">
                      <div className="w-8 h-1.5 bg-white/30 rounded-full mx-auto mb-2"></div>
                      <h3 className="font-black text-xs tracking-wider uppercase">Smart Attendance</h3>
                      <p className="text-[8.5px] text-emerald-200 tracking-wide font-bold">EXECUTIVE LEADERSHIP BADGE</p>
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center -mt-6 relative z-10">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-emerald-50 overflow-hidden flex items-center justify-center text-emerald-700 font-extrabold text-2xl">
                        {manager.profilePic ? (
                          <img src={manager.profilePic} alt={manager.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(manager.name)}</span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center px-4 pt-2 space-y-1">
                      <h2 className="font-extrabold text-sm text-stone-900 leading-tight">{manager.name}</h2>
                      <p className="text-xs font-bold text-emerald-700">{manager.designation || "Lead Manager"}</p>
                      <p className="text-[10px] text-stone-400">{manager.department}</p>
                      <div className="inline-block mt-1 px-3 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md font-mono text-xs font-bold text-emerald-800">
                        {managerCode}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 mx-4 mt-3 p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-[10px]">
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Role</span>
                        <span className="font-bold text-emerald-800">Supervisor</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Team Size</span>
                        <span className="font-bold text-stone-800">{manager.teamCount || 0} Members</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Branch</span>
                        <span className="font-bold text-stone-800 truncate">{manager.assignedBranch || "HQ"}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Status</span>
                        <span className="font-bold text-emerald-600">{manager.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-3 bg-emerald-900 w-full"></div>
                </div>
              </div>

              {/* 2. BACK SIDE BADGE */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-3 py-0.5 rounded-full">Back Side</span>
                <div className="w-[270px] h-[430px] bg-white rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200">
                  
                  {/* Header */}
                  <div className="bg-stone-900 text-white px-3 py-3 text-center">
                    <div className="w-8 h-1.5 bg-white/20 rounded-full mx-auto mb-1.5"></div>
                    <span className="text-[9px] font-extrabold tracking-wider uppercase text-emerald-400">Leadership Security & Attestation</span>
                  </div>

                  {/* Body with QR */}
                  <div className="p-4 flex flex-col items-center text-center space-y-3 flex-1 justify-between">
                    <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          (typeof window !== "undefined" ? window.location.origin : "https://smartattendance.io") + 
                          `/verify/manager/${encodeURIComponent(manager.id)}`
                        )}&color=065f46`} 
                        alt="QR Code" 
                        className="w-24 h-24"
                      />
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Scan to Verify Leadership
                      </span>
                      <a
                        href={`/verify/manager/${encodeURIComponent(manager.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[8px] text-emerald-600 hover:text-emerald-800 hover:underline font-semibold mt-0.5 inline-flex items-center gap-0.5"
                      >
                        Preview Verification Page <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="space-y-1 text-[9px] text-stone-600 leading-tight">
                      <p><strong>Official Phone:</strong> {manager.phone || "+880 1800-000000"}</p>
                      <p className="truncate max-w-[220px]"><strong>Email:</strong> {manager.email}</p>
                      <p className="truncate max-w-[220px]"><strong>Branch:</strong> {manager.assignedBranch}</p>
                    </div>

                    <div className="w-full pt-1">
                      <div className="font-mono font-bold tracking-widest text-xs text-stone-800">||| | || |||| | ||| ||</div>
                      <div className="text-[8px] font-mono text-stone-400">{managerCode}</div>
                    </div>

                    <p className="text-[7.5px] text-stone-400 leading-tight border-t border-stone-100 pt-2">
                      Authorized for executive approvals and team operations.
                    </p>
                  </div>

                  <div className="h-2.5 bg-stone-900 w-full"></div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-stone-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Remove Manager</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Are you sure you want to remove <strong className="text-stone-800">"{manager.name}"</strong>? Their supervised team members will become unassigned.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setIsDeleteOpen(false)} 
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDelete(manager.id, manager.name);
                  setIsDeleteOpen(false);
                }} 
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors cursor-pointer active:scale-95"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
