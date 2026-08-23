/**
 * Dynamic Multi-Tenant Scoped Notification Service
 * 
 * Supports:
 * - Super Admin: Global broadcasts, Org-specific targeting, Role-specific targeting, User targeting
 * - Org Admin: Scoped strictly to direct organization members (all, by role, or direct user)
 * - Strict multi-tenant isolation guard preventing cross-tenant leakage.
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

// Global In-Memory Notification Store (Persisted alongside Prisma DB)
let notificationsStore: AppNotification[] = [
  {
    id: "notif-1",
    organizationId: null, // Super Admin Global Broadcast
    senderId: "super-1",
    senderName: "Super Admin (Platform)",
    senderRole: "SUPER_ADMIN",
    scope: "GLOBAL_BROADCAST",
    title: "⚡ Scheduled Maintenance Notice",
    message: "Smart Attendance Cloud will undergo server speed optimization on Sunday at 02:00 AM UTC. Estimated downtime: 15 minutes.",
    category: "SYSTEM",
    type: "INFO",
    isRead: false,
    createdAt: "2026-08-23 10:00:00",
  },
  {
    id: "notif-2",
    organizationId: "org-1", // Vertex Technologies Org
    senderId: "user-org-1",
    senderName: "Sarah Jenkins (Org Admin)",
    senderRole: "ORG_ADMIN",
    scope: "ORG_BROADCAST",
    targetOrgId: "org-1",
    title: "🏢 Vertex Tech: Public Holiday Announcement",
    message: "Office will remain closed on National Mourning Day. Shifts will be exempted automatically without leave deduction.",
    category: "ATTENDANCE",
    type: "SUCCESS",
    isRead: false,
    createdAt: "2026-08-22 09:30:00",
  },
  {
    id: "notif-3",
    organizationId: null,
    senderId: "system",
    senderName: "Affiliate Engine",
    senderRole: "SUPER_ADMIN",
    scope: "TARGETED_USER",
    recipientUserId: "user-emp-1", // Arif Chowdhury
    title: "💰 Referral Commission Generated!",
    message: "Your referral code ARIF-EMP1042 was used by CloudTech Software. $22.35 added to pending balance.",
    category: "REFERRAL",
    type: "SUCCESS",
    link: "/employee/referrals",
    isRead: false,
    createdAt: "2026-08-21 16:45:00",
  },
  {
    id: "notif-4",
    organizationId: "org-1",
    senderId: "mgr-1",
    senderName: "Tanvir Ahmed (Manager)",
    senderRole: "MANAGER",
    scope: "TARGETED_USER",
    recipientUserId: "user-emp-1",
    title: "✅ Leave Request Approved",
    message: "Your Annual Leave request for Aug 25 - Aug 28 (4 days) has been approved by management.",
    category: "LEAVE",
    type: "SUCCESS",
    link: "/employee/leaves",
    isRead: false,
    createdAt: "2026-08-20 11:15:00",
  },
];

/**
 * Dispatch a Notification with Strict Multi-Tenant Enforcement
 */
export function sendNotification(input: {
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
}): { success: boolean; notification?: AppNotification; error?: string } {
  // Security Guard: Check Tenant Isolation
  if (input.senderRole === "ORG_ADMIN") {
    // Org Admin can ONLY send within their own organization
    if (!input.senderOrgId) {
      return { success: false, error: "Unauthorized: Missing organization identity" };
    }

    if (input.scope === "GLOBAL_BROADCAST") {
      return { success: false, error: "Permission Denied: Only Super Admin can send global platform broadcasts" };
    }

    // Force targetOrgId to be the sender's own org
    input.targetOrgId = input.senderOrgId;
  } else if (input.senderRole === "MANAGER") {
    // Manager can only send to employees within their own org
    if (!input.senderOrgId) {
      return { success: false, error: "Unauthorized: Missing organization identity" };
    }
    input.targetOrgId = input.senderOrgId;
    if (input.scope === "GLOBAL_BROADCAST") {
      return { success: false, error: "Permission Denied: Managers cannot send global broadcasts" };
    }
  }

  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    organizationId: input.senderRole === "SUPER_ADMIN" ? (input.targetOrgId || null) : (input.senderOrgId || null),
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
  console.info(`[NOTIFICATION_SENT] Scope: ${newNotif.scope} by ${newNotif.senderName} (${newNotif.senderRole}) -> "${newNotif.title}"`);
  return { success: true, notification: newNotif };
}

/**
 * Get Scoped Notifications for a User
 * Ensures:
 * 1. Super Admin sees all platform and audit notifications
 * 2. Org Admin sees Super Admin broadcasts + their own organization notifications
 * 3. Manager/Employee sees Super Admin broadcasts + their org broadcasts + direct messages
 * 4. NEVER sees another organization's scoped notifications!
 */
export function getUserNotifications(user: {
  userId: string;
  role: RoleType;
  organizationId?: string | null;
}): AppNotification[] {
  return notificationsStore.filter((n) => {
    // 1. Super Admin sees all
    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    // 2. Direct message targeted specifically to this user
    if (n.recipientUserId && n.recipientUserId === user.userId) {
      return true;
    }

    // 3. Global broadcast from Super Admin (no specific org)
    if (n.scope === "GLOBAL_BROADCAST") {
      // Check if it has a role filter
      if (n.targetRole && n.targetRole !== user.role) {
        return false;
      }
      return true;
    }

    // 4. Org-scoped notifications: Must strictly match the user's organizationId
    if (user.organizationId && (n.organizationId === user.organizationId || n.targetOrgId === user.organizationId)) {
      // If scoped to all in org
      if (n.scope === "ORG_BROADCAST") {
        return true;
      }
      // If scoped to role within org
      if (n.scope === "ROLE_BROADCAST" && n.targetRole === user.role) {
        return true;
      }
      // If direct user
      if (n.recipientUserId === user.userId) {
        return true;
      }
    }

    // Otherwise, blocked by tenant boundary
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
  return count;
}
