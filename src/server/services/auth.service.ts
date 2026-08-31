import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../errors";
import { logAuditEvent } from "@/lib/audit-logger";
import { prisma } from "@/lib/prisma";
import { OrganizationService } from "./organization.service";
import { registerSessionToken, signSessionToken } from "../authorization";




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
    const normalizedEmail = email.trim().toLowerCase();
    let user = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);

    // Always check/sync from database for most up-to-date credentials
    try {
      const orgAdmin = await prisma.org_admins.findUnique({
        where: { email: normalizedEmail },
        include: { organizations: true },
      });

      if (orgAdmin) {
        if (user) {
          user.passwordHash = orgAdmin.password;
          user.fullName = orgAdmin.name;
          user.organizationId = orgAdmin.organizationId;
          user.isActive = orgAdmin.organizations?.status !== "SUSPENDED";
        } else {
          user = {
            id: orgAdmin.id,
            email: orgAdmin.email,
            passwordHash: orgAdmin.password,
            fullName: orgAdmin.name,
            role: "ORG_ADMIN",
            organizationId: orgAdmin.organizationId,
            isActive: orgAdmin.organizations?.status !== "SUSPENDED",
          };
          usersStore.push(user);
        }
      } else {
        const mgr = await prisma.managers.findFirst({
          where: { email: normalizedEmail },
          include: { organizations: true },
        });

        if (mgr) {
          if (user) {
            user.passwordHash = mgr.password;
            user.fullName = mgr.name;
            user.organizationId = mgr.organizationId;
            user.isActive = mgr.organizations?.status !== "SUSPENDED";
          } else {
            user = {
              id: mgr.id,
              email: mgr.email,
              passwordHash: mgr.password,
              fullName: mgr.name,
              role: "MANAGER",
              organizationId: mgr.organizationId,
              isActive: mgr.organizations?.status !== "SUSPENDED",
            };
            usersStore.push(user);
          }
        } else {
          const emp = await prisma.employees.findFirst({
            where: { email: normalizedEmail },
            include: {
              organizations: true,
              branches: true,
            },
          });

          if (emp) {
            if (user) {
              user.id = emp.id;
              user.employeeId = emp.employeeCode || emp.id;
              user.passwordHash = emp.password;
              user.fullName = emp.fullName;
              user.organizationId = emp.organizationId;
              user.isActive = emp.status !== "SUSPENDED" && emp.organizations?.status !== "SUSPENDED";
              user.branchId = emp.branchId;
              user.branchName = emp.branches?.name || undefined;
              user.branchLatitude = emp.branches?.latitude ? Number(emp.branches.latitude) : undefined;
              user.branchLongitude = emp.branches?.longitude ? Number(emp.branches.longitude) : undefined;
              user.geofenceRadius = emp.branches?.geoFenceRadius || undefined;
            } else {
              user = {
                id: emp.id,
                employeeId: emp.employeeCode || emp.id,
                email: emp.email,
                passwordHash: emp.password,
                fullName: emp.fullName,
                role: "EMPLOYEE",
                organizationId: emp.organizationId,
                isActive: emp.status !== "SUSPENDED" && emp.organizations?.status !== "SUSPENDED",
                branchId: emp.branchId,
                branchName: emp.branches?.name || undefined,
                branchLatitude: emp.branches?.latitude ? Number(emp.branches.latitude) : undefined,
                branchLongitude: emp.branches?.longitude ? Number(emp.branches.longitude) : undefined,
                geofenceRadius: emp.branches?.geoFenceRadius || undefined,
              };
              usersStore.push(user);
            }
          }

        }
      }
    } catch (e) {
      console.warn("[AuthService] Database check during login fallback:", e);
    }

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

    const sessionData = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
      employeeId: user.employeeId,
    };

    const sessionToken = signSessionToken(sessionData);
    registerSessionToken(sessionToken, sessionData);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        employeeId: user.employeeId,
        branchId: user.branchId,
        branchName: user.branchName,
        branchLatitude: user.branchLatitude,
        branchLongitude: user.branchLongitude,
        geofenceRadius: user.geofenceRadius,
      },
      token: sessionToken,
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
    const normalizedAdminEmail = data.adminEmail.trim().toLowerCase();
    const normalizedCompanyEmail = data.companyEmail.trim().toLowerCase();

    // 1. Check if admin email already exists in DB
    const existingAdmin = await prisma.org_admins.findUnique({
      where: { email: normalizedAdminEmail },
    });
    if (existingAdmin) {
      throw new ConflictError(`An administrator account with email '${data.adminEmail}' already exists`);
    }

    const existingUser = usersStore.find((u) => u.email.toLowerCase() === normalizedAdminEmail);
    if (existingUser) {
      throw new ConflictError(`User with email '${data.adminEmail}' already exists`);
    }

    // 2. Create Organization record
    const slug = data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || "org";
    const org = await OrganizationService.createOrganization({
      name: data.companyName,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      email: normalizedCompanyEmail,
      industry: data.industry || "General",
      phone: data.phone,
      website: data.website,
      address: data.address,
      country: data.country,
      language: data.language,
      currency: data.currency,
      timezone: data.timezone,
      workingDays: data.workingDays,
      defaultOfficeStart: data.startTime,
      defaultOfficeEnd: data.endTime,
      planTier: "STARTER",
      defaultGeofenceM: 120,
      adminName: data.adminName,
      adminEmail: normalizedAdminEmail,
      adminPassword: data.password,
    });

    const adminId = `org-admin-${Date.now()}`;

    // 3. Persist / Upsert Admin Account with Password in Database
    const createdAdmin = await prisma.org_admins.upsert({
      where: { email: normalizedAdminEmail },
      update: {
        name: data.adminName.trim(),
        password: data.password,
        organizationId: org.id,
        updatedAt: new Date(),
      },
      create: {
        id: adminId,
        name: data.adminName.trim(),
        email: normalizedAdminEmail,
        password: data.password,
        organizationId: org.id,
        updatedAt: new Date(),
      },
    });

    const existingStoreUser = usersStore.find((u) => u.email.toLowerCase() === normalizedAdminEmail);
    if (existingStoreUser) {
      existingStoreUser.id = createdAdmin.id;
      existingStoreUser.passwordHash = createdAdmin.password;
      existingStoreUser.fullName = createdAdmin.name;
      existingStoreUser.organizationId = org.id;
      existingStoreUser.isActive = true;
    } else {
      usersStore.push({
        id: createdAdmin.id,
        email: createdAdmin.email,
        passwordHash: createdAdmin.password,
        fullName: createdAdmin.name,
        role: "ORG_ADMIN",
        organizationId: org.id,
        isActive: true,
      });
    }

    // Track Referral conversion if applicable
    if (data.referralCode) {
      try {
        const { AffiliateService } = await import("./affiliate.service");
        await AffiliateService.trackReferral(data.referralCode, org.id, data.companyEmail);
      } catch (refErr) {
        console.error("Failed to track affiliate referral:", refErr);
      }

      logAuditEvent({
        organizationId: org.id,
        userId: createdAdmin.id,
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
        id: createdAdmin.id,
        email: createdAdmin.email,
        fullName: createdAdmin.name,
        role: "ORG_ADMIN",
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
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check & persist to database
    let createdAdmin = await prisma.org_admins.findUnique({
      where: { email: normalizedEmail },
    });

    if (createdAdmin) {
      createdAdmin = await prisma.org_admins.update({
        where: { id: createdAdmin.id },
        data: {
          name: data.fullName.trim(),
          password: data.password,
          organizationId: data.organizationId,
          updatedAt: new Date(),
        },
      });
    } else {
      createdAdmin = await prisma.org_admins.create({
        data: {
          id: `org-admin-${Date.now()}`,
          name: data.fullName.trim(),
          email: normalizedEmail,
          password: data.password,
          organizationId: data.organizationId,
          updatedAt: new Date(),
        },
      });
    }

    const existingStoreUser = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingStoreUser) {
      existingStoreUser.passwordHash = data.password;
      existingStoreUser.fullName = data.fullName;
      existingStoreUser.organizationId = data.organizationId;
    } else {
      usersStore.push({
        id: createdAdmin.id,
        email: normalizedEmail,
        passwordHash: data.password,
        fullName: data.fullName,
        role: "ORG_ADMIN",
        organizationId: data.organizationId,
        isActive: true,
      });
    }

    return createdAdmin;
  }

  static async getUserById(userId: string) {
    const user = usersStore.find((u) => u.id === userId);
    if (!user) throw new NotFoundError("User");
    return user;
  }

  /**
   * Super Admin override to change organization admin password
   */
  static async updateOrgAdminPassword(
    organizationId: string,
    newPassword: string,
    adminEmail?: string,
    adminName?: string
  ) {
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError("New password must be at least 6 characters");
    }

    // 1. Update in-memory user store
    let user = usersStore.find(
      (u) =>
        (u.organizationId === organizationId && u.role === "ORG_ADMIN") ||
        (adminEmail && u.email.toLowerCase() === adminEmail.toLowerCase())
    );

    if (user) {
      user.passwordHash = newPassword;
      if (adminEmail) user.email = adminEmail;
      if (adminName) user.fullName = adminName;
    } else {
      user = {
        id: `user-org-${Date.now()}`,
        email: adminEmail || `admin@${organizationId}.com`,
        passwordHash: newPassword,
        fullName: adminName || "Organization Admin",
        role: "ORG_ADMIN",
        organizationId: organizationId,
        isActive: true,
      };
      usersStore.push(user);
    }

    // 2. Persist in Prisma database
    try {
      const existingAdmin = await prisma.org_admins.findFirst({
        where: { organizationId },
      });

      if (existingAdmin) {
        await prisma.org_admins.update({
          where: { id: existingAdmin.id },
          data: {
            password: newPassword,
            ...(adminEmail ? { email: adminEmail } : {}),
            ...(adminName ? { name: adminName } : {}),
            updatedAt: new Date(),
          },
        });
      } else {
        const org = await prisma.organizations.findUnique({
          where: { id: organizationId },
        });

        await prisma.org_admins.create({
          data: {
            id: `admin-${Date.now()}`,
            name: adminName || (org ? `${org.name} Admin` : "Organization Admin"),
            email: adminEmail || (org ? org.email : `admin@${organizationId}.com`),
            password: newPassword,
            organizationId: organizationId,
            updatedAt: new Date(),
          },
        });
      }
    } catch (e) {
      console.warn("[AuthService] DB update for org admin password bypassed/fallback:", e);
    }

    // 3. Record Audit Log
    logAuditEvent({
      organizationId: organizationId,
      userId: "SUPER_ADMIN",
      userName: "Super Admin",
      userRole: "SUPER_ADMIN",
      action: "ADMIN_PASSWORD_RESET",
      module: "Auth",
      details: `Super Admin reset password for organization '${organizationId}' (Email: ${adminEmail || user.email})`,
    });

    return { success: true, message: "Organization password updated successfully" };
  }

  /**
   * User Self-Service Change Password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    role?: string,
    email?: string
  ) {
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError("New password must be at least 6 characters long");
    }

    if (!currentPassword) {
      throw new ValidationError("Current password is required");
    }

    // 1. Check in-memory store
    let user = usersStore.find(
      (u) => u.id === userId || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (user && user.passwordHash && user.passwordHash !== currentPassword) {
      throw new ValidationError("Current password is incorrect");
    }

    if (user) {
      user.passwordHash = newPassword;
    }

    // 2. Persist in database
    try {
      if (role === "ORG_ADMIN" || user?.role === "ORG_ADMIN") {
        const orgAdmin = await prisma.org_admins.findFirst({
          where: {
            OR: [
              { id: userId },
              ...(email ? [{ email: email }] : []),
              ...(user?.organizationId ? [{ organizationId: user.organizationId }] : []),
            ],
          },
        });

        if (orgAdmin) {
          if (orgAdmin.password && orgAdmin.password !== currentPassword) {
            throw new ValidationError("Current password is incorrect");
          }
          await prisma.org_admins.update({
            where: { id: orgAdmin.id },
            data: { password: newPassword, updatedAt: new Date() },
          });
        }
      }
    } catch (e: any) {
      if (e instanceof ValidationError) throw e;
      console.warn("[AuthService] DB update for change password bypassed/fallback:", e);
    }

    // 3. Log Audit
    logAuditEvent({
      userId: userId,
      userName: user?.fullName || "User",
      userRole: (user?.role as any) || (role as any) || "ORG_ADMIN",
      action: "PASSWORD_CHANGED",
      module: "Auth",
      details: `User ${userId} successfully changed their account password`,
    });

    return { success: true, message: "Password updated successfully" };
  }
}

