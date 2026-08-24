import { NotFoundError, ConflictError, ValidationError } from "../errors";

export interface ShiftData {
  id: string;
  organizationId: string;
  name: string;
  type: "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE" | "ROTATIONAL";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  graceMinutes: number;
  overtimeThresholdHours: number;
  workingDays: string[];
  status: "Active" | "Inactive";
  assignedEmployeesCount: number;
  createdAt: string;
}

let shiftsStore: ShiftData[] = [
  {
    id: "shift-1",
    organizationId: "org-1",
    name: "General Morning Shift",
    type: "MORNING",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    breakMinutes: 60,
    graceMinutes: 15,
    overtimeThresholdHours: 8.0,
    workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    status: "Active",
    assignedEmployeesCount: 245,
    createdAt: "2026-01-15",
  },
  {
    id: "shift-2",
    organizationId: "org-1",
    name: "Evening Support Shift",
    type: "EVENING",
    startTime: "02:00 PM",
    endTime: "10:00 PM",
    breakMinutes: 45,
    graceMinutes: 15,
    overtimeThresholdHours: 8.0,
    workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    status: "Active",
    assignedEmployeesCount: 46,
    createdAt: "2026-02-01",
  },
];

export class ShiftService {
  static async getShifts(organizationId: string) {
    return shiftsStore.filter((s) => s.organizationId === organizationId);
  }

  static async getShiftById(id: string, organizationId: string) {
    const shift = shiftsStore.find((s) => s.id === id && s.organizationId === organizationId);
    if (!shift) throw new NotFoundError("Shift");
    return shift;
  }

  static async createShift(data: {
    organizationId: string;
    name: string;
    type?: ShiftData["type"];
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    graceMinutes?: number;
    overtimeThresholdHours?: number;
    workingDays: string[];
  }) {
    if (data.breakMinutes !== undefined && data.breakMinutes < 0) {
      throw new ValidationError("Break duration cannot be negative");
    }

    const newShift: ShiftData = {
      id: `shift-${Date.now()}`,
      organizationId: data.organizationId,
      name: data.name,
      type: data.type || "MORNING",
      startTime: data.startTime,
      endTime: data.endTime,
      breakMinutes: data.breakMinutes ?? 60,
      graceMinutes: data.graceMinutes ?? 15,
      overtimeThresholdHours: data.overtimeThresholdHours ?? 8.0,
      workingDays: data.workingDays,
      status: "Active",
      assignedEmployeesCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    shiftsStore.push(newShift);
    return newShift;
  }

  static async updateShift(id: string, organizationId: string, updates: Partial<ShiftData>) {
    const shift = await this.getShiftById(id, organizationId);
    Object.assign(shift, updates);
    return shift;
  }
}
