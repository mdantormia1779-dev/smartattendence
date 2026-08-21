/**
 * GPS Geofencing & Haversine Distance Calculation Engine
 * 
 * Accurately calculates great-circle distance between coordinates on Earth (in meters)
 * and validates branch geofence boundary compliance server-side.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeofenceValidationResult {
  distanceMeters: number;
  allowedRadiusMeters: number;
  isInsideGeofence: boolean;
  accuracy: "EXACT" | "NEARBY" | "OUT_OF_BOUNDS";
}

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const EARTH_RADIUS_METERS = 6371000; // Earth's mean radius in meters

  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_METERS * c;
  return Number(distance.toFixed(1)); // return rounded to 1 decimal place
}

/**
 * Validates whether user coordinates are within the branch geofence radius
 */
export function validateGeofence(
  userCoord: Coordinates,
  branchCoord: Coordinates,
  allowedRadiusMeters: number = 120
): GeofenceValidationResult {
  const distance = calculateHaversineDistance(userCoord, branchCoord);
  const isInside = distance <= allowedRadiusMeters;

  let accuracy: "EXACT" | "NEARBY" | "OUT_OF_BOUNDS" = "OUT_OF_BOUNDS";
  if (distance <= allowedRadiusMeters * 0.5) {
    accuracy = "EXACT";
  } else if (isInside) {
    accuracy = "NEARBY";
  }

  return {
    distanceMeters: distance,
    allowedRadiusMeters,
    isInsideGeofence: isInside,
    accuracy,
  };
}
