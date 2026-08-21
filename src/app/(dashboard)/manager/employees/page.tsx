"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
    Users, 
    Search, 
    Filter, 
    Phone, 
    Mail, 
    CheckCircle2, 
    Clock, 
    Calendar, 
    UserCheck, 
    Building2, 
    MoreVertical, 
    X,
    ShieldCheck
} from "lucide-react";

interface TeamMember {
    id: string;
    name: string;
    employeeId: string;
    avatar: string;
    designation: string;
    shift: string;
    phone: string;
    email: string;
    attendanceRate: number; // percentage
    todayStatus: "Present" | "Late" | "On Leave" | "Absent";
    joiningDate: string;
}

const teamData: TeamMember[] = [
    {
        id: "tm-1",
        name: "Arif Chowdhury",
        employeeId: "EMP-1042",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        designation: "Senior Software Engineer",
        shift: "Regular Morning (09:00 - 05:00)",
        phone: "+880 1712-100201",
        email: "arif.c@vertextech.io",
        attendanceRate: 98.5,
        todayStatus: "Present",
        joiningDate: "Jan 12, 2020",
    },
    {
        id: "tm-2",
        name: "Mahmudul Hasan",
        employeeId: "EMP-1047",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        designation: "Frontend Engineer",
        shift: "Regular Morning (09:00 - 05:00)",
        phone: "+880 1822-998877",
        email: "mahmud.h@vertextech.io",
        attendanceRate: 94.0,
        todayStatus: "Present",
        joiningDate: "Mar 01, 2022",
    },
    {
        id: "tm-3",
        name: "Sabbir Hossain",
        employeeId: "EMP-1049",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        designation: "Backend API Engineer",
        shift: "Regular Morning (09:00 - 05:00)",
        phone: "+880 1911-334455",
        email: "sabbir.h@vertextech.io",
        attendanceRate: 91.2,
        todayStatus: "Late",
        joiningDate: "Aug 15, 2023",
    },
    {
        id: "tm-4",
        name: "Farhana Islam",
        employeeId: "EMP-1051",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        designation: "QA & Test Automation Lead",
        shift: "Flexible Core Hours",
        phone: "+880 1622-445566",
        email: "farhana.i@vertextech.io",
        attendanceRate: 97.0,
        todayStatus: "On Leave",
        joiningDate: "Feb 10, 2021",
    },
];

export default function ManagerTeamPage() {
    const [team, setTeam] = useState<TeamMember[]>(teamData);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".team-card",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [team, searchQuery]);

    const filteredTeam = team.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div ref={containerRef} className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#00B050]" />
                        My Assigned Team
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Direct reports in IT & Engineering Department · Head Office – Dhaka
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search team member..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B050]/20 focus:border-[#00B050]"
                    />
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeam.map((member) => (
                    <div
                        key={member.id}
                        className="team-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{member.name}</h3>
                                    <span className="text-xs text-gray-400 font-mono">{member.employeeId}</span>
                                </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                member.todayStatus === "Present"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : member.todayStatus === "Late"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-blue-50 text-blue-700"
                            }`}>
                                {member.todayStatus}
                            </span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Designation:</span>
                                <span className="font-semibold text-gray-800">{member.designation}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Assigned Shift:</span>
                                <span className="font-medium text-gray-700 truncate max-w-[160px]">{member.shift}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Attendance Rate:</span>
                                <span className="font-bold text-[#00B050]">{member.attendanceRate}%</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-gray-500">
                                <a href={`mailto:${member.email}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#00B050]">
                                    <Mail className="w-4 h-4" />
                                </a>
                                <a href={`tel:${member.phone}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#00B050]">
                                    <Phone className="w-4 h-4" />
                                </a>
                            </div>
                            <button
                                onClick={() => setSelectedMember(member)}
                                className="text-xs font-bold text-[#00B050] hover:underline"
                            >
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Member Profile Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Team Member Profile</h3>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-center space-y-2">
                            <img
                                src={selectedMember.avatar}
                                alt={selectedMember.name}
                                className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-[#00B050]/20"
                            />
                            <h4 className="font-bold text-gray-900 text-lg">{selectedMember.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">{selectedMember.employeeId} · {selectedMember.designation}</p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email:</span>
                                <span className="font-semibold text-gray-800">{selectedMember.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone:</span>
                                <span className="font-semibold text-gray-800">{selectedMember.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Joining Date:</span>
                                <span className="font-semibold text-gray-800">{selectedMember.joiningDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Current Shift:</span>
                                <span className="font-semibold text-gray-800">{selectedMember.shift}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Punctuality Score:</span>
                                <span className="font-bold text-[#00B050]">{selectedMember.attendanceRate}% Compliance</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="px-5 py-2 bg-[#00B050] text-white rounded-xl text-xs font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
