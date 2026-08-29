import { prisma } from "@/lib/prisma";
import { NotFoundError } from "../errors";
import { ContactCategory, ContactMessageStatus } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit-logger";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  category?: "GENERAL" | "SALES" | "ENTERPRISE" | "SUPPORT" | "PARTNERSHIP" | "BILLING";
  subject: string;
  message: string;
  ipAddress?: string | null;
}

export class ContactService {
  /**
   * Submit a new public contact inquiry
   */
  static async createMessage(data: CreateContactMessageInput) {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const categoryEnum = (data.category as ContactCategory) || ContactCategory.GENERAL;

    const message = await prisma.contact_messages.create({
      data: {
        id,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        companyName: data.companyName?.trim() || null,
        category: categoryEnum,
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: ContactMessageStatus.UNREAD,
        ipAddress: data.ipAddress || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Record Audit
    logAuditEvent({
      userId: "ANONYMOUS",
      userName: data.name,
      userRole: "EMPLOYEE",
      action: "CONTACT_INQUIRY_SUBMITTED",
      module: "System",
      details: `New inquiry submitted by ${data.name} (${data.email}) - Subject: ${data.subject}`,
      ipAddress: data.ipAddress || undefined,
    });

    return message;
  }

  /**
   * Super Admin - Get list of contact messages with filters and pagination
   */
  static async getMessages(query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.max(1, query?.limit || 50);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.status && query.status !== "ALL") {
      where.status = query.status as ContactMessageStatus;
    }

    if (query?.category && query.category !== "ALL") {
      where.category = query.category as ContactCategory;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { subject: { contains: query.search, mode: "insensitive" } },
        { companyName: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [total, items, stats] = await Promise.all([
      prisma.contact_messages.count({ where }),
      prisma.contact_messages.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.getStats(),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats,
    };
  }

  /**
   * Get single message and mark as READ if previously UNREAD
   */
  static async getMessageById(id: string) {
    const message = await prisma.contact_messages.findUnique({
      where: { id },
    });

    if (!message) throw new NotFoundError("Contact Inquiry");

    if (message.status === ContactMessageStatus.UNREAD) {
      return await prisma.contact_messages.update({
        where: { id },
        data: { status: ContactMessageStatus.READ },
      });
    }

    return message;
  }

  /**
   * Super Admin - Update status and internal notes
   */
  static async updateStatus(
    id: string,
    status: ContactMessageStatus,
    adminNotes?: string | null
  ) {
    const exists = await prisma.contact_messages.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Contact Inquiry");

    return await prisma.contact_messages.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined ? { adminNotes: adminNotes?.trim() || null } : {}),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Super Admin - Delete inquiry
   */
  static async deleteMessage(id: string) {
    const exists = await prisma.contact_messages.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Contact Inquiry");

    await prisma.contact_messages.delete({ where: { id } });
    return { success: true, id };
  }

  /**
   * Get inquiry metrics
   */
  static async getStats() {
    const [total, unread, inProgress, resolved] = await Promise.all([
      prisma.contact_messages.count(),
      prisma.contact_messages.count({ where: { status: ContactMessageStatus.UNREAD } }),
      prisma.contact_messages.count({ where: { status: ContactMessageStatus.IN_PROGRESS } }),
      prisma.contact_messages.count({ where: { status: ContactMessageStatus.RESOLVED } }),
    ]);

    return {
      total,
      unread,
      inProgress,
      resolved,
    };
  }
}
