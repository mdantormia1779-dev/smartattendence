"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Building2, Plus } from "lucide-react";
import BranchCard from "../Components/Branches/BranchCard";
import BranchModal from "../Components/Branches/BranchModal";
import DeleteModal from "../Components/Branches/DeleteModal";

interface Branch {
    id: string;
    name: string;
    code: string;
    shortName: string;
    address: string;
    phone: string;
    employees: number;
    geoFence: string;
    latitude: string;
    longitude: string;
    status: "Active" | "Inactive";
}

interface BranchFormData {
    name: string;
    code: string;
    shortName?: string;
    address: string;
    phone: string;
    geoFence: string;
    latitude: string;
    longitude: string;
    status: "Active" | "Inactive"; // এখানে status ফিল্ড যুক্ত করা হয়েছে
}

export default function BranchesPage() {
    const gridRef = useRef<HTMLDivElement>(null);

    const [branches, setBranches] = useState<Branch[]>([
        {
            id: "1",
            name: "Head Office – Dhaka",
            code: "BR-001",
            shortName: "HOD",
            address: "114 Kazi Nazrul Islam Ave, Dhaka",
            phone: "+880 1712-345678",
            employees: 142,
            geoFence: "120m",
            latitude: "23.7493",
            longitude: "90.3929",
            status: "Active",
        },
        {
            id: "2",
            name: "Gulshan Branch",
            code: "BR-002",
            shortName: "GSH",
            address: "Plot 5, Gulshan Avenue, Dhaka",
            phone: "+880 1812-223344",
            employees: 68,
            geoFence: "150m",
            latitude: "23.7930",
            longitude: "90.4142",
            status: "Active",
        },
        {
            id: "3",
            name: "Chattogram Branch",
            code: "BR-003",
            shortName: "CTG",
            address: "9 CDA Avenue, Chattogram",
            phone: "+880 1912-556677",
            employees: 45,
            geoFence: "100m",
            latitude: "22.3421",
            longitude: "91.8158",
            status: "Active",
        },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
    
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (gridRef.current) {
            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, [branches]);

    const handleSaveBranch = (data: BranchFormData) => {
        // Validate Coordinates & Radius
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        const radius = parseInt(data.geoFence.replace(/\D/g, ""), 10) || 120;

        if (isNaN(lat) || lat < -90 || lat > 90) {
            alert("Invalid Latitude: Latitude must be a numeric coordinate between -90 and 90.");
            return;
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
            alert("Invalid Longitude: Longitude must be a numeric coordinate between -180 and 180.");
            return;
        }
        if (radius < 20 || radius > 1000) {
            alert("Invalid Geofence Radius: Geofence must be between 20 meters and 1000 meters.");
            return;
        }

        if (branchToEdit) {
            setBranches(branches.map(b => b.id === branchToEdit.id ? { ...b, ...data, geoFence: `${radius}m` } : b));
        } else {
            const newBranch: Branch = {
                id: Date.now().toString(),
                ...data,
                geoFence: `${radius}m`,
                shortName: data.shortName || data.name.substring(0, 3).toUpperCase(),
                employees: 0,
            };
            setBranches([newBranch, ...branches]);
        }
        setBranchToEdit(null);
    };

    const confirmDelete = () => {
        if (branchToDelete) {
            setBranches(branches.filter(b => b.id !== branchToDelete));
            setIsDeleteOpen(false);
            setBranchToDelete(null);
        }
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 space-y-6 overflow-y-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-[#00B050]" />
                        Branches
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {branches.length} active branches with geo-fenced attendance
                    </p>
                </div>
                <button 
                    onClick={() => { setBranchToEdit(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B050] text-white shadow-md shadow-[#00B050]/20 hover:bg-[#009b46] transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Add Branch
                </button>
            </div>

            {/* Branches Grid */}
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                    <BranchCard 
                        key={branch.id} 
                        branch={branch} 
                        onEdit={(b: Branch) => { setBranchToEdit(b); setIsModalOpen(true); }}
                        onDelete={(id: string) => { setBranchToDelete(id); setIsDeleteOpen(true); }}
                    />
                ))}
            </div>

            {/* Modals */}
            <BranchModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                branchToEdit={branchToEdit} 
                onSave={handleSaveBranch} 
            />

            <DeleteModal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                onConfirm={confirmDelete} 
            />
        </div>
    );
}