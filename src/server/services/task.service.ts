import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError, ValidationError } from "../errors";
import { logAuditEvent } from "@/lib/audit-logger";
import { TaskPriority, TaskStatus, UserRole } from "@prisma/client";

export interface TaskItemData {
  id: string;
  organizationId: string;
  branchId?: string | null;
  departmentId?: string | null;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeAvatar: string | null;
  departmentName: string;
  branchName: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER";
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: string | null;
  startDate: string | null;
  completedAt: string | null;
  completionNotes: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

// In-Memory store for fast fallback & demo resilience
let tasksStore: TaskItemData[] = [
  {
    id: "task-001",
    organizationId: "org-1",
    branchId: "branch-1",
    departmentId: "dept-1",
    employeeId: "emp-1",
    employeeName: "Arif Chowdhury",
    employeeCode: "EMP-1042",
    employeeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    departmentName: "Engineering",
    branchName: "Main Branch",
    assignedById: "user-org-1",
    assignedByName: "Sarah Rahman",
    assignedByRole: "ORG_ADMIN",
    title: "Client Portal Security Audit",
    description: "Perform comprehensive automated vulnerability scanning and code audit for the customer login endpoints.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date().toISOString(),
    completedAt: null,
    completionNotes: null,
    attachmentUrl: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isOverdue: false,
  },
  {
    id: "task-002",
    organizationId: "org-1",
    branchId: "branch-1",
    departmentId: "dept-2",
    employeeId: "emp-2",
    employeeName: "Nusrat Jahan",
    employeeCode: "EMP-1043",
    employeeAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
    departmentName: "Operations",
    branchName: "Main Branch",
    assignedById: "user-mgr-1",
    assignedByName: "Tanvir Ahmed",
    assignedByRole: "MANAGER",
    title: "Monthly Inventory Reconciliation",
    description: "Reconcile warehouse inventory log against ERP physical stock counts for Q3 closing.",
    priority: "MEDIUM",
    status: "PENDING",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date().toISOString(),
    completedAt: null,
    completionNotes: null,
    attachmentUrl: null,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isOverdue: false,
  },
  {
    id: "task-003",
    organizationId: "org-1",
    branchId: "branch-1",
    departmentId: "dept-1",
    employeeId: "emp-3",
    employeeName: "Kazi Farhan",
    employeeCode: "EMP-1044",
    employeeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    departmentName: "Engineering",
    branchName: "Main Branch",
    assignedById: "user-org-1",
    assignedByName: "Sarah Rahman",
    assignedByRole: "ORG_ADMIN",
    title: "Update API Documentation & Postman Collections",
    description: "Ensure all newly introduced attendance and leave endpoints are fully documented in Postman Collection v2.",
    priority: "LOW",
    status: "COMPLETED",
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    completionNotes: "All 24 endpoints verified and collection shared in repository.",
    attachmentUrl: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isOverdue: false,
  },
  {
    id: "task-004",
    organizationId: "org-1",
    branchId: "branch-1",
    departmentId: "dept-2",
    employeeId: "emp-1",
    employeeName: "Arif Chowdhury",
    employeeCode: "EMP-1042",
    employeeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    departmentName: "Engineering",
    branchName: "Main Branch",
    assignedById: "user-mgr-1",
    assignedByName: "Tanvir Ahmed",
    assignedByRole: "MANAGER",
    title: "Urgent Server Patching & Kernel Update",
    description: "Apply critical security hotfixes to application load balancers and staging reverse proxy.",
    priority: "URGENT",
    status: "PENDING",
    dueDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Overdue
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    completionNotes: null,
    attachmentUrl: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isOverdue: true,
  }
];

export class TaskService {
  /**
   * Helper to check if a task is overdue
   */
  private static checkIsOverdue(dueDate: string | Date | null | undefined, status: string): boolean {
    if (!dueDate || status === "COMPLETED" || status === "CANCELLED") return false;
    const dueTime = new Date(dueDate).getTime();
    return Date.now() > dueTime;
  }

  /**
   * Get all tasks for an organization with flexible filtering & search
   */
  static async getTasks(
    organizationId: string,
    filters: {
      employeeId?: string;
      status?: string;
      priority?: string;
      branchId?: string;
      departmentId?: string;
      search?: string;
      managerId?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ tasks: TaskItemData[]; total: number }> {
    try {
      const where: any = {};
      if (organizationId && organizationId !== "all") {
        where.organizationId = organizationId;
      }

      if (filters.employeeId) {
        const idList = filters.employeeId.includes(",")
          ? filters.employeeId.split(",").map((s) => s.trim()).filter(Boolean)
          : [filters.employeeId.trim()];

        where.OR = [
          { employeeId: { in: idList } },
          { employees: { employeeCode: { in: idList } } },
          { employees: { id: { in: idList } } },
          { employees: { email: { in: idList } } },
        ];
      }

      if (filters.status && filters.status !== "ALL" && filters.status !== "All") {
        where.status = filters.status.toUpperCase() as TaskStatus;
      }

      if (filters.priority && filters.priority !== "ALL" && filters.priority !== "All") {
        where.priority = filters.priority.toUpperCase() as TaskPriority;
      }

      if (filters.branchId && filters.branchId !== "ALL" && filters.branchId !== "All") {
        where.branchId = filters.branchId;
      }

      if (filters.departmentId && filters.departmentId !== "ALL" && filters.departmentId !== "All") {
        where.departmentId = filters.departmentId;
      }

      if (filters.search) {
        const query = filters.search.trim().toLowerCase();
        where.AND = [
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { employees: { fullName: { contains: query, mode: "insensitive" } } },
              { employees: { employeeCode: { contains: query, mode: "insensitive" } } },
            ],
          },
        ];
      }

      const [dbTasks, total] = await Promise.all([
        prisma.tasks.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: {
            employees: {
              include: {
                departments: true,
                branches: true,
              },
            },
          },
        }),
        prisma.tasks.count({ where }),
      ]);

      if (dbTasks && dbTasks.length > 0) {
        const mapped: TaskItemData[] = dbTasks.map((t) => {
          const isOverdue = this.checkIsOverdue(t.dueDate, t.status);
          return {
            id: t.id,
            organizationId: t.organizationId,
            branchId: t.branchId || t.employees?.branchId || null,
            departmentId: t.departmentId || t.employees?.departmentId || null,
            employeeId: t.employees?.id || t.employeeId,
            employeeName: t.employees?.fullName || "Employee",
            employeeCode: t.employees?.employeeCode || "EMP-000",
            employeeAvatar: t.employees?.profilePicture || null,
            departmentName: t.employees?.departments?.name || "General",
            branchName: t.employees?.branches?.name || "Main Branch",
            assignedById: t.assignedById,
            assignedByName: t.assignedByName || "Admin",
            assignedByRole: (t.assignedByRole as any) || "ORG_ADMIN",
            title: t.title,
            description: t.description,
            priority: t.priority as any,
            status: t.status as any,
            dueDate: t.dueDate ? t.dueDate.toISOString() : null,
            startDate: t.startDate ? t.startDate.toISOString() : null,
            completedAt: t.completedAt ? t.completedAt.toISOString() : null,
            completionNotes: t.completionNotes,
            attachmentUrl: t.attachmentUrl,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            isOverdue,
          };
        });

        return { tasks: mapped, total };
      }
    } catch (err) {
      console.warn("[TaskService.getTasks] Database query fallback:", err);
    }

    // In-memory fallback
    let filtered = tasksStore.filter((t) => {
      if (organizationId && organizationId !== "all" && t.organizationId !== organizationId) {
        return false;
      }
      if (filters.employeeId && t.employeeId !== filters.employeeId && t.employeeCode !== filters.employeeId) {
        return false;
      }
      if (filters.status && filters.status !== "ALL" && filters.status !== "All" && t.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      if (filters.priority && filters.priority !== "ALL" && filters.priority !== "All" && t.priority.toLowerCase() !== filters.priority.toLowerCase()) {
        return false;
      }
      if (filters.branchId && filters.branchId !== "ALL" && filters.branchId !== "All" && t.branchId !== filters.branchId) {
        return false;
      }
      if (filters.departmentId && filters.departmentId !== "ALL" && filters.departmentId !== "All" && t.departmentId !== filters.departmentId) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || "").toLowerCase().includes(q);
        const matchesEmp = t.employeeName.toLowerCase().includes(q) || t.employeeCode.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesEmp) return false;
      }
      return true;
    });

    // Recalculate isOverdue
    filtered = filtered.map((t) => ({
      ...t,
      isOverdue: this.checkIsOverdue(t.dueDate, t.status),
    }));

    return { tasks: filtered, total: filtered.length };
  }

  /**
   * Get single task by ID
   */
  static async getTaskById(organizationId: string, taskId: string): Promise<TaskItemData> {
    try {
      const t = await prisma.tasks.findFirst({
        where: {
          id: taskId,
          ...(organizationId !== "all" ? { organizationId } : {}),
        },
        include: {
          employees: {
            include: {
              departments: true,
              branches: true,
            },
          },
        },
      });

      if (t) {
        return {
          id: t.id,
          organizationId: t.organizationId,
          branchId: t.branchId || t.employees?.branchId || null,
          departmentId: t.departmentId || t.employees?.departmentId || null,
          employeeId: t.employees?.id || t.employeeId,
          employeeName: t.employees?.fullName || "Employee",
          employeeCode: t.employees?.employeeCode || "EMP-000",
          employeeAvatar: t.employees?.profilePicture || null,
          departmentName: t.employees?.departments?.name || "General",
          branchName: t.employees?.branches?.name || "Main Branch",
          assignedById: t.assignedById,
          assignedByName: t.assignedByName || "Admin",
          assignedByRole: (t.assignedByRole as any) || "ORG_ADMIN",
          title: t.title,
          description: t.description,
          priority: t.priority as any,
          status: t.status as any,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          startDate: t.startDate ? t.startDate.toISOString() : null,
          completedAt: t.completedAt ? t.completedAt.toISOString() : null,
          completionNotes: t.completionNotes,
          attachmentUrl: t.attachmentUrl,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          isOverdue: this.checkIsOverdue(t.dueDate, t.status),
        };
      }
    } catch (err) {
      console.warn("[TaskService.getTaskById] Database fallback:", err);
    }

    const item = tasksStore.find((t) => t.id === taskId && (organizationId === "all" || t.organizationId === organizationId));
    if (!item) {
      throw new NotFoundError(`Task with ID '${taskId}' not found`);
    }
    return {
      ...item,
      isOverdue: this.checkIsOverdue(item.dueDate, item.status),
    };
  }

  /**
   * Create a new task assigned to an employee
   */
  static async createTask(data: {
    organizationId: string;
    employeeId: string;
    assignedById: string;
    assignedByName: string;
    assignedByRole: "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER";
    title: string;
    description?: string | null;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: string | null;
    startDate?: string | null;
    branchId?: string | null;
    departmentId?: string | null;
  }): Promise<TaskItemData> {
    if (!data.organizationId) {
      throw new ValidationError("Organization ID is required");
    }
    if (!data.employeeId) {
      throw new ValidationError("Target employee is required");
    }
    if (!data.title || data.title.trim().length < 2) {
      throw new ValidationError("Task title must be at least 2 characters");
    }

    const priorityVal = (data.priority || "MEDIUM").toUpperCase() as TaskPriority;
    const dueDateParsed = data.dueDate ? new Date(data.dueDate) : null;
    const startDateParsed = data.startDate ? new Date(data.startDate) : new Date();

    // Try finding the real employee from DB to attach accurate relations
    let emp: any = null;
    try {
      emp = await prisma.employees.findFirst({
        where: {
          OR: [
            { id: data.employeeId },
            { employeeCode: data.employeeId },
          ],
          ...(data.organizationId !== "all" ? { organizationId: data.organizationId } : {}),
        },
        include: {
          departments: true,
          branches: true,
        },
      });
    } catch (e) {
      console.warn("[TaskService.createTask] Employee lookup fallback:", e);
    }

    const newTaskId = `task-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const resolvedEmployeeId = emp?.id || data.employeeId;
    const resolvedEmployeeName = emp?.fullName || "Employee";
    const resolvedEmployeeCode = emp?.employeeCode || "EMP-1042";
    const resolvedEmployeeAvatar = emp?.profilePicture || null;
    const resolvedDeptName = emp?.departments?.name || "General";
    const resolvedBranchName = emp?.branches?.name || "Main Branch";
    const resolvedBranchId = data.branchId || emp?.branchId || null;
    const resolvedDeptId = data.departmentId || emp?.departmentId || null;

    try {
      const created = await prisma.tasks.create({
        data: {
          id: newTaskId,
          organizationId: data.organizationId,
          branchId: resolvedBranchId,
          departmentId: resolvedDeptId,
          employeeId: resolvedEmployeeId,
          assignedById: data.assignedById,
          assignedByName: data.assignedByName,
          assignedByRole: (data.assignedByRole as any) || "ORG_ADMIN",
          title: data.title.trim(),
          description: data.description?.trim() || null,
          priority: priorityVal,
          status: TaskStatus.PENDING,
          dueDate: dueDateParsed,
          startDate: startDateParsed,
        },
        include: {
          employees: {
            include: {
              departments: true,
              branches: true,
            },
          },
        },
      });

      // Try creating in-app notification for the employee
      try {
        await prisma.notifications.create({
          data: {
            id: `notif-${Date.now()}`,
            organizationId: data.organizationId,
            recipientType: "EMPLOYEE",
            recipientId: resolvedEmployeeId,
            type: "IN_APP",
            title: `New Task Assigned: ${data.title}`,
            message: `${data.assignedByName} (${data.assignedByRole}) assigned you a new task: "${data.title}". Due: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : "No deadline"}.`,
          },
        });
      } catch {}

      // Log audit
      await logAuditEvent({
        action: "TASK_CREATE",
        module: "Employees",
        userId: data.assignedById,
        userName: data.assignedByName,
        userRole: (data.assignedByRole as any) || "ORG_ADMIN",
        organizationId: data.organizationId,
        details: `Assigned task '${data.title}' to ${resolvedEmployeeName} (${priorityVal})`,
      });

      const isOverdue = this.checkIsOverdue(created.dueDate, created.status);
      const resultItem: TaskItemData = {
        id: created.id,
        organizationId: created.organizationId,
        branchId: created.branchId,
        departmentId: created.departmentId,
        employeeId: created.employees?.id || created.employeeId,
        employeeName: created.employees?.fullName || resolvedEmployeeName,
        employeeCode: created.employees?.employeeCode || resolvedEmployeeCode,
        employeeAvatar: created.employees?.profilePicture || resolvedEmployeeAvatar,
        departmentName: created.employees?.departments?.name || resolvedDeptName,
        branchName: created.employees?.branches?.name || resolvedBranchName,
        assignedById: created.assignedById,
        assignedByName: created.assignedByName || data.assignedByName,
        assignedByRole: (created.assignedByRole as any) || data.assignedByRole,
        title: created.title,
        description: created.description,
        priority: created.priority as any,
        status: created.status as any,
        dueDate: created.dueDate ? created.dueDate.toISOString() : null,
        startDate: created.startDate ? created.startDate.toISOString() : null,
        completedAt: null,
        completionNotes: null,
        attachmentUrl: null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        isOverdue,
      };

      // Also sync to in-memory store
      tasksStore.unshift(resultItem);
      return resultItem;
    } catch (err) {
      console.warn("[TaskService.createTask] Database create fallback:", err);
    }

    // Fallback store item
    const fallbackItem: TaskItemData = {
      id: newTaskId,
      organizationId: data.organizationId,
      branchId: resolvedBranchId,
      departmentId: resolvedDeptId,
      employeeId: resolvedEmployeeId,
      employeeName: resolvedEmployeeName,
      employeeCode: resolvedEmployeeCode,
      employeeAvatar: resolvedEmployeeAvatar,
      departmentName: resolvedDeptName,
      branchName: resolvedBranchName,
      assignedById: data.assignedById,
      assignedByName: data.assignedByName,
      assignedByRole: data.assignedByRole,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      priority: priorityVal as any,
      status: "PENDING",
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      startDate: startDateParsed.toISOString(),
      completedAt: null,
      completionNotes: null,
      attachmentUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOverdue: this.checkIsOverdue(data.dueDate, "PENDING"),
    };

    tasksStore.unshift(fallbackItem);
    return fallbackItem;
  }

  /**
   * Update task details, status, or completion notes
   */
  static async updateTask(
    organizationId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string | null;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
      dueDate?: string | null;
      startDate?: string | null;
      completionNotes?: string | null;
      attachmentUrl?: string | null;
      employeeId?: string;
    },
    userContext?: {
      userId?: string;
      role?: string;
      userName?: string;
    }
  ): Promise<TaskItemData> {
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null;
    if (data.priority) updatePayload.priority = data.priority.toUpperCase() as TaskPriority;
    if (data.status) {
      updatePayload.status = data.status.toUpperCase() as TaskStatus;
      if (updatePayload.status === "COMPLETED") {
        updatePayload.completedAt = new Date();
      } else if (updatePayload.status === "PENDING" || updatePayload.status === "IN_PROGRESS") {
        updatePayload.completedAt = null;
      }
    }
    if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.completionNotes !== undefined) updatePayload.completionNotes = data.completionNotes;
    if (data.attachmentUrl !== undefined) updatePayload.attachmentUrl = data.attachmentUrl;
    if (data.employeeId !== undefined) updatePayload.employeeId = data.employeeId;

    try {
      const updated = await prisma.tasks.update({
        where: { id: taskId },
        data: updatePayload,
        include: {
          employees: {
            include: {
              departments: true,
              branches: true,
            },
          },
        },
      });

      if (updated) {
        await logAuditEvent({
          action: "TASK_UPDATE",
          module: "Employees",
          userId: userContext?.userId || "user",
          userName: userContext?.userName || "Admin",
          userRole: (userContext?.role as any) || "ORG_ADMIN",
          organizationId,
          details: `Updated task '${taskId}' status or notes`,
        });

        const isOverdue = this.checkIsOverdue(updated.dueDate, updated.status);
        const resItem: TaskItemData = {
          id: updated.id,
          organizationId: updated.organizationId,
          branchId: updated.branchId || updated.employees?.branchId || null,
          departmentId: updated.departmentId || updated.employees?.departmentId || null,
          employeeId: updated.employees?.id || updated.employeeId,
          employeeName: updated.employees?.fullName || "Employee",
          employeeCode: updated.employees?.employeeCode || "EMP-000",
          employeeAvatar: updated.employees?.profilePicture || null,
          departmentName: updated.employees?.departments?.name || "General",
          branchName: updated.employees?.branches?.name || "Main Branch",
          assignedById: updated.assignedById,
          assignedByName: updated.assignedByName || "Admin",
          assignedByRole: (updated.assignedByRole as any) || "ORG_ADMIN",
          title: updated.title,
          description: updated.description,
          priority: updated.priority as any,
          status: updated.status as any,
          dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
          startDate: updated.startDate ? updated.startDate.toISOString() : null,
          completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
          completionNotes: updated.completionNotes,
          attachmentUrl: updated.attachmentUrl,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          isOverdue,
        };

        // Sync in-memory store
        const storeIdx = tasksStore.findIndex((t) => t.id === taskId);
        if (storeIdx !== -1) {
          tasksStore[storeIdx] = { ...tasksStore[storeIdx], ...resItem };
        }

        return resItem;
      }
    } catch (err) {
      console.warn("[TaskService.updateTask] Database update fallback:", err);
    }

    // In-memory fallback
    const idx = tasksStore.findIndex((t) => t.id === taskId && (organizationId === "all" || t.organizationId === organizationId));
    if (idx === -1) {
      throw new NotFoundError(`Task with ID '${taskId}' not found`);
    }

    const current = tasksStore[idx];
    const newStatus = data.status ? (data.status.toUpperCase() as any) : current.status;
    const completedAt = newStatus === "COMPLETED" ? new Date().toISOString() : newStatus === "PENDING" || newStatus === "IN_PROGRESS" ? null : current.completedAt;

    const updatedMem: TaskItemData = {
      ...current,
      title: data.title !== undefined ? data.title.trim() : current.title,
      description: data.description !== undefined ? data.description?.trim() || null : current.description,
      priority: data.priority ? (data.priority.toUpperCase() as any) : current.priority,
      status: newStatus,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate).toISOString() : null) : current.dueDate,
      startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate).toISOString() : null) : current.startDate,
      completionNotes: data.completionNotes !== undefined ? data.completionNotes : current.completionNotes,
      attachmentUrl: data.attachmentUrl !== undefined ? data.attachmentUrl : current.attachmentUrl,
      completedAt,
      updatedAt: new Date().toISOString(),
      isOverdue: this.checkIsOverdue(data.dueDate !== undefined ? data.dueDate : current.dueDate, newStatus),
    };

    tasksStore[idx] = updatedMem;
    return updatedMem;
  }

  /**
   * Delete task
   */
  static async deleteTask(
    organizationId: string,
    taskId: string,
    userContext?: { userId?: string; role?: string }
  ): Promise<boolean> {
    try {
      await prisma.tasks.deleteMany({
        where: {
          id: taskId,
          ...(organizationId !== "all" ? { organizationId } : {}),
        },
      });

      await logAuditEvent({
        action: "TASK_DELETE",
        module: "Employees",
        userId: userContext?.userId || "user",
        userRole: (userContext?.role as any) || "ORG_ADMIN",
        organizationId,
        details: `Deleted task '${taskId}'`,
      });
    } catch (err) {
      console.warn("[TaskService.deleteTask] Database delete fallback:", err);
    }

    const idx = tasksStore.findIndex((t) => t.id === taskId && (organizationId === "all" || t.organizationId === organizationId));
    if (idx !== -1) {
      tasksStore.splice(idx, 1);
    }
    return true;
  }

  /**
   * Calculate aggregated task statistics for dashboards
   */
  static async getTaskStats(organizationId: string, filters: { employeeId?: string; managerId?: string } = {}): Promise<TaskStats> {
    const { tasks } = await this.getTasks(organizationId, filters);

    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let cancelled = 0;
    let overdue = 0;

    for (const t of tasks) {
      if (t.status === "PENDING") pending++;
      else if (t.status === "IN_PROGRESS") inProgress++;
      else if (t.status === "COMPLETED") completed++;
      else if (t.status === "CANCELLED") cancelled++;

      if (t.isOverdue) overdue++;
    }

    return {
      total: tasks.length,
      pending,
      inProgress,
      completed,
      cancelled,
      overdue,
    };
  }
}
