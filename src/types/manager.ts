export interface Manager {
    id: string;
    managerId: string;
    name: string;
    profilePic?: string;
    email: string;
    phone: string;
    designation: string;
    assignedBranch: string;
    department: string;
    status: "Active" | "Inactive";
    password?: string;
}

export interface ManagerFormData {
    managerId: string;
    name: string;
    profilePic?: string;
    email: string;
    phone: string;
    designation: string;
    assignedBranch: string;
    department: string;
    status: "Active" | "Inactive";
    password?: string;
}