"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import EmployeeHeader from "./../Components/Employee/EmployeeHeader";
import EmployeeFilters from "./../Components/Employee/EmployeeFilters";
import EmployeeTable from "./../Components/Employee/EmployeeTable";
import EmployeeDetails from "./../Components/Employee/EmployeeDetails";
import CreateEmployeeModal from "./../Components/Employee/CreateEmployeeModal";
import QuotaExceededModal from "./../Components/QuotaExceededModal";
import { api } from "@/lib/api-client";
import { Loader2, Plus, Users } from "lucide-react";

export interface EmployeeRecord {
  dbId: string;
  name: string;
  fullName: string;
  email: string;
  id: string;
  employeeId: string;
  department: string;
  designation: string;
  branch: string;
  manager: string;
  type: string;
  employmentType: string;
  status: string;
  employeeStatus: string;
  today: string;
  todayColor: string;
  image?: string;
  profilePicture?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  salary?: string;
  basicSalary?: string;
  grade?: string;
  salaryGrade?: string;
  salaryType?: string;
  hourlyRate?: string;
  payCycle?: string;
  nextPay?: string;
  documents?: any[];
}

interface Branch {
  id: string;
  name: string;
  code?: string;
}

interface Department {
  id: string;
  name: string;
  code?: string;
}

interface Manager {
  id: string;
  name: string;
  designation?: string;
}

const EmployeePage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Data States
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Active View
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      let activeOrgId = "";
      if (typeof window !== "undefined") {
        const rawUser = localStorage.getItem("user") || localStorage.getItem("user_info") || localStorage.getItem("userData");
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            activeOrgId = parsed.organizationId || parsed.orgId || "";
          } catch {}
        }
        if (!activeOrgId) {
          activeOrgId = localStorage.getItem("organizationId") || localStorage.getItem("orgId") || "";
        }
      }

      const queryParam = activeOrgId ? { organizationId: activeOrgId } : undefined;

      const [empRes, branchRes, deptRes, mgrRes, subRes] = await Promise.allSettled([
        api.employees.getAll({ limit: 100, ...(activeOrgId ? { organizationId: activeOrgId } : {}) }),
        api.branches.getAll(queryParam),
        api.departments.getAll(queryParam),
        api.managers.getAll(queryParam),
        api.get("/api/subscription", queryParam),
      ]);

      if (subRes.status === "fulfilled" && subRes.value.success && subRes.value.data) {
        setSubscription(subRes.value.data);
      }

      if (empRes.status === "fulfilled" && empRes.value.success) {
        const val = empRes.value as any;
        const rawItems = val.items || val.data?.items || (Array.isArray(val.data) ? val.data : []);
        if (Array.isArray(rawItems)) {
          const mapped: EmployeeRecord[] = rawItems.map((e: any) => {
            const empName = e.name || e.fullName || "Staff Member";
            const empCode = e.employeeId || e.employeeCode || `EMP-${(e.id || "").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}`;
            const empStatus = e.status || "Active";
            const isPresent = e.today === "Present" || (e.attendance && e.attendance.length > 0) || empStatus === "Active";

            return {
              dbId: e.id,
              id: empCode,
              employeeId: empCode,
              name: empName,
              fullName: empName,
              email: e.email,
              department: e.department || e.departmentName || (e.departments?.name) || "General Operations",
              designation: e.designation || "Staff",
              branch: e.branch || e.branchName || (e.branches?.name) || "Main Head Office",
              manager: e.manager || e.managerName || (e.managers?.name) || "Unassigned",
              type: e.type || e.employmentType || "Full-time",
              employmentType: e.employmentType || e.type || "Full-time",
              status: empStatus,
              employeeStatus: empStatus,
              today: isPresent ? "Present" : "Not Clocked In",
              todayColor: isPresent ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-stone-100 text-stone-600",
              image: e.image || e.profilePicture || e.avatar || undefined,
              profilePicture: e.image || e.profilePicture || e.avatar || undefined,
              phone: e.phone || e.phoneNumber || "+880 1700-000000",
              phoneNumber: e.phone || e.phoneNumber || "+880 1700-000000",
              address: e.address || "Dhaka, Bangladesh",
              emergencyContact: e.emergencyContact || "+880 1800-000000",
              joiningDate: e.joiningDate ? new Date(e.joiningDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 12, 2024",
              gender: e.gender || "Male",
              dob: e.dob || "May 14, 1994",
              bloodGroup: e.bloodGroup || "B+",
              maritalStatus: e.maritalStatus || "Single",
              nationality: "Bangladeshi",
              salary: `৳${Number(e.basicSalary || 50000).toLocaleString()}`,
              basicSalary: String(e.basicSalary || 50000),
              grade: e.salaryGrade || "Grade 8",
              salaryGrade: e.salaryGrade || "Grade 8",
              salaryType: e.salaryType || "Monthly",
              hourlyRate: String(e.hourlyRate || 350),
              payCycle: "Monthly",
              nextPay: "Next Month 05",
              documents: [
                { title: "National ID (Front)", file: "id-front.pdf", status: "Verified" },
                { title: "National ID (Back)", file: "id-back.pdf", status: "Verified" },
                { title: "Appointment Letter", file: "appointment.pdf", status: "Verified" },
              ]
            };
          });
          setEmployees(mapped);
        }
      }

      if (branchRes.status === "fulfilled" && branchRes.value.success && Array.isArray(branchRes.value.data)) {
        setBranches(branchRes.value.data);
      }

      if (deptRes.status === "fulfilled" && deptRes.value.success && Array.isArray(deptRes.value.data)) {
        setDepartments(deptRes.value.data);
      }

      if (mgrRes.status === "fulfilled" && mgrRes.value.success && Array.isArray(mgrRes.value.data)) {
        setManagers(mgrRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load employee directory dependencies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (emp.name && emp.name.toLowerCase().includes(q)) ||
        (emp.fullName && emp.fullName.toLowerCase().includes(q)) ||
        (emp.id && emp.id.toLowerCase().includes(q)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
        (emp.email && emp.email.toLowerCase().includes(q)) ||
        (emp.designation && emp.designation.toLowerCase().includes(q)) ||
        (emp.phone && emp.phone.toLowerCase().includes(q)) ||
        (emp.phoneNumber && emp.phoneNumber.toLowerCase().includes(q));

      const matchesType =
        selectedType === "All" ||
        (emp.type && emp.type.toLowerCase() === selectedType.toLowerCase()) ||
        (emp.employmentType && emp.employmentType.toLowerCase() === selectedType.toLowerCase());

      const matchesBranch =
        selectedBranch === "All" ||
        emp.branch === selectedBranch ||
        (emp as any).branchId === selectedBranch ||
        ((emp.branch || "").toLowerCase() === selectedBranch.toLowerCase());

      const matchesDept =
        selectedDepartment === "All" ||
        emp.department === selectedDepartment ||
        (emp as any).departmentId === selectedDepartment ||
        ((emp.department || "").toLowerCase() === selectedDepartment.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" ||
        (emp.status && emp.status.toLowerCase() === selectedStatus.toLowerCase()) ||
        (emp.employeeStatus && emp.employeeStatus.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesType && matchesBranch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedType, selectedBranch, selectedDepartment, selectedStatus]);

  // Create Employee Handler
  const handleCreateEmployee = async (newEmp: any) => {
    try {
      let activeOrgId = "";
      if (typeof window !== "undefined") {
        const rawUser = localStorage.getItem("user") || localStorage.getItem("user_info") || localStorage.getItem("userData");
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            activeOrgId = parsed.organizationId || parsed.orgId || "";
          } catch {}
        }
        if (!activeOrgId) {
          activeOrgId = localStorage.getItem("organizationId") || localStorage.getItem("orgId") || "";
        }
      }

      const payload = {
        organizationId: activeOrgId || undefined,
        fullName: newEmp.fullName.trim(),
        email: newEmp.email.trim().toLowerCase(),
        employeeId: newEmp.employeeId,
        employeeCode: newEmp.employeeId,
        password: newEmp.password || "emp12345",
        designation: newEmp.designation.trim(),
        department: newEmp.department,
        branch: newEmp.branch,
        manager: newEmp.manager,
        gender: newEmp.gender,
        dob: newEmp.dob,
        bloodGroup: newEmp.bloodGroup,
        maritalStatus: newEmp.maritalStatus,
        phone: newEmp.phoneNumber || newEmp.phone,
        address: newEmp.address,
        emergencyContact: newEmp.emergencyContact,
        joiningDate: newEmp.joiningDate,
        basicSalary: Number(newEmp.basicSalary) || 50000,
        salaryGrade: newEmp.salaryGrade || "Grade 8",
        salaryType: newEmp.salaryType || "Monthly",
        hourlyRate: Number(newEmp.hourlyRate) || 350,
        employmentType: newEmp.employmentType || "Full-time",
        status: newEmp.employeeStatus || "Active",
        profilePicture: newEmp.profilePicture || undefined,
        documents: newEmp.documents,
      };

      const res = await api.employees.create(payload);
      if (res.success) {
        await fetchAllData();
        return { success: true };
      } else {
        return { success: false, error: res.error || "Failed to create employee profile" };
      }
    } catch (e: any) {
      console.error("Error creating employee", e);
      return { success: false, error: e?.message || "Failed to create employee profile" };
    }
  };

  // Update Employee Handler
  const handleUpdateEmployee = async (updatedEmp: any) => {
    try {
      const targetId = updatedEmp.dbId || updatedEmp.id || selectedEmployee?.dbId || selectedEmployee?.id;
      if (!targetId) return;

      const payload = {
        fullName: (updatedEmp.fullName || updatedEmp.name || "").trim(),
        email: (updatedEmp.email || "").trim().toLowerCase(),
        designation: (updatedEmp.designation || "").trim(),
        department: updatedEmp.department,
        branch: updatedEmp.branch,
        gender: updatedEmp.gender,
        phone: updatedEmp.phoneNumber || updatedEmp.phone,
        address: updatedEmp.address,
        emergencyContact: updatedEmp.emergencyContact,
        basicSalary: Number(String(updatedEmp.basicSalary || updatedEmp.salary || "50000").replace(/[^0-9]/g, "")) || 50000,
        salaryGrade: updatedEmp.salaryGrade || updatedEmp.grade,
        employmentType: updatedEmp.employmentType || updatedEmp.type,
        status: updatedEmp.employeeStatus || updatedEmp.status,
        profilePicture: updatedEmp.profilePicture || updatedEmp.image || undefined,
        password: updatedEmp.password ? updatedEmp.password : undefined,
      };

      const res = await api.employees.update(targetId, payload);
      if (res.success) {
        await fetchAllData();
        setSelectedEmployee((prev) => prev ? { ...prev, ...updatedEmp } : null);
      }
    } catch (e) {
      console.error("Error updating employee", e);
    }
  };

  // Delete Employee Handler
  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.employees.delete(id);
      setSelectedEmployee(null);
      await fetchAllData();
    } catch (e) {
      console.error("Error deleting employee", e);
    }
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) return;

    const headers = ["Employee ID", "Full Name", "Email", "Phone", "Department", "Designation", "Branch", "Manager", "Employment Type", "Status", "Basic Salary", "Joining Date"];
    const rows = filteredEmployees.map((emp) => [
      emp.id,
      `"${emp.name.replace(/"/g, '""')}"`,
      emp.email,
      emp.phone || "",
      `"${emp.department.replace(/"/g, '""')}"`,
      `"${emp.designation.replace(/"/g, '""')}"`,
      `"${emp.branch.replace(/"/g, '""')}"`,
      `"${emp.manager.replace(/"/g, '""')}"`,
      emp.type,
      emp.status,
      emp.basicSalary || emp.salary,
      emp.joiningDate || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedBranch("All");
    setSelectedDepartment("All");
    setSelectedStatus("All");
  };

  // Animation on load
  useEffect(() => {
    if (!loading && containerRef.current) {
      const rows = containerRef.current.querySelectorAll(".anim-row");
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
        );
      }
    }
  }, [loading, filteredEmployees]);

  const activeStaffCount = useMemo(() => {
    return employees.filter((e) => e.status === "Active").length;
  }, [employees]);

  const fullTimeStaffCount = useMemo(() => {
    return employees.filter((e) => e.type === "Full-time").length;
  }, [employees]);

  // Single Employee Details View
  if (selectedEmployee) {
    return (
      <EmployeeDetails 
        employee={selectedEmployee as any} 
        branches={branches as any}
        departments={departments as any}
        managers={managers as any}
        onBack={() => {
          setSelectedEmployee(null);
          fetchAllData();
        }} 
        onUpdate={handleUpdateEmployee}
        onDelete={handleDeleteEmployee}
      />
    );
  }

  // Quota Computations
  const maxEmployees = subscription?.limits?.maxEmployees ?? 20;
  const planName = subscription?.planName || "Free Tier";
  const isQuotaExceeded = maxEmployees !== null && employees.length >= maxEmployees;

  const handleOpenAddEmployee = () => {
    if (isQuotaExceeded) {
      setIsQuotaModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF7F0] min-h-screen text-stone-800 font-sans p-6 md:p-10 space-y-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Stats & Actions */}
        <EmployeeHeader 
          totalCount={employees.length} 
          activeCount={activeStaffCount}
          fullTimeCount={fullTimeStaffCount}
          maxLimit={maxEmployees}
          planName={planName}
          isQuotaExceeded={isQuotaExceeded}
          onAddClick={handleOpenAddEmployee} 
          onExport={handleExportCSV}
        />

        {/* Filters Bar */}
        <EmployeeFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          branches={branches as any}
          departments={departments as any}
          onReset={handleResetFilters}
        />

        {/* Employees Table or Loading / Empty state */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-stone-400 flex flex-col items-center justify-center border border-stone-200/80 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-semibold">Loading workforce records from database...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center text-stone-400 border border-stone-200/80 shadow-xs space-y-3">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-1" />
            <h3 className="text-sm font-bold text-stone-800">
              {searchTerm || selectedType !== "All" || selectedBranch !== "All" || selectedDepartment !== "All" || selectedStatus !== "All"
                ? "No employees matched your filters"
                : "No employee records found"}
            </h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {searchTerm || selectedType !== "All" || selectedBranch !== "All" || selectedDepartment !== "All" || selectedStatus !== "All"
                ? "Try adjusting your search criteria or resetting filters."
                : "Click 'Add Employee' to register your first organization team member."}
            </p>
            {searchTerm || selectedType !== "All" || selectedBranch !== "All" || selectedDepartment !== "All" || selectedStatus !== "All" ? (
              <button 
                onClick={handleResetFilters}
                className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button 
                onClick={handleOpenAddEmployee}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Employee
              </button>
            )}
          </div>
        ) : (
          <EmployeeTable
            employees={filteredEmployees as any}
            onRowClick={(employee: any) => {
              setSelectedEmployee(employee);
            }}
          />
        )}

        {/* Create Employee Modal */}
        <CreateEmployeeModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          existingEmployees={employees as any}
          branches={branches as any}
          departments={departments as any}
          managers={managers as any}
          onCreate={handleCreateEmployee}
        />

        {/* Quota Limit Exceeded Alert Modal */}
        <QuotaExceededModal 
          isOpen={isQuotaModalOpen}
          onClose={() => setIsQuotaModalOpen(false)}
          resourceName="Employees"
          currentCount={employees.length}
          maxLimit={maxEmployees}
          planName={planName}
        />
      </div>
    </div>
  );
};

export default EmployeePage;