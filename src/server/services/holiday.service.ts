import { NotFoundError, ValidationError } from "../errors";
import { prisma } from "@/lib/prisma";

export interface HolidayData {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  date: string;
  totalDays: number;
  description?: string;
  applicableBranches: string;
  status: "Upcoming" | "Completed";
  createdAt: string;
}

async function resolveOrganizationId(inputOrgId?: string | null): Promise<string> {
  if (inputOrgId && inputOrgId !== "org-1" && inputOrgId !== "default") {
    const directMatch = await prisma.organizations.findUnique({
      where: { id: inputOrgId },
      select: { id: true },
    }).catch(() => null);
    if (directMatch) return directMatch.id;
  }

  const firstOrg = await prisma.organizations.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  }).catch(() => null);

  if (firstOrg) return firstOrg.id;

  return inputOrgId || "org-1";
}

export class HolidayService {
  /**
   * Get all holidays for an organization
   */
  static async getHolidays(organizationId: string): Promise<HolidayData[]> {
    const validOrgId = await resolveOrganizationId(organizationId);

    let records = await prisma.holidays.findMany({
      where: { organizationId: validOrgId },
      orderBy: { date: "asc" },
    });

    // Auto-seed initial official holidays if empty
    if (records.length === 0) {
      const initialHolidays = [
        {
          id: `hol-1-${Date.now()}`,
          organizationId: validOrgId,
          name: "International Mother Language Day",
          date: new Date("2026-02-21"),
          type: "GOVERNMENT",
        },
        {
          id: `hol-2-${Date.now() + 1}`,
          organizationId: validOrgId,
          name: "Independence Day & National Day",
          date: new Date("2026-03-26"),
          type: "GOVERNMENT",
        },
        {
          id: `hol-3-${Date.now() + 2}`,
          organizationId: validOrgId,
          name: "Eid-ul-Fitr Holidays",
          date: new Date("2026-03-31"),
          type: "FESTIVAL",
        },
        {
          id: `hol-4-${Date.now() + 3}`,
          organizationId: validOrgId,
          name: "Bengali New Year (Pohela Boishakh)",
          date: new Date("2026-04-14"),
          type: "FESTIVAL",
        },
        {
          id: `hol-5-${Date.now() + 4}`,
          organizationId: validOrgId,
          name: "May Day (Labor Day)",
          date: new Date("2026-05-01"),
          type: "GOVERNMENT",
        },
        {
          id: `hol-6-${Date.now() + 5}`,
          organizationId: validOrgId,
          name: "Eid-ul-Adha Holidays",
          date: new Date("2026-06-07"),
          type: "FESTIVAL",
        },
        {
          id: `hol-7-${Date.now() + 6}`,
          organizationId: validOrgId,
          name: "Victory Day",
          date: new Date("2026-12-16"),
          type: "GOVERNMENT",
        },
      ];

      for (const h of initialHolidays) {
        await prisma.holidays.create({ data: h }).catch(() => {});
      }

      records = await prisma.holidays.findMany({
        where: { organizationId: validOrgId },
        orderBy: { date: "asc" },
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    return records.map((h): HolidayData => {
      const dateFormatted = h.date.toISOString().split("T")[0];
      const isPast = dateFormatted < todayStr;

      return {
        id: h.id,
        organizationId: h.organizationId,
        name: h.name,
        type: h.type || "Government Holiday",
        startDate: dateFormatted,
        endDate: dateFormatted,
        date: dateFormatted,
        totalDays: 1,
        description: `${h.name} public holiday observation.`,
        applicableBranches: "All Branches",
        status: isPast ? "Completed" : "Upcoming",
        createdAt: h.createdAt.toISOString().split("T")[0],
      };
    });
  }

  /**
   * Get single holiday by ID
   */
  static async getHolidayById(id: string, organizationId: string): Promise<HolidayData> {
    const validOrgId = await resolveOrganizationId(organizationId);
    const holiday = await prisma.holidays.findFirst({
      where: { id, organizationId: validOrgId },
    });

    if (!holiday) throw new NotFoundError("Holiday");

    const dateFormatted = holiday.date.toISOString().split("T")[0];
    const isPast = dateFormatted < new Date().toISOString().split("T")[0];

    return {
      id: holiday.id,
      organizationId: holiday.organizationId,
      name: holiday.name,
      type: holiday.type || "Government Holiday",
      startDate: dateFormatted,
      endDate: dateFormatted,
      date: dateFormatted,
      totalDays: 1,
      description: `${holiday.name} observation.`,
      applicableBranches: "All Branches",
      status: isPast ? "Completed" : "Upcoming",
      createdAt: holiday.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Create new holiday in database
   */
  static async createHoliday(data: {
    organizationId: string;
    name: string;
    type?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }): Promise<HolidayData> {
    const validOrgId = await resolveOrganizationId(data.organizationId);

    if (!data.name || !data.name.trim()) {
      throw new ValidationError("Holiday title is required");
    }

    const holidayDateStr = data.date || data.startDate || new Date().toISOString().split("T")[0];

    const newHol = await prisma.holidays.create({
      data: {
        id: `hol-${Date.now()}`,
        organizationId: validOrgId,
        name: data.name.trim(),
        type: data.type || "GOVERNMENT",
        date: new Date(holidayDateStr),
      },
    });

    const dateFormatted = newHol.date.toISOString().split("T")[0];
    const isPast = dateFormatted < new Date().toISOString().split("T")[0];

    return {
      id: newHol.id,
      organizationId: newHol.organizationId,
      name: newHol.name,
      type: newHol.type,
      startDate: dateFormatted,
      endDate: dateFormatted,
      date: dateFormatted,
      totalDays: 1,
      description: data.description || `${newHol.name} observation.`,
      applicableBranches: "All Branches",
      status: isPast ? "Completed" : "Upcoming",
      createdAt: newHol.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Update existing holiday in database
   */
  static async updateHoliday(
    id: string,
    organizationId: string,
    updates: {
      name?: string;
      type?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }
  ): Promise<HolidayData> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const existing = await prisma.holidays.findFirst({
      where: { id, organizationId: validOrgId },
    });

    if (!existing) throw new NotFoundError("Holiday");

    const dateToUpdate = updates.date || updates.startDate ? new Date(updates.date || updates.startDate!) : undefined;

    const updated = await prisma.holidays.update({
      where: { id },
      data: {
        ...(updates.name ? { name: updates.name.trim() } : {}),
        ...(updates.type ? { type: updates.type } : {}),
        ...(dateToUpdate ? { date: dateToUpdate } : {}),
      },
    });

    const dateFormatted = updated.date.toISOString().split("T")[0];
    const isPast = dateFormatted < new Date().toISOString().split("T")[0];

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      name: updated.name,
      type: updated.type,
      startDate: dateFormatted,
      endDate: dateFormatted,
      date: dateFormatted,
      totalDays: 1,
      description: updates.description || `${updated.name} observation.`,
      applicableBranches: "All Branches",
      status: isPast ? "Completed" : "Upcoming",
      createdAt: updated.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Delete holiday from database
   */
  static async deleteHoliday(id: string, organizationId: string): Promise<{ success: boolean; deletedId: string }> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const record = await prisma.holidays.findFirst({
      where: { id, organizationId: validOrgId },
    });

    if (!record) throw new NotFoundError("Holiday");

    await prisma.holidays.delete({
      where: { id },
    });

    return { success: true, deletedId: id };
  }
}
