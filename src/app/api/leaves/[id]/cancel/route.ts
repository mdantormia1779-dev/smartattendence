import { prisma } from "@/lib/prisma";
import { LeaveStatus } from "@prisma/client";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError, ForbiddenError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.role === "SUPER_ADMIN" ? "all" : (session.organizationId || "");

    const leave = await prisma.leaves.findUnique({
      where: { id },
      include: { employees: true },
    });

    if (!leave) throw new NotFoundError("Leave Request");

    if (orgId !== "all" && leave.employees.organizationId !== orgId) {
      throw new ForbiddenError("Not authorized to cancel leave for another organization");
    }

    const updated = await prisma.leaves.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        orgNote: "Cancelled by user",
        updatedAt: new Date(),
      },
    });

    return apiSuccess(updated, "Leave request cancelled successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
