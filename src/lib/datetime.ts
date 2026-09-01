/**
 * Timezone, Working Days & Holiday Calculation Helpers
 */

export interface WorkingDaysConfig {
  workingDays: string[]; // e.g. ["Sun", "Mon", "Tue", "Wed", "Thu"]
  holidays: string[];    // array of "YYYY-MM-DD"
  timezone?: string;     // default "Asia/Dhaka"
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Normalizes timezone string to valid IANA format (e.g. "Asia/Dhaka (GMT+6)" -> "Asia/Dhaka")
 */
export function cleanTimezone(timeZoneStr?: string | null): string {
  if (!timeZoneStr || typeof timeZoneStr !== "string") return "Asia/Dhaka";
  let tz = timeZoneStr.trim();
  if (tz.includes(" ")) {
    tz = tz.split(" ")[0].trim();
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "Asia/Dhaka";
  }
}

/**
 * Returns YYYY-MM-DD in the specified timezone (default: Asia/Dhaka)
 */
export function getLocalDateString(
  dateInput: Date | string = new Date(),
  timeZoneStr?: string | null
): string {
  const dateObj = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(dateObj.getTime())) return new Date().toISOString().split("T")[0];
  const tz = cleanTimezone(timeZoneStr);
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(dateObj);
  } catch {
    return dateObj.toISOString().split("T")[0];
  }
}

/**
 * Returns a UTC Date object representing YYYY-MM-DDT00:00:00.000Z in the specified timezone
 */
export function getLocalDateObject(
  dateInput: Date | string = new Date(),
  timeZoneStr?: string | null
): Date {
  const dateStr = getLocalDateString(dateInput, timeZoneStr);
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/**
 * Formats a Date or ISO string in the specified timezone (default: Asia/Dhaka)
 */
export function formatTimeInTimezone(
  dateInput: Date | string | null | undefined,
  timeZoneStr?: string | null
): string {
  if (!dateInput) return "--";
  const dateObj = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(dateObj.getTime())) return "--";

  const tz = cleanTimezone(timeZoneStr);
  try {
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
    });
  } catch {
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
}

/**
 * Extracts hours and minutes in the specified timezone
 */
export function getTimeInTimezone(date: Date, timeZoneStr?: string | null) {
  const tz = cleanTimezone(timeZoneStr);
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10) % 24;
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const second = parseInt(parts.find((p) => p.type === "second")?.value || "0", 10);
    return { hour, minute, second, totalMinutes: hour * 60 + minute };
  } catch {
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      totalMinutes: date.getHours() * 60 + date.getMinutes(),
    };
  }
}

/**
 * Formats a Date or date string to readable format e.g. "02 Sep 2026"
 */
export function formatReadableDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "--";
  const dateObj = typeof dateInput === "string" ? new Date(dateInput.includes("T") ? dateInput : `${dateInput}T00:00:00`) : dateInput;
  if (isNaN(dateObj.getTime())) return typeof dateInput === "string" ? dateInput : "--";
  return dateObj.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a Date or date string to long readable format e.g. "Wednesday, 02 Sep 2026"
 */
export function formatLongDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "--";
  const dateObj = typeof dateInput === "string" ? new Date(dateInput.includes("T") ? dateInput : `${dateInput}T00:00:00`) : dateInput;
  if (isNaN(dateObj.getTime())) return typeof dateInput === "string" ? dateInput : "--";
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format any attendance time value (whether ISO timestamp or pre-formatted string)
 */
export function formatAttendanceTime(
  timeVal: string | Date | null | undefined,
  timeZoneStr: string = "Asia/Dhaka"
): string {
  if (!timeVal) return "--";
  if (timeVal instanceof Date) {
    return formatTimeInTimezone(timeVal, timeZoneStr);
  }
  if (typeof timeVal === "string") {
    const trimmed = timeVal.trim();
    if (trimmed === "-" || trimmed === "--" || trimmed === "—") return "--";
    // If it's an ISO date string e.g. "2026-09-01T21:28:56.019Z"
    if (trimmed.includes("T") || trimmed.endsWith("Z")) {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return formatTimeInTimezone(parsed, timeZoneStr);
      }
    }
    // If it's already a formatted time like "03:28 AM" or "3:28 PM"
    return trimmed;
  }
  return "--";
}

/**
 * Checks if a given date is a working business day for the organization
 */
export function isWorkingDay(date: Date, config: WorkingDaysConfig): boolean {
  const dayName = DAY_NAMES[date.getDay()];
  const isRegularWorkingDay = config.workingDays.includes(dayName);

  const dateStr = date.toISOString().split("T")[0];
  const isHoliday = config.holidays.includes(dateStr);

  return isRegularWorkingDay && !isHoliday;
}

/**
 * Calculates net leave days between two dates, excluding weekends and official holidays
 */
export function calculateNetLeaveDays(
  startDateStr: string,
  endDateStr: string,
  config: WorkingDaysConfig
): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (isWorkingDay(current, config)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Checks if a punch request is within the anti-duplicate debounce window (e.g. 60s)
 */
export function isDuplicatePunchWindow(lastPunchTime: Date, now: Date, debounceSeconds: number = 60): boolean {
  const diffMs = Math.abs(now.getTime() - lastPunchTime.getTime());
  return diffMs < debounceSeconds * 1000;
}
