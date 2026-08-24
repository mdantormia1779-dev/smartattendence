"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import EmployeeHeader from "./../Components/Employee/EmployeeHeader";
import EmployeeFilters from "./../Components/Employee/EmployeeFilters";
import EmployeeTable from "./../Components/Employee/EmployeeTable";
import EmployeeDetails from "./../Components/Employee/EmployeeDetails";
import CreateEmployeeModal from "./../Components/Employee/CreateEmployeeModal";
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

interface EmployeeRecord {
  name: string;
  email: string;
  id: string;
  department: string;
  designation: string;
  branch: string;
  type: string;
  status: string;
  today: string;
  todayColor: string;
  image?: string;
  phone?: string;
  joiningDate?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  manager?: string;
  salary?: string;
  grade?: string;
  salaryType?: string;
  payCycle?: string;
  nextPay?: string;
}

const EmployeePage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.employees.getAll({
        search: searchTerm || undefined,
        limit: 100,
      });

      if (res.success && res.data?.items) {
        const mapped: EmployeeRecord[] = res.data.items.map((e: any) => ({
          name: e.name,
          email: e.email,
          id: e.employeeId,
          department: e.department || "General",
          designation: e.designation || "Staff",
          branch: e.branch || "Head Office – Dhaka",
          type: e.employmentType || "Full-time",
          status: e.status || "Active",
          today: e.status === "Active" ? "Present" : "On Leave",
          todayColor: e.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-cyan-100 text-cyan-700",
          image: e.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          phone: e.phone || "+880 1712-000000",
          joiningDate: e.joiningDate || "Jan 12, 2024",
          gender: e.gender || "Male",
          dob: e.dob || "May 14, 1994",
          bloodGroup: e.bloodGroup || "B+",
          maritalStatus: e.maritalStatus || "Single",
          nationality: "Bangladeshi",
          manager: e.managerName || "Sarah Rahman",
          salary: `৳${Number(e.basicSalary || 50000).toLocaleString()}`,
          grade: e.salaryGrade || "Grade 8",
          salaryType: e.salaryType || "Monthly",
          payCycle: "Monthly",
          nextPay: "Sep 05, 2026",
        }));
        setEmployees(mapped);
      }
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm]);

  const handleCreateEmployee = async (newEmp: any) => {
    try {
      const payload = {
        fullName: newEmp.fullName,
        email: newEmp.email,
        employeeId: newEmp.employeeId,
        password: newEmp.password || "emp12345",
        designation: newEmp.designation,
        department: newEmp.department,
        branch: newEmp.branch,
        gender: newEmp.gender,
        phone: newEmp.phoneNumber,
        basicSalary: Number(newEmp.basicSalary) || 50000,
        salaryGrade: newEmp.salaryGrade,
        employmentType: newEmp.employmentType,
        status: newEmp.employeeStatus,
      };

      const res = await api.employees.create(payload);
      if (res.success) {
        await fetchEmployees();
      }
    } catch (e) {
      console.error("Error creating employee", e);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "All" || emp.type === selectedType;
    const matchesBranch = selectedBranch === "All" || emp.branch === selectedBranch;

    return matchesSearch && matchesType && matchesBranch;
  });

  useEffect(() => {
    if (selectedEmployee) return;

    const ctx = gsap.context(() => {
      gsap.from(".anim-header", {
        y: -20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      });

      gsap.from(".anim-filter", {
        y: 15,
        opacity: 0,
        duration: 0.5,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from(".anim-row", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.4,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [selectedEmployee, loading]);

  if (selectedEmployee) {
    return (
      <EmployeeDetails 
        employee={selectedEmployee} 
        onBack={() => {
          setSelectedEmployee(null);
          fetchEmployees();
        }} 
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF7F0] min-h-screen text-stone-800 font-sans p-6 md:p-10"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <EmployeeHeader 
          totalCount={filteredEmployees.length} 
          onAddClick={() => setIsAddModalOpen(true)} 
        />

        <EmployeeFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
        />

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-stone-400 flex flex-col items-center justify-center border border-stone-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
            <span>Loading employees directory...</span>
          </div>
        ) : (
          <EmployeeTable
            employees={filteredEmployees}
            onRowClick={(employee: any) => {
              setSelectedEmployee(employee);
            }}
          />
        )}

        <CreateEmployeeModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreate={handleCreateEmployee}
        />
      </div>
    </div>
  );
};

export default EmployeePage;