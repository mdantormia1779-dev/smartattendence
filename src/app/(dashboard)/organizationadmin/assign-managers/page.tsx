"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { UserCheck, Plus } from "lucide-react";
import { Manager, ManagerFormData } from "@/types/manager";
import ManagerCard from "../Components/Managers/AssignedManagerCard";
import ManagerModal from "../Components/Managers/ManagerModal";

export default function ManagersPage() {
    const gridRef = useRef<HTMLDivElement>(null);

    const [managers, setManagers] = useState<Manager[]>([
        { id: "1", managerId: "MGR-1001", name: "Tanvir Ahmed", profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", email: "tanvir.it@vertex.com", phone: "+880 1822-200002", designation: "Senior IT Lead", assignedBranch: "Head Office - Dhaka", department: "Information Technology", status: "Active" },
        { id: "2", managerId: "MGR-1002", name: "Nusrat Jahan", profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", email: "nusrat.hr@vertex.com", phone: "+880 1711-100001", designation: "HR Manager", assignedBranch: "Gulshan Branch", department: "Human Resources", status: "Active" },
        { id: "3", managerId: "MGR-1003", name: "Sabrina Noor", profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", email: "sabrina.mkt@vertex.com", phone: "+880 1644-400004", designation: "Marketing Lead", assignedBranch: "Uttara Branch", department: "Marketing", status: "Active" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [managerToEdit, setManagerToEdit] = useState<Manager | null>(null);

    useEffect(() => {
        if (gridRef.current) {
            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
            );
        }
    }, [managers]);

    const handleSaveManager = (data: ManagerFormData): void => {
        if (managerToEdit) {
            setManagers((prev: Manager[]) => 
                prev.map((m: Manager) => m.id === managerToEdit.id ? { ...m, ...data } : m)
            );
        } else {
            const newManager: Manager = {
                id: Date.now().toString(),
                ...data,
            };
            setManagers((prev: Manager[]) => [newManager, ...prev]);
        }
        setManagerToEdit(null);
    };

    const handleDelete = (id: string): void => {
        setManagers((prev: Manager[]) => prev.filter((m: Manager) => m.id !== id));
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-[#00B050]" />
                        Manager Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Total {managers.length} active managers assigned to branches and departments
                    </p>
                </div>
                <button 
                    onClick={() => { setManagerToEdit(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Add Manager
                </button>
            </div>

            {/* Grid Layout */}
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managers.map((manager: Manager) => (
                    <ManagerCard 
                        key={manager.id} 
                        manager={manager} 
                        onEdit={(m: Manager) => { setManagerToEdit(m); setIsModalOpen(true); }}
                        onDelete={(id: string) => handleDelete(id)}
                    />
                ))}
            </div>

            {/* Modal */}
            <ManagerModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                managerToEdit={managerToEdit} 
                onSave={handleSaveManager} 
            />
        </div>
    );
}