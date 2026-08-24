# API, UI & DATABASE END-TO-END TRACE MAP

> **Architecture:** Full Request-Response Lifecycle Trace  
> **Audited Date:** August 24, 2026  
> **Source of Truth:** Prisma ORM 7.9.1 + PostgreSQL (Neon Cloud)

---

## 1. Authentication & Onboarding Trace

```
[UI] src/app/(auth)/login/page.tsx
  │ (User submits email + password)
  ▼
[API Client] api.auth.login({ email, password })
  │ POST /api/auth/login
  ▼
[Route Handler] src/app/api/auth/login/route.ts
  │ Password Verification: bcrypt.compare(password, user.password)
  ▼
[Prisma Query]
  ├── prisma.super_admins.findUnique({ where: { email } })
  ├── prisma.org_admins.findUnique({ where: { email }, include: { organizations: true } })
  ├── prisma.managers.findUnique({ where: { email } })
  └── prisma.employees.findUnique({ where: { email } })
  ▼
[Database] PostgreSQL: super_admins | org_admins | managers | employees
  ▼
[Response Payload] { success: true, token, user: { id, email, role, organizationId } }
  ▼
[UI Redirection]
  ├── SUPER_ADMIN    -> /admin
  ├── ORG_ADMIN      -> /organizationadmin
  ├── MANAGER        -> /manager
  └── EMPLOYEE       -> /employee
```

---

## 2. Organization & Hierarchy Management Trace

```
[UI] src/app/(dashboard)/organizationadmin/branchescreate/page.tsx
  │ (Org Admin creates Branch with GPS & Geofence Radius)
  ▼
[API Client] api.branches.create({ name, code, latitude, longitude, geoFenceRadius })
  │ POST /api/branches
  ▼
[Route Handler] src/app/api/branches/route.ts
  │ Auth & Tenant Guard: getTenantContext(req) -> organizationId
  ▼
[Prisma Query]
  └── prisma.branches.create({
        data: {
          organizationId: session.organizationId,
          name,
          code,
          latitude,
          longitude,
          geoFenceRadius: 100,
          status: "ACTIVE"
        }
      })
  ▼
[Database] PostgreSQL: branches (foreign key: organizationId -> organizations.id)
  ▼
[Response Payload] { success: true, data: { id, name, code, ... } }
  ▼
[UI Invalidation] React state re-fetches api.branches.getAll() -> Table updates
```

---

## 3. Real-Time Attendance, GPS & Face Biometrics Trace

```
[UI] src/app/(dashboard)/employee/checkin/page.tsx
  │ 1. Browser Geolocation: navigator.geolocation.getCurrentPosition()
  │ 2. Camera Biometrics: Face API extracts 128-d float descriptor array
  ▼
[API Client] api.attendance.checkIn({
    latitude,
    longitude,
    faceDescriptor,
    method: "FACE"
  })
  │ POST /api/attendance/check-in
  ▼
[Route Handler] src/app/api/attendance/check-in/route.ts
  │ Step 1: Resolve authenticated Employee & Branch from session
  │ Step 2: Haversine Geofence Verification (geo-verification.ts)
  │         Distance(deviceLat, deviceLng, branchLat, branchLng) <= branch.geoFenceRadius
  │ Step 3: Face Embedding Comparison (face-verification.ts)
  │         EuclideanDistance(inputDescriptor, storedDescriptor) <= 0.55
  │ Step 4: Duplicate Check (no existing check-in for today's date)
  ▼
[Prisma Query]
  ├── prisma.branches.findUnique({ where: { id: employee.branchId } })
  ├── prisma.face_profiles.findUnique({ where: { employeeId: employee.id } })
  └── prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: todayDate,
          checkInTime: new Date(),
          checkInMethod: "FACE",
          checkInLat: latitude,
          checkInLng: longitude,
          faceScore: 0.99,
          status: isLate ? "LATE" : "PRESENT",
          lateMinutes: lateDiffMinutes
        }
      })
  ▼
[Database] PostgreSQL: attendance (unique constraint: [employeeId, date])
  ▼
[Response Payload] { success: true, message: "Punch In Recorded Successfully", data: attendanceRecord }
  ▼
[UI Feedback] Green Check-In Badge displayed, live timer started
```

---

## 4. Leave Lifecycle Trace (2-Stage Approval)

```
[UI 1] src/app/(dashboard)/employee/leaves/page.tsx
  │ (Employee submits Leave Request)
  ▼
[API Client] api.leaves.submit({ type, startDate, endDate, reason })
  │ POST /api/leaves
  ▼
[Route Handler] src/app/api/leaves/route.ts
  │ Validates leave date overlap & annual quota balance
  ▼
[Prisma Query]
  └── prisma.leaves.create({
        data: {
          employeeId: employee.id,
          type: "CASUAL",
          startDate,
          endDate,
          reason,
          status: "PENDING"
        }
      })
  ▼
[UI 2] src/app/(dashboard)/manager/leaves/page.tsx
  │ (Manager reviews and endorses leave)
  ▼
[API Client] api.leaves.approve(leaveId, "Supervisor Recommended")
  │ PUT /api/leaves/[id]/approve
  ▼
[Route Handler] src/app/api/leaves/[id]/approve/route.ts
  │ Manager verification: employee.managerId === manager.id
  ▼
[Prisma Query]
  └── prisma.leaves.update({
        where: { id: leaveId },
        data: {
          status: "MANAGER_APPROVED",
          managerNote: "Supervisor Recommended"
        }
      })
  ▼
[UI 3] src/app/(dashboard)/organizationadmin/leaves/page.tsx
  │ (Org Admin executes Final Approval)
  ▼
[API Client] api.leaves.approve(leaveId, "Final Approved by HR")
  │ PUT /api/leaves/[id]/approve
  ▼
[Prisma Query]
  └── prisma.leaves.update({
        where: { id: leaveId },
        data: {
          status: "APPROVED",
          orgNote: "Final Approved by HR"
        }
      })
  ▼
[Audit & Notifications] Dispatches notification to Employee & writes audit_logs
```

---

## 5. Automated Payroll & Payslip Generation Trace

```
[UI] src/app/(dashboard)/organizationadmin/payroll/page.tsx
  │ (Org Admin clicks "Generate Monthly Payroll" for Month/Year)
  ▼
[API Client] api.payroll.generate({ month: 8, year: 2026 })
  │ POST /api/payroll/generate
  ▼
[Route Handler] src/app/api/payroll/generate/route.ts
  │ Auth & Tenant Guard: organizationId from session
  │ Calculation Engine (src/lib/calculations.ts):
  │   - Basic Salary from employee profile
  │   - Overtime Pay: Sum(overtime.minutes / 60 * (Basic/160) * multiplier)
  │   - Late Deductions & Unpaid Leave Deductions from attendance & leaves
  │   - Statutory Deductions: Tax (TDS) + Provident Fund (10% Basic)
  │   - Net Salary = (Basic + Allowances + OT) - (Deductions + Tax + PF)
  ▼
[Prisma Query]
  ├── prisma.employees.findMany({ where: { organizationId, status: "ACTIVE" } })
  ├── prisma.attendance.findMany({ where: { employeeId, date in range } })
  ├── prisma.overtime.findMany({ where: { employeeId, approved: true, date in range } })
  └── prisma.payslips.createMany({
        data: computedPayslipsList,
        skipDuplicates: true
      })
  ▼
[Database] PostgreSQL: payslips (unique constraint: [employeeId, month, year])
  ▼
[UI Feedback] Batch created in "DRAFT" status with Gross, Deductions, and Net Summary
```

---

## 6. Multi-Tier Referral, Commission & Wallet Trace

```
[UI] src/app/(auth)/signup/page.tsx?ref=VERTEX2026
  │ (New Tenant onboards via referral link)
  ▼
[API Route] POST /api/referral/track -> Links organization.id to referralCode
  ▼
[Payment Trigger] POST /api/payments -> Organization purchases "Business Plan" ($149)
  ▼
[Referral Engine] src/lib/referral-engine.ts
  │ Tier Calculation: Silver Tier (20% of $149 = $29.80)
  │ Attribution: Credit $29.80 to Referrer's Ledger
  ▼
[Referral Ledger] Status: PENDING (14-day clearance hold) -> AVAILABLE
  ▼
[UI] src/app/(dashboard)/organizationadmin/referrals/page.tsx
  │ Referrer views Available Wallet Balance: $150.00
  │ Clicks "Request Payout" -> $100.00 via bKash
  ▼
[API Client] api.referrals.requestWithdrawal({ amount: 100, method: "bKash" })
  │ POST /api/referrals/withdrawals
  ▼
[Super Admin Approval] src/app/(dashboard)/admin/referrals/page.tsx
  │ Super Admin clicks "Mark as Disbursed / Paid"
  │ POST /api/admin/withdrawals/[id]/paid
```

---

## 7. Master Route-to-Database Mapping Table

| Endpoint | Method | RBAC Roles | Tenant Isolation Key | Primary DB Models |
| :--- | :---: | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | N/A | `super_admins`, `org_admins`, `managers`, `employees` |
| `/api/auth/register` | POST | Public | Auto-generated | `organizations`, `org_admins`, `subscriptions` |
| `/api/auth/me` | GET | Authenticated | Resolved from token | Respective User Model |
| `/api/organizations` | GET, POST | `SUPER_ADMIN` | Global | `organizations` |
| `/api/organizations/[id]` | GET, PUT, DELETE | `SUPER_ADMIN`, `ORG_ADMIN` | `organizationId` | `organizations` |
| `/api/branches` | GET, POST | `ORG_ADMIN` | `organizationId` | `branches` |
| `/api/departments` | GET, POST | `ORG_ADMIN` | `organizationId` | `departments` |
| `/api/managers` | GET, POST | `ORG_ADMIN` | `organizationId` | `managers` |
| `/api/employees` | GET, POST | `ORG_ADMIN`, `MANAGER` | `organizationId` | `employees` |
| `/api/attendance/check-in` | POST | `EMPLOYEE` | `employee.organizationId` | `attendance`, `branches`, `face_profiles` |
| `/api/attendance/check-out` | POST | `EMPLOYEE` | `employee.organizationId` | `attendance` |
| `/api/attendance/regularize`| POST | `MANAGER`, `ORG_ADMIN` | `organizationId` | `attendance` |
| `/api/leaves` | GET, POST | `EMPLOYEE`, `MANAGER`, `ORG_ADMIN` | `organizationId` | `leaves` |
| `/api/leaves/[id]/approve` | PUT | `MANAGER`, `ORG_ADMIN` | `organizationId` | `leaves` |
| `/api/overtime` | GET, POST | `EMPLOYEE`, `MANAGER`, `ORG_ADMIN` | `organizationId` | `overtime` |
| `/api/shifts` | GET, POST | `ORG_ADMIN` | `organizationId` | `shifts`, `shift_assignments` |
| `/api/payroll/generate` | POST | `ORG_ADMIN` | `organizationId` | `payslips`, `employees`, `attendance`, `overtime` |
| `/api/payslips/[id]/download` | GET | `EMPLOYEE`, `ORG_ADMIN` | `organizationId` | `payslips` |
| `/api/referrals/account` | GET | Authenticated | `user.id` | Referral Ledger Engine |
| `/api/notifications` | GET, POST | Authenticated | `organizationId` | `notifications` |
| `/api/audit-logs` | GET | `SUPER_ADMIN` | Global | `audit_logs` |
