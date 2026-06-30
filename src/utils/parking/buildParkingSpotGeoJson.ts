import ParkingSpot from "@/core/types/parking/ParkingSpot";
import type { FeatureCollection, Point } from "geojson";

export default function buildParkingSpotGeoJson(
  spots?: ParkingSpot[],
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features:
      spots?.map((spot) => ({
        type: "Feature" as const,
        properties: {
          id: spot.id,
          name: spot.name,
          sheltered: spot.sheltered,
          spotType: spot.parkingType,
          sourceType: spot.sourceType,
          capacity: spot.capacity,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [spot.lng, spot.lat],
        },
      })) ?? [],
  };
}
