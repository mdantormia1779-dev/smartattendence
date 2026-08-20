"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, CalendarDays, Clock, UserX, TrendingUp, TrendingDown } from "lucide-react";

export default function StatCards() {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = cardRef.current;
        if (el) {
            gsap.fromTo(
                el.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, []);

    return (
        <div ref={cardRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Present Today</span>
                        <div className="w-8 h-8 rounded-xl bg-[#00B050]/10 text-[#00B050] flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mt-3">46</h2>
                </div>
                <p className="text-xs font-semibold text-[#00B050] flex items-center gap-1 mt-3">
                    <TrendingUp className="w-3.5 h-3.5" /> 4.2% <span className="text-gray-400 font-normal">vs yesterday</span>
                </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">On Leave</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                            <CalendarDays className="w-4 h-4" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mt-3">4</h2>
                </div>
                <p className="text-xs font-semibold text-rose-500 flex items-center gap-1 mt-3">
                    <TrendingDown className="w-3.5 h-3.5" /> 2 <span className="text-gray-400 font-normal">pending</span>
                </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Late Arrivals</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mt-3">8</h2>
                </div>
                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-3">
                    1 review <span className="text-gray-400 font-normal">pending</span>
                </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Absent Today</span>
                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                            <UserX className="w-4 h-4" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mt-3">5</h2>
                </div>
                <p className="text-xs font-semibold text-rose-500 flex items-center gap-1 mt-3">
                    <TrendingDown className="w-3.5 h-3.5" /> 1 <span className="text-gray-400 font-normal">unexcused</span>
                </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Overtime (hrs)</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B050] flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mt-3">27.5</h2>
                </div>
                <p className="text-xs font-semibold text-[#00B050] flex items-center gap-1 mt-3">
                    <TrendingUp className="w-3.5 h-3.5" /> 3.1 <span className="text-gray-400 font-normal">this week</span>
                </p>
            </div>
        </div>
    );
}