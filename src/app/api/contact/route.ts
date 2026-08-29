import { NextResponse } from "next/server";
import { ContactService } from "@/server/services/contact.service";
import { ContactMessageSchema } from "@/server/validators";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ContactMessageSchema.parse(body);

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    const message = await ContactService.createMessage({
      ...validated,
      ipAddress: clientIp,
    });

    return NextResponse.json(
      {
        success: true,
        data: message,
        message: "Thank you! Your message has been received. Our team will get back to you shortly.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;

    const result = await ContactService.getMessages({
      page,
      limit,
      search,
      status,
      category,
    });

    return NextResponse.json({
      success: true,
      data: result,
      items: result.items,
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
