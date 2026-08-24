import { NextResponse } from "next/server";
import { BranchService } from "@/server/services/branch.service";
import { CreateBranchSchema } from "@/server/validators";
import { requireAuth, requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const branches = await BranchService.getBranches(orgId);
    return NextResponse.json({ success: true, data: branches });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = CreateBranchSchema.parse(body);

    const newBranch = await BranchService.createBranch({
      organizationId: orgId,
      ...validated,
    });

    return NextResponse.json({ success: true, data: newBranch }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
