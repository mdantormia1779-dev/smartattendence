import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

let notificationPreferencesStore: Record<string, any> = {
  "user-org-1": {
    emailAlerts: true,
    pushAlerts: true,
    attendanceAlerts: true,
    payrollAlerts: true,
    leaveAlerts: true,
    referralAlerts: true,
  },
  "user-emp-1": {
    emailAlerts: true,
    pushAlerts: true,
    attendanceAlerts: true,
    payrollAlerts: true,
    leaveAlerts: true,
    referralAlerts: true,
  },
};

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const prefs = notificationPreferencesStore[session.userId] || {
      emailAlerts: true,
      pushAlerts: true,
      attendanceAlerts: true,
      payrollAlerts: true,
      leaveAlerts: true,
      referralAlerts: true,
    };

    return apiSuccess(prefs, "Notification preferences fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();

    notificationPreferencesStore[session.userId] = {
      ...(notificationPreferencesStore[session.userId] || {}),
      ...body,
    };

    return apiSuccess(notificationPreferencesStore[session.userId], "Notification preferences updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
