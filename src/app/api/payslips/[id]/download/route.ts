import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireAuth(request);

    const downloadUrl = `https://s3.ap-southeast-1.amazonaws.com/vertex-tenant-vault/payslips/${id}.pdf?sig=${Date.now()}`;
    return apiSuccess({ id, downloadUrl, fileName: `Payslip_${id}.pdf` }, "Payslip download link generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
