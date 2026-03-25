import { ParkingSpotResponse } from "@/constants/ParkingSpotResponse";
import type { FeatureCollection, Point } from "geojson";

export default function toParkingGeoJson(
  racks?: ParkingSpotResponse[],
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features:
      racks?.map((rack, index) => ({
        type: "Feature" as const,
        id: index,
        properties: {
          description: rack.Description,
          rackType: rack.RackType,
          shelter: rack.ShelterIndicator,
          rackCount: rack.RackCount,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [rack.Longitude, rack.Latitude],
        },
      })) ?? [],
  };
}
