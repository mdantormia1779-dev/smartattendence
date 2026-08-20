"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { MapPin } from "lucide-react";

export default function LiveAttendanceTable() {
    const tableRef = useRef<HTMLTableSectionElement>(null);

    useEffect(() => {
        const rows = tableRef.current?.querySelectorAll("tr");
        if (rows) {
            gsap.fromTo(
                rows,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
            );
        }
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">Live Attendance</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-[#00B050] text-[10px] font-bold rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B050] animate-pulse"></span> Live
                    </span>
                </div>
                <button className="text-xs font-bold text-[#00B050] hover:underline">View all</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="text-gray-400 border-b border-gray-100">
                            <th className="pb-3 font-semibold">Employee</th>
                            <th className="pb-3 font-semibold">Department</th>
                            <th className="pb-3 font-semibold">Check-in</th>
                            <th className="pb-3 font-semibold">Method</th>
                            <th className="pb-3 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody ref={tableRef} className="divide-y divide-gray-50">
                        {[
                            { name: "Arif Chowdhury", dept: "IT", time: "08:58 AM", method: "Face + GPS", status: "present", color: "bg-emerald-50 text-[#00B050]" },
                            { name: "Nusrat Jahan", dept: "Accounts", time: "08:52 AM", method: "Face + GPS", status: "present", color: "bg-emerald-50 text-[#00B050]" },
                            { name: "Tanvir Ahmed", dept: "Marketing", time: "09:24 AM", method: "Face + GPS", status: "late", color: "bg-amber-50 text-amber-600" },
                            { name: "Farhana Akter", dept: "Support", time: "08:47 AM", method: "Face + GPS", status: "present", color: "bg-emerald-50 text-[#00B050]" },
                            { name: "Shakil Khan", dept: "Product", time: "--", method: "--", status: "absent", color: "bg-rose-50 text-rose-600" },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-[10px]">
                                        {row.name.charAt(0)}
                                    </div>
                                    {row.name}
                                </td>
                                <td className="py-3 text-gray-500 font-medium">{row.dept}</td>
                                <td className="py-3 text-gray-700 font-semibold">{row.time}</td>
                                <td className="py-3 text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-gray-400" /> {row.method}
                                </td>
                                <td className="py-3 text-right">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${row.color}`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}