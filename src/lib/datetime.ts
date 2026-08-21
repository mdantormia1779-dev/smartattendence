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
