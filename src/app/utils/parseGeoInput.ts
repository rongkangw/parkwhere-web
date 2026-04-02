export default function parseGeoInput(
  rawValue: string,
): { latitude: number; longitude: number } | null {
  const [latText, lngText] = rawValue.split(",").map((part) => part.trim());
  if (!latText || !lngText) return null;

  const latitude = Number(latText);
  const longitude = Number(lngText);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;

  return { latitude, longitude };
}
