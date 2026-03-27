import ParkingSpot from "@/core/constants/ParkingSpot";
import type { FeatureCollection, Point } from "geojson";

export default function toParkingGeoJson(
  racks?: ParkingSpot[],
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features:
      racks?.map((rack) => ({
        type: "Feature" as const,
        properties: {
          id: rack.id,
          name: rack.name,
          sheltered: rack.sheltered,
          rackType: rack.parkingType,
          sourceType: rack.sourceType,
          capacity: rack.capacity,
          occupancy: rack.occupancy,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [rack.lng, rack.lat],
        },
      })) ?? [],
  };
}
