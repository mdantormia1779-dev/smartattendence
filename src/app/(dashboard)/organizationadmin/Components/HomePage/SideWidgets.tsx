"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function SideWidgets() {
    const widgetsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = widgetsRef.current;
        if (el) {
            gsap.fromTo(
                el.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }
            );
        }
    }, []);

    return (
        <div ref={widgetsRef} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Leave Requests</h3>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md">2 pending</span>
                </div>

                <div className="space-y-3">
                    {[
                        { name: "Sharmin Sultana", type: "Sick Leave • 2d", date: "Aug 20, 2026", status: "pending", badge: "bg-amber-50 text-amber-600 border-amber-200" },
                        { name: "Imran Hossain", type: "Casual Leave • 1d", date: "Aug 24, 2026", status: "pending", badge: "bg-amber-50 text-amber-600 border-amber-200" },
                        { name: "Tanvir Ahmed", type: "Annual Leave • 5d", date: "Aug 10, 2026", status: "approved", badge: "bg-emerald-50 text-[#00B050] border-emerald-200" },
                    ].map((leave, i) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-gray-900">{leave.name}</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">{leave.type}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{leave.date}</p>
                            </div>
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase ${leave.badge}`}>
                                {leave.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">Upcoming Holidays</h3>
                <div className="space-y-3">
                    {[
                        { title: "International Mother Language Day", date: "Feb 21", type: "Government" },
                        { title: "Independence Day", date: "Mar 26", type: "Government" },
                    ].map((holiday, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B050] flex flex-col items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-100">
                                <span>{holiday.date.split(" ")[0]}</span>
                                <span className="text-xs">{holiday.date.split(" ")[1]}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-gray-900 truncate">{holiday.title}</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">{holiday.type} Holiday</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}