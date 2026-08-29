import { NextResponse } from "next/server";
import { ContactService } from "@/server/services/contact.service";
import { UpdateContactStatusSchema } from "@/server/validators";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const { id } = await params;

    const message = await ContactService.getMessageById(id);
    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateContactStatusSchema.parse(body);

    const updated = await ContactService.updateStatus(
      id,
      validated.status,
      validated.adminNotes
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Contact inquiry status updated successfully",
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const { id } = await params;

    const result = await ContactService.deleteMessage(id);
    return NextResponse.json({
      success: true,
      data: result,
      message: "Contact inquiry deleted successfully",
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
