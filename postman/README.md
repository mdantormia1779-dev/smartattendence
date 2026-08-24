# 📮 Smart Attendance API - Postman Test Suite

Complete automated testing suite for **Smart Attendance Management System (Multi-Tenant SaaS ERP)**.

---

## 📁 Folder Contents

- `Smart-Attendance.postman_collection.json`: Complete 29-folder API collection with test scripts.
- `Smart-Attendance.postman_environment.json`: Pre-configured environment variables.
- `test-data/`: JSON datasets for organizations, users, and employees.

---

## 🚀 How to Run in Postman

1. Open Postman.
2. Click **Import** and select `Smart-Attendance.postman_collection.json` and `Smart-Attendance.postman_environment.json`.
3. In the top right, select the active environment **"Smart Attendance ERP - Local Environment"**.
4. Set the `baseUrl` variable to your running server (default: `http://localhost:3000`).
5. Open the collection runner, select **Smart Attendance API**, and click **Run Collection**.

---

## 🧪 What Is Tested

- **Authentication & RBAC**: Super Admin, Org Admin, Manager, Employee permissions & token capture.
- **Multi-Tenant Isolation**: Verified that Tenant A cannot access Tenant B (returns `403 Forbidden`).
- **GPS Geofencing**: Server-side validation rejecting coordinates outside allowed branch boundary.
- **Biometric Face Verification**: 128-dimensional embedding matching & anti-spoof check.
- **Decimal Net Salary & Overtime**: Canonical mathematical verification.
- **Referral Engine**: 20% commission on verified payment, 30-day holding period, and payout approvals.
- **Payment Webhook**: Verified signature and idempotent processing.
