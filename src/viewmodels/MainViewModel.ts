"use client";

import { useCallback, useMemo, useState } from "react";
import ParkingSpot from "@/core/constants/ParkingSpot";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
} from "@/core/constants/map/MapConstants";
import useParkingSpots from "@/hooks/useParkingSpots";
import usePersistParkingSpots from "@/hooks/usePersistParkingSpots";
import parseGeoInput from "@/app/utils/parseGeoInput";

type UseMainViewModelArgs = {
  initialQueryLocation?: {
    latitude: number;
    longitude: number;
  };
};

export default function useMainViewModel({
  initialQueryLocation,
}: UseMainViewModelArgs = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults: string[] = [];

  const [queryLatitude, setQueryLatitude] = useState<number>(
    initialQueryLocation?.latitude ?? DEFAULT_LATITUDE,
  );
  const [queryLongitude, setQueryLongitude] = useState<number>(
    initialQueryLocation?.longitude ?? DEFAULT_LONGITUDE,
  );

  const {
    data,
    error,
    isError,
    isLoading,
    shouldFetchOnlineRacks,
    fetchedTileIds,
  } = useParkingSpots(queryLatitude, queryLongitude);

  const racks: ParkingSpot[] = useMemo(() => data ?? [], [data]);

  usePersistParkingSpots({
    lat: queryLatitude,
    lng: queryLongitude,
    spots: data,
    shouldPersist: shouldFetchOnlineRacks && !!data,
  });

  const setQueryLocation = useCallback(
    (latitude: number, longitude: number) => {
      setQueryLatitude(latitude);
      setQueryLongitude(longitude);
    },
    [],
  );

  const handleCameraMove = useCallback(
    (latitude: number, longitude: number) => {
      setQueryLocation(latitude, longitude);
    },
    [setQueryLocation],
  );

  const handleSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const runMapSearch = useCallback(
    (query: string) => {
      const parsedCoordinates = parseGeoInput(query);
      if (!parsedCoordinates) {
        handleSearchQuery(query);
        return null;
      }

      setQueryLocation(parsedCoordinates.latitude, parsedCoordinates.longitude);
      return parsedCoordinates;
    },
    [handleSearchQuery, setQueryLocation],
  );

  return {
    racks,
    fetchedTileIds,
    isLoading,
    isError,
    error,
    queryLatitude,
    queryLongitude,
    setQueryLocation,
    handleCameraMove,
    handleSearchQuery,
    runMapSearch,
    searchQuery,
    searchResults,
  };
}
