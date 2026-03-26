import { DEFAULT_QUERY_DISTANCE } from "@/constants/MapConstants";
import { useQuery } from "@tanstack/react-query";
import fetchLocalRacks from "@/features/backend/fetchLocalRacks";
import { ParkingSpot } from "@/constants/ParkingSpot";

export function useLocalRacks(
  lat: number,
  lng: number,
  dist: number = DEFAULT_QUERY_DISTANCE,
) {
  return useQuery<ParkingSpot[], Error>({
    queryKey: ["nearbySpots", lat, lng, dist],
    queryFn: () => fetchLocalRacks(lat, lng, dist),
    enabled: lat !== undefined && lng !== undefined,
    refetchOnWindowFocus: false,
  });
}
