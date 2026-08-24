import { NotFoundError } from "../errors";

export interface HolidayData {
  id: string;
  organizationId: string;
  name: string;
  type: "Government" | "Festival" | "Company" | "Weekly";
  startDate: string;
  endDate: string;
  totalDays: number;
  description?: string;
  applicableBranches: string[];
  createdAt: string;
}

let holidaysStore: HolidayData[] = [
  {
    id: "hol-1",
    organizationId: "org-1",
    name: "National Mourning Day",
    type: "Government",
    startDate: "2026-08-15",
    endDate: "2026-08-15",
    totalDays: 1,
    description: "National public holiday",
    applicableBranches: ["All"],
    createdAt: "2026-01-01",
  },
  {
    id: "hol-2",
    organizationId: "org-1",
    name: "Eid-ul-Fitr Holidays",
    type: "Festival",
    startDate: "2026-03-20",
    endDate: "2026-03-24",
    totalDays: 5,
    description: "Annual religious festival",
    applicableBranches: ["All"],
    createdAt: "2026-01-01",
  },
  {
    id: "hol-3",
    organizationId: "org-1",
    name: "Vertex Annual Tech Summit",
    type: "Company",
    startDate: "2026-11-10",
    endDate: "2026-11-10",
    totalDays: 1,
    description: "Company-wide day off for annual retreat",
    applicableBranches: ["All"],
    createdAt: "2026-01-01",
  },
];

export class HolidayService {
  static async getHolidays(organizationId: string) {
    return holidaysStore.filter((h) => h.organizationId === organizationId);
  }

  static async createHoliday(data: {
    organizationId: string;
    name: string;
    type?: HolidayData["type"];
    startDate: string;
    endDate: string;
    totalDays?: number;
    description?: string;
    applicableBranches?: string[];
  }) {
    const newHoliday: HolidayData = {
      id: `hol-${Date.now()}`,
      organizationId: data.organizationId,
      name: data.name,
      type: data.type || "Government",
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays || 1,
      description: data.description,
      applicableBranches: data.applicableBranches || ["All"],
      createdAt: new Date().toISOString().split("T")[0],
    };

    holidaysStore.push(newHoliday);
    return newHoliday;
  }
}
