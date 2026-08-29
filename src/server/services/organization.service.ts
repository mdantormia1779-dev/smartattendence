import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError, PlanLimitExceededError } from "../errors";
import { OrgStatus, SubscriptionPlanType } from "@prisma/client";

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  address?: string | null;
  country?: string | null;
  language?: string | null;
  currency?: string | null;
  planId?: string;
  planName?: string;
  planTier?: "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE";
  subscriptionStatus?: "ACTIVE" | "TRIAL" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
  brandColor?: string;
  customLogoUrl?: string | null;
  customDomain?: string | null;
  defaultOfficeStart?: string;
  defaultOfficeEnd?: string;
  defaultGeofenceM?: number;
  antiSpoofingMode?: string;
  workingDays?: string[] | string;
  timezone?: string;
  totalEmployees: number;
  totalBranches: number;
  isSuspended: boolean;
  suspensionReason?: string | null;
  createdAt: string;
}

/**
 * Helper to map Prisma organization record to domain OrganizationData
 */
function mapToOrganizationData(org: any): OrganizationData {
  const isSuspended = org.status === OrgStatus.SUSPENDED;
  const subscription = org.subscriptions;
  const plan = subscription?.subscription_plans;

  let workingDaysParsed: string[] | string = ["Sun", "Mon", "Tue", "Wed", "Thu"];
  if (Array.isArray(org.workingDays)) {
    workingDaysParsed = org.workingDays;
  } else if (typeof org.workingDays === "string") {
    workingDaysParsed = org.workingDays;
  }

  const customTheme =
    typeof org.customTheme === "object" && org.customTheme !== null
      ? (org.customTheme as Record<string, any>)
      : {};

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    email: org.email,
    phone: org.phone ?? null,
    website: org.website ?? null,
    industry: org.industry ?? "General",
    address: org.address ?? null,
    country: org.country ?? "Bangladesh",
    language: org.language ?? "English",
    currency: org.currency ?? "BDT (৳)",
    planId: plan?.id ?? (subscription?.planId || "plan-free"),
    planName: plan?.name ?? (plan?.type === "FREE" ? "30-Day Free Trial" : (plan?.type || "30-Day Free Trial")),
    planTier: (plan?.type as "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE") ?? "FREE",
    subscriptionStatus: isSuspended ? "SUSPENDED" : (subscription?.status ?? "ACTIVE"),
    brandColor: customTheme.brandColor || "#00B050",
    customLogoUrl: org.logoUrl ?? null,
    customDomain: org.customDomain ?? null,
    defaultOfficeStart: org.officeStart ?? "09:00 AM",
    defaultOfficeEnd: org.officeEnd ?? "05:00 PM",
    defaultGeofenceM: customTheme.defaultGeofenceM ?? 120,
    antiSpoofingMode: customTheme.antiSpoofingMode ?? "High",
    workingDays: workingDaysParsed,
    timezone: org.timezone ?? "Asia/Dhaka",
    // Strictly return real relational counts without 1 fallback
    totalEmployees: org._count?.employees ?? 0,
    totalBranches: org._count?.branches ?? 0,
    isSuspended: isSuspended,
    suspensionReason: customTheme.suspensionReason ?? null,
    createdAt: org.createdAt instanceof Date ? org.createdAt.toISOString() : String(org.createdAt),
  };
}

let cachedOrganizations: OrganizationData[] = [];

export class OrganizationService {
  /**
   * Fetch all organizations from database with relational employee and branch counts
   */
  static async getAllOrganizations(): Promise<OrganizationData[]> {
    try {
      const orgs = await prisma.organizations.findMany({
        include: {
          subscriptions: {
            include: {
              subscription_plans: true,
            },
          },
          _count: {
            select: {
              employees: true,
              branches: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const mapped = orgs.map(mapToOrganizationData);
      cachedOrganizations = mapped;
      return mapped;
    } catch (err) {
      console.warn("[OrganizationService] Database query error or connection timeout, returning cached fallback:", err);
      if (cachedOrganizations.length > 0) return cachedOrganizations;
      return [];
    }
  }

  /**
   * Fetch a single organization by ID
   */
  static async getOrganizationById(id: string): Promise<OrganizationData> {
    let org = await prisma.organizations.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
        _count: {
          select: {
            employees: true,
            branches: true,
          },
        },
      },
    });

    // If not found by exact ID, find the first available organization
    if (!org) {
      org = await prisma.organizations.findFirst({
        include: {
          subscriptions: {
            include: {
              subscription_plans: true,
            },
          },
          _count: {
            select: {
              employees: true,
              branches: true,
            },
          },
        },
      });
    }

    // If database has 0 organizations, auto-provision initial default organization
    if (!org) {
      try {
        let starterPlan = await prisma.subscription_plans.findFirst({
          where: { type: SubscriptionPlanType.STARTER },
        });
        if (!starterPlan) {
          starterPlan = await prisma.subscription_plans.create({
            data: {
              id: "plan-starter",
              name: "Starter Plan",
              type: SubscriptionPlanType.STARTER,
              price: 29,
              billingCycle: "monthly",
              updatedAt: new Date(),
            },
          });
        }

        org = await prisma.organizations.create({
          data: {
            id: id || "org-1",
            name: "Vertex Technologies Ltd",
            slug: "vertex-tech",
            email: "admin@vertextech.io",
            phone: "+880 1700-000000",
            country: "Bangladesh",
            currency: "BDT (৳)",
            timezone: "Asia/Dhaka",
            status: OrgStatus.ACTIVE,
            updatedAt: new Date(),
            subscriptions: {
              create: {
                id: `sub-${Date.now()}`,
                planId: starterPlan.id,
                status: "ACTIVE",
                updatedAt: new Date(),
              },
            },
          },
          include: {
            subscriptions: {
              include: {
                subscription_plans: true,
              },
            },
            _count: {
              select: {
                employees: true,
                branches: true,
              },
            },
          },
        });
      } catch (e) {
        console.warn("[OrganizationService] Auto-provisioning fallback failed:", e);
      }
    }

    if (!org) {
      throw new NotFoundError("Organization");
    }

    return mapToOrganizationData(org);
  }

  /**
   * Insert new organization record into the database (no fake initial branch/employee entries)
   */
  static async createOrganization(data: {
    name: string;
    slug: string;
    email: string;
    planTier?: OrganizationData["planTier"];
    industry?: string;
    phone?: string;
    website?: string;
    customLogoUrl?: string;
    address?: string;
    country?: string;
    language?: string;
    currency?: string;
    timezone?: string;
    workingDays?: string[] | string;
    defaultOfficeStart?: string;
    defaultOfficeEnd?: string;
    defaultGeofenceM?: number;
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
  }): Promise<OrganizationData> {
    // Check if slug or email already exists
    const existing = await prisma.organizations.findFirst({
      where: {
        OR: [{ slug: data.slug }, { email: data.email }],
      },
    });

    if (existing) {
      throw new ConflictError(
        `Organization with slug '${data.slug}' or email '${data.email}' already exists`
      );
    }

    const orgId = `org-${Date.now()}`;

    let workingDaysData: any = ["Sun", "Mon", "Tue", "Wed", "Thu"];
    if (Array.isArray(data.workingDays)) {
      workingDaysData = data.workingDays;
    } else if (typeof data.workingDays === "string" && data.workingDays.trim()) {
      workingDaysData = data.workingDays
        .split(/[,-]/)
        .map((d) => d.trim())
        .filter(Boolean);
    }

    const tier = (data.planTier?.toUpperCase() as SubscriptionPlanType) || SubscriptionPlanType.FREE;
    let targetPlan = await prisma.subscription_plans.findFirst({
      where: { type: tier },
    });

    if (!targetPlan) {
      targetPlan = await prisma.subscription_plans.create({
        data: {
          id: `plan-${tier.toLowerCase()}`,
          name: tier === "FREE" ? "30-Day Free Trial" : `${tier.charAt(0) + tier.slice(1).toLowerCase()} Plan`,
          type: tier,
          price: tier === "FREE" ? 0 : tier === "STARTER" ? 29 : tier === "BUSINESS" ? 99 : 299,
          billingCycle: tier === "FREE" ? "30-Day Trial" : "monthly",
          updatedAt: new Date(),
        },
      });
    }

    const isTrial = tier === "FREE";
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const created = await prisma.organizations.create({
      data: {
        id: orgId,
        name: data.name,
        slug: data.slug,
        email: data.email,
        logoUrl: data.customLogoUrl || null,
        industry: data.industry || "General",
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        country: data.country || "Bangladesh",
        language: data.language || "English",
        currency: data.currency || "BDT (৳)",
        timezone: data.timezone || "Asia/Dhaka",
        workingDays: workingDaysData,
        officeStart: data.defaultOfficeStart || "09:00 AM",
        officeEnd: data.defaultOfficeEnd || "05:00 PM",
        status: OrgStatus.ACTIVE,
        customTheme: {
          brandColor: "#00B050",
          defaultGeofenceM: data.defaultGeofenceM || 120,
          antiSpoofingMode: "High",
        },
        updatedAt: new Date(),
        subscriptions: {
          create: {
            id: `sub-${Date.now()}`,
            planId: targetPlan.id,
            status: isTrial ? "TRIAL" : "ACTIVE",
            startDate: now,
            endDate: isTrial ? trialEndDate : null,
            updatedAt: new Date(),
          },
        },
      },
      include: {
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
        _count: {
          select: {
            employees: true,
            branches: true,
          },
        },
      },
    });

    if (data.adminEmail && data.adminPassword) {
      try {
        const normalizedEmail = data.adminEmail.trim().toLowerCase();
        await prisma.org_admins.upsert({
          where: { email: normalizedEmail },
          update: {
            name: data.adminName?.trim() || `${data.name} Admin`,
            password: data.adminPassword,
            organizationId: created.id,
            updatedAt: new Date(),
          },
          create: {
            id: `admin-${Date.now()}`,
            name: data.adminName?.trim() || `${data.name} Admin`,
            email: normalizedEmail,
            password: data.adminPassword,
            organizationId: created.id,
            updatedAt: new Date(),
          },
        });
      } catch (adminErr) {
        console.warn("[OrganizationService] Failed to auto-provision admin in DB:", adminErr);
      }
    }

    return mapToOrganizationData(created);
  }

  /**
   * Update organization settings directly in database
   */
  static async updateSettings(
    id: string,
    settings: Partial<OrganizationData> & {
      status?: string;
      adminPassword?: string;
      adminEmail?: string;
      adminName?: string;
    }
  ): Promise<OrganizationData> {
    const existing = await prisma.organizations.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("Organization");
    }

    // If adminPassword is provided by Super Admin, update the admin user credentials
    if (settings.adminPassword && settings.adminPassword.trim().length >= 6) {
      const { AuthService } = await import("./auth.service");
      await AuthService.updateOrgAdminPassword(
        id,
        settings.adminPassword.trim(),
        settings.adminEmail || settings.email || existing.email,
        settings.adminName || settings.name || existing.name
      );
    }

    const currentPlanTier = existing.subscriptions?.subscription_plans?.type;
    if (settings.customDomain && currentPlanTier !== "ENTERPRISE") {
      throw new PlanLimitExceededError(
        "Custom domain is an Enterprise-only feature. Please upgrade your subscription."
      );
    }

    // 1. Handle Plan Tier & Subscription Upsert if planTier is provided
    if (settings.planTier) {
      const planType = settings.planTier.toUpperCase() as SubscriptionPlanType;
      let targetPlan = await prisma.subscription_plans.findFirst({
        where: { type: planType },
      });

      if (!targetPlan) {
        targetPlan = await prisma.subscription_plans.create({
          data: {
            id: `plan-${planType.toLowerCase()}`,
            name: planType === "FREE" ? "30-Day Free Trial" : `${planType.charAt(0) + planType.slice(1).toLowerCase()} Plan`,
            type: planType,
            price: planType === "FREE" ? 0 : planType === "STARTER" ? 29 : planType === "BUSINESS" ? 99 : 299,
            billingCycle: planType === "FREE" ? "30-Day Trial" : "monthly",
            updatedAt: new Date(),
          },
        });
      }

      const isFreeTrial = planType === "FREE";
      const now = new Date();
      const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.subscriptions.upsert({
        where: { organizationId: id },
        create: {
          id: `sub-${Date.now()}`,
          organizationId: id,
          planId: targetPlan.id,
          status: isFreeTrial ? "TRIAL" : "ACTIVE",
          startDate: now,
          endDate: isFreeTrial ? trialEndDate : null,
          updatedAt: new Date(),
        },
        update: {
          planId: targetPlan.id,
          status: isFreeTrial ? "TRIAL" : "ACTIVE",
          startDate: now,
          endDate: isFreeTrial ? trialEndDate : null,
          updatedAt: new Date(),
        },
      });
    }

    const currentTheme =
      typeof existing.customTheme === "object" && existing.customTheme !== null
        ? (existing.customTheme as Record<string, any>)
        : {};

    const updatedTheme = {
      ...currentTheme,
      ...(settings.brandColor ? { brandColor: settings.brandColor } : {}),
      ...(settings.defaultGeofenceM ? { defaultGeofenceM: settings.defaultGeofenceM } : {}),
      ...(settings.antiSpoofingMode ? { antiSpoofingMode: settings.antiSpoofingMode } : {}),
      ...(settings.suspensionReason !== undefined ? { suspensionReason: settings.suspensionReason } : {}),
    };

    let orgStatus: OrgStatus | undefined;
    if (settings.isSuspended !== undefined) {
      orgStatus = settings.isSuspended ? OrgStatus.SUSPENDED : OrgStatus.ACTIVE;
    } else if (settings.status) {
      const statusUpper = settings.status.toUpperCase();
      if (statusUpper === "SUSPENDED") orgStatus = OrgStatus.SUSPENDED;
      else if (statusUpper === "ACTIVE") orgStatus = OrgStatus.ACTIVE;
      else if (statusUpper === "PENDING") orgStatus = OrgStatus.PENDING;
    }

    const updated = await prisma.organizations.update({
      where: { id },
      data: {
        ...(settings.name ? { name: settings.name } : {}),
        ...(settings.slug ? { slug: settings.slug } : {}),
        ...(settings.email ? { email: settings.email } : {}),
        ...(settings.phone !== undefined ? { phone: settings.phone } : {}),
        ...(settings.website !== undefined ? { website: settings.website } : {}),
        ...(settings.industry !== undefined ? { industry: settings.industry } : {}),
        ...(settings.address !== undefined ? { address: settings.address } : {}),
        ...(settings.country !== undefined ? { country: settings.country } : {}),
        ...(settings.language ? { language: settings.language } : {}),
        ...(settings.currency ? { currency: settings.currency } : {}),
        ...(settings.timezone ? { timezone: settings.timezone } : {}),
        ...(settings.customLogoUrl !== undefined ? { logoUrl: settings.customLogoUrl } : {}),
        ...(settings.customDomain !== undefined ? { customDomain: settings.customDomain } : {}),
        ...(settings.defaultOfficeStart !== undefined ? { officeStart: settings.defaultOfficeStart } : {}),
        ...(settings.defaultOfficeEnd !== undefined ? { officeEnd: settings.defaultOfficeEnd } : {}),
        ...(settings.workingDays !== undefined ? { workingDays: settings.workingDays as any } : {}),
        ...(orgStatus ? { status: orgStatus } : {}),
        customTheme: updatedTheme,
        updatedAt: new Date(),
      },
      include: {
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
        _count: {
          select: {
            employees: true,
            branches: true,
          },
        },
      },
    });

    return mapToOrganizationData(updated);
  }

  /**
   * Suspend or unsuspend organization
   */
  static async suspendOrganization(
    id: string,
    reason: string,
    isSuspended: boolean = true
  ): Promise<OrganizationData> {
    const existing = await prisma.organizations.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Organization");
    }

    const currentTheme =
      typeof existing.customTheme === "object" && existing.customTheme !== null
        ? (existing.customTheme as Record<string, any>)
        : {};

    const updated = await prisma.organizations.update({
      where: { id },
      data: {
        status: isSuspended ? OrgStatus.SUSPENDED : OrgStatus.ACTIVE,
        customTheme: {
          ...currentTheme,
          suspensionReason: isSuspended ? reason : null,
        },
        updatedAt: new Date(),
      },
      include: {
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
        _count: {
          select: {
            employees: true,
            branches: true,
          },
        },
      },
    });

    return mapToOrganizationData(updated);
  }

  /**
   * Delete organization by ID
   */
  static async deleteOrganization(id: string): Promise<OrganizationData> {
    const existing = await prisma.organizations.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
        _count: {
          select: {
            employees: true,
            branches: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("Organization");
    }

    await prisma.organizations.delete({
      where: { id },
    });

    return mapToOrganizationData(existing);
  }
}
