import { PayrollService } from "@/server/services/payroll.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const payslips = await PayrollService.getEmployeePayslips(orgId, session.employeeId || "EMP-1042");
    const payslip = payslips.find((p) => p.id === id || p.employeeId === id) || payslips[0];
    if (!payslip) throw new NotFoundError("Payslip");

    return apiSuccess(payslip, "Payslip fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
