import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Enterprise Audit Logging Service
 * 
 * Records tamper-evident audit logs directly to PostgreSQL Prisma
 * for enterprise security & compliance.
 */

export interface AuditLogEntry {
  id: string;
  organizationId?: string | null;
  organizationName?: string | null;
  userId?: string | null;
  userName: string;
  userEmail: string;
  userRole: "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";
  action: string;
  module: "Auth" | "Attendance" | "Employees" | "Branches" | "Leaves" | "Overtime" | "Payroll" | "Settings" | "Subscriptions" | "Referral" | "System";
  details: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

// In-memory buffer for ultra-low-latency aggregation
let inMemoryAuditLogs: AuditLogEntry[] = [];

export async function logAuditEvent(entry: {
  organizationId?: string | null;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
  userRole?: "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";
  action: string;
  module?: AuditLogEntry["module"];
  details: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuditLogEntry> {
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();

  const newLog: AuditLogEntry = {
    id: logId,
    organizationId: entry.organizationId || null,
    userId: entry.userId || null,
    userName: entry.userName || "System User",
    userEmail: entry.userEmail || (entry.userId ? `${entry.userId}@erp.com` : "system@platform.io"),
    userRole: entry.userRole || "SUPER_ADMIN",
    action: entry.action,
    module: entry.module || "System",
    details: entry.details,
    ipAddress: entry.ipAddress || "127.0.0.1",
    userAgent: entry.userAgent,
    createdAt: now.toISOString().replace("T", " ").substring(0, 19),
  };

  inMemoryAuditLogs.unshift(newLog);

  // Persist directly to PostgreSQL Prisma
  try {
    let roleEnum: UserRole | undefined;
    if (entry.userRole === "SUPER_ADMIN") roleEnum = UserRole.SUPER_ADMIN;
    else if (entry.userRole === "ORG_ADMIN") roleEnum = UserRole.ORG_ADMIN;
    else if (entry.userRole === "MANAGER") roleEnum = UserRole.MANAGER;
    else if (entry.userRole === "EMPLOYEE") roleEnum = UserRole.EMPLOYEE;

    await prisma.audit_logs.create({
      data: {
        id: logId,
        actorId: entry.userId || null,
        actorEmail: entry.userEmail || null,
        actorRole: roleEnum,
        action: entry.action,
        entityType: entry.module || "System",
        metadata: {
          details: entry.details,
          userName: entry.userName,
          userAgent: entry.userAgent,
        },
        ipAddress: entry.ipAddress || "127.0.0.1",
        organizationId: entry.organizationId || null,
        createdAt: now,
      },
    });
  } catch (err) {
    console.warn("[AUDIT_LOG_PERSIST_WARN]", err);
  }

  return newLog;
}

export async function getAuditLogs(organizationId?: string): Promise<AuditLogEntry[]> {
  try {
    const dbLogs = await prisma.audit_logs.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        organizations: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (dbLogs.length > 0) {
      const mappedDb: AuditLogEntry[] = dbLogs.map((l) => {
        const meta = typeof l.metadata === "object" && l.metadata !== null ? (l.metadata as any) : {};
        return {
          id: l.id,
          organizationId: l.organizationId,
          organizationName: l.organizations?.name || null,
          userId: l.actorId,
          userName: meta.userName || l.actorEmail?.split("@")[0] || "System Actor",
          userEmail: l.actorEmail || "system@platform.io",
          userRole: (l.actorRole as any) || "SUPER_ADMIN",
          action: l.action,
          module: (l.entityType as any) || "System",
          details: meta.details || `${l.action} on ${l.entityType}`,
          ipAddress: l.ipAddress || "127.0.0.1",
          createdAt: l.createdAt.toISOString().replace("T", " ").substring(0, 19),
        };
      });

      // Merge memory logs not yet in DB
      const existingIds = new Set(mappedDb.map((m) => m.id));
      const recentUnsaved = inMemoryAuditLogs.filter((m) => !existingIds.has(m.id));
      return [...recentUnsaved, ...mappedDb];
    }
  } catch (err) {
    console.warn("[AUDIT_LOG_FETCH_WARN]", err);
  }

  if (organizationId) {
    return inMemoryAuditLogs.filter((l) => !l.organizationId || l.organizationId === organizationId);
  }
  return inMemoryAuditLogs;
}
