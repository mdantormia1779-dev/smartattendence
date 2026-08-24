import { validateFileUpload, generatePresignedDownloadUrl } from "@/lib/s3";
import { ValidationError } from "../errors";

export class StorageService {
  static validateUpload(file: { type: string; size: number }) {
    const res = validateFileUpload({
      type: file.type,
      size: file.size,
    });

    if (!res.valid) {
      throw new ValidationError(res.error || "Invalid file upload");
    }

    return true;
  }

  static getPresignedDownloadUrl(s3Key: string, expiresInSeconds: number = 3600) {
    return generatePresignedDownloadUrl(s3Key, expiresInSeconds);
  }
}
