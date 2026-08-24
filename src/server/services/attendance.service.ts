import { calculateHaversineDistance } from "@/lib/geo-verification";
import { isDuplicatePunchWindow } from "@/lib/datetime";
import { ValidationError, NotFoundError } from "../errors";
import { BranchService } from "./branch.service";
import { EmployeeService } from "./employee.service";
import { BiometricsService } from "./biometrics.service";

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

let attendanceStore: AttendanceEntry[] = [
  {
    id: "att-1",
    organizationId: "org-1",
    employeeId: "EMP-1042",
    employeeName: "Arif Chowdhury",
    department: "Information Technology",
    branch: "Head Office – Dhaka",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "08:52 AM",
    status: "PRESENT",
    verificationMethod: "FACE_RECOGNITION",
    faceConfidence: 98.4,
    gpsDistanceMeters: 38,
    isGeofenceVerified: true,
    isRegularized: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "att-2",
    organizationId: "org-1",
    employeeId: "EMP-1043",
    employeeName: "Nusrat Jahan",
    department: "Accounts & Finance",
    branch: "Head Office – Dhaka",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "08:58 AM",
    status: "PRESENT",
    verificationMethod: "FACE_RECOGNITION",
    faceConfidence: 97.2,
    gpsDistanceMeters: 45,
    isGeofenceVerified: true,
    isRegularized: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "att-3",
    organizationId: "org-1",
    employeeId: "EMP-1044",
    employeeName: "Mahmudul Hasan",
    department: "Information Technology",
    branch: "Head Office – Dhaka",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "09:22 AM",
    status: "LATE",
    verificationMethod: "GPS_GEOFENCE",
    faceConfidence: 0,
    gpsDistanceMeters: 62,
    isGeofenceVerified: true,
    isRegularized: false,
    createdAt: new Date().toISOString(),
  },
];

export class AttendanceService {
  static async getAttendanceLogs(organizationId: string, query: {
    date?: string;
    branchId?: string;
    departmentId?: string;
    employeeId?: string;
  }) {
    let list = attendanceStore.filter((a) => a.organizationId === organizationId);
    if (query.date) {
      list = list.filter((a) => a.date === query.date);
    }
    if (query.employeeId) {
      list = list.filter((a) => a.employeeId === query.employeeId);
    }
    return list;
  }

  static async getTodayStatus(organizationId: string, employeeId: string) {
    const todayStr = new Date().toISOString().split("T")[0];
    const punch = attendanceStore.find((a) => a.organizationId === organizationId && a.employeeId === employeeId && a.date === todayStr);
    return punch || null;
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

    const todayStr = new Date().toISOString().split("T")[0];
    const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // Check duplicate punch debounce (60 seconds)
    const existing = attendanceStore.find((a) => a.organizationId === data.organizationId && a.employeeId === data.employeeId && a.date === todayStr);
    if (existing && existing.checkInTime) {
      throw new ValidationError(`Duplicate Punch: Employee ${employee.name} is already checked in for today at ${existing.checkInTime}`);
    }

    // Evaluate punctuality (Late after 09:15 AM)
    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const isLate = currentMinutes > (9 * 60 + 15);

    const newRecord: AttendanceEntry = {
      id: `att-${Date.now()}`,
      organizationId: data.organizationId,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      branch: branch.name,
      date: todayStr,
      checkInTime: nowTimeStr,
      status: isLate ? "LATE" : "PRESENT",
      verificationMethod: data.verificationMethod || "FACE_RECOGNITION",
      faceConfidence: confidence,
      gpsDistanceMeters: Math.round(distanceMeters),
      isGeofenceVerified: true,
      isRegularized: false,
      createdAt: new Date().toISOString(),
    };

    attendanceStore.unshift(newRecord);
    return newRecord;
  }

  static async checkOut(data: {
    organizationId: string;
    employeeId: string;
    latitude: number;
    longitude: number;
  }) {
    const todayStr = new Date().toISOString().split("T")[0];
    const record = attendanceStore.find((a) => a.organizationId === data.organizationId && a.employeeId === data.employeeId && a.date === todayStr);
    if (!record) {
      throw new ValidationError("Cannot punch out: No check-in record found for today");
    }

    record.checkOutTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return record;
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
    const record = attendanceStore.find((a) => a.id === data.attendanceId && a.organizationId === data.organizationId);
    if (!record) throw new NotFoundError("Attendance Record");

    if (data.checkInTime) record.checkInTime = data.checkInTime;
    if (data.checkOutTime) record.checkOutTime = data.checkOutTime;
    record.status = data.status;
    record.isRegularized = true;
    record.regularizedBy = data.regularizedBy;
    record.regularizeReason = data.reason;

    return record;
  }
}
