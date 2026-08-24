# 📚 Master Postman API Testing & Integration Guide

This guide documents the complete automated testing workflow for the **Smart Attendance Management System (Multi-Tenant SaaS ERP)**.

---

## 1. Importing Collection & Environment

1. Launch Postman.
2. Click **Import** (top left).
3. Import both files from the project directory:
   - `postman/Smart-Attendance.postman_collection.json`
   - `postman/Smart-Attendance.postman_environment.json`
4. Set the active environment dropdown to **Smart Attendance ERP - Local Environment**.

---

## 2. Environment Variables Overview

| Variable | Description | Initial Value |
|---|---|---|
| `baseUrl` | Next.js API server base URL | `http://localhost:3000` |
| `superAdminToken` | Token for platform super administrator | `super-admin-token` |
| `adminToken` | Token for Organization Admin A | `admin-token` |
| `adminBToken` | Token for Organization Admin B (Tenant B) | `admin-b-token` |
| `managerToken` | Token for Manager | `manager-token` |
| `employeeToken` | Token for Employee | `employee-token` |
| `organizationAId` | Primary demo organization ID | `org-1` |
| `organizationBId` | Secondary demo organization ID | `org-2` |
| `branchId` | Main branch ID | `branch-1` |
| `employeeId` | Test employee ID | `EMP-1042` |
| `referralCode` | Referral tracking code | `ANTOR2026` |

---

## 3. Automated Token Capture & Auth Flow

When executing **01 Authentication -> Login**, the Postman test script dynamically extracts the session token from `response.json().data.token` and stores it into `pm.environment`.

All subsequent requests automatically send:
```http
Authorization: Bearer {{adminToken}}
```

---

## 4. Multi-Tenant Isolation Testing (Phase 40)

To verify tenant sandboxing:
1. Make a request using `adminToken` (Organization A) to `GET /api/organizations/{{organizationBId}}`.
2. The server responds with:
```json
{
  "success": false,
  "message": "Tenant Isolation Violation: Organization 'org-1' is not authorized to access organization 'org-2'",
  "error": {
    "code": "TENANT_ACCESS_DENIED",
    "message": "Tenant Isolation Violation: Organization 'org-1' is not authorized to access organization 'org-2'"
  }
}
```
Status: `403 Forbidden`.

---

## 5. Automated Business Workflow Execution (Phase 42)

The collection executes the following sequential end-to-end workflow:
1. **Auth**: Login Super Admin, Org Admin, Employee.
2. **Organization & Branch**: Fetch Org A, create Branch with GPS coordinates and 150m geofence radius.
3. **Employees**: Create Employee with Decimal basic salary.
4. **Attendance**: Verify location inside geofence -> Punch in.
5. **Overtime & Leaves**: Submit overtime claim -> Submit leave -> Manager approval.
6. **Payroll**: Generate payroll batch with exact Decimal calculation -> Employee views payslip.
7. **Subscription & Payment**: Fetch plans -> Trigger verified payment webhook -> Verify plan activation.
8. **Referral & Commissions**: Track public click -> Auto-credit 20% recurring commission on payment -> View wallet balance -> Request withdrawal.
9. **Notifications & Audits**: View scoped alerts -> Verify tamper-evident audit trail.

---

## 6. Running Automated Tests

Run the full collection runner in Postman or execute via CLI using Newman:
```bash
npx newman run postman/Smart-Attendance.postman_collection.json -e postman/Smart-Attendance.postman_environment.json
```
All critical tests will execute and assert status codes, response schemas, and tenant boundaries.
