import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBikeParking } from "@/features/parking/fetchBicycleParking";
import { ParkingSpotResponse } from "@/constants/ParkingSpotResponse";
import { DEFAULT_QUERY_DISTANCE } from "@/constants/MapConstants";

export function useBikeParking(
  lat: number,
  lng: number,
  dist: number = DEFAULT_QUERY_DISTANCE,
) {
  return useQuery<ParkingSpotResponse[], Error>({
    queryKey: ["bikeParking", lat, lng, dist],
    queryFn: () => fetchBikeParking(lat, lng, dist),
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
