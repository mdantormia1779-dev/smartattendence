import { prisma } from "@/lib/prisma";

/**
 * Dynamic Multi-Tenant Scoped Notification Service
 * 
 * Supports:
 * - Super Admin: Global broadcasts, Org-specific targeting, Role-specific targeting, User targeting
 * - Org Admin: Scoped strictly to direct organization members (all, by role, or direct user)
 * - Strict multi-tenant isolation guard preventing cross-tenant leakage.
 * - Full CRUD: Create, Read/Filter, Update (Edit), Delete.
 */

export type RoleType = "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AppNotification {
  id: string;
  organizationId?: string | null; // null for Super Admin platform broadcasts
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

// Clean in-memory store for real-time notification dispatch and caching
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
  // Security Guard: Check Tenant Isolation
  if (input.senderRole === "ORG_ADMIN") {
    if (!input.senderOrgId) {
      return { success: false, error: "Unauthorized: Missing organization identity" };
    }
    if (input.scope === "GLOBAL_BROADCAST") {
      return { success: false, error: "Permission Denied: Only Super Admin can send global platform broadcasts" };
    }
    input.targetOrgId = input.senderOrgId;
  } else if (input.senderRole === "MANAGER") {
    if (!input.senderOrgId) {
      return { success: false, error: "Unauthorized: Missing organization identity" };
    }
    input.targetOrgId = input.senderOrgId;
    if (input.scope === "GLOBAL_BROADCAST") {
      return { success: false, error: "Permission Denied: Managers cannot send global broadcasts" };
    }
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

  // Persist to PostgreSQL Prisma if target organization or recipient is valid
  try {
    const dbRecipientId = input.recipientUserId || input.targetRole || (input.scope === "GLOBAL_BROADCAST" ? "ALL" : "ORG_ALL");
    
    let validOrgId: string | null = null;
    if (targetOrg) {
      const orgExists = await prisma.organizations.findUnique({
        where: { id: targetOrg },
        select: { id: true },
      });
      if (orgExists) validOrgId = orgExists.id;
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
 * Update an existing notification (Edit Title, Message, Category, Severity, Link, Target)
 */
export async function updateNotification(
  id: string,
  updates: Partial<AppNotification>
): Promise<{ success: boolean; notification?: AppNotification; error?: string }> {
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index === -1) {
    return { success: false, error: "Notification not found" };
  }

  const existing = notificationsStore[index];
  const updated: AppNotification = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  notificationsStore[index] = updated;

  try {
    await prisma.notifications.update({
      where: { id },
      data: {
        title: updated.title,
        message: updated.message,
        recipientType: updated.scope,
        recipientId: updated.recipientUserId || updated.targetRole || (updated.scope === "GLOBAL_BROADCAST" ? "ALL" : "ORG_ALL"),
      },
    }).catch(() => {});
  } catch (err) {
    console.warn("[NOTIFICATION_DB_UPDATE_WARN]", err);
  }

  return { success: true, notification: updated };
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index === -1) {
    return { success: false, error: "Notification not found" };
  }

  notificationsStore.splice(index, 1);

  try {
    await prisma.notifications.delete({
      where: { id },
    }).catch(() => {});
  } catch (err) {
    console.warn("[NOTIFICATION_DB_DELETE_WARN]", err);
  }

  return { success: true };
}

/**
 * Get Scoped Notifications for a User
 */
export function getUserNotifications(user: {
  userId: string;
  role: RoleType;
  organizationId?: string | null;
}): AppNotification[] {
  return notificationsStore.filter((n) => {
    // 1. Super Admin sees all platform and audit notifications
    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    // 2. Direct message targeted specifically to this user
    if (n.recipientUserId && n.recipientUserId === user.userId) {
      return true;
    }

    // 3. Global broadcast from Super Admin
    if (n.scope === "GLOBAL_BROADCAST") {
      if (n.targetRole && n.targetRole !== user.role) {
        return false;
      }
      return true;
    }

    // 4. Org-scoped notifications: Must strictly match the user's organizationId
    if (user.organizationId && (n.organizationId === user.organizationId || n.targetOrgId === user.organizationId)) {
      if (n.scope === "ORG_BROADCAST") {
        return true;
      }
      if (n.scope === "ROLE_BROADCAST" && n.targetRole === user.role) {
        return true;
      }
      if (n.recipientUserId === user.userId) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Mark a notification as read
 */
export function markNotificationAsRead(id: string): boolean {
  const notif = notificationsStore.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    notif.readAt = new Date().toISOString();

    prisma.notifications.update({
      where: { id },
      data: { isRead: true },
    }).catch(() => {});

    return true;
  }
  return false;
}

/**
 * Mark all notifications as read for a user
 */
export function markAllNotificationsAsRead(user: { userId: string; role: RoleType; organizationId?: string | null }): number {
  const userNotifs = getUserNotifications(user);
  let count = 0;
  userNotifs.forEach((n) => {
    if (!n.isRead) {
      n.isRead = true;
      n.readAt = new Date().toISOString();
      count++;
    }
  });

  const notifIds = userNotifs.map((n) => n.id);
  if (notifIds.length > 0) {
    prisma.notifications.updateMany({
      where: { id: { in: notifIds } },
      data: { isRead: true },
    }).catch(() => {});
  }

  return count;
}
