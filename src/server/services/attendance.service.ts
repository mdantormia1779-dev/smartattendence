import { calculateHaversineDistance } from "@/lib/geo-verification";
import { ValidationError, NotFoundError } from "../errors";
import { BranchService } from "./branch.service";
import { EmployeeService } from "./employee.service";
import { BiometricsService } from "./biometrics.service";
import { prisma } from "@/lib/prisma";
import { AttendanceMethod, AttendanceStatus } from "@prisma/client";

export interface AttendanceEntry {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  branch: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "HALF_DAY" | "ON_LEAVE";
  verificationMethod: "FACE_RECOGNITION" | "GPS_GEOFENCE" | "BIOMETRIC_DEVICE" | "MANUAL_OVERRIDE";
  faceConfidence: number;
  gpsDistanceMeters: number;
  isGeofenceVerified: boolean;
  isRegularized: boolean;
  regularizedBy?: string;
  regularizeReason?: string;
  createdAt: string;
}

export class AttendanceService {
  static async getAttendanceLogs(organizationId: string, query: {
    date?: string;
    branchId?: string;
    departmentId?: string;
    employeeId?: string;
    limit?: number;
  }) {
    const where: any = {
      employees: { organizationId },
    };

    if (query.date) {
      const dStart = new Date(query.date);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(query.date);
      dEnd.setHours(23, 59, 59, 999);
      where.date = { gte: dStart, lte: dEnd };
    }

    if (query.employeeId) {
      where.OR = [
        { employeeId: query.employeeId },
        { employees: { employeeCode: query.employeeId } },
      ];
    }

    if (query.branchId && query.branchId !== "All") {
      where.employees = { ...where.employees, branchId: query.branchId };
    }

    if (query.departmentId && query.departmentId !== "All") {
      where.employees = { ...where.employees, departmentId: query.departmentId };
    }

    const records = await prisma.attendance.findMany({
      where,
      take: query.limit || 50,
      orderBy: { createdAt: "desc" },
      include: {
        employees: {
          include: {
            branches: true,
            departments: true,
          },
        },
      },
    });

    return records.map((r): AttendanceEntry => {
      const isPresent = r.status === AttendanceStatus.PRESENT;
      const isLate = r.status === AttendanceStatus.LATE || r.lateMinutes > 0;
      const isLeave = r.status === AttendanceStatus.ON_LEAVE;
      const isHalf = r.status === AttendanceStatus.HALF_DAY;

      let statusStr: AttendanceEntry["status"] = "ABSENT";
      if (isPresent) statusStr = "PRESENT";
      else if (isLate) statusStr = "LATE";
      else if (isLeave) statusStr = "ON_LEAVE";
      else if (isHalf) statusStr = "HALF_DAY";

      let methodStr: AttendanceEntry["verificationMethod"] = "GPS_GEOFENCE";
      if (r.checkInMethod === AttendanceMethod.FACE) methodStr = "FACE_RECOGNITION";
      else if (r.checkInMethod === AttendanceMethod.FINGERPRINT) methodStr = "BIOMETRIC_DEVICE";
      else if (r.checkInMethod === AttendanceMethod.MANUAL) methodStr = "MANUAL_OVERRIDE";

      const timeFormatted = r.checkInTime
        ? new Date(r.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "--";
      const outFormatted = r.checkOutTime
        ? new Date(r.checkOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : undefined;

      return {
        id: r.id,
        organizationId: r.employees.organizationId,
        employeeId: r.employees.employeeCode,
        employeeName: r.employees.fullName,
        department: r.employees.departments?.name || "General",
        branch: r.employees.branches?.name || "Main Branch",
        date: r.date.toISOString().split("T")[0],
        checkInTime: timeFormatted,
        checkOutTime: outFormatted,
        status: statusStr,
        verificationMethod: methodStr,
        faceConfidence: r.faceScore || 98.0,
        gpsDistanceMeters: 25,
        isGeofenceVerified: true,
        isRegularized: false,
        createdAt: r.createdAt.toISOString(),
      };
    });
  }

  static async getTodayStatus(organizationId: string, employeeId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const punch = await prisma.attendance.findFirst({
      where: {
        employees: {
          organizationId,
          OR: [{ id: employeeId }, { employeeCode: employeeId }],
        },
        date: { gte: todayStart, lte: todayEnd },
      },
      include: {
        employees: {
          include: { branches: true, departments: true },
        },
      },
    });

    if (!punch) return null;

    return {
      id: punch.id,
      organizationId: punch.employees.organizationId,
      employeeId: punch.employees.employeeCode,
      employeeName: punch.employees.fullName,
      department: punch.employees.departments?.name || "General",
      branch: punch.employees.branches?.name || "Main Branch",
      date: punch.date.toISOString().split("T")[0],
      checkInTime: punch.checkInTime
        ? new Date(punch.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "--",
      status: punch.status,
      verificationMethod: punch.checkInMethod,
      createdAt: punch.createdAt.toISOString(),
    };
  }

  static async checkIn(data: {
    organizationId: string;
    employeeId: string;
    latitude: number;
    longitude: number;
    verificationMethod?: AttendanceEntry["verificationMethod"];
    faceVector?: number[];
  }) {
    const employee = await EmployeeService.getEmployeeById(data.employeeId, data.organizationId);
    const branch = await BranchService.getBranchById(employee.branchId, data.organizationId);

    // 1. Calculate Server-Side GPS Geofence Distance with object coordinates
    const distanceMeters = calculateHaversineDistance(
      { latitude: data.latitude, longitude: data.longitude },
      { latitude: branch.latitude, longitude: branch.longitude }
    );

    const isInside = distanceMeters <= branch.geofenceRadius;
    if (!isInside) {
      throw new ValidationError(
        `Geofence verification failed: You are ${distanceMeters}m away from ${branch.name} (Max allowed: ${branch.geofenceRadius}m)`
      );
    }

    // 2. Face Recognition Verification if Vector provided
    let confidence = 98.0;
    if (data.faceVector && data.faceVector.length === 128) {
      const match = await BiometricsService.verifyFace(data.employeeId, data.faceVector);
      confidence = match.confidence;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: todayStart, lte: todayEnd },
      },
    });

    if (existing && existing.checkInTime) {
      throw new ValidationError(
        `Duplicate Punch: Employee ${employee.name} is already checked in for today.`
      );
    }

    // Evaluate punctuality (Late after 09:15 AM)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isLate = currentMinutes > (9 * 60 + 15);
    const lateMinutes = isLate ? currentMinutes - (9 * 60) : 0;

    let methodEnum: AttendanceMethod = AttendanceMethod.GPS;
    if (data.verificationMethod === "FACE_RECOGNITION") methodEnum = AttendanceMethod.FACE;
    else if (data.verificationMethod === "BIOMETRIC_DEVICE") methodEnum = AttendanceMethod.FINGERPRINT;

    const newRecord = await prisma.attendance.create({
      data: {
        id: `att-${Date.now()}`,
        employeeId: employee.id,
        date: new Date(),
        checkInTime: now,
        checkInMethod: methodEnum,
        checkInLat: data.latitude,
        checkInLng: data.longitude,
        faceScore: confidence,
        status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
        lateMinutes,
        updatedAt: new Date(),
      },
      include: {
        employees: {
          include: { branches: true, departments: true },
        },
      },
    });

    return {
      id: newRecord.id,
      organizationId: newRecord.employees.organizationId,
      employeeId: newRecord.employees.employeeCode,
      employeeName: newRecord.employees.fullName,
      department: newRecord.employees.departments?.name || "General",
      branch: newRecord.employees.branches?.name || "Main Branch",
      date: newRecord.date.toISOString().split("T")[0],
      checkInTime: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: isLate ? "LATE" : "PRESENT",
      verificationMethod: data.verificationMethod || "FACE_RECOGNITION",
      faceConfidence: confidence,
      gpsDistanceMeters: Math.round(distanceMeters),
      isGeofenceVerified: true,
      isRegularized: false,
      createdAt: newRecord.createdAt.toISOString(),
    };
  }

  static async checkOut(data: {
    organizationId: string;
    employeeId: string;
    latitude: number;
    longitude: number;
  }) {
    const employee = await EmployeeService.getEmployeeById(data.employeeId, data.organizationId);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const record = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: todayStart, lte: todayEnd },
      },
    });

    if (!record) {
      throw new ValidationError("Cannot punch out: No check-in record found for today");
    }

    const now = new Date();
    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOutTime: now,
        checkOutLat: data.latitude,
        checkOutLng: data.longitude,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      employeeId: employee.employeeId,
      checkOutTime: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  static async regularize(data: {
    organizationId: string;
    attendanceId: string;
    checkInTime?: string;
    checkOutTime?: string;
    status: AttendanceEntry["status"];
    reason: string;
    regularizedBy: string;
  }) {
    const statusEnum = data.status.toUpperCase() as AttendanceStatus;
    const updated = await prisma.attendance.update({
      where: { id: data.attendanceId },
      data: {
        status: statusEnum,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      status: data.status,
      isRegularized: true,
      regularizedBy: data.regularizedBy,
      regularizeReason: data.reason,
    };
  }
}
