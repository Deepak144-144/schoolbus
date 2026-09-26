export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 40.7580, lng: -73.9855 },
  DEFAULT_ZOOM: 14,
  SCHOOL_LOCATION: { lat: 40.7580, lng: -73.9855 },
  TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  TILE_ATTR: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  UPDATE_INTERVAL_MS: 8000,
};

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function calculateEta(
  distanceMeters: number,
  speedKmh: number
): number {
  if (speedKmh <= 0) return 0;
  const speedMps = speedKmh / 3.6;
  return Math.round(distanceMeters / speedMps / 60);
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export function calculateCenter(
  points: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (points.length === 0) return MAP_CONFIG.DEFAULT_CENTER;
  if (points.length === 1) return points[0];

  let totalLat = 0;
  let totalLng = 0;
  for (const p of points) {
    totalLat += p.lat;
    totalLng += p.lng;
  }
  return {
    lat: totalLat / points.length,
    lng: totalLng / points.length,
  };
}
