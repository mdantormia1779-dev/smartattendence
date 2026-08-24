import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../errors";
import { logAuditEvent } from "@/lib/audit-logger";
import { OrganizationService } from "./organization.service";

export interface UserSessionData {
  id: string;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";
  organizationId?: string | null;
  employeeId?: string | null;
}

// In-Memory Core Store for production API fallback & local fast memory
let usersStore: any[] = [
  {
    id: "user-super-1",
    email: "superadmin@erp.com",
    passwordHash: "admin123", // In production hashed via bcrypt
    fullName: "Super Admin",
    role: "SUPER_ADMIN",
    organizationId: null,
    isActive: true,
  },
  {
    id: "user-org-1",
    email: "sarah.admin@vertextech.io",
    passwordHash: "admin123",
    fullName: "Sarah Rahman",
    role: "ORG_ADMIN",
    organizationId: "org-1",
    isActive: true,
  },
  {
    id: "user-mgr-1",
    email: "tanvir.mgr@vertextech.io",
    passwordHash: "mgr123",
    fullName: "Tanvir Ahmed",
    role: "MANAGER",
    organizationId: "org-1",
    employeeId: "EMP-MGR01",
    isActive: true,
  },
  {
    id: "user-emp-1",
    email: "arif.c@vertextech.io",
    passwordHash: "emp123",
    fullName: "Arif Chowdhury",
    role: "EMPLOYEE",
    organizationId: "org-1",
    employeeId: "EMP-1042",
    isActive: true,
  },
];

export class AuthService {
  static async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== password) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been suspended. Please contact administrator.");
    }

    // Log Audit Event
    logAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: "LOGIN",
      module: "Auth",
      details: `User ${user.email} successfully logged in with role ${user.role}`,
      ipAddress: ip,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        employeeId: user.employeeId,
      },
      token: `session_${user.id}_${Date.now()}`,
    };
  }

  static async registerTenant(data: {
    adminName: string;
    adminEmail: string;
    password: string;
    companyName: string;
    companyEmail: string;
    industry?: string;
    phone?: string;
    website?: string;
    address?: string;
    country?: string;
    language?: string;
    currency?: string;
    timezone?: string;
    workingDays?: string;
    startTime?: string;
    endTime?: string;
    referralCode?: string | null;
  }) {
    const existingUser = usersStore.find((u) => u.email.toLowerCase() === data.adminEmail.toLowerCase());
    if (existingUser) {
      throw new ConflictError(`User with email '${data.adminEmail}' already exists`);
    }

    const slug = data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || "org";
    const org = await OrganizationService.createOrganization({
      name: data.companyName,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      email: data.companyEmail,
      industry: data.industry || "General",
      phone: data.phone,
      planTier: "STARTER",
      defaultGeofenceM: 120,
    });

    const userId = `user-org-${Date.now()}`;
    const newUser = {
      id: userId,
      email: data.adminEmail,
      passwordHash: data.password,
      fullName: data.adminName,
      role: "ORG_ADMIN",
      organizationId: org.id,
      isActive: true,
    };

    usersStore.push(newUser);

    // Track Referral conversion if applicable
    if (data.referralCode) {
      logAuditEvent({
        organizationId: org.id,
        userId: userId,
        userName: data.adminName,
        userRole: "ORG_ADMIN",
        action: "REFERRAL_REGISTRATION",
        module: "Referral",
        details: `Organization ${org.name} registered via referral code: ${data.referralCode}`,
      });
    }

    return {
      organizationId: org.id,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        organizationId: org.id,
      },
      referralAttributed: data.referralCode || null,
    };
  }

  static async createOrgAdminUser(data: {
    fullName: string;
    email: string;
    password: string;
    organizationId: string;
  }) {
    const existingUser = usersStore.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      throw new ConflictError(`User with email '${data.email}' already exists`);
    }

    const userId = `user-org-${Date.now()}`;
    const newUser = {
      id: userId,
      email: data.email,
      passwordHash: data.password,
      fullName: data.fullName,
      role: "ORG_ADMIN",
      organizationId: data.organizationId,
      isActive: true,
    };

    usersStore.push(newUser);
    return newUser;
  }

  static async getUserById(userId: string) {
    const user = usersStore.find((u) => u.id === userId);
    if (!user) throw new NotFoundError("User");
    return user;
  }
}
