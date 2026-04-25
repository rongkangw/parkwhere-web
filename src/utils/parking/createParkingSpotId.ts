import { STORAGE_COORDINATE_PRECISION } from "@/core/constants/MapConstants";

export default function createParkingSpotId(lat: number, lng: number) {
  const normLat = Number(lat.toFixed(STORAGE_COORDINATE_PRECISION));
  const normLng = Number(lng.toFixed(STORAGE_COORDINATE_PRECISION));
  return `${normLng}-${normLat}`; // match PostGIS order (lng, lat)
}
