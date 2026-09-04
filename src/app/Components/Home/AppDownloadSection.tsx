'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  ScanFace, 
  WifiOff, 
  Bell, 
  Copy, 
  Check, 
  Layers, 
  Zap,
  ArrowDownToLine,
  SmartphoneNfc
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AppDownloadSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo(
        '.download-header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      // Card / Content Animation
      gsap.fromTo(
        '.download-content-box',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.download-content-box',
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/smartattendence.apk`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const steps = [
    {
      step: '01',
      title: 'Download APK',
      desc: 'Click Download or scan the QR code to save smartattendence.apk on your Android device.',
    },
    {
      step: '02',
      title: 'Allow & Install',
      desc: 'Open the downloaded file and select "Install" (Allow "Install from Unknown Sources" if prompted).',
    },
    {
      step: '03',
      title: 'Login & Check In',
      desc: 'Open the app, enter your Organization & credentials, and verify attendance via Face & GPS.',
    },
  ];

  const appFeatures = [
    {
      icon: <ScanFace className="w-5 h-5 text-[#00B050]" />,
      title: 'AI Face Attendance',
      desc: 'Sub-second real-time face scan with anti-spoofing detection.',
    },
    {
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      title: 'GPS Geo-Fence Protection',
      desc: 'Ensures employee attendance is marked only within authorized office radius.',
    },
    {
      icon: <WifiOff className="w-5 h-5 text-amber-500" />,
      title: 'Offline Sync Mode',
      desc: 'Records punches seamlessly offline and auto-syncs when online.',
    },
    {
      icon: <Bell className="w-5 h-5 text-blue-500" />,
      title: 'Instant Leave & Shift Alerts',
      desc: 'Submit leave applications, view shift schedules, and check payslips on the go.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="download-app"
      className="relative w-full py-24 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-[#FBF9F5] via-white to-[#F0FDF4] overflow-hidden"
    >
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="download-header text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs md:text-sm font-semibold shadow-xs">
            <Smartphone className="w-4 h-4 text-[#00B050]" />
            <span>Mobile Experience · Android APK</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Take Smart Attendance Anywhere <br className="hidden sm:inline" />
            <span className="text-[#00B050]">Download Android App</span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            Empower your team with face recognition, real-time GPS branch verification, 
            shift tracking, and instant notifications directly from their mobile devices.
          </p>
        </div>

        {/* Main Showcase Card */}
        <div className="download-content-box bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Download Actions & Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#00B050]/10 text-[#00B050] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Latest Release
                  </span>
                  <span className="text-xs text-gray-500 font-medium">v1.0.0 · Android Package</span>
                  <span className="text-xs text-gray-400 font-normal">|</span>
                  <span className="text-xs text-gray-500 font-medium">Size: ~92.7 MB</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                  Smart Attendance ERP for Android
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Fast, lightweight, and battery-optimized application built for frontline workers, office staff, and branch managers.
                </p>
              </div>

              {/* Download Buttons Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                {/* Primary Direct Download Button */}
                <a
                  href="https://github.com/mdantormia1779-dev/smartattendence/releases/download/v1.0.0/smartattendence.apk"
                  download="smartattendence.apk"
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-[#00B050] hover:bg-[#009644] text-white font-semibold text-base px-7 py-4 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDownToLine className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs uppercase font-medium text-emerald-100 leading-none">
                      Direct Download
                    </div>
                    <div className="text-base font-bold leading-tight">
                      Download APK File
                    </div>
                  </div>
                </a>

                {/* Copy Download Link Button */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border border-gray-200 hover:border-emerald-500 bg-gray-50 hover:bg-emerald-50/50 text-gray-700 hover:text-emerald-700 font-medium text-sm transition-all duration-200 cursor-pointer"
                  title="Copy direct download link"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security & System Requirements Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#00B050] shrink-0" />
                  <span>100% Virus-Free & Safe</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <SmartphoneNfc className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Android 7.0+ (Nougat+)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Fast Face Verification</span>
                </div>
              </div>

              {/* Feature Grid Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {appFeatures.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-xs shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Mobile Mockup & QR Code Box (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6">
              
              {/* Phone Frame Mockup */}
              <div className="relative w-full max-w-[320px] aspect-[9/18.5] bg-gray-900 rounded-[44px] p-3.5 shadow-2xl border-4 border-gray-800 ring-1 ring-gray-900/10">
                {/* Speaker Grill & Camera Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-900 rounded-full flex items-center justify-center gap-2 z-30">
                  <div className="w-3 h-3 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                  <div className="w-10 h-1.5 bg-gray-800 rounded-full" />
                </div>

                {/* Screen Container */}
                <div className="w-full h-full bg-gradient-to-b from-slate-900 via-gray-900 to-slate-950 rounded-[34px] overflow-hidden flex flex-col justify-between p-5 pt-8 text-white relative">
                  
                  {/* Mock App Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#00B050] flex items-center justify-center font-bold text-xs text-white">
                        VX
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Smart Attendance</div>
                        <div className="text-[10px] text-emerald-400 font-medium">Head Office · In Radius</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#00B050] animate-ping" />
                  </div>

                  {/* Face Scan Visual Preview Box */}
                  <div className="my-auto py-2 space-y-4">
                    <div className="relative w-40 h-40 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-950/80 to-slate-900 border-2 border-dashed border-[#00B050]/60 flex flex-col items-center justify-center text-center p-3 overflow-hidden shadow-inner">
                      {/* Laser scanning line effect */}
                      <div className="absolute inset-x-0 h-0.5 bg-[#00B050] shadow-[0_0_8px_#00B050] animate-bounce top-1/3" />
                      
                      <ScanFace className="w-14 h-14 text-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-semibold text-emerald-300 mt-2">
                        Face Verified (99.8%)
                      </span>
                      <span className="text-[9px] text-gray-400">GPS Geo-fence: Verified</span>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
                      <div className="text-[11px] text-gray-400">Today&apos;s Status</div>
                      <div className="text-sm font-bold text-white mt-0.5">Checked In at 09:02 AM</div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">On Time · Branch A</div>
                    </div>
                  </div>

                  {/* Mock Bottom App Nav */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-around text-gray-400 text-[10px]">
                    <div className="text-[#00B050] font-semibold flex flex-col items-center gap-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Punch</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Bell className="w-4 h-4" />
                      <span>Leaves</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <MapPin className="w-4 h-4" />
                      <span>Branch</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Desktop QR Code Scan Box */}
              <div className="w-full max-w-[320px] bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
                  <QrCode className="w-4 h-4 text-[#00B050]" />
                  <span>Scan to Download on Phone</span>
                </div>
                
                {/* SVG QR Code Simulation with accurate visual style */}
                <div className="w-32 h-32 mx-auto bg-white p-2.5 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-center">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="w-full h-full text-gray-900"
                    fill="currentColor"
                  >
                    {/* Top Left Corner */}
                    <rect x="5" y="5" width="30" height="30" rx="4" fill="#00B050" />
                    <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
                    <rect x="15" y="15" width="10" height="10" rx="1" fill="#00B050" />
                    
                    {/* Top Right Corner */}
                    <rect x="65" y="5" width="30" height="30" rx="4" fill="#00B050" />
                    <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
                    <rect x="75" y="15" width="10" height="10" rx="1" fill="#00B050" />
                    
                    {/* Bottom Left Corner */}
                    <rect x="5" y="65" width="30" height="30" rx="4" fill="#00B050" />
                    <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
                    <rect x="15" y="75" width="10" height="10" rx="1" fill="#00B050" />

                    {/* QR Code Dots & Patterns */}
                    <rect x="42" y="10" width="6" height="6" rx="1" />
                    <rect x="52" y="15" width="6" height="6" rx="1" />
                    <rect x="42" y="25" width="6" height="6" rx="1" />
                    
                    <rect x="10" y="45" width="6" height="6" rx="1" />
                    <rect x="20" y="52" width="6" height="6" rx="1" />
                    <rect x="30" y="42" width="6" height="6" rx="1" />

                    <rect x="45" y="45" width="10" height="10" rx="2" fill="#00B050" />
                    <rect x="60" y="42" width="6" height="6" rx="1" />
                    <rect x="72" y="50" width="6" height="6" rx="1" />
                    <rect x="85" y="45" width="6" height="6" rx="1" />

                    <rect x="42" y="65" width="6" height="6" rx="1" />
                    <rect x="52" y="75" width="6" height="6" rx="1" />
                    <rect x="42" y="85" width="6" height="6" rx="1" />
                    <rect x="65" y="68" width="6" height="6" rx="1" />
                    <rect x="75" y="80" width="6" height="6" rx="1" />
                    <rect x="85" y="70" width="6" height="6" rx="1" />
                    <rect x="85" y="88" width="6" height="6" rx="1" />
                  </svg>
                </div>

                <p className="text-[11px] text-gray-500">
                  Open your mobile camera or scanner app and point at this code to download directly.
                </p>
              </div>

            </div>

          </div>

          {/* Installation Steps Section */}
          <div className="mt-12 pt-10 border-t border-gray-100">
            <h4 className="text-center text-lg font-bold text-gray-900 mb-6">
              How to Install in 3 Easy Steps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((item, i) => (
                <div 
                  key={i} 
                  className="bg-[#FBF9F5] p-5 rounded-2xl border border-gray-100 relative hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-xl bg-[#00B050] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {item.step}
                    </span>
                    <h5 className="font-bold text-gray-900 text-base">{item.title}</h5>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pl-11">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
