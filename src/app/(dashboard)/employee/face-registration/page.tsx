"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { 
    ScanFace, 
    Camera, 
    CheckCircle2, 
    RefreshCw, 
    ShieldCheck, 
    ArrowRight, 
    Check, 
    Sparkles,
    UserCheck,
    Eye,
    Sliders
} from "lucide-react";

export default function FaceRegistrationPage() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isCapturing, setIsCapturing] = useState<boolean>(false);
    const [stepCompleted, setStepCompleted] = useState<boolean[]>([false, false, false, false]);
    const [isEnrollmentComplete, setIsEnrollmentComplete] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const steps = [
        { title: "Frontal Face Capture", instruction: "Look directly into the camera with a neutral expression" },
        { title: "Turn Head Left (30°)", instruction: "Slowly turn your head slightly to the left" },
        { title: "Turn Head Right (30°)", instruction: "Slowly turn your head slightly to the right" },
        { title: "Liveness Blink Check", instruction: "Blink twice and smile gently to confirm 3D depth" },
    ];

    const handleCaptureStep = () => {
        setIsCapturing(true);
        setTimeout(() => {
            const updated = [...stepCompleted];
            updated[currentStep - 1] = true;
            setStepCompleted(updated);
            setIsCapturing(false);

            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            } else {
                setIsEnrollmentComplete(true);
            }
        }, 1500);
    };

    const handleReset = () => {
        setCurrentStep(1);
        setStepCompleted([false, false, false, false]);
        setIsEnrollmentComplete(false);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-[#00B050]" />
                        Biometric Face Registration Wizard
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Enroll your 3D facial feature vector with multi-angle anti-spoofing validation
                    </p>
                </div>
                {isEnrollmentComplete && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#00B050] text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Enrollment 100% Active
                    </span>
                )}
            </div>

            {/* Wizard Steps Indicator */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((s, idx) => {
                    const stepNum = idx + 1;
                    const isDone = stepCompleted[idx];
                    const isCurrent = currentStep === stepNum && !isEnrollmentComplete;

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all ${
                                isDone
                                    ? "bg-emerald-50/60 border-[#00B050]/30 text-emerald-900"
                                    : isCurrent
                                    ? "bg-white border-[#00B050] shadow-sm"
                                    : "bg-white border-gray-200 text-gray-400"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                    isDone ? "bg-[#00B050] text-white" : isCurrent ? "bg-[#00B050]/10 text-[#00B050]" : "bg-gray-100 text-gray-500"
                                }`}>
                                    Step {stepNum}
                                </span>
                                {isDone && <CheckCircle2 className="w-4 h-4 text-[#00B050]" />}
                            </div>
                            <h4 className="font-bold text-xs mt-2">{s.title}</h4>
                        </div>
                    );
                })}
            </div>

            {/* Interactive Viewport Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                {isEnrollmentComplete ? "Face Model Enrolled Successfully" : steps[currentStep - 1].title}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isEnrollmentComplete ? "Your 128-dimensional facial vector is encrypted and stored in secure tenant vault" : steps[currentStep - 1].instruction}
                            </p>
                        </div>
                        {!isEnrollmentComplete && (
                            <span className="text-xs font-bold text-[#00B050] bg-emerald-50 px-3 py-1 rounded-xl">
                                Step {currentStep} of 4
                            </span>
                        )}
                    </div>

                    {/* Camera Simulation Viewport */}
                    <div className="relative aspect-4/3 max-h-[420px] w-full bg-neutral-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-neutral-800">
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"
                            alt="Facial Enrollment"
                            className="w-full h-full object-cover"
                        />

                        {/* Scanner Target Circle */}
                        <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                            <div className={`w-64 h-64 rounded-full border-2 border-dashed transition-all duration-300 ${
                                isEnrollmentComplete
                                    ? "border-[#00B050] shadow-[0_0_30px_rgba(0,176,80,0.6)]"
                                    : isCapturing
                                    ? "border-amber-400 animate-spin"
                                    : "border-white/50"
                            }`} />
                        </div>

                        {/* Live AI Overlay */}
                        <div className="absolute bottom-4 inset-x-4 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs text-white">
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#00B050]" />
                                {isEnrollmentComplete ? "Biometric Profile Stored" : isCapturing ? "Extracting 128 Face Vector Landmarks..." : "Ready to Capture"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">Confidence: 99.8%</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Start Over
                        </button>

                        {!isEnrollmentComplete ? (
                            <button
                                onClick={handleCaptureStep}
                                disabled={isCapturing}
                                className="px-6 py-3 rounded-xl bg-[#00B050] hover:bg-[#009b46] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#00B050]/20 flex items-center gap-2 cursor-pointer"
                            >
                                <Camera className="w-4 h-4" />
                                {isCapturing ? "Scanning..." : `Capture Step ${currentStep}`}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/employee/checkin"
                                    className="px-6 py-3 rounded-xl bg-[#00B050] hover:bg-[#009b46] text-white text-xs font-bold shadow-md shadow-[#00B050]/20 flex items-center gap-1.5"
                                >
                                    Proceed to Check-In <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Security & Vector Details */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4 text-xs">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <ShieldCheck className="w-5 h-5 text-[#00B050]" />
                            <h3 className="font-bold text-gray-900">Security & Privacy Guard</h3>
                        </div>

                        <p className="text-gray-600 leading-relaxed">
                            Your biometric data is mathematically hashed into one-way encryption vectors and cannot be converted back into raw images.
                        </p>

                        <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-[11px] text-gray-600">
                            <div className="flex justify-between"><span>Vector Algorithm:</span> <span className="font-mono font-bold">FaceNet ResNet-34</span></div>
                            <div className="flex justify-between"><span>Anti-Spoofing:</span> <span className="font-bold text-emerald-600">Liveness 3D Active</span></div>
                            <div className="flex justify-between"><span>Tenant Isolation:</span> <span className="font-bold text-gray-900">Vertex Ltd. Only</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
