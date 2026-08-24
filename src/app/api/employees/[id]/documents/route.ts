import { requireAuth } from "@/server/authorization";
import { StorageService } from "@/server/services/storage.service";
import { apiSuccess, apiError } from "@/server/errors";

let employeeDocsStore: any[] = [
  {
    id: "doc-1",
    employeeId: "EMP-1042",
    title: "National ID Card (NID)",
    fileType: "application/pdf",
    s3Key: "documents/EMP-1042/nid_verified.pdf",
    fileSizeBytes: 1420000,
    downloadUrl: "https://s3.ap-southeast-1.amazonaws.com/vertex-tenant-vault/nid_verified.pdf",
    isVerified: true,
    createdAt: "2026-01-15",
  },
  {
    id: "doc-2",
    employeeId: "EMP-1042",
    title: "Academic Certificate - BSc in CSE",
    fileType: "application/pdf",
    s3Key: "documents/EMP-1042/bsc_certificate.pdf",
    fileSizeBytes: 2150000,
    downloadUrl: "https://s3.ap-southeast-1.amazonaws.com/vertex-tenant-vault/bsc_certificate.pdf",
    isVerified: true,
    createdAt: "2026-01-15",
  },
];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireAuth(request);

    const docs = employeeDocsStore.filter((d) => d.employeeId === id);
    return apiSuccess(docs, "Employee documents fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireAuth(request);

    const body = await request.json();
    StorageService.validateUpload({
      type: body.fileType || "application/pdf",
      size: body.fileSizeBytes || 1024 * 500,
    });

    const newDoc = {
      id: `doc-${Date.now()}`,
      employeeId: id,
      title: body.title || "Document",
      fileType: body.fileType || "application/pdf",
      s3Key: `documents/${id}/${Date.now()}_${body.title}.pdf`,
      fileSizeBytes: body.fileSizeBytes || 1024 * 500,
      downloadUrl: StorageService.getPresignedDownloadUrl(`documents/${id}/${Date.now()}_${body.title}.pdf`),
      isVerified: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    employeeDocsStore.push(newDoc);
    return apiSuccess(newDoc, "Document uploaded successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
