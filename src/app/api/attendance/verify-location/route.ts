import { z } from "zod";
import { BranchService } from "@/server/services/branch.service";
import { validateGeofence } from "@/lib/geo-verification";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

const VerifyLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional().default(10),
  branchId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = VerifyLocationSchema.parse(body);

    const branches = await BranchService.getBranches(orgId);
    const branch = validated.branchId
      ? branches.find((b) => b.id === validated.branchId) || branches[0]
      : branches[0];

    const result = validateGeofence(
      { latitude: validated.latitude, longitude: validated.longitude },
      { latitude: branch.latitude, longitude: branch.longitude },
      branch.geofenceRadius
    );

    return apiSuccess(
      {
        branchId: branch.id,
        branchName: branch.name,
        distanceMeters: result.distanceMeters,
        geofenceRadius: branch.geofenceRadius,
        isInsideGeofence: result.isInsideGeofence,
        accuracy: result.accuracy,
      },
      result.isInsideGeofence ? "Location verified inside geofence" : "Location outside allowed branch boundary"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
