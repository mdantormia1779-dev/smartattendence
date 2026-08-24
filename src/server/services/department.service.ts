import { ConflictError, NotFoundError } from "../errors";

export interface DepartmentData {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  headOfDept?: string;
  totalMembers: number;
  createdAt: string;
}

let departmentsStore: DepartmentData[] = [
  { id: "dept-1", organizationId: "org-1", name: "Information Technology", code: "IT", headOfDept: "Tanvir Ahmed", totalMembers: 112, createdAt: "2026-01-15" },
  { id: "dept-2", organizationId: "org-1", name: "Accounts & Finance", code: "ACC", headOfDept: "Ariful Islam", totalMembers: 34, createdAt: "2026-01-15" },
  { id: "dept-3", organizationId: "org-1", name: "Human Resources", code: "HR", headOfDept: "Nusrat Jahan", totalMembers: 22, createdAt: "2026-01-15" },
  { id: "dept-4", organizationId: "org-1", name: "Marketing & Growth", code: "MKT", headOfDept: "Zubair Rahman", totalMembers: 45, createdAt: "2026-02-01" },
];

export class DepartmentService {
  static async getDepartments(organizationId: string) {
    return departmentsStore.filter((d) => d.organizationId === organizationId);
  }

  static async getDepartmentById(id: string, organizationId: string) {
    const dept = departmentsStore.find((d) => d.id === id && d.organizationId === organizationId);
    if (!dept) throw new NotFoundError("Department");
    return dept;
  }

  static async createDepartment(data: {
    organizationId: string;
    name: string;
    code?: string;
    headOfDept?: string;
  }) {
    const existing = departmentsStore.find(
      (d) => d.organizationId === data.organizationId && d.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existing) {
      throw new ConflictError(`Department with name '${data.name}' already exists`);
    }

    const newDept: DepartmentData = {
      id: `dept-${Date.now()}`,
      organizationId: data.organizationId,
      name: data.name,
      code: data.code,
      headOfDept: data.headOfDept,
      totalMembers: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    departmentsStore.push(newDept);
    return newDept;
  }

  static async updateDepartment(id: string, organizationId: string, updates: Partial<DepartmentData>) {
    const dept = await this.getDepartmentById(id, organizationId);
    Object.assign(dept, updates);
    return dept;
  }

  static async deleteDepartment(id: string, organizationId: string) {
    const dept = await this.getDepartmentById(id, organizationId);
    departmentsStore = departmentsStore.filter((d) => d.id !== id);
    return { success: true, deletedDepartment: dept };
  }
}
