"use client";

import { useCallback, useMemo, useState } from "react";
import ParkingSpot from "@/core/constants/ParkingSpot";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
} from "@/core/constants/map/MapConstants";
import useParkingSpots from "@/hooks/useParkingSpots";
import usePersistParkingSpots from "@/hooks/usePersistParkingSpots";
import useMapViewModel from "@/viewmodels/MapViewModel";

export default function useMainViewModel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const [queryLatitude, setQueryLatitude] = useState<number>(DEFAULT_LATITUDE);
  const [queryLongitude, setQueryLongitude] =
    useState<number>(DEFAULT_LONGITUDE);

  const { data, error, isError, isLoading, shouldFetchOnlineRacks } =
    useParkingSpots(queryLatitude, queryLongitude);

  const racks: ParkingSpot[] = useMemo(() => data ?? [], [data]);

  usePersistParkingSpots({
    lat: queryLatitude,
    lng: queryLongitude,
    spots: data,
    shouldPersist: shouldFetchOnlineRacks && !!data,
  });

  const handleCameraMove = useCallback(
    (latitude: number, longitude: number) => {
      setQueryLatitude(latitude);
      setQueryLongitude(longitude);
    },
    [],
  );

  const mapVM = useMapViewModel({ racks, onCameraMove: handleCameraMove });

  const handleSearchQuery = useCallback(
    (query: string) => {
      setSearchQuery(query);

      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        setSearchResults([]);
        return;
      }

      const matchedRackNames = racks
        .filter((rack) => rack.name.toLowerCase().includes(normalizedQuery))
        .map((rack) => rack.name);

      setSearchResults(matchedRackNames);
    },
    [racks],
  );

  return {
    mapVM,
    racks,
    isLoading,
    isError,
    error,
    handleSearchQuery,
    searchQuery,
    searchResults,
  };
}
