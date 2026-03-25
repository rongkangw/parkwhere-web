import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBikeParking } from "@/features/parking/fetchBicycleParking";
import { ParkingSpotResponse } from "@/constants/ParkingSpotResponse";

export function useBikeParking(lat: number, lng: number, dist?: number) {
  return useQuery<ParkingSpotResponse[], Error>({
    queryKey: ["bikeParking", lat, lng, dist],
    queryFn: () => fetchBikeParking(lat, lng, dist),
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
