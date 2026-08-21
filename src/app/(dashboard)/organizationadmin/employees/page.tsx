"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import EmployeeHeader from "./../Components/Employee/EmployeeHeader";
import EmployeeFilters from "./../Components/Employee/EmployeeFilters";
import EmployeeTable from "./../Components/Employee/EmployeeTable";
import EmployeeDetails from "./../Components/Employee/EmployeeDetails";
import CreateEmployeeModal from "./../Components/Employee/CreateEmployeeModal"; // মোডাল ইম্পোর্ট করা হলো

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

interface EmployeePageProps {
  initialEmployees?: EmployeeRecord[];
}

const EmployeePage = ({ initialEmployees = [] }: EmployeePageProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");
  
  // ক্লিক করা এমপ্লয়ির ডেটা রাখার জন্য স্টেট
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);

  // নতুন এমপ্লয়ি যোগ করার মোডালের স্টেট
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const defaultEmployees = [
    {
      name: "Arif Chowdhury",
      email: "arif.c@vertextech.io",
      id: "EMP-1042",
      department: "Information Technology",
      designation: "Senior Software Engineer",
      branch: "Head Office – Dhaka",
      type: "Full-time",
      status: "Active",
      today: "Present",
      todayColor: "bg-emerald-100 text-emerald-700",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      phone: "+880 1712-100201",
      joiningDate: "Jan 12, 2020",
      gender: "Male",
      dob: "May 14, 1994",
      bloodGroup: "B+",
      maritalStatus: "Married",
      nationality: "Bangladeshi",
      manager: "Sarah Rahman",
      salary: "৳95,000",
      grade: "Grade 8",
      salaryType: "Monthly",
      payCycle: "Monthly",
      nextPay: "Sep 05, 2026",
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.j@vertextech.io",
      id: "EMP-1043",
      department: "Accounts & Finance",
      designation: "Senior Accountant",
      branch: "Head Office – Dhaka",
      type: "Full-time",
      status: "Active",
      today: "Present",
      todayColor: "bg-emerald-100 text-emerald-700",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
      phone: "+880 1811-223344",
      joiningDate: "Mar 15, 2021",
      gender: "Female",
      dob: "Aug 22, 1996",
      bloodGroup: "O+",
      maritalStatus: "Single",
      nationality: "Bangladeshi",
      manager: "Ariful Islam",
      salary: "৳75,000",
      grade: "Grade 6",
      salaryType: "Monthly",
      payCycle: "Monthly",
      nextPay: "Sep 05, 2026",
    },
    {
      name: "Tanvir Ahmed",
      email: "tanvir.a@vertextech.io",
      id: "EMP-1044",
      department: "Marketing",
      designation: "Digital Marketing Lead",
      branch: "Gulshan Branch",
      type: "Full-time",
      status: "Active",
      today: "Late",
      todayColor: "bg-amber-100 text-amber-700",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      phone: "+880 1919-556677",
      joiningDate: "Jul 01, 2022",
      gender: "Male",
      dob: "Jan 10, 1992",
      bloodGroup: "A+",
      maritalStatus: "Married",
      nationality: "Bangladeshi",
      manager: "Nazmul Hossain",
      salary: "৳85,000",
      grade: "Grade 7",
      salaryType: "Monthly",
      payCycle: "Monthly",
      nextPay: "Sep 05, 2026",
    },
  ];

  // এমপ্লয়ি লিস্টকে স্টেটে রূপান্তর করা হলো যাতে নতুন এমপ্লয়ি যোগ করলে লিস্ট আপডেট হয়
  const [employees, setEmployees] = useState<EmployeeRecord[]>(
    initialEmployees.length > 0 ? initialEmployees : defaultEmployees
  );

  // নতুন এমপ্লয়ি হ্যান্ডলার
  const handleCreateEmployee = (newEmp: any) => {
    // মোডাল থেকে আসা ডেটাকে টেবিলের ফরম্যাটে ম্যাপ করে নেওয়া
    const formattedEmp: EmployeeRecord = {
      name: newEmp.fullName || "Unnamed Employee",
      email: newEmp.email || "no-email@company.com",
      id: newEmp.employeeId || `EMP-${Date.now()}`,
      department: newEmp.department || "General",
      designation: newEmp.designation || "Staff",
      branch: newEmp.branch || "Head Office",
      type: newEmp.employmentType || "Full-time",
      status: newEmp.employeeStatus || "Active",
      today: "Present",
      todayColor: "bg-emerald-100 text-emerald-700",
      image: newEmp.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      phone: newEmp.phoneNumber || "",
      joiningDate: newEmp.joiningDate || "Today",
      gender: newEmp.gender || "Male",
      dob: newEmp.dob || "",
      bloodGroup: newEmp.bloodGroup || "",
      maritalStatus: newEmp.maritalStatus || "",
      manager: newEmp.manager || "Unassigned",
      salary: newEmp.basicSalary || "৳50,000",
      grade: newEmp.salaryGrade || "Grade 1",
      salaryType: newEmp.salaryType || "Monthly",
      nationality: "Bangladeshi",
      payCycle: "Monthly",
      nextPay: "Next Month",
    };

    setEmployees((prev) => [formattedEmp, ...prev]);
  };

  // Filtering Logic
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
  }, [selectedEmployee]);

  // যদি কোনো এমপ্লয়ি সিলেক্ট করা থাকে, তবে তার ডিটেইলস পেজ দেখাবে
  if (selectedEmployee) {
    return (
      <EmployeeDetails 
        employee={selectedEmployee} 
        onBack={() => setSelectedEmployee(null)} 
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

        <EmployeeTable
          employees={filteredEmployees}
          onRowClick={(employee: any) => {
            setSelectedEmployee(employee);
          }}
        />

        {/* নতুন এমপ্লয়ি যোগ করার মোডাল */}
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