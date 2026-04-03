"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MapErrorPopup from "@/components/map/MapErrorPopup";
import MapView from "@/components/map/MapView";
import BackButton from "@/components/ui/BackButton";
import LatLngIndicator from "@/components/ui/LatLngIndicator";
import SearchBar from "@/components/ui/SearchBar";
import useMapViewModel from "@/viewmodels/MapViewModel";
import { buildHomeRoute } from "@/app/utils/mapRoute";
import parseGeoInput from "@/app/utils/parseGeoInput";
import { SINGAPORE_BOUNDS_HINT } from "@/core/constants/map/MapConstants";

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="pointer-events-none fixed top-20 left-1/2 z-20 -translate-x-1/2">
          <MapErrorPopup message={"Loading map..."} variant="loading" />
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}

function MapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCoordinates = useMemo(() => {
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    if (!latParam || !lngParam) return null;

    return parseGeoInput(`${latParam},${lngParam}`);
  }, [searchParams]);

  const mapVM = useMapViewModel({
    initialQueryLocation: initialCoordinates ?? undefined,
  });

  const [searchInputError, setSearchInputError] = useState<string | null>(null);
  const { queryLocation, isLoading, isError, error, handleMapSearch } = mapVM;

  const handleBackToHome = useCallback(() => {
    router.push(buildHomeRoute());
  }, [router]);

  const handleSearch = useCallback(
    (searchValue: string) => {
      const isSearchValid = handleMapSearch(searchValue);
      if (!isSearchValid) {
        setSearchInputError(SINGAPORE_BOUNDS_HINT);
        return;
      }

      setSearchInputError(null);
    },
    [handleMapSearch],
  );

  return (
    <main className="h-screen w-screen">
      <div className="fixed top-4 z-20 w-full">
        <div className="relative flex w-full items-center px-2">
          <div className="mr-auto">
            <BackButton onClick={handleBackToHome} />
          </div>

          <div className="pointer-events-auto absolute left-1/2 w-[60vw] max-w-[60vw] min-w-56 -translate-x-1/2">
            <SearchBar
              onEnter={handleSearch}
              placeholder="Jump to a location..."
            />
          </div>
        </div>

        {(isLoading || (isError && error) || searchInputError) && (
          <div className="mt-2 flex w-full justify-center">
            <div className="space-y-2">
              {isLoading && (
                <MapErrorPopup
                  message={"Loading bike parking data..."}
                  variant="loading"
                />
              )}
              {isError && error && (
                <MapErrorPopup message={error.message} variant="error" />
              )}
              {searchInputError && (
                <MapErrorPopup message={searchInputError} variant="error" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed right-4 bottom-4 z-20">
        <LatLngIndicator
          latitude={queryLocation.latitude}
          longitude={queryLocation.longitude}
        />
      </div>

      <MapView vm={mapVM} />
    </main>
  );
}
