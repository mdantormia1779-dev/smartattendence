"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  Layers, 
  Loader2,
  ExternalLink,
  Lock
} from "lucide-react";

interface VerificationData {
  verified: boolean;
  verifiedAt: string;
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  branch: string;
  branchAddress: string;
  gender: string;
  bloodGroup: string;
  status: string;
  employmentType: string;
  joiningDate: string | null;
  profilePicture?: string | null;
  organization: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export default function EmployeeVerificationPage() {
  const params = useParams();
  const employeeId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/verify/employee/${encodeURIComponent(employeeId)}`);
        const json = await res.json();

        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error || "Employee verification failed. Invalid or expired QR code.");
        }
      } catch (err: any) {
        console.error("Verification fetch error:", err);
        setError("Network error occurred while verifying employee identity.");
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [employeeId]);

  const getInitials = (name: string) => {
    if (!name) return "EM";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-stone-800">
      
      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-stone-200/80 rounded-full shadow-2xs text-xs font-bold text-emerald-800 uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Smart Attendance Verification Portal
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200/80 overflow-hidden">
        
        {loading ? (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-stone-600">Verifying digital employee credentials...</p>
            <p className="text-[11px] text-stone-400">Connecting to secure organization cloud</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Verification Failed</h2>
              <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
              <p className="text-[11px] text-stone-400 mt-2">
                This QR code may be incorrect, expired, or the employee record is no longer active.
              </p>
            </div>
          </div>
        ) : data ? (
          <div>
            
            {/* Top Verification Status Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white p-6 text-center relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-15">
                <ShieldCheck className="w-28 h-28 -mr-6 -mt-6" />
              </div>

              <div className="relative z-10 flex flex-col items-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/30 backdrop-blur-xs border border-emerald-300/40 rounded-full text-[11px] font-extrabold tracking-wider uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> Officially Verified Staff
                </div>
                <h1 className="text-lg font-black tracking-tight">{data.organization.name}</h1>
                <p className="text-[10px] text-emerald-100 font-mono">
                  Verified at: {new Date(data.verifiedAt).toLocaleTimeString()} • {new Date(data.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Profile Section */}
            <div className="p-6 space-y-6">
              
              <div className="flex items-center gap-4">
                <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-emerald-600/30 bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-xl shadow-xs shrink-0">
                  {data.profilePicture ? (
                    <img src={data.profilePicture} alt={data.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(data.fullName)}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-extrabold text-stone-900 leading-tight truncate">
                    {data.fullName}
                  </h2>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{data.designation}</p>
                  <p className="text-[11px] text-stone-500 truncate">{data.department}</p>
                  <div className="inline-block mt-1 px-2.5 py-0.5 bg-stone-100 border border-stone-200 rounded-md font-mono text-[11px] font-bold text-stone-800">
                    {data.employeeCode}
                  </div>
                </div>
              </div>

              {/* Status and Details Grid */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3 text-xs">
                
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <span className="text-stone-400 font-medium">Record Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {data.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-medium">Branch Location</span>
                  <span className="font-bold text-stone-800 text-right truncate max-w-[200px]">{data.branch}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-medium">Employment Type</span>
                  <span className="font-bold text-stone-800">{data.employmentType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-medium">Blood Group</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-mono">{data.bloodGroup}</span>
                </div>

                {data.joiningDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-medium">Joining Date</span>
                    <span className="font-bold text-stone-800">{data.joiningDate}</span>
                  </div>
                )}

                {data.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-medium">Official Contact</span>
                    <span className="font-bold text-stone-800">{data.phone}</span>
                  </div>
                )}
              </div>

              {/* Security Attestation */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-emerald-900 leading-relaxed font-medium">
                  This identity is authenticated by the Smart Attendance Human Resources System. All records are actively encrypted and verified in real-time.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 text-center text-[10px] text-stone-400">
              © {new Date().getFullYear()} {data.organization.name} • Official Personnel Directory
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
}
