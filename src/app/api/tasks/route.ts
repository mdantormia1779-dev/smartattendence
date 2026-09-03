import { NextRequest } from "next/server";
import { TaskService } from "@/server/services/task.service";
import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError, ValidationError } from "@/server/errors";
import { CreateTaskSchema, TaskQuerySchema } from "@/server/validators";

export async function GET(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const orgId = session.role === "EMPLOYEE"
      ? (session.organizationId || "all")
      : (session.organizationId || "all");

    const { searchParams } = new URL(request.url);
    const query = TaskQuerySchema.parse({
      employeeId: searchParams.get("employeeId") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      branchId: searchParams.get("branchId") || undefined,
      departmentId: searchParams.get("departmentId") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    // If logged in user is EMPLOYEE, match across all their identifiers (ID, code, email)
    let targetEmployeeId = query.employeeId;
    if (session.role === "EMPLOYEE") {
      const identifiers = Array.from(
        new Set([session.employeeId, session.userId, session.email].filter(Boolean))
      );
      targetEmployeeId = identifiers.join(",");
    }

    const result = await TaskService.getTasks(orgId, {
      ...query,
      employeeId: targetEmployeeId,
      managerId: session.role === "MANAGER" ? session.userId : undefined,
    });

    return apiSuccess(result.tasks, "Tasks retrieved successfully", { total: result.total });
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = CreateTaskSchema.parse(body);

    const task = await TaskService.createTask({
      organizationId: orgId,
      employeeId: validated.employeeId,
      assignedById: session.userId,
      assignedByName: session.fullName || (session.role === "ORG_ADMIN" ? "Organization Admin" : "Manager"),
      assignedByRole: session.role as any,
      title: validated.title,
      description: validated.description,
      priority: validated.priority,
      dueDate: validated.dueDate,
      startDate: validated.startDate,
      branchId: validated.branchId,
      departmentId: validated.departmentId,
    });

    return apiSuccess(task, "Task assigned successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
