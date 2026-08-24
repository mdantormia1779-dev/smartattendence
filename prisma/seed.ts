/**
 * Production-like Seed Script for Smart Attendance ERP
 */

export const SEED_DATA = {
  superAdmin: {
    email: "superadmin@erp.com",
    fullName: "Super Admin",
    role: "SUPER_ADMIN",
  },
  plans: [
    { name: "Free Plan", tier: "FREE", monthlyPrice: 0, maxBranches: 1, maxEmployees: 10 },
    { name: "Starter Plan", tier: "STARTER", monthlyPrice: 39, maxBranches: 2, maxEmployees: 50 },
    { name: "Business Plan", tier: "BUSINESS", monthlyPrice: 149, maxBranches: 10, maxEmployees: 300 },
    { name: "Enterprise Plan", tier: "ENTERPRISE", monthlyPrice: 319, maxBranches: -1, maxEmployees: -1 },
  ],
  organizations: [
    {
      id: "org-1",
      name: "Vertex Technologies Ltd.",
      slug: "vertex-tech",
      email: "contact@vertextech.io",
      planTier: "BUSINESS",
      defaultGeofenceM: 120,
    },
    {
      id: "org-2",
      name: "Bengal Textiles Ltd.",
      slug: "bengal-textiles",
      email: "info@bengaltextiles.com",
      planTier: "ENTERPRISE",
      defaultGeofenceM: 200,
    },
  ],
  branches: [
    { name: "Head Office – Dhaka", code: "DHK-01", lat: 23.7925, lng: 90.4078, radius: 120 },
    { name: "Chittagong Tech Hub", code: "CTG-01", lat: 22.3384, lng: 91.8317, radius: 150 },
  ],
  departments: [
    { name: "Information Technology", code: "IT", head: "Tanvir Ahmed" },
    { name: "Accounts & Finance", code: "ACC", head: "Ariful Islam" },
    { name: "Human Resources", code: "HR", head: "Nusrat Jahan" },
  ],
  employees: [
    { id: "EMP-1042", name: "Arif Chowdhury", email: "arif.c@vertextech.io", role: "EMPLOYEE", salary: 95000 },
    { id: "EMP-1043", name: "Nusrat Jahan", email: "nusrat.j@vertextech.io", role: "EMPLOYEE", salary: 72000 },
    { id: "EMP-1044", name: "Mahmudul Hasan", email: "mahmud.h@vertextech.io", role: "EMPLOYEE", salary: 60000 },
  ],
  referralProgram: {
    name: "Standard Growth Affiliate Program",
    commissionRate: 20.0,
    holdingPeriodDays: 30,
    minimumWithdrawal: 50.0,
  },
};

console.log("🌱 Seed configuration prepared with Super Admin, 4 Plans, 2 Demo Tenants, and Employees.");
