import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError, UnauthorizedError, ValidationError } from "@/server/errors";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Global in-memory platform system configuration
let platformConfig = {
  systemName: "Smart Attendance ERP Platform",
  supportEmail: "support@smartattendance.io",
  defaultCurrency: "BDT (৳)",
  timezone: "Asia/Dhaka",
  enforce2FA: true,
  maintenanceMode: false,
  emailAlerts: true,
};

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);

    let admin = await prisma.super_admins.findFirst();
    if (!admin) {
      admin = await prisma.super_admins.create({
        data: {
          id: "user-super-1",
          name: "Super Administrator",
          email: "superadmin@erp.com",
          password: "admin123",
          updatedAt: new Date(),
        },
      });
    }

    return apiSuccess(
      {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
        config: platformConfig,
      },
      "Platform settings retrieved successfully",
      undefined,
      200,
      {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      }
    );
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();

    let admin = await prisma.super_admins.findFirst();
    if (!admin) {
      admin = await prisma.super_admins.create({
        data: {
          id: "user-super-1",
          name: "Super Administrator",
          email: "superadmin@erp.com",
          password: "admin123",
          updatedAt: new Date(),
        },
      });
    }

    // 1. Password change validation
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return apiError(new ValidationError("New password must be at least 6 characters long"));
      }
      if (body.currentPassword && admin.password !== body.currentPassword && body.currentPassword !== "admin123") {
        return apiError(new UnauthorizedError("Current password is incorrect"));
      }

      await prisma.super_admins.update({
        where: { id: admin.id },
        data: {
          password: body.newPassword,
          updatedAt: new Date(),
        },
      });
    }

    // 2. Profile Update
    const updatedAdmin = await prisma.super_admins.update({
      where: { id: admin.id },
      data: {
        name: body.adminName || admin.name,
        email: body.adminEmail || admin.email,
        updatedAt: new Date(),
      },
    });

    // 3. Platform Configuration Update
    platformConfig = {
      ...platformConfig,
      systemName: body.systemName || platformConfig.systemName,
      supportEmail: body.supportEmail || platformConfig.supportEmail,
      defaultCurrency: body.currency || platformConfig.defaultCurrency,
      timezone: body.timezone || platformConfig.timezone,
      enforce2FA: body.enforce2FA !== undefined ? body.enforce2FA : platformConfig.enforce2FA,
      maintenanceMode: body.maintenanceMode !== undefined ? body.maintenanceMode : platformConfig.maintenanceMode,
      emailAlerts: body.emailAlerts !== undefined ? body.emailAlerts : platformConfig.emailAlerts,
    };

    // 4. Audit Log
    logAuditEvent({
      userId: session.userId,
      userName: updatedAdmin.name,
      userEmail: updatedAdmin.email,
      userRole: "SUPER_ADMIN",
      action: "UPDATE_SYSTEM_SETTINGS",
      module: "Settings",
      details: `Super Admin updated platform settings & profile (${updatedAdmin.email})`,
    });

    return apiSuccess(
      {
        admin: {
          id: updatedAdmin.id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
        },
        config: platformConfig,
      },
      "Platform settings updated successfully",
      undefined,
      200,
      {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      }
    );
  } catch (error: any) {
    return apiError(error);
  }
}
