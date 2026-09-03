import { NextRequest } from "next/server";
import { TaskService } from "@/server/services/task.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, ForbiddenError } from "@/server/errors";
import { UpdateTaskSchema } from "@/server/validators";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const task = await TaskService.getTaskById(orgId, id);
    return apiSuccess(task, "Task fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = UpdateTaskSchema.parse(body);

    const updated = await TaskService.updateTask(
      orgId,
      id,
      validated,
      {
        userId: session.userId,
        role: session.role,
        userName: session.fullName,
      }
    );

    return apiSuccess(updated, "Task updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);

    // Employees cannot delete tasks
    if (session.role === "EMPLOYEE") {
      throw new ForbiddenError("Employees are not authorized to delete tasks");
    }

    const orgId = session.organizationId || "org-1";
    await TaskService.deleteTask(orgId, id, {
      userId: session.userId,
      role: session.role,
    });

    return apiSuccess({ deleted: true }, "Task deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
