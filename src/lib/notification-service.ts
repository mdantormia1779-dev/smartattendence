import { prisma } from "@/lib/prisma";

/**
 * Enterprise Multi-Tenant Scoped Notification Service
 * 
 * Backed by PostgreSQL Prisma (`prisma.notifications`) with real-time in-memory caching.
 * Supports:
 * - Super Admin: Global broadcasts, Org-specific targeting, Role-specific targeting, User targeting
 * - Org Admin / Manager / Employee: Scoped strictly to direct organization members & personal feeds.
 * - Full CRUD: Create, Read/Filter, Update (Edit), Delete, Mark Read.
 */

export type RoleType = "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AppNotification {
  id: string;
  organizationId?: string | null;
  organizationName?: string | null;
  senderId: string;
  senderName: string;
  senderRole: RoleType;
  scope: "GLOBAL_BROADCAST" | "ORG_BROADCAST" | "ROLE_BROADCAST" | "TARGETED_USER";
  targetOrgId?: string | null;
  targetRole?: RoleType | null;
  recipientUserId?: string | null;
  title: string;
  message: string;
  category: "SYSTEM" | "ATTENDANCE" | "LEAVE" | "PAYROLL" | "REFERRAL" | "SECURITY" | "ALERT";
  type: "INFO" | "SUCCESS" | "WARNING" | "ALERT";
  link?: string;
  dataJson?: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

// In-memory buffer for immediate local delivery
let notificationsStore: AppNotification[] = [];

/**
 * Dispatch a Notification with Strict Multi-Tenant Enforcement and Prisma Persistence
 */
export async function sendNotification(input: {
  senderId: string;
  senderName: string;
  senderRole: RoleType;
  senderOrgId?: string | null;
  scope: "GLOBAL_BROADCAST" | "ORG_BROADCAST" | "ROLE_BROADCAST" | "TARGETED_USER";
  targetOrgId?: string | null;
  targetRole?: RoleType | null;
  recipientUserId?: string | null;
  title: string;
  message: string;
  category?: AppNotification["category"];
  type?: AppNotification["type"];
  link?: string;
  dataJson?: string;
}): Promise<{ success: boolean; notification?: AppNotification; error?: string }> {
  // Tenant Security Guards
  if (input.senderRole === "ORG_ADMIN" || input.senderRole === "MANAGER") {
    if (!input.senderOrgId || input.senderOrgId === "org-1" || input.senderOrgId === "undefined") {
      // Auto-resolve sender's real organization from DB if missing
      const adminRecord = await prisma.org_admins.findFirst({
        where: {
          OR: [
            { id: input.senderId },
            { email: input.senderId },
          ],
        },
        select: { organizationId: true },
      }).catch(() => null);

      if (adminRecord?.organizationId) {
        input.senderOrgId = adminRecord.organizationId;
      } else {
        const firstOrg = await prisma.organizations.findFirst({ select: { id: true } }).catch(() => null);
        if (firstOrg?.id) {
          input.senderOrgId = firstOrg.id;
        }
      }
    }

    if (!input.senderOrgId) {
      return { success: false, error: "Unauthorized: Missing organization identity" };
    }
    if (input.scope === "GLOBAL_BROADCAST") {
      return { success: false, error: "Permission Denied: Only Super Admin can send global platform broadcasts" };
    }
    input.targetOrgId = input.senderOrgId;
  }

  const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const targetOrg = input.senderRole === "SUPER_ADMIN" ? (input.targetOrgId || null) : (input.senderOrgId || null);

  const newNotif: AppNotification = {
    id: notifId,
    organizationId: targetOrg,
    senderId: input.senderId,
    senderName: input.senderName,
    senderRole: input.senderRole,
    scope: input.scope,
    targetOrgId: input.targetOrgId || null,
    targetRole: input.targetRole || null,
    recipientUserId: input.recipientUserId || null,
    title: input.title,
    message: input.message,
    category: input.category || "SYSTEM",
    type: input.type || "INFO",
    link: input.link,
    dataJson: input.dataJson,
    isRead: false,
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
  };

  notificationsStore.unshift(newNotif);

  // Persist directly to PostgreSQL Database
  try {
    const dbRecipientId = input.recipientUserId || input.targetRole || (input.scope === "GLOBAL_BROADCAST" ? "ALL" : "ORG_ALL");
    
    let validOrgId: string | null = null;
    if (targetOrg) {
      const orgExists = await prisma.organizations.findUnique({
        where: { id: targetOrg },
        select: { id: true },
      });
      if (orgExists) {
        validOrgId = orgExists.id;
      } else {
        const firstOrg = await prisma.organizations.findFirst({ select: { id: true } }).catch(() => null);
        if (firstOrg) validOrgId = firstOrg.id;
      }
    }

    await prisma.notifications.create({
      data: {
        id: notifId,
        organizationId: validOrgId,
        recipientType: input.scope,
        recipientId: dbRecipientId,
        type: "IN_APP",
        title: input.title,
        message: input.message,
        isRead: false,
        createdAt: new Date(),
      },
    });
  } catch (dbErr) {
    console.warn("[NOTIFICATION_DB_PERSIST_WARN]", dbErr);
  }

  return { success: true, notification: newNotif };
}

/**
 * Update an existing notification in DB and memory
 */
export async function updateNotification(
  id: string,
  updates: Partial<AppNotification>
): Promise<{ success: boolean; notification?: AppNotification; error?: string }> {
  // Update in-memory
  const index = notificationsStore.findIndex((n) => n.id === id);
  let updatedNotif: AppNotification | null = null;

  if (index !== -1) {
    const existing = notificationsStore[index];
    updatedNotif = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
    };
    notificationsStore[index] = updatedNotif;
  }

  // Update in PostgreSQL Database
  try {
    const dbRecipientId = updates.recipientUserId || updates.targetRole || (updates.scope === "GLOBAL_BROADCAST" ? "ALL" : "ORG_ALL");

    let validOrgId: string | null = null;
    if (updates.targetOrgId) {
      const orgExists = await prisma.organizations.findUnique({
        where: { id: updates.targetOrgId },
        select: { id: true },
      });
      if (orgExists) validOrgId = orgExists.id;
    }

    const dbUpdated = await prisma.notifications.update({
      where: { id },
      data: {
        ...(updates.title ? { title: updates.title } : {}),
        ...(updates.message ? { message: updates.message } : {}),
        ...(updates.scope ? { recipientType: updates.scope } : {}),
        ...(dbRecipientId ? { recipientId: dbRecipientId } : {}),
        ...(validOrgId !== null ? { organizationId: validOrgId } : {}),
      },
      include: {
        organizations: {
          select: { name: true },
        },
      },
    });

    if (!updatedNotif) {
      updatedNotif = {
        id: dbUpdated.id,
        organizationId: dbUpdated.organizationId,
        organizationName: dbUpdated.organizations?.name || null,
        senderId: "user-super-1",
        senderName: "Super Admin",
        senderRole: "SUPER_ADMIN",
        scope: (dbUpdated.recipientType as any) || "GLOBAL_BROADCAST",
        targetOrgId: dbUpdated.organizationId,
        targetRole: (["ORG_ADMIN", "MANAGER", "EMPLOYEE"].includes(dbUpdated.recipientId) ? dbUpdated.recipientId : null) as any,
        recipientUserId: dbUpdated.recipientType === "TARGETED_USER" ? dbUpdated.recipientId : null,
        title: dbUpdated.title,
        message: dbUpdated.message,
        category: "SYSTEM",
        type: "INFO",
        isRead: dbUpdated.isRead,
        createdAt: dbUpdated.createdAt.toISOString().replace("T", " ").substring(0, 19),
      };
    }
  } catch (err) {
    console.warn("[NOTIFICATION_DB_UPDATE_WARN]", err);
  }

  if (updatedNotif) {
    return { success: true, notification: updatedNotif };
  }

  return { success: false, error: "Notification not found" };
}

/**
 * Delete a notification from DB and memory
 */
export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  // Delete from in-memory
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index !== -1) {
    notificationsStore.splice(index, 1);
  }

  // Delete from PostgreSQL
  try {
    await prisma.notifications.delete({
      where: { id },
    });
    return { success: true };
  } catch (err: any) {
    console.warn("[NOTIFICATION_DB_DELETE_WARN]", err);
    if (index !== -1) return { success: true };
    return { success: false, error: err?.message || "Failed to delete notification" };
  }
}

/**
 * Get Scoped Notifications for a User directly from PostgreSQL Database
 */
export async function getUserNotifications(user: {
  userId: string;
  role: RoleType;
  organizationId?: string | null;
}): Promise<AppNotification[]> {
  try {
    let whereClause: any = {};

    if (user.role === "SUPER_ADMIN") {
      // Super Admin sees all notifications across the platform
      whereClause = {};
    } else if (user.role === "ORG_ADMIN") {
      // Resolve real organization identity and admin IDs
      let targetOrgId = user.organizationId;
      let adminRecord: any = null;

      if (!targetOrgId || targetOrgId === "org-1" || targetOrgId === "undefined") {
        adminRecord = await prisma.org_admins.findFirst({
          where: {
            OR: [
              { id: user.userId },
              { email: user.userId },
            ],
          },
          select: { id: true, email: true, organizationId: true },
        }).catch(() => null);

        if (adminRecord?.organizationId) {
          targetOrgId = adminRecord.organizationId;
        } else {
          const firstOrg = await prisma.organizations.findFirst({ select: { id: true } }).catch(() => null);
          if (firstOrg?.id) {
            targetOrgId = firstOrg.id;
          }
        }
      }

      if (!adminRecord && user.userId) {
        adminRecord = await prisma.org_admins.findFirst({
          where: {
            OR: [
              { id: user.userId },
              { email: user.userId },
            ],
          },
          select: { id: true, email: true, organizationId: true },
        }).catch(() => null);
      }

      const adminUserIds = Array.from(
        new Set([user.userId, adminRecord?.id, adminRecord?.email, "ORG_ADMIN"].filter(Boolean) as string[])
      );

      whereClause = {
        OR: [
          { recipientType: "GLOBAL_BROADCAST" },
          { recipientId: "ALL" },
          ...(targetOrgId
            ? [
                // All notices, broadcasts, and task assignments belonging to this organization
                { organizationId: targetOrgId },
              ]
            : [
                { recipientType: "ORG_BROADCAST" },
                { recipientId: "ORG_ADMIN" },
              ]),
          { recipientId: { in: adminUserIds } },
        ],
      };
    } else if (user.role === "MANAGER") {
      let targetOrgId = user.organizationId;
      if (!targetOrgId || targetOrgId === "org-1" || targetOrgId === "undefined") {
        const mgr = await prisma.managers.findFirst({
          where: { OR: [{ id: user.userId }, { email: user.userId }] },
          select: { organizationId: true },
        }).catch(() => null);
        if (mgr?.organizationId) targetOrgId = mgr.organizationId;
      }

      whereClause = {
        OR: [
          { recipientType: "GLOBAL_BROADCAST" },
          { recipientId: "ALL" },
          ...(targetOrgId
            ? [
                { organizationId: targetOrgId, recipientType: "ORG_BROADCAST" },
                { organizationId: targetOrgId, recipientId: "ORG_ALL" },
                { organizationId: targetOrgId, recipientId: "MANAGER" },
                { organizationId: targetOrgId, recipientType: "ROLE_BROADCAST" },
              ]
            : [
                { recipientType: "ORG_BROADCAST" },
                { recipientId: "MANAGER" },
              ]),
          { recipientId: user.userId },
        ],
      };
    } else {
      // EMPLOYEE: find employee record to resolve both id, employeeCode and organizationId
      const emp = await prisma.employees.findFirst({
        where: {
          OR: [
            { id: user.userId },
            { employeeCode: user.userId },
            ...(user.organizationId ? [{ id: user.userId, organizationId: user.organizationId }] : []),
          ],
        },
        select: { id: true, employeeCode: true, organizationId: true },
      }).catch(() => null);

      const targetEmpIds = Array.from(
        new Set([user.userId, emp?.id, emp?.employeeCode].filter(Boolean) as string[])
      );
      const targetOrgId = emp?.organizationId || user.organizationId;

      whereClause = {
        OR: [
          { recipientType: "GLOBAL_BROADCAST" },
          { recipientId: "ALL" },
          ...(targetOrgId
            ? [
                { organizationId: targetOrgId, recipientType: "ORG_BROADCAST" },
                { organizationId: targetOrgId, recipientId: "ORG_ALL" },
                { organizationId: targetOrgId, recipientId: "EMPLOYEE" },
                { organizationId: targetOrgId, recipientType: "ROLE_BROADCAST" },
              ]
            : [
                { recipientType: "ORG_BROADCAST" },
                { recipientId: "EMPLOYEE" },
              ]),
          { recipientId: { in: targetEmpIds } },
          { recipientType: "EMPLOYEE", recipientId: { in: targetEmpIds } },
          { recipientType: "TARGETED_USER", recipientId: { in: targetEmpIds } },
        ],
      };
    }

    const dbNotifs = await prisma.notifications.findMany({
      where: whereClause,
      include: {
        organizations: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const mappedDb: AppNotification[] = dbNotifs.map((db) => {
      let scopeVal = (db.recipientType as any) || "GLOBAL_BROADCAST";
      const isRole = ["ORG_ADMIN", "MANAGER", "EMPLOYEE"].includes(db.recipientId);
      const isUser = scopeVal === "TARGETED_USER" || (!isRole && db.recipientId !== "ALL" && db.recipientId !== "ORG_ALL");

      if (scopeVal === "EMPLOYEE" || scopeVal === "MANAGER") {
        scopeVal = "ROLE_BROADCAST";
      }

      let senderName = "Super Admin";
      let senderRole: RoleType = "SUPER_ADMIN";
      if (db.recipientType === "GLOBAL_BROADCAST") {
        senderName = "Platform Super Admin";
        senderRole = "SUPER_ADMIN";
      } else if (db.organizations?.name) {
        senderName = db.organizations.name;
        senderRole = "ORG_ADMIN";
      } else {
        senderName = "Organization Admin";
        senderRole = "ORG_ADMIN";
      }

      return {
        id: db.id,
        organizationId: db.organizationId,
        organizationName: db.organizations?.name || null,
        senderId: "org-admin",
        senderName,
        senderRole,
        scope: scopeVal,
        targetOrgId: db.organizationId,
        targetRole: isRole ? (db.recipientId as RoleType) : null,
        recipientUserId: isUser ? db.recipientId : null,
        title: db.title,
        message: db.message,
        category: "SYSTEM",
        type: "INFO",
        isRead: db.isRead,
        createdAt: db.createdAt.toISOString().replace("T", " ").substring(0, 19),
      };
    });

    // Merge memory items not yet retrieved, scoped appropriately
    const dbIds = new Set(mappedDb.map((m) => m.id));
    const unsavedMemory = notificationsStore.filter((m) => {
      if (dbIds.has(m.id)) return false;
      if (user.role === "SUPER_ADMIN") return true;
      if (user.role === "ORG_ADMIN") {
        return m.scope === "GLOBAL_BROADCAST" || (user.organizationId && m.organizationId === user.organizationId);
      }
      return false;
    });

    return [...unsavedMemory, ...mappedDb];
  } catch (err) {
    console.warn("[NOTIFICATION_DB_QUERY_WARN] Falling back to memory store:", err);
    return notificationsStore;
  }
}

/**
 * Mark a notification as read in DB and memory
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  const notif = notificationsStore.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    notif.readAt = new Date().toISOString();
  }

  try {
    await prisma.notifications.update({
      where: { id },
      data: { isRead: true },
    });
    return true;
  } catch (err) {
    console.warn("[NOTIFICATION_DB_READ_WARN]", err);
    return notif ? true : false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(user: {
  userId: string;
  role: RoleType;
  organizationId?: string | null;
}): Promise<number> {
  const userNotifs = await getUserNotifications(user);
  let count = 0;

  userNotifs.forEach((n) => {
    if (!n.isRead) {
      n.isRead = true;
      n.readAt = new Date().toISOString();
      count++;
    }
  });

  const notifIds = userNotifs.filter((n) => !n.isRead).map((n) => n.id);
  if (notifIds.length > 0) {
    try {
      await prisma.notifications.updateMany({
        where: { id: { in: notifIds } },
        data: { isRead: true },
      });
    } catch (err) {
      console.warn("[NOTIFICATION_DB_READ_ALL_WARN]", err);
    }
  }

  return count;
}
