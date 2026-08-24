/**
 * Type-Safe Centralized API Client & Service Layer
 * Automatically attaches Authorization headers and provides structured domain helpers.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token") || "super-admin-token";
      const storedUser = localStorage.getItem("user");
      let userRole = "SUPER_ADMIN";
      let userId = "user-super-1";
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role) userRole = parsed.role;
          if (parsed.id || parsed.userId) userId = parsed.id || parsed.userId;
        } catch {}
      }

      return {
        Authorization: `Bearer ${token}`,
        "x-user-role": userRole,
        "x-user-id": userId,
      };
    }
    return {};
  }

  public async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const authHeaders = this.getAuthHeader();
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.error(`[API_CLIENT_ERROR] ${options.method || "GET"} ${url}:`, err);
      return {
        success: false,
        message: err.message || "Network error",
        error: {
          code: "NETWORK_ERROR",
          message: err.message || "Failed to communicate with server",
        },
      };
    }
  }

  async get<T = any>(url: string, queryParams?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams();
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
    }
    // Cache-busting parameter to prevent browser & proxy caches
    searchParams.append("_t", Date.now().toString());

    const separator = url.includes("?") ? "&" : "?";
    const finalUrl = `${url}${separator}${searchParams.toString()}`;

    return this.request<T>(finalUrl, {
      method: "GET",
      cache: "no-store",
    });
  }

  async post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: "DELETE" });
  }

  // Domain Helper Services for UI
  auth = {
    login: (body: { email: string; password: string }) => this.post("/api/auth/login", body),
    register: (body: any) => this.post("/api/auth/register", body),
    logout: () => this.post("/api/auth/logout"),
    session: () => this.get("/api/auth/session"),
    me: () => this.get("/api/auth/me"),
  };

  organizations = {
    getAll: () => this.get("/api/organizations"),
    getById: (id: string) => this.get(`/api/organizations/${id}`),
    create: (body: any) => this.post("/api/organizations", body),
    update: (id: string, body: any) => this.patch(`/api/organizations/${id}`, body),
    delete: (id: string) => this.delete(`/api/organizations/${id}`),
    getStats: (id: string) => this.get(`/api/organizations/${id}/stats`),
    getSettings: (id: string) => this.get(`/api/organizations/${id}/settings`),
    updateSettings: (id: string, body: any) => this.patch(`/api/organizations/${id}/settings`, body),
  };

  branches = {
    getAll: () => this.get("/api/branches"),
    getById: (id: string) => this.get(`/api/branches/${id}`),
    create: (body: any) => this.post("/api/branches", body),
    update: (id: string, body: any) => this.patch(`/api/branches/${id}`, body),
    delete: (id: string) => this.delete(`/api/branches/${id}`),
  };

  departments = {
    getAll: () => this.get("/api/departments"),
    getById: (id: string) => this.get(`/api/departments/${id}`),
    create: (body: any) => this.post("/api/departments", body),
    update: (id: string, body: any) => this.patch(`/api/departments/${id}`, body),
    delete: (id: string) => this.delete(`/api/departments/${id}`),
  };

  managers = {
    getAll: () => this.get("/api/managers"),
    getById: (id: string) => this.get(`/api/managers/${id}`),
    create: (body: any) => this.post("/api/managers", body),
    assign: (id: string, body: any) => this.patch(`/api/managers/${id}`, body),
    delete: (id: string) => this.delete(`/api/managers/${id}`),
  };

  employees = {
    getAll: (params?: any) => this.get("/api/employees", params),
    getById: (id: string) => this.get(`/api/employees/${id}`),
    create: (body: any) => this.post("/api/employees", body),
    update: (id: string, body: any) => this.patch(`/api/employees/${id}`, body),
    delete: (id: string) => this.delete(`/api/employees/${id}`),
    getAttendance: (id: string) => this.get(`/api/employees/${id}/attendance`),
    getLeaves: (id: string) => this.get(`/api/employees/${id}/leaves`),
    getPayslips: (id: string) => this.get(`/api/employees/${id}/payslips`),
    getDocuments: (id: string) => this.get(`/api/employees/${id}/documents`),
  };

  attendance = {
    getLogs: (params?: any) => this.get("/api/attendance", params),
    getToday: () => this.get("/api/attendance/today"),
    checkIn: (body: any) => this.post("/api/attendance/check-in", body),
    checkOut: (body: any) => this.post("/api/attendance/check-out", body),
    verifyLocation: (body: any) => this.post("/api/attendance/verify-location", body),
    regularize: (body: any) => this.post("/api/attendance/regularize", body),
  };

  shifts = {
    getAll: () => this.get("/api/shifts"),
    create: (body: any) => this.post("/api/shifts", body),
    update: (id: string, body: any) => this.patch(`/api/shifts/${id}`, body),
    delete: (id: string) => this.delete(`/api/shifts/${id}`),
    assign: (shiftId: string, employeeIds: string[]) => this.post(`/api/shifts/${shiftId}/assign`, { employeeIds }),
  };

  overtime = {
    getAll: (params?: any) => this.get("/api/overtime", params),
    submit: (body: any) => this.post("/api/overtime", body),
    approve: (id: string, comment?: string) => this.post(`/api/overtime/${id}/approve`, { decision: "APPROVED", comment }),
    reject: (id: string, comment?: string) => this.post(`/api/overtime/${id}/reject`, { comment }),
  };

  leaves = {
    getAll: (params?: any) => this.get("/api/leaves", params),
    submit: (body: any) => this.post("/api/leaves", body),
    approve: (id: string, comment?: string) => this.post(`/api/leaves/${id}/approve`, { decision: "APPROVED", comment }),
    reject: (id: string, comment?: string) => this.post(`/api/leaves/${id}/reject`, { comment }),
    cancel: (id: string) => this.post(`/api/leaves/${id}/cancel`),
  };

  holidays = {
    getAll: () => this.get("/api/holidays"),
    create: (body: any) => this.post("/api/holidays", body),
    update: (id: string, body: any) => this.patch(`/api/holidays/${id}`, body),
    delete: (id: string) => this.delete(`/api/holidays/${id}`),
  };

  payroll = {
    getBatches: () => this.get("/api/payroll"),
    getBatchById: (id: string) => this.get(`/api/payroll/${id}`),
    generate: (month: string) => this.post("/api/payroll/generate", { month }),
    approve: (id: string) => this.post(`/api/payroll/${id}/approve`),
    finalize: (id: string) => this.post(`/api/payroll/${id}/finalize`),
    getPayslips: () => this.get("/api/payslips"),
    getPayslipById: (id: string) => this.get(`/api/payslips/${id}`),
  };

  subscriptions = {
    getPlans: () => this.get("/api/subscription/plans"),
    createPlan: (body: any) => this.post("/api/subscription/plans", body),
    updatePlan: (id: string, body: any) => this.patch(`/api/subscription/plans/${id}`, body),
    getTrialStatus: () => this.get("/api/subscription/trial"),
    checkout: (body: any) => this.post("/api/subscription/checkout", body),
    upgrade: (body: any) => this.post("/api/subscription/upgrade", body),
    downgrade: (body: any) => this.post("/api/subscription/downgrade", body),
    cancel: (id?: string) => this.post("/api/subscription/cancel", { id }),
    delete: (id: string) => this.delete(`/api/subscription/plans/${id}`),
  };

  payments = {
    getAll: () => this.get("/api/payments"),
    getById: (id: string) => this.get(`/api/payments/${id}`),
    create: (body: any) => this.post("/api/payments", body),
    updateStatus: (id: string, status: string) => this.patch(`/api/payments/${id}`, { status }),
  };

  referrals = {
    getAccount: () => this.get("/api/referrals"),
    getLink: () => this.get("/api/referrals/link"),
    getAnalytics: () => this.get("/api/referrals/analytics"),
    getConversions: () => this.get("/api/referrals/conversions"),
    getCommissions: () => this.get("/api/commissions"),
    getWallet: () => this.get("/api/wallet"),
    getTransactions: () => this.get("/api/wallet/transactions"),
    requestWithdrawal: (body: any) => this.post("/api/withdrawals", body),
    getWithdrawals: () => this.get("/api/withdrawals"),
  };

  adminReferrals = {
    getCommissions: () => this.get("/api/admin/commissions"),
    approveCommission: (id: string) => this.post(`/api/admin/commissions/${id}/approve`),
    reverseCommission: (id: string, reason: string) => this.post(`/api/admin/commissions/${id}/reverse`, { reason }),
    getWithdrawals: () => this.get("/api/admin/withdrawals"),
    approveWithdrawal: (id: string, adminNotes?: string) => this.post(`/api/admin/withdrawals/${id}/approve`, { adminNotes }),
    rejectWithdrawal: (id: string, rejectionReason: string) => this.post(`/api/admin/withdrawals/${id}/reject`, { rejectionReason }),
    markWithdrawalPaid: (id: string) => this.post(`/api/admin/withdrawals/${id}/paid`),
  };

  notifications = {
    getAll: () => this.get("/api/notifications"),
    markRead: (id: string) => this.patch(`/api/notifications/${id}/read`),
    markAllRead: () => this.post("/api/notifications/read-all"),
    getPreferences: () => this.get("/api/notification-preferences"),
    updatePreferences: (body: any) => this.patch("/api/notification-preferences", body),
  };

  reports = {
    attendance: (params?: any) => this.get("/api/reports/attendance", params),
    employee: () => this.get("/api/reports/employee"),
    leave: () => this.get("/api/reports/leave"),
    overtime: () => this.get("/api/reports/overtime"),
    payroll: () => this.get("/api/reports/payroll"),
    revenue: () => this.get("/api/reports/revenue"),
    subscription: () => this.get("/api/reports/subscription"),
    referral: () => this.get("/api/reports/referral"),
    commission: () => this.get("/api/reports/commission"),
  };

  analytics = {
    admin: () => this.get("/api/analytics/admin"),
    organization: () => this.get("/api/analytics/organization"),
    employee: () => this.get("/api/analytics/employee"),
  };

  auditLogs = {
    getAll: (params?: any) => this.get("/api/audit-logs", params),
    getById: (id: string) => this.get(`/api/audit-logs/${id}`),
  };
}

export const api = new ApiClient();
