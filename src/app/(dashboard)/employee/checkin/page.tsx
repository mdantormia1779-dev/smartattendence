"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { 
    ScanFace, 
    MapPin, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Building2, 
    Camera, 
    RefreshCw, 
    Fingerprint, 
    ShieldCheck, 
    Sparkles, 
    ArrowLeft,
    Check,
    X,
    Eye
} from "lucide-react";

export default function SmartCheckInPage() {
    const [isScanning, setIsScanning] = useState(true);
    const [faceDetected, setFaceDetected] = useState(false);
    const [livenessPassed, setLivenessPassed] = useState(false);
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [distanceMeters, setDistanceMeters] = useState(24);
    const [isInsideGeofence, setIsInsideGeofence] = useState(true);
    const [attendanceMode, setAttendanceMode] = useState<"Face" | "Biometric">("Face");

    // Punch state
    const [punchStatus, setPunchStatus] = useState<"Idle" | "Clocked In" | "Clocked Out">("Clocked In");
    const [punchSuccessModal, setPunchSuccessModal] = useState(false);
    const [lastPunchTime, setLastPunchTime] = useState("08:52 AM");

    const containerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<HTMLDivElement>(null);

    // Simulate AI Face detection & liveness scan
    useEffect(() => {
        setIsScanning(true);
        setFaceDetected(false);
        setLivenessPassed(false);
        setConfidenceScore(0);

        const timer1 = setTimeout(() => {
            setFaceDetected(true);
            setConfidenceScore(98.4);
        }, 1200);

        const timer2 = setTimeout(() => {
            setLivenessPassed(true);
            setConfidenceScore(99.2);
            setIsScanning(false);
        }, 2400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [attendanceMode]);

    const handlePunch = (type: "In" | "Out") => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastPunchTime(timeStr);
        setPunchStatus(type === "In" ? "Clocked In" : "Clocked Out");
        setPunchSuccessModal(true);
    };

    const handleRetakeScan = () => {
        setIsScanning(true);
        setFaceDetected(false);
        setLivenessPassed(false);
        setConfidenceScore(0);

        setTimeout(() => {
            setFaceDetected(true);
            setConfidenceScore(98.6);
        }, 1000);

        setTimeout(() => {
            setLivenessPassed(true);
            setConfidenceScore(99.4);
            setIsScanning(false);
        }, 2200);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <ScanFace className="w-6 h-6 text-[#00B050]" />
                        Smart Attendance Check-In / Out
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        AI Facial Recognition Anti-Spoofing & GPS Branch Geo-Fence Verification
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAttendanceMode("Face")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            attendanceMode === "Face"
                                ? "bg-[#00B050] text-white shadow-xs"
                                : "bg-gray-50 border border-gray-200 text-gray-700"
                        }`}
                    >
                        <ScanFace className="w-4 h-4" /> AI Face Recognition
                    </button>
                    <button
                        onClick={() => setAttendanceMode("Biometric")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            attendanceMode === "Biometric"
                                ? "bg-[#00B050] text-white shadow-xs"
                                : "bg-gray-50 border border-gray-200 text-gray-700"
                        }`}
                    >
                        <Fingerprint className="w-4 h-4" /> Biometric Punch
                    </button>
                </div>
            </div>

            {/* Main Interactive Punch Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Live Face Camera / Biometric Viewport */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00B050] animate-pulse"></span>
                            <span className="text-xs font-bold text-gray-800">
                                {attendanceMode === "Face" ? "HD Camera Viewport (Anti-Spoofing Active)" : "Biometric Device Scanner Ready"}
                            </span>
                        </div>
                        <button
                            onClick={handleRetakeScan}
                            className="text-xs font-semibold text-gray-500 hover:text-[#00B050] flex items-center gap-1 cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} /> Rescan
                        </button>
                    </div>

                    {/* Camera Simulation Viewport */}
                    {attendanceMode === "Face" ? (
                        <div className="relative aspect-4/3 max-h-[420px] w-full bg-neutral-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-neutral-800">
                            {/* Employee Preview Image */}
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"
                                alt="Face Verification Scan"
                                className={`w-full h-full object-cover transition-opacity duration-300 ${isScanning ? "opacity-75" : "opacity-95"}`}
                            />

                            {/* Animated AI Scanning Grid & Boundary Frame */}
                            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                                <div className={`w-64 h-72 border-2 rounded-3xl relative transition-all duration-300 ${
                                    livenessPassed
                                        ? "border-[#00B050] shadow-[0_0_25px_rgba(0,176,80,0.5)]"
                                        : faceDetected
                                        ? "border-amber-400"
                                        : "border-white/40"
                                }`}>
                                    {/* Corner Brackets */}
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00B050] rounded-tl-xl" />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00B050] rounded-tr-xl" />
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00B050] rounded-bl-xl" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00B050] rounded-br-xl" />

                                    {/* Scanning laser beam */}
                                    {isScanning && (
                                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#00B050] to-transparent absolute top-0 animate-[bounce_2s_infinite]" />
                                    )}

                                    {/* Score pill on top of box */}
                                    {faceDetected && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] font-bold text-white whitespace-nowrap">
                                            Face Match: <span className="text-[#00B050]">{confidenceScore}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Live Feedback Bar */}
                            <div className="absolute bottom-4 inset-x-4 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs text-white">
                                <div className="flex items-center gap-2">
                                    {livenessPassed ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#00B050]" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
                                    )}
                                    <span>
                                        {livenessPassed
                                            ? "Liveness & Blink Verified ✅"
                                            : faceDetected
                                            ? "Blink your eyes to verify liveness..."
                                            : "Align your face within the frame..."}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">30 FPS · 1080p</span>
                            </div>
                        </div>
                    ) : (
                        /* Biometric Fingerprint Box */
                        <div className="h-80 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-emerald-50 text-[#00B050] flex items-center justify-center shadow-inner animate-pulse">
                                <Fingerprint className="w-14 h-14" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Biometric Sensor ID #BIO-01 Ready</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Place registered index finger on office device scanner</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: GPS Radar Verification & Punch Action Buttons */}
                <div className="lg:col-span-5 space-y-6">
                    {/* GPS Geofence Radar Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#00B050]" />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">GPS Geofence Location</h3>
                                    <p className="text-[11px] text-gray-400">Head Office – Dhaka Branch</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                In Safe Zone
                            </span>
                        </div>

                        {/* Location Visual Box */}
                        <div className="p-4 bg-gray-50 rounded-2xl space-y-3 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Your Current Distance:</span>
                                <span className="font-bold text-emerald-600">{distanceMeters} meters away</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Branch Geofence Radius:</span>
                                <span className="font-bold text-gray-800">120 meters allowed</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Coordinates:</span>
                                <span className="font-mono text-gray-700">23.7493° N, 90.3929° E</span>
                            </div>
                        </div>

                        {/* Verification Checklist */}
                        <div className="space-y-2 text-xs pt-1">
                            <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                                <span className="text-gray-700 font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#00B050]" /> AI Anti-Spoofing & Liveness
                                </span>
                                <span className="font-bold text-emerald-700">{confidenceScore}%</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                                <span className="text-gray-700 font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#00B050]" /> Branch Geo-fence Validation
                                </span>
                                <span className="font-bold text-emerald-700">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Punch Actions Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Current Status</span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                {punchStatus}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => handlePunch("In")}
                                disabled={!livenessPassed}
                                className="py-4 px-4 rounded-2xl bg-[#00B050] hover:bg-[#009b46] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#00B050]/20 transition-transform hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed text-center"
                            >
                                Clock In (Punch In)
                            </button>

                            <button
                                onClick={() => handlePunch("Out")}
                                disabled={!livenessPassed}
                                className="py-4 px-4 rounded-2xl bg-gray-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-transform hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed text-center"
                            >
                                Clock Out (Punch Out)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Punch Success Confirmation Modal */}
            {punchSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#00B050] flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Attendance Logged Successfully!</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {punchStatus} registered at <span className="font-bold text-gray-900">{lastPunchTime}</span>
                            </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1 text-gray-600 text-left">
                            <div className="flex justify-between"><span>Employee:</span> <span className="font-bold text-gray-900">Arif Chowdhury (EMP-1042)</span></div>
                            <div className="flex justify-between"><span>Location:</span> <span className="font-semibold text-gray-800">Head Office – Dhaka</span></div>
                            <div className="flex justify-between"><span>AI Match:</span> <span className="font-bold text-[#00B050]">99.2% Confidence</span></div>
                        </div>

                        <button
                            onClick={() => setPunchSuccessModal(false)}
                            className="w-full py-3 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
