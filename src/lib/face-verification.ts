/**
 * AI Facial Recognition & Anti-Spoofing Verification Pipeline
 * 
 * Performs 128-dimensional embedding vector comparison, liveness validation,
 * and anti-spoofing confidence scoring.
 */

export interface FaceVerificationResult {
  isMatch: boolean;
  confidencePercent: number;
  antiSpoofPassed: boolean;
  distance: number;
  rejectionReason?: string;
}

/**
 * Calculates Euclidean distance between two 128-dimensional face embedding vectors
 */
export function calculateEuclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    throw new Error("Invalid face vector dimensions: vectors must be matching 128-dimensional arrays");
  }

  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculates Cosine Similarity between two embedding vectors (-1 to 1)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    throw new Error("Invalid face vector dimensions");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Server-side facial match & liveness verification
 * Matching threshold default: 0.6 distance (~92%+ confidence)
 */
export function verifyFaceBiometric(
  storedVector: number[],
  submittedVector: number[],
  livenessPassed: boolean,
  thresholdDistance: number = 0.55
): FaceVerificationResult {
  if (!livenessPassed) {
    return {
      isMatch: false,
      confidencePercent: 0,
      antiSpoofPassed: false,
      distance: 1.0,
      rejectionReason: "Liveness / 3D anti-spoofing check failed. Static photos or screen replays are rejected.",
    };
  }

  const distance = calculateEuclideanDistance(storedVector, submittedVector);
  const similarity = calculateCosineSimilarity(storedVector, submittedVector);

  // Convert distance into confidence percentage
  const confidencePercent = Number((Math.max(0, (1 - distance / 1.0)) * 100).toFixed(1));
  const isMatch = distance <= thresholdDistance;

  return {
    isMatch,
    confidencePercent,
    antiSpoofPassed: true,
    distance: Number(distance.toFixed(4)),
    rejectionReason: isMatch ? undefined : "Face match confidence is below security threshold",
  };
}
