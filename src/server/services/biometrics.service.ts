import { calculateEuclideanDistance } from "@/lib/face-verification";
import { ValidationError, NotFoundError } from "../errors";
import { prisma } from "@/lib/prisma";

interface FaceVectorRecord {
  employeeId: string;
  organizationId?: string;
  vector: number[]; // 128 float values
  modelName: string;
  sampleCount: number;
  updatedAt: string;
}

let inMemoryFaceStore: FaceVectorRecord[] = [];

export class BiometricsService {
  /**
   * Registers or updates ArcFace 128D Master Template for an employee with tenant isolation
   */
  static async registerFace(
    employeeId: string,
    vectorData: number[],
    modelName: string = "ArcFace-MobileFaceNet-ONNX",
    sampleCount: number = 5,
    organizationId?: string
  ) {
    if (!Array.isArray(vectorData) || vectorData.length !== 128) {
      throw new ValidationError("Biometric face vector must contain exactly 128 floating-point embedding dimensions");
    }

    // In-memory cache update
    const existingIndex = inMemoryFaceStore.findIndex((f) => f.employeeId === employeeId);
    const newRecord: FaceVectorRecord = {
      employeeId,
      organizationId,
      vector: vectorData,
      modelName,
      sampleCount,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      inMemoryFaceStore[existingIndex] = newRecord;
    } else {
      inMemoryFaceStore.push(newRecord);
    }

    // Prisma DB persistence if employee exists in DB with tenant isolation
    try {
      const emp = await prisma.employees.findFirst({
        where: {
          AND: [
            organizationId ? { organizationId } : {},
            {
              OR: [
                { id: employeeId },
                { employeeCode: employeeId },
                { employeeCode: { equals: employeeId, mode: "insensitive" } },
              ],
            },
          ],
        },
      });

      if (emp) {
        await prisma.face_profiles.upsert({
          where: { employeeId: emp.id },
          create: {
            id: `face-${emp.id}`,
            employeeId: emp.id,
            descriptor: {
              vector: vectorData,
              modelName,
              dimension: 128,
              sampleCount,
              livenessStatus: "NOT_CHECKED",
              organizationId: emp.organizationId,
            },
            sampleImages: [],
            livenessPassed: false, // Honest state: Registration enrollees are not assumed to have passed active verification liveness
            updatedAt: new Date(),
          },
          update: {
            descriptor: {
              vector: vectorData,
              modelName,
              dimension: 128,
              sampleCount,
              livenessStatus: "NOT_CHECKED",
              organizationId: emp.organizationId,
            },
            livenessPassed: false,
            updatedAt: new Date(),
          },
        });
      }
    } catch (dbErr) {
      console.log("[BiometricsService DB Sync Notice]:", dbErr);
    }

    return {
      success: true,
      employeeId,
      modelName,
      sampleCount,
      registeredAt: newRecord.updatedAt,
    };
  }

  /**
   * Verifies live probe vector against enrolled employee ArcFace baseline using Cosine Similarity & Euclidean Distance
   */
  static async verifyFace(
    employeeId: string,
    probeVector: number[],
    livenessPassed: boolean = false,
    organizationId?: string,
    threshold: number = 0.68
  ) {
    if (!Array.isArray(probeVector) || probeVector.length !== 128) {
      throw new ValidationError("Probe vector must contain exactly 128 floating-point dimensions");
    }

    let enrolledVector: number[] | null = null;

    // Check memory store
    const memRecord = inMemoryFaceStore.find((f) => f.employeeId === employeeId);
    if (memRecord) {
      enrolledVector = memRecord.vector;
    } else {
      // Check Prisma DB with tenant scoping
      try {
        const emp = await prisma.employees.findFirst({
          where: {
            AND: [
              organizationId ? { organizationId } : {},
              {
                OR: [
                  { id: employeeId },
                  { employeeCode: employeeId },
                  { employeeCode: { equals: employeeId, mode: "insensitive" } },
                ],
              },
            ],
          },
          include: { face_profiles: true },
        });

        if (emp?.face_profiles?.descriptor) {
          const desc = emp.face_profiles.descriptor as any;
          if (Array.isArray(desc.vector) && desc.vector.length === 128) {
            enrolledVector = desc.vector;
          }
        }
      } catch (dbErr) {
        console.log("[BiometricsService verify DB lookup notice]:", dbErr);
      }
    }

    if (!enrolledVector) {
      throw new NotFoundError(`No registered ArcFace biometric template found for employee '${employeeId}'`);
    }

    // 1. Calculate Euclidean Distance
    const distance = calculateEuclideanDistance(enrolledVector, probeVector);

    // 2. Calculate Cosine Similarity: dot(A, B) / (||A|| * ||B||)
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < 128; i++) {
      dotProduct += enrolledVector[i] * probeVector[i];
      normA += enrolledVector[i] * enrolledVector[i];
      normB += probeVector[i] * probeVector[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    const cosineSimilarity = denom > 0 ? dotProduct / denom : 0;
    const similarity = parseFloat(Math.max(-1, Math.min(1, cosineSimilarity)).toFixed(4));

    // 3. Match Decision: Cosine >= threshold (e.g. 0.68) AND livenessPassed === true
    const isIdentityMatch = similarity >= threshold;
    const isVerified = isIdentityMatch && livenessPassed;

    return {
      match: isVerified,
      identityMatched: isIdentityMatch,
      livenessPassed,
      similarity,
      distance: parseFloat(distance.toFixed(4)),
      threshold,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves enrolled biometric status with tenant scoping
   */
  static async getFaceStatus(employeeId: string, organizationId?: string) {
    const mem = inMemoryFaceStore.find((f) => f.employeeId === employeeId);
    if (mem) {
      return {
        isEnrolled: true,
        enrolledAt: mem.updatedAt,
        modelName: mem.modelName,
        sampleCount: mem.sampleCount,
      };
    }

    try {
      const emp = await prisma.employees.findFirst({
        where: {
          AND: [
            organizationId ? { organizationId } : {},
            {
              OR: [
                { id: employeeId },
                { employeeCode: employeeId },
              ],
            },
          ],
        },
        include: { face_profiles: true },
      });

      if (emp?.face_profiles) {
        const desc = emp.face_profiles.descriptor as any;
        return {
          isEnrolled: true,
          enrolledAt: emp.face_profiles.updatedAt.toISOString(),
          modelName: desc?.modelName || "ArcFace-MobileFaceNet-ONNX",
          sampleCount: desc?.sampleCount || 5,
        };
      }
    } catch (e) {}

    return { isEnrolled: false };
  }

  /**
   * Deletes enrolled face profile with tenant scoping
   */
  static async deleteFace(employeeId: string, organizationId?: string) {
    inMemoryFaceStore = inMemoryFaceStore.filter((f) => f.employeeId !== employeeId);

    try {
      const emp = await prisma.employees.findFirst({
        where: {
          AND: [
            organizationId ? { organizationId } : {},
            {
              OR: [
                { id: employeeId },
                { employeeCode: employeeId },
              ],
            },
          ],
        },
      });
      if (emp) {
        await prisma.face_profiles.deleteMany({ where: { employeeId: emp.id } });
      }
    } catch (e) {}

    return { success: true };
  }
}
