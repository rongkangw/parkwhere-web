export default function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  // Haversine distance measures the shortest path over the Earth's surface.
  // Convert degree differences to radians, then apply the haversine formula.
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusInMeters = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusInMeters * c;
}
