import {
  MIN_LAT,
  MAX_LAT,
  MIN_LNG,
  MAX_LNG,
} from "@/core/constants/UiConstants";

export default function parseGeoInput(
  rawValue: string,
): { latitude: number; longitude: number } | null {
  const [latText, lngText] = rawValue.split(",").map((part) => part.trim());
  if (!latText || !lngText) return null;

  const latitude = Number(latText);
  const longitude = Number(lngText);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  if (latitude < MIN_LAT || latitude > MAX_LAT) return null;
  if (longitude < MIN_LNG || longitude > MAX_LNG) return null;

  return { latitude, longitude };
}
