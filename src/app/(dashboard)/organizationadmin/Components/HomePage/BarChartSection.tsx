"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function BarChartSection() {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bars = chartRef.current?.querySelectorAll(".bar-item");
        if (bars) {
            gsap.fromTo(
                bars,
                { height: 0, opacity: 0 },
                { height: "100%", opacity: 1, duration: 0.8, stagger: 0.08, ease: "power2.out" }
            );
        }
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Weekly Attendance Trend</h3>
                        <p className="text-xs text-gray-500">Present vs absent across last 7 working days</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-[#00B050]"></span> Present</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-400"></span> Late</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-gray-300"></span> Absent</span>
                    </div>
                </div>

                <div ref={chartRef} className="h-48 flex items-end justify-between gap-4 mt-8 px-2 border-b border-gray-100 pb-2">
                    {[
                        { day: "Sun", p: 46, l: 6, a: 3 },
                        { day: "Mon", p: 44, l: 8, a: 4 },
                        { day: "Tue", p: 48, l: 4, a: 2 },
                        { day: "Wed", p: 47, l: 7, a: 3 },
                        { day: "Thu", p: 45, l: 8, a: 3 },
                        { day: "Fri", p: 43, l: 9, a: 4 },
                        { day: "Sat", p: 42, l: 6, a: 5 },
                    ].map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <div className="bar-item w-full max-w-[36px] bg-gray-100 rounded-lg flex flex-col justify-end overflow-hidden h-40">
                                <div style={{ height: `${item.a * 5}%` }} className="w-full bg-gray-300"></div>
                                <div style={{ height: `${item.l * 5}%` }} className="w-full bg-amber-400"></div>
                                <div style={{ height: `${item.p * 2}%` }} className="w-full bg-[#00B050]"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}