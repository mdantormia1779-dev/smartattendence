import { NotFoundError } from "../errors";
import { prisma } from "@/lib/prisma";

export interface HolidayData {
  id: string;
  organizationId: string;
  name: string;
  title?: string;
  type: string;
  startDate: string;
  endDate: string;
  date: string;
  totalDays: number;
  description?: string;
  applicableBranches: string[];
  createdAt: string;
}

export class HolidayService {
  static async getHolidays(organizationId: string) {
    const records = await prisma.holidays.findMany({
      where: { organizationId },
      orderBy: { date: "asc" },
    });

    return records.map((h): HolidayData => {
      const dateFormatted = h.date.toISOString().split("T")[0];
      return {
        id: h.id,
        organizationId: h.organizationId,
        name: h.name,
        title: h.name,
        type: h.type,
        startDate: dateFormatted,
        endDate: dateFormatted,
        date: dateFormatted,
        totalDays: 1,
        applicableBranches: ["All"],
        createdAt: h.createdAt.toISOString().split("T")[0],
      };
    });
  }

  static async createHoliday(data: {
    organizationId: string;
    name: string;
    type?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    totalDays?: number;
    description?: string;
    applicableBranches?: string[];
  }) {
    const holidayDate = data.date || data.startDate || new Date().toISOString().split("T")[0];
    const newHol = await prisma.holidays.create({
      data: {
        id: `hol-${Date.now()}`,
        organizationId: data.organizationId,
        name: data.name,
        type: data.type || "National",
        date: new Date(holidayDate),
      },
    });

    return {
      id: newHol.id,
      organizationId: newHol.organizationId,
      name: newHol.name,
      title: newHol.name,
      type: newHol.type,
      startDate: holidayDate,
      endDate: holidayDate,
      date: holidayDate,
      totalDays: 1,
      applicableBranches: ["All"],
      createdAt: newHol.createdAt.toISOString().split("T")[0],
    };
  }

  static async deleteHoliday(id: string, organizationId: string) {
    const record = await prisma.holidays.findFirst({
      where: { id, organizationId },
    });
    if (!record) throw new NotFoundError("Holiday");

    await prisma.holidays.delete({
      where: { id },
    });

    return { success: true, deletedId: id };
  }
}
