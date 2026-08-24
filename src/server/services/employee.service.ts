import { ConflictError, NotFoundError } from "../errors";

export interface EmployeeRecordData {
  id: string;
  userId: string;
  organizationId: string;
  employeeId: string; // e.g. "EMP-1042"
  name: string;
  email: string;
  designation: string;
  department: string;
  departmentId: string;
  branch: string;
  branchId: string;
  manager?: string;
  managerId?: string | null;
  shiftId?: string | null;
  type: "Full-time" | "Part-time" | "Contract" | "Intern";
  status: "Active" | "On Leave" | "Resigned" | "Suspended";
  today: string;
  todayColor: string;
  image?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  joiningDate?: string;
  basicSalary: number;
  salaryGrade: string;
  salaryType: string;
  bankAccountNumber?: string;
  bankName?: string;
  payCycle?: string;
  nextPay?: string;
  createdAt: string;
}

let employeesStore: EmployeeRecordData[] = [
  {
    id: "emp-rec-1",
    userId: "user-emp-1",
    organizationId: "org-1",
    employeeId: "EMP-1042",
    name: "Arif Chowdhury",
    email: "arif.c@vertextech.io",
    designation: "Senior Software Engineer",
    department: "Information Technology",
    departmentId: "dept-1",
    branch: "Head Office – Dhaka",
    branchId: "branch-1",
    manager: "Tanvir Ahmed",
    managerId: "user-mgr-1",
    shiftId: "shift-1",
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
    basicSalary: 95000,
    salaryGrade: "Grade 8",
    salaryType: "Monthly",
    payCycle: "Monthly",
    nextPay: "Sep 05, 2026",
    createdAt: "2020-01-12",
  },
  {
    id: "emp-rec-2",
    userId: "user-emp-2",
    organizationId: "org-1",
    employeeId: "EMP-1043",
    name: "Nusrat Jahan",
    email: "nusrat.j@vertextech.io",
    designation: "Senior Accountant",
    department: "Accounts & Finance",
    departmentId: "dept-2",
    branch: "Head Office – Dhaka",
    branchId: "branch-1",
    manager: "Ariful Islam",
    managerId: "user-mgr-2",
    shiftId: "shift-1",
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
    basicSalary: 72000,
    salaryGrade: "Grade 6",
    salaryType: "Monthly",
    payCycle: "Monthly",
    nextPay: "Sep 05, 2026",
    createdAt: "2021-03-15",
  },
  {
    id: "emp-rec-3",
    userId: "user-emp-3",
    organizationId: "org-1",
    employeeId: "EMP-1044",
    name: "Mahmudul Hasan",
    email: "mahmud.h@vertextech.io",
    designation: "Frontend Developer",
    department: "Information Technology",
    departmentId: "dept-1",
    branch: "Head Office – Dhaka",
    branchId: "branch-1",
    manager: "Tanvir Ahmed",
    managerId: "user-mgr-1",
    shiftId: "shift-1",
    type: "Full-time",
    status: "Active",
    today: "Late (09:22 AM)",
    todayColor: "bg-amber-100 text-amber-700",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    phone: "+880 1912-334455",
    joiningDate: "Jun 01, 2022",
    gender: "Male",
    dob: "Nov 03, 1997",
    bloodGroup: "A+",
    maritalStatus: "Single",
    nationality: "Bangladeshi",
    basicSalary: 60000,
    salaryGrade: "Grade 5",
    salaryType: "Monthly",
    payCycle: "Monthly",
    nextPay: "Sep 05, 2026",
    createdAt: "2022-06-01",
  },
];

export class EmployeeService {
  static async getEmployees(organizationId: string, query: {
    page?: number;
    limit?: number;
    search?: string;
    branchId?: string;
    departmentId?: string;
    managerId?: string;
    status?: string;
  }) {
    let list = employeesStore.filter((e) => e.organizationId === organizationId);

    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
      );
    }

    if (query.branchId && query.branchId !== "All") {
      list = list.filter((e) => e.branchId === query.branchId || e.branch === query.branchId);
    }

    if (query.departmentId && query.departmentId !== "All") {
      list = list.filter((e) => e.departmentId === query.departmentId || e.department === query.departmentId);
    }

    if (query.status && query.status !== "All") {
      list = list.filter((e) => e.status === query.status);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedItems = list.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getEmployeeById(idOrEmpId: string, organizationId: string) {
    const emp = employeesStore.find(
      (e) => (e.id === idOrEmpId || e.employeeId === idOrEmpId) && e.organizationId === organizationId
    );
    if (!emp) throw new NotFoundError("Employee");
    return emp;
  }

  static async createEmployee(data: {
    organizationId: string;
    fullName: string;
    email: string;
    employeeId: string;
    designation: string;
    branchId: string;
    branchName?: string;
    departmentId: string;
    departmentName?: string;
    managerId?: string | null;
    managerName?: string;
    shiftId?: string | null;
    basicSalary?: number;
    salaryGrade?: string;
    salaryType?: string;
    phone?: string;
    gender?: string;
    bloodGroup?: string;
    joiningDate?: string;
  }) {
    const existing = employeesStore.find(
      (e) =>
        e.organizationId === data.organizationId &&
        (e.employeeId.toUpperCase() === data.employeeId.toUpperCase() || e.email.toLowerCase() === data.email.toLowerCase())
    );
    if (existing) {
      throw new ConflictError(`Employee with ID '${data.employeeId}' or email '${data.email}' already exists in your organization`);
    }

    const newEmp: EmployeeRecordData = {
      id: `emp-rec-${Date.now()}`,
      userId: `user-emp-${Date.now()}`,
      organizationId: data.organizationId,
      employeeId: data.employeeId.toUpperCase(),
      name: data.fullName,
      email: data.email,
      designation: data.designation,
      department: data.departmentName || "General",
      departmentId: data.departmentId,
      branch: data.branchName || "Main Branch",
      branchId: data.branchId,
      manager: data.managerName || undefined,
      managerId: data.managerId || null,
      shiftId: data.shiftId || null,
      type: "Full-time",
      status: "Active",
      today: "Not Clocked In",
      todayColor: "bg-gray-100 text-gray-700",
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=00B050&color=fff`,
      phone: data.phone || "",
      gender: data.gender || "Not specified",
      bloodGroup: data.bloodGroup || "",
      nationality: "Bangladeshi",
      joiningDate: data.joiningDate || new Date().toISOString().split("T")[0],
      basicSalary: data.basicSalary || 0,
      salaryGrade: data.salaryGrade || "Grade 1",
      salaryType: data.salaryType || "Monthly",
      payCycle: "Monthly",
      nextPay: "Next Cycle",
      createdAt: new Date().toISOString().split("T")[0],
    };

    employeesStore.unshift(newEmp);
    return newEmp;
  }

  static async updateEmployee(id: string, organizationId: string, updates: Partial<EmployeeRecordData>) {
    const emp = await this.getEmployeeById(id, organizationId);
    Object.assign(emp, updates);
    return emp;
  }

  static async deleteEmployee(id: string, organizationId: string) {
    const emp = await this.getEmployeeById(id, organizationId);
    employeesStore = employeesStore.filter((e) => e.id !== id && e.employeeId !== id);
    return { success: true, deletedEmployee: emp };
  }
}
