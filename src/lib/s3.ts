/**
 * AWS S3 Private Storage & Signed URL Manager
 * 
 * Enforces file size/type validation and generates secure, time-limited presigned URLs.
 */

export interface S3UploadConfig {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

export const DOCUMENT_UPLOAD_CONFIG: S3UploadConfig = {
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
};

export function validateFileUpload(file: { type: string; size: number }): { valid: boolean; error?: string } {
  if (!DOCUMENT_UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format '${file.type}'. Allowed: JPEG, PNG, WEBP, PDF.`,
    };
  }

  if (file.size > DOCUMENT_UPLOAD_CONFIG.maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB provided).`,
    };
  }

  return { valid: true };
}

/**
 * Generates a mock/real time-limited presigned download URL for private documents
 */
export function generatePresignedDownloadUrl(s3Key: string, expiresInSeconds: number = 3600): string {
  // In production: return s3Client.getSignedUrlPromise('getObject', { Bucket, Key: s3Key, Expires: expiresInSeconds })
  return `https://s3.ap-southeast-1.amazonaws.com/vertex-tenant-vault/${s3Key}?token=sig_${Date.now()}_exp${expiresInSeconds}`;
}
