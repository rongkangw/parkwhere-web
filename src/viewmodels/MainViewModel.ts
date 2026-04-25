"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildMapRoute } from "@/app/utils/mapRoute";
import useGeocodingSearch from "@/hooks/useGeocodingSearch";
import { OneMapGeocodeResult } from "@/modules/geocoding/fetchGeocodeResults";

export default function useMainViewModel() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<OneMapGeocodeResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { geocodeResults, isGeocodeLoading, geocodeError } =
    useGeocodingSearch(searchInput);

  useEffect(() => {
    setSearchResults(geocodeResults);
  }, [geocodeResults]);

  useEffect(() => {
    if (geocodeError) {
      setSearchError(geocodeError);
    }
  }, [geocodeError]);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
    setSearchError(null);
  }, []);

  const handleOpenMapWithResult = useCallback(
    (result: OneMapGeocodeResult) => {
      const latitude = Number(result.LATITUDE);
      const longitude = Number(result.LONGITUDE);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        setSearchError("Selected place has invalid coordinates.");
        return;
      }

      setSearchError(null);
      router.push(
        buildMapRoute({
          latitude,
          longitude,
        }),
      );
    },
    [router],
  );

  const handleOpenMapFromEnter = useCallback(() => {
    if (searchResults.length > 0) {
      handleOpenMapWithResult(searchResults[0]);
      return;
    }

    setSearchError(
      "No places found. Select a place result or refine your search.",
    );
  }, [handleOpenMapWithResult, searchResults]);

  const selectGeocodeResult = useCallback(
    (result: OneMapGeocodeResult) => {
      handleOpenMapWithResult(result);
    },
    [handleOpenMapWithResult],
  );

  const openMapDirectly = useCallback(() => {
    setSearchError(null);
    router.push(buildMapRoute());
  }, [router]);

  const handleBackToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    searchInput,
    searchResults,
    searchError,
    handleSearchInputChange,
    isGeocodeLoading,
    handleOpenMapFromEnter,
    handleOpenMapWithResult,
    handleBackToHome,
    openMapDirectly,
    selectGeocodeResult,
  };
}
