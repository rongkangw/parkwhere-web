import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
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
  const fetchedTileIdsRef = useRef<Set<string>>(new Set());

  console.log("checking tile status for tile:", tile);

  const tileStatus = useQuery({
    queryKey: ["tileStatus", tile],
    queryFn: () => fetchTileStatus(tile),
    enabled: !!tile,
    staleTime: 10 * 60 * 1000,
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
    if (tileStatus.isError || !tileStatus.data) {
      console.warn(`Tile status unavailable. Proceeding with online fetch.`);
      return true;
    }

    const { fetched, lastFetched } = tileStatus.data;

    if (!fetched) return true;
    if (lastFetched == null) return true;

    const now = currentTime.getTime();
    const lastFetchedMs = new Date(lastFetched).getTime();

    console.log(
      (now - lastFetchedMs) / (1000 * 60),
      "mins since last fetch for tile, stale if >",
      ONE_DAY_MS / (1000 * 60),
      "mins",
    );

    return now - lastFetchedMs > ONE_DAY_MS;
  }, [ONE_DAY_MS, currentTime, tileStatus.data, tileStatus.isError]);

  const spotsQuery = useQuery<ParkingSpot[], Error>({
    queryKey: [
      "bikeParking",
      tile,
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

  const isTileFetched = tileStatus.data?.fetched === true;

  if (tile && tileStatus.isSuccess) {
    if (isTileFetched) {
      fetchedTileIdsRef.current.add(tile);
    } else {
      fetchedTileIdsRef.current.delete(tile);
    }
  }

  const fetchedTileIds = new Set(fetchedTileIdsRef.current);

  return {
    data: spotsQuery.data,
    error: spotsQuery.error,
    isError: spotsQuery.isError,
    isLoading: spotsQuery.isLoading,
    shouldFetchOnlineRacks,
    currentTile: tile,
    isTileStatusResolved: tileStatus.isSuccess,
    isTileFetched,
    fetchedTileIds,
  };
}
