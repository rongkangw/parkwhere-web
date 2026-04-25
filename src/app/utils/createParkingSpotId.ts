import { STORAGE_COORDINATE_PRECISION } from "@/core/constants/map/MapConstants";
import roundCoordinate from "@/app/utils/roundCoordinate";

export default function createParkingSpotKey(lat: number, lng: number) {
  const normLat = roundCoordinate(lat, STORAGE_COORDINATE_PRECISION);
  const normLng = roundCoordinate(lng, STORAGE_COORDINATE_PRECISION);
  return `${normLng}-${normLat}`; // match PostGIS order (lng, lat)
}
