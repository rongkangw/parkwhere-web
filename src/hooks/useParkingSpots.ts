import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import {
  DEFAULT_QUERY_DISTANCE,
  DEFAULT_QUERY_DISTANCE_METERS,
} from "@/core/constants/map/MapConstants";
import fetchOnlineSpots from "@/modules/parking/fetchOnlineSpots";
import fetchDbSpots from "@/modules/db/fetchDbSpots";
import ParkingSpot from "@/core/constants/parkingspot/ParkingSpot";
import getTileId from "@/app/utils/getTileId";
import fetchTileStatus from "@/modules/db/fetchTileStatus";
import getAdjacentTileIds from "@/app/utils/getAdjacentTileIds";
import MapTileResponse from "@/core/constants/map/MapTileResponse";
import { getTileCenter } from "@/app/utils/getTileCenter";
import MapTile from "../core/constants/map/MapTile";
import updateDbSpots from "@/modules/db/updateDbSpots";

type TileStatusQueryResponse = {
  data?: MapTileResponse;
  isError?: boolean;
  isSuccess?: boolean;
  isLoading?: boolean;
  error?: unknown;
};

export default function useParkingSpots(
  lat: number,
  lng: number,
  dist: number = DEFAULT_QUERY_DISTANCE,
  currentTime: Date = new Date(),
) {
  const persistedTileSignaturesRef = useRef(new Set<string>());

  // 1) Get current tile id and adjacent tile ids from map position.
  const tile = getTileId(lat, lng);
  const tileIds = useMemo(() => getAdjacentTileIds(tile), [tile]);

  // 2) Fetch tile status for each tile id.
  const tilesStatusQueries = useQueries({
    queries: tileIds.map((tileId) => ({
      queryKey: ["tileStatus", tileId],
      queryFn: async () => {
        try {
          return await fetchTileStatus(tileId);
        } catch (error) {
          console.warn(
            `Tile ${tileId} status check failed. Proceeding with online fetch. ${error}`,
          );
          throw error;
        }
      },
      enabled: !!tileId,
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });

  // 3) Decide per tile whether to fetch online or DB spots.
  const tileQueryContexts = useMemo<MapTile[]>(() => {
    const nowMs = currentTime.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return tileIds.map((tileId, index) => {
      const { lat: tileLat, lng: tileLng } = getTileCenter(tileId);
      const tileStatusQuery = tilesStatusQueries[index] as
        | TileStatusQueryResponse
        | undefined;

      const tileStatus = tileStatusQuery?.data;
      const shouldPersist =
        tileStatusQuery?.isError ||
        !tileStatus ||
        !tileStatus.fetched ||
        tileStatus.lastFetched == null ||
        nowMs - tileStatus.lastFetched.getTime() > oneDayMs;

      return {
        tileId,
        lat: tileLat,
        lng: tileLng,
        shouldPersist,
      };
    });
  }, [currentTime, tileIds, tilesStatusQueries]);

  // 3) Continue: fetch online if stale/missing/error, otherwise fetch DB spots.
  const parkingSpotsQueries = useQueries({
    queries: tileQueryContexts.map((context, index) => {
      const { tileId, lat: tileLat, lng: tileLng, shouldPersist } = context;

      return {
        queryKey: ["bikeParking", tileId, dist, shouldPersist],
        queryFn: async () => {
          try {
            if (shouldPersist) {
              return await fetchOnlineSpots(tileLat, tileLng, dist);
            }

            return await fetchDbSpots(
              tileLat,
              tileLng,
              DEFAULT_QUERY_DISTANCE_METERS,
            );
          } catch (error) {
            console.warn(
              `Spots query failed for tile ${tileId} >> ${error instanceof Error ? error.message : String(error)}`,
            );
            throw new Error(`Failed to fetch spots for tile ${tileId}`);
          }
        },
        enabled:
          !!tileId &&
          (tilesStatusQueries[index]?.isSuccess ||
            tilesStatusQueries[index]?.isError),
        retry: 3,
        retryDelay: (attemptCount: number) => {
          return Math.min(1000 * attemptCount, 10000); // max delay 10s as safeguard
        },
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
      };
    }),
  });

  // Keep tile-grouped spot results as the primary shape.
  const tileFetchEntriesWithSpots = useMemo<MapTile[]>(() => {
    return tileQueryContexts.map((context, index) => {
      const { tileId, lat, lng, shouldPersist } = context;
      return {
        tileId,
        lat,
        lng,
        shouldPersist,
        spots: parkingSpotsQueries[index]?.data,
      };
    });
  }, [parkingSpotsQueries, tileQueryContexts]);

  // 4) Persist online-fetched tiles back into DB.
  useEffect(() => {
    const persistTile = async (tileEntry: MapTile) => {
      if (
        !tileEntry.shouldPersist ||
        !tileEntry.spots ||
        tileEntry.spots.length === 0
      ) {
        return;
      }

      const { tileId, lat, lng, spots } = tileEntry;
      const signature = `${tileId}:${spots.map((spot) => spot.id).join(",")}`;
      if (persistedTileSignaturesRef.current.has(signature)) return;

      try {
        await updateDbSpots(tileId, lat, lng, spots);
        persistedTileSignaturesRef.current.add(signature);
      } catch (error) {
        console.warn(
          `Failed to persist online spots for tile ${tileId} >> ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    if (tileFetchEntriesWithSpots.length === 0) return;

    void Promise.all(tileFetchEntriesWithSpots.map(persistTile));
  }, [tileFetchEntriesWithSpots]);

  // 5) Merge all tile spots into one deduplicated list for rendering.
  const spots = useMemo(() => {
    const dedupedSpots = new Map<string, ParkingSpot>();

    tileFetchEntriesWithSpots.forEach((entry) => {
      entry.spots?.forEach((spot) => {
        dedupedSpots.set(spot.id, spot);
      });
    });

    return Array.from(dedupedSpots.values());
  }, [tileFetchEntriesWithSpots]);

  const fetchedTileIds = useMemo(() => {
    const fetched = new Set<string>();

    tilesStatusQueries.forEach((tileStatusQuery, index) => {
      if (tileStatusQuery.data?.fetched) {
        fetched.add(tileIds[index]);
      }
    });

    return fetched;
  }, [tileIds, tilesStatusQueries]);

  return {
    data: spots,
    error: parkingSpotsQueries.find((query) => query.isError)?.error,
    isError: parkingSpotsQueries.some((query) => query.isError),
    isLoading:
      tilesStatusQueries.some((query) => query.isLoading) ||
      parkingSpotsQueries.some((query) => query.isLoading),
    currentTile: tile,
    isTileStatusResolved: tilesStatusQueries.every(
      (query) => query.isSuccess || query.isError,
    ),
    isTileFetched: fetchedTileIds.has(tile),
    fetchedTileIds,
    tileFetchEntries: tileFetchEntriesWithSpots,
  };
}
