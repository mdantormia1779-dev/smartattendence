import { ConflictError, NotFoundError } from "../errors";
import { prisma } from "@/lib/prisma";
import { EmployeeStatus, EmploymentType, SalaryType } from "@prisma/client";

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
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { employeeCode: { contains: query.search, mode: "insensitive" } },
        { designation: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.branchId && query.branchId !== "All") {
      where.branchId = query.branchId;
    }

    if (query.departmentId && query.departmentId !== "All") {
      where.departmentId = query.departmentId;
    }

    if (query.status && query.status !== "All") {
      where.status = query.status.toUpperCase() as EmployeeStatus;
    }

    const [total, dbEmployees] = await Promise.all([
      prisma.employees.count({ where }),
      prisma.employees.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          branches: true,
          departments: true,
          managers: true,
          attendance: {
            take: 1,
            orderBy: { date: "desc" },
          },
        },
      }),
    ]);

    const items: EmployeeRecordData[] = dbEmployees.map((emp) => {
      const lastPunch = emp.attendance[0];
      let today = "Not Clocked In";
      let todayColor = "bg-neutral-100 text-neutral-700";

      if (lastPunch) {
        if (lastPunch.status === "PRESENT") {
          today = "Present";
          todayColor = "bg-emerald-100 text-emerald-700";
        } else if (lastPunch.status === "LATE") {
          today = "Late";
          todayColor = "bg-amber-100 text-amber-700";
        } else if (lastPunch.status === "ON_LEAVE") {
          today = "On Leave";
          todayColor = "bg-indigo-100 text-indigo-700";
        }
      }

      return {
        id: emp.id,
        userId: emp.id,
        organizationId: emp.organizationId,
        employeeId: emp.employeeCode,
        name: emp.fullName,
        email: emp.email,
        designation: emp.designation || "Staff",
        department: emp.departments?.name || "General",
        departmentId: emp.departmentId || "",
        branch: emp.branches?.name || "Main Branch",
        branchId: emp.branchId,
        manager: emp.managers?.name || undefined,
        managerId: emp.managerId || null,
        type: emp.employmentType === EmploymentType.FULL_TIME ? "Full-time" : "Part-time",
        status: emp.status === EmployeeStatus.ACTIVE ? "Active" : "Suspended",
        today,
        todayColor,
        image: emp.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=00B050&color=fff`,
        phone: emp.phone || "",
        gender: emp.gender || "Not specified",
        bloodGroup: emp.bloodGroup || "",
        maritalStatus: emp.maritalStatus || "Single",
        nationality: "Bangladeshi",
        joiningDate: emp.joiningDate ? emp.joiningDate.toISOString().split("T")[0] : emp.createdAt.toISOString().split("T")[0],
        basicSalary: Number(emp.basicSalary) || 0,
        salaryGrade: emp.salaryGrade || "Grade 1",
        salaryType: emp.salaryType === SalaryType.MONTHLY ? "Monthly" : "Hourly",
        createdAt: emp.createdAt.toISOString().split("T")[0],
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getEmployeeById(idOrEmpId: string, organizationId: string): Promise<EmployeeRecordData> {
    const emp = await prisma.employees.findFirst({
      where: {
        organizationId,
        OR: [{ id: idOrEmpId }, { employeeCode: idOrEmpId }],
      },
      include: {
        branches: true,
        departments: true,
        managers: true,
        attendance: {
          take: 1,
          orderBy: { date: "desc" },
        },
      },
    });

    if (!emp) throw new NotFoundError("Employee");

    return {
      id: emp.id,
      userId: emp.id,
      organizationId: emp.organizationId,
      employeeId: emp.employeeCode,
      name: emp.fullName,
      email: emp.email,
      designation: emp.designation || "Staff",
      department: emp.departments?.name || "General",
      departmentId: emp.departmentId || "",
      branch: emp.branches?.name || "Main Branch",
      branchId: emp.branchId,
      manager: emp.managers?.name || undefined,
      managerId: emp.managerId || null,
      type: emp.employmentType === EmploymentType.FULL_TIME ? "Full-time" : "Part-time",
      status: emp.status === EmployeeStatus.ACTIVE ? "Active" : "Suspended",
      today: "Active",
      todayColor: "bg-emerald-100 text-emerald-700",
      image: emp.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=00B050&color=fff`,
      phone: emp.phone || "",
      gender: emp.gender || "Not specified",
      bloodGroup: emp.bloodGroup || "",
      maritalStatus: emp.maritalStatus || "Single",
      nationality: "Bangladeshi",
      joiningDate: emp.joiningDate ? emp.joiningDate.toISOString().split("T")[0] : emp.createdAt.toISOString().split("T")[0],
      basicSalary: Number(emp.basicSalary) || 0,
      salaryGrade: emp.salaryGrade || "Grade 1",
      salaryType: emp.salaryType === SalaryType.MONTHLY ? "Monthly" : "Hourly",
      createdAt: emp.createdAt.toISOString().split("T")[0],
    };
  }

  static async createEmployee(data: {
    organizationId: string;
    fullName: string;
    email: string;
    employeeId: string;
    designation: string;
    branchId: string;
    branchName?: string;
    departmentId?: string;
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
    // Ensure branch exists or create default branch
    let targetBranchId = data.branchId;
    if (!targetBranchId || targetBranchId === "branch-1") {
      const existingBranch = await prisma.branches.findFirst({
        where: { organizationId: data.organizationId },
      });
      if (existingBranch) {
        targetBranchId = existingBranch.id;
      } else {
        const createdBranch = await prisma.branches.create({
          data: {
            id: `branch-${Date.now()}`,
            organizationId: data.organizationId,
            name: data.branchName || "Main Headquarters",
            code: `BR-${Date.now().toString().slice(-4)}`,
            address: "Main Office",
            latitude: 23.8103,
            longitude: 90.4125,
            geoFenceRadius: 100,
            updatedAt: new Date(),
          },
        });
        targetBranchId = createdBranch.id;
      }
    }

    const existing = await prisma.employees.findFirst({
      where: {
        organizationId: data.organizationId,
        OR: [
          { employeeCode: data.employeeId.toUpperCase() },
          { email: data.email.toLowerCase() },
        ],
      },
    });

    if (existing) {
      throw new ConflictError(
        `Employee with Code '${data.employeeId}' or Email '${data.email}' already exists in your organization`
      );
    }

    const newEmp = await prisma.employees.create({
      data: {
        id: `emp-${Date.now()}`,
        organizationId: data.organizationId,
        branchId: targetBranchId,
        departmentId: data.departmentId || null,
        managerId: data.managerId || null,
        employeeCode: data.employeeId.toUpperCase(),
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        password: "hashed-placeholder-password",
        phone: data.phone || null,
        designation: data.designation,
        gender: data.gender || null,
        bloodGroup: data.bloodGroup || null,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        basicSalary: data.basicSalary || 0,
        salaryGrade: data.salaryGrade || "Grade 1",
        updatedAt: new Date(),
      },
      include: {
        branches: true,
        departments: true,
        managers: true,
      },
    });

    return {
      id: newEmp.id,
      userId: newEmp.id,
      organizationId: newEmp.organizationId,
      employeeId: newEmp.employeeCode,
      name: newEmp.fullName,
      email: newEmp.email,
      designation: newEmp.designation || "Staff",
      department: newEmp.departments?.name || "General",
      departmentId: newEmp.departmentId || "",
      branch: newEmp.branches?.name || "Main Branch",
      branchId: newEmp.branchId,
      manager: newEmp.managers?.name || undefined,
      managerId: newEmp.managerId || null,
      type: "Full-time",
      status: "Active",
      today: "Not Clocked In",
      todayColor: "bg-neutral-100 text-neutral-700",
      image: newEmp.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(newEmp.fullName)}&background=00B050&color=fff`,
      phone: newEmp.phone || "",
      gender: newEmp.gender || "Not specified",
      bloodGroup: newEmp.bloodGroup || "",
      maritalStatus: "Single",
      nationality: "Bangladeshi",
      joiningDate: newEmp.joiningDate ? newEmp.joiningDate.toISOString().split("T")[0] : newEmp.createdAt.toISOString().split("T")[0],
      basicSalary: Number(newEmp.basicSalary) || 0,
      salaryGrade: newEmp.salaryGrade || "Grade 1",
      salaryType: "Monthly",
      createdAt: newEmp.createdAt.toISOString().split("T")[0],
    };
  }

  static async updateEmployee(id: string, organizationId: string, updates: Partial<EmployeeRecordData>) {
    const updated = await prisma.employees.update({
      where: { id },
      data: {
        fullName: updates.name,
        email: updates.email?.toLowerCase(),
        designation: updates.designation,
        phone: updates.phone,
        basicSalary: updates.basicSalary,
        salaryGrade: updates.salaryGrade,
        updatedAt: new Date(),
      },
      include: {
        branches: true,
        departments: true,
        managers: true,
      },
    });

    return {
      id: updated.id,
      userId: updated.id,
      organizationId: updated.organizationId,
      employeeId: updated.employeeCode,
      name: updated.fullName,
      email: updated.email,
      designation: updated.designation || "Staff",
      department: updated.departments?.name || "General",
      departmentId: updated.departmentId || "",
      branch: updated.branches?.name || "Main Branch",
      branchId: updated.branchId,
      type: "Full-time",
      status: "Active",
      today: "Active",
      todayColor: "bg-emerald-100 text-emerald-700",
      image: updated.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(updated.fullName)}&background=00B050&color=fff`,
      phone: updated.phone || "",
      basicSalary: Number(updated.basicSalary) || 0,
      salaryGrade: updated.salaryGrade || "Grade 1",
      salaryType: "Monthly",
      createdAt: updated.createdAt.toISOString().split("T")[0],
    };
  }

  static async deleteEmployee(id: string, organizationId: string) {
    const deleted = await prisma.employees.delete({
      where: { id },
    });
    return { success: true, deletedEmployee: deleted };
  }
}
