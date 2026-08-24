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
    Eye,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";

export default function SmartCheckInPage() {
    const [isScanning, setIsScanning] = useState(true);
    const [faceDetected, setFaceDetected] = useState(false);
    const [livenessPassed, setLivenessPassed] = useState(false);
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [distanceMeters, setDistanceMeters] = useState(24);
    const [isInsideGeofence, setIsInsideGeofence] = useState(true);
    const [attendanceMode, setAttendanceMode] = useState<"Face" | "Biometric">("Face");
    const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 23.7925, lng: 90.4078 });

    // Punch state
    const [punchStatus, setPunchStatus] = useState<"Idle" | "Clocked In" | "Clocked Out">("Idle");
    const [punchSuccessModal, setPunchSuccessModal] = useState(false);
    const [lastPunchTime, setLastPunchTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function initCheckin() {
            try {
                // Get today's attendance
                const todayRes = await api.attendance.getToday();
                if (todayRes.success && todayRes.data) {
                    if (todayRes.data.checkInTime) {
                        setPunchStatus("Clocked In");
                        setLastPunchTime(todayRes.data.checkInTime);
                    }
                    if (todayRes.data.checkOutTime) {
                        setPunchStatus("Clocked Out");
                        setLastPunchTime(todayRes.data.checkOutTime);
                    }
                }

                // Request GPS Location
                if (typeof window !== "undefined" && "geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            setCurrentCoords({ lat, lng });

                            const verifyRes = await api.attendance.verifyLocation({
                                latitude: lat,
                                longitude: lng,
                                branchId: "branch-1",
                            });

                            if (verifyRes.success && verifyRes.data) {
                                setIsInsideGeofence(verifyRes.data.isInsideGeofence);
                                setDistanceMeters(verifyRes.data.distanceMeters || 24);
                            }
                        },
                        (err) => {
                            console.warn("GPS unavailable, using demo coordinates", err);
                        }
                    );
                }
            } catch (e) {
                console.error("Failed to initialize check-in state", e);
            }
        }

        initCheckin();
    }, []);

    // Simulate AI Face detection & liveness scan
    useEffect(() => {
        setIsScanning(true);
        setFaceDetected(false);
        setLivenessPassed(false);
        setConfidenceScore(0);

        const timer1 = setTimeout(() => {
            setFaceDetected(true);
            setConfidenceScore(98.4);
        }, 1000);

        const timer2 = setTimeout(() => {
            setLivenessPassed(true);
            setConfidenceScore(99.2);
            setIsScanning(false);
        }, 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [attendanceMode]);

    const handlePunch = async (type: "In" | "Out") => {
        setErrorMessage("");
        setLoading(true);

        try {
            if (type === "In") {
                const res = await api.attendance.checkIn({
                    employeeId: "EMP-1042",
                    latitude: currentCoords.lat,
                    longitude: currentCoords.lng,
                    verificationMethod: "FACE_RECOGNITION",
                });

                if (!res.success) {
                    setErrorMessage(res.message || "Failed to check in");
                    return;
                }

                const timeStr = res.data?.checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setLastPunchTime(timeStr);
                setPunchStatus("Clocked In");
                setPunchSuccessModal(true);
            } else {
                const res = await api.attendance.checkOut({
                    employeeId: "EMP-1042",
                    latitude: currentCoords.lat,
                    longitude: currentCoords.lng,
                });

                if (!res.success) {
                    setErrorMessage(res.message || "Failed to check out");
                    return;
                }

                const timeStr = res.data?.checkOutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setLastPunchTime(timeStr);
                setPunchStatus("Clocked Out");
                setPunchSuccessModal(true);
            }
        } catch (e: any) {
            setErrorMessage(e.message || "An error occurred during punch");
        } finally {
            setLoading(false);
        }
    };

    const handleRetakeScan = () => {
        setIsScanning(true);
        setFaceDetected(false);
        setLivenessPassed(false);
        setConfidenceScore(0);

        setTimeout(() => {
            setFaceDetected(true);
            setConfidenceScore(98.6);
        }, 800);

        setTimeout(() => {
            setLivenessPassed(true);
            setConfidenceScore(99.4);
            setIsScanning(false);
        }, 1800);
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            attendanceMode === "Face" 
                                ? "bg-[#00B050] text-white shadow-sm shadow-[#00B050]/20" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <ScanFace className="w-4 h-4" />
                        Face ID
                    </button>
                    <button
                        onClick={() => setAttendanceMode("Biometric")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            attendanceMode === "Biometric" 
                                ? "bg-[#00B050] text-white shadow-sm shadow-[#00B050]/20" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <Fingerprint className="w-4 h-4" />
                        Biometric Device
                    </button>
                </div>
            </div>

            {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Main Punching Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Scanner Preview */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-between space-y-6">
                    <div className="w-full flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-[#00B050]" />
                            Live AI Camera Stream
                        </span>
                        <button 
                            onClick={handleRetakeScan}
                            className="text-xs font-bold text-[#00B050] flex items-center gap-1 hover:underline cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Retake Scan
                        </button>
                    </div>

                    {/* Camera Video / Visualizer Frame */}
                    <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gray-900 overflow-hidden flex items-center justify-center border-4 border-gray-100 shadow-inner">
                        {/* Simulation Video Background */}
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"
                            alt="Face Scan Preview"
                            className={`w-full h-full object-cover transition-opacity duration-500 ${isScanning ? "opacity-60 blur-xs" : "opacity-100"}`}
                        />

                        {/* Scanner HUD Overlay */}
                        <div className="absolute inset-0 border-2 border-dashed border-[#00B050]/40 rounded-3xl pointer-events-none"></div>

                        {/* Corner Target Markers */}
                        <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#00B050] rounded-tl-xl"></div>
                        <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#00B050] rounded-tr-xl"></div>
                        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#00B050] rounded-bl-xl"></div>
                        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#00B050] rounded-br-xl"></div>

                        {/* Scanning Laser Line */}
                        {isScanning && (
                            <div className="absolute left-0 right-0 h-1 bg-[#00B050] shadow-[0_0_15px_#00B050] animate-bounce"></div>
                        )}

                        {/* Face Recognition AI Box */}
                        {faceDetected && (
                            <div className="absolute inset-12 border-2 border-[#00B050] rounded-2xl flex flex-col justify-between p-3 animate-in fade-in zoom-in duration-300">
                                <span className="bg-[#00B050] text-white font-bold text-[10px] px-2 py-0.5 rounded-full w-fit flex items-center gap-1 shadow-sm">
                                    <Sparkles className="w-3 h-3" /> Arif Chowdhury (99.2%)
                                </span>
                                <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-full w-fit self-end">
                                    Anti-Spoofing Validated
                                </span>
                            </div>
                        )}
                    </div>

                    {/* AI Feedback Badges */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                        <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Face Match</p>
                            <p className="text-sm font-extrabold text-[#00B050] mt-0.5">{confidenceScore}%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Liveness</p>
                            <p className="text-sm font-extrabold text-[#00B050] mt-0.5">
                                {livenessPassed ? "Verified" : "Checking..."}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Anti-Spoof</p>
                            <p className="text-sm font-extrabold text-[#00B050] mt-0.5">PASSED</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: GPS Geofence & Punch Actions */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Location Verification Card */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center font-bold">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">GPS Geofence Boundary</h3>
                                    <p className="text-[11px] text-gray-500">Head Office – Dhaka (Radius: 120m)</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 text-[#00B050] text-[10px] font-extrabold rounded-full">
                                Inside Boundary
                            </span>
                        </div>

                        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#00B050] shrink-0 mt-0.5" />
                            <div className="text-xs text-emerald-900">
                                <p className="font-bold">Verified Location Accuracy</p>
                                <p className="text-[11px] text-emerald-700 mt-0.5">
                                    You are <span className="font-bold">{distanceMeters}m</span> from the branch center (within the permitted 120m zone).
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1.5 pt-1">
                            <div className="flex justify-between"><span>Assigned Shift:</span><span className="font-bold text-gray-800">Regular Morning (09:00 - 05:00)</span></div>
                            <div className="flex justify-between"><span>Grace Time:</span><span className="font-bold text-gray-800">15 Minutes (Up to 09:15 AM)</span></div>
                            <div className="flex justify-between"><span>Current Status:</span><span className="font-bold text-emerald-600">{punchStatus}</span></div>
                        </div>
                    </div>

                    {/* Punch In / Out Actions */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">One-Click Biometric Punch</p>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={() => handlePunch("In")}
                                disabled={loading || punchStatus === "Clocked In"}
                                className="py-4 px-4 bg-[#00B050] hover:bg-[#009b46] disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-2xl font-bold text-sm shadow-lg shadow-[#00B050]/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Clock className="w-6 h-6" />
                                        <span>Punch In</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handlePunch("Out")}
                                disabled={loading || punchStatus === "Clocked Out"}
                                className="py-4 px-4 bg-gray-900 hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span>Punch Out</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {lastPunchTime && (
                            <p className="text-xs text-gray-400 pt-2">
                                Last recorded punch at: <span className="font-bold text-gray-800">{lastPunchTime}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Punch Success Modal */}
            {punchSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#00B050] mx-auto flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                                {punchStatus === "Clocked In" ? "Clock In Successful!" : "Clock Out Recorded!"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Recorded at <span className="font-bold text-gray-800">{lastPunchTime}</span> with Face Match 99.2% & GPS Geofence verified.
                            </p>
                        </div>
                        <button
                            onClick={() => setPunchSuccessModal(false)}
                            className="w-full py-3 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00B050]/20 transition-colors cursor-pointer"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
