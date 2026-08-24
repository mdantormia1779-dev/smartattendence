import { ConflictError, NotFoundError, ValidationError } from "../errors";

export interface BranchData {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number; // in meters (20-1000)
  status: "Active" | "Inactive";
  assignedManager?: string;
  totalEmployees: number;
  createdAt: string;
}

let branchesStore: BranchData[] = [
  {
    id: "branch-1",
    organizationId: "org-1",
    name: "Head Office – Dhaka",
    code: "DHK-01",
    address: "Gulshan-2, Dhaka 1212, Bangladesh",
    phone: "+880 1711-001122",
    latitude: 23.7925,
    longitude: 90.4078,
    geofenceRadius: 120,
    status: "Active",
    assignedManager: "Tanvir Ahmed",
    totalEmployees: 142,
    createdAt: "2026-01-15",
  },
  {
    id: "branch-2",
    organizationId: "org-1",
    name: "Chittagong Tech Hub",
    code: "CTG-01",
    address: "Agrabad C/A, Chittagong, Bangladesh",
    phone: "+880 1811-334455",
    latitude: 22.3384,
    longitude: 91.8317,
    geofenceRadius: 150,
    status: "Active",
    assignedManager: "Rashid Karim",
    totalEmployees: 89,
    createdAt: "2026-02-10",
  },
  {
    id: "branch-3",
    organizationId: "org-1",
    name: "Sylhet Regional Office",
    code: "SYL-01",
    address: "Zindabazar, Sylhet, Bangladesh",
    phone: "+880 1911-556677",
    latitude: 24.8949,
    longitude: 91.8687,
    geofenceRadius: 100,
    status: "Active",
    assignedManager: "Kamal Hossain",
    totalEmployees: 60,
    createdAt: "2026-03-01",
  },
];

export class BranchService {
  static async getBranches(organizationId: string) {
    return branchesStore.filter((b) => b.organizationId === organizationId);
  }

  static async getBranchById(id: string, organizationId: string) {
    const branch = branchesStore.find((b) => b.id === id && b.organizationId === organizationId);
    if (!branch) throw new NotFoundError("Branch");
    return branch;
  }

  static async createBranch(data: {
    organizationId: string;
    name: string;
    code: string;
    address: string;
    phone?: string;
    latitude: number;
    longitude: number;
    geofenceRadius?: number;
  }) {
    if (data.latitude < -90 || data.latitude > 90) {
      throw new ValidationError("Latitude must be between -90 and 90 degrees");
    }
    if (data.longitude < -180 || data.longitude > 180) {
      throw new ValidationError("Longitude must be between -180 and 180 degrees");
    }
    const radius = data.geofenceRadius || 120;
    if (radius < 20 || radius > 1000) {
      throw new ValidationError("Geofence radius must be between 20 and 1000 meters");
    }

    const existing = branchesStore.find(
      (b) => b.organizationId === data.organizationId && b.code.toUpperCase() === data.code.toUpperCase()
    );
    if (existing) {
      throw new ConflictError(`Branch with code '${data.code}' already exists in your organization`);
    }

    const newBranch: BranchData = {
      id: `branch-${Date.now()}`,
      organizationId: data.organizationId,
      name: data.name,
      code: data.code.toUpperCase(),
      address: data.address,
      phone: data.phone,
      latitude: data.latitude,
      longitude: data.longitude,
      geofenceRadius: radius,
      status: "Active",
      totalEmployees: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    branchesStore.push(newBranch);
    return newBranch;
  }

  static async updateBranch(id: string, organizationId: string, updates: Partial<BranchData>) {
    const branch = await this.getBranchById(id, organizationId);
    if (updates.latitude !== undefined && (updates.latitude < -90 || updates.latitude > 90)) {
      throw new ValidationError("Latitude must be between -90 and 90");
    }
    if (updates.longitude !== undefined && (updates.longitude < -180 || updates.longitude > 180)) {
      throw new ValidationError("Longitude must be between -180 and 180");
    }
    if (updates.geofenceRadius !== undefined && (updates.geofenceRadius < 20 || updates.geofenceRadius > 1000)) {
      throw new ValidationError("Geofence radius must be between 20 and 1000 meters");
    }

    Object.assign(branch, updates);
    return branch;
  }

  static async deleteBranch(id: string, organizationId: string) {
    const branch = await this.getBranchById(id, organizationId);
    branchesStore = branchesStore.filter((b) => b.id !== id);
    return { success: true, deletedBranch: branch };
  }
}
