"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import useGeocodingSearch from "@/hooks/useGeocodingSearch";
import { OneMapGeocodeResult } from "@/services/external/fetchGeocodeResults";

export default function useMainViewModel() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const {
    geocodeSearchResults: geocodeResults,
    isGeocodeLoading,
    geocodeError,
  } = useGeocodingSearch(searchInput);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleOpenMapWithResult = useCallback(
    (result: OneMapGeocodeResult) => {
      const latitude = Number(result.LATITUDE);
      const longitude = Number(result.LONGITUDE);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return;
      }
      const params = new URLSearchParams({
        lat: String(latitude),
        lng: String(longitude),
      });
      router.push(`/map?${params.toString()}`);
    },
    [router],
  );

  const handleOpenMapFromEnter = useCallback(() => {
    if (geocodeResults.length > 0) {
      handleOpenMapWithResult(geocodeResults[0]);
      return true;
    }

    return false;
  }, [handleOpenMapWithResult, geocodeResults]);

  const selectGeocodeResult = useCallback(
    (result: OneMapGeocodeResult) => {
      handleOpenMapWithResult(result);
    },
    [handleOpenMapWithResult],
  );

  const openMapDirectly = useCallback(() => {
    router.push("/map");
  }, [router]);

  const handleBackToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    searchInput,
    geocodeResults,
    geocodeError,
    handleSearchInputChange,
    isGeocodeLoading,
    handleOpenMapFromEnter,
    handleOpenMapWithResult,
    handleBackToHome,
    openMapDirectly,
    selectGeocodeResult,
  };
}
