import { NextRequest } from "next/server";
import { TaskService } from "@/server/services/task.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || (session.role === "EMPLOYEE" ? (session.employeeId || session.userId) : undefined);
    const managerId = session.role === "MANAGER" ? session.userId : undefined;

    const stats = await TaskService.getTaskStats(orgId, {
      employeeId,
      managerId,
    });

    return apiSuccess(stats, "Task statistics retrieved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
