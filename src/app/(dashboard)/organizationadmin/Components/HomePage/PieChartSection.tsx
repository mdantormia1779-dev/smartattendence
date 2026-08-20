"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function PieChartSection() {
    const pieRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pieRef.current) {
            gsap.fromTo(
                pieRef.current,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
            );
        }
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
                <h3 className="text-base font-bold text-gray-900">Today's Attendance</h3>
                <p className="text-xs text-gray-500">Out of 63 active employees</p>
            </div>

            <div className="flex flex-col items-center justify-center my-6">
                <div ref={pieRef} className="relative w-36 h-36 rounded-full border-8 border-gray-100 flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 rounded-full border-8 border-[#00B050] border-t-transparent -rotate-45"></div>
                    <div className="text-center">
                        <span className="text-2xl font-extrabold text-gray-900">73%</span>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Present</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#00B050]"></span> Present</span>
                    <span className="font-bold text-gray-900">46</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Late</span>
                    <span className="font-bold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Absent</span>
                    <span className="font-bold text-gray-900">5</span>
                </div>
            </div>
        </div>
    );
}