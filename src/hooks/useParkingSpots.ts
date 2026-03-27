import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  DEFAULT_QUERY_DISTANCE,
  DEFAULT_QUERY_DISTANCE_METERS,
} from "@/core/constants/map/MapConstants";
import fetchOnlineSpots from "@/modules/parking/fetchOnlineSpots";
import fetchDbSpots from "@/modules/db/fetchDbSpots";
import ParkingSpot from "@/core/constants/ParkingSpot";
import getTileId from "@/app/utils/getTileId";
import fetchTileStatus from "@/modules/db/fetchTileStatus";

export default function useParkingSpots(
  lat: number,
  lng: number,
  dist: number = DEFAULT_QUERY_DISTANCE,
  currentTime: Date = new Date(),
) {
  const tile = getTileId(lat, lng);
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const tileStatus = useQuery({
    queryKey: ["tileStatus", tile],
    queryFn: () => fetchTileStatus(tile),
    enabled: !!tile,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!tileStatus.isError) return;

    console.warn(
      `Tile ${tile} status check failed. Proceeding with online fetch. Error: ${tileStatus.error}`,
    );
  }, [tile, tileStatus.error, tileStatus.isError]);

  const shouldFetchOnlineRacks = useMemo(() => {
    if (tileStatus.isError || !tileStatus.data) return true;

    const { fetched, lastFetched } = tileStatus.data;
    if (!fetched) return true;
    if (lastFetched == null) return true;

    const now = currentTime.getTime();
    const lastFetchedMs = new Date(lastFetched).getTime();
    return now - lastFetchedMs > ONE_DAY_MS;
  }, [ONE_DAY_MS, currentTime, tileStatus.data, tileStatus.isError]);

  const spotsQuery = useQuery<ParkingSpot[], Error>({
    queryKey: [
      "bikeParking",
      lat,
      lng,
      dist,
      shouldFetchOnlineRacks ? 1 : 0, // to differentiate cache for online vs db fetch
    ],
    queryFn: () =>
      shouldFetchOnlineRacks
        ? fetchOnlineSpots(lat, lng, dist)
        : fetchDbSpots(lat, lng, DEFAULT_QUERY_DISTANCE_METERS),
    enabled: !!tile && (tileStatus.isSuccess || tileStatus.isError),
    retry: 3,
    retryDelay: (attemptCount) => {
      return Math.min(1000 * attemptCount, 10000); // max delay 10s as safeguard
    },
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!spotsQuery.isError) return;

    console.warn(
      `Spots query failed for tile ${tile} (${lat}, ${lng}). Error: ${spotsQuery.error}`,
    );
  }, [lat, lng, spotsQuery.error, spotsQuery.isError, tile]);

  return {
    data: spotsQuery.data,
    error: spotsQuery.error,
    isError: spotsQuery.isError,
    isLoading: spotsQuery.isLoading,
    shouldFetchOnlineRacks,
  };
}
