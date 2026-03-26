import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_QUERY_DISTANCE } from "@/constants/MapConstants";
import fetchOnlineRacks from "@/features/parking/fetchOnlineRacks";
import { ParkingSpot } from "@/constants/ParkingSpot";

export function useOnlineRacks(
  lat: number,
  lng: number,
  dist: number = DEFAULT_QUERY_DISTANCE,
) {
  return useQuery<ParkingSpot[], Error>({
    queryKey: ["bikeParking", lat, lng, dist],
    queryFn: () => fetchOnlineRacks(lat, lng, dist),
    enabled: lat !== undefined && lng !== undefined,
    retry: 3,
    retryDelay: (attemptCount) => {
      return Math.min(1000 * attemptCount, 10000); // max delay 10s as safeguard
    },
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
