"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LocateFixed } from "lucide-react";
import MapStatusPopup from "@/components/map/MapStatusPopup";
import MapView from "@/components/map/MapView";
import BackButton from "@/components/ui/BackButton";
import LatLngIndicator from "@/components/ui/LatLngIndicator";
import SearchBar from "@/components/ui/SearchBar";
import useMainViewModel from "@/viewmodels/MainViewModel";
import useMapViewModel from "@/viewmodels/MapViewModel";
import SettingsMenu from "@/components/ui/SettingsMenu";
import parseGeoInput from "@/utils/geocoding/parseGeoInput";

export default function MapPage() {
  return (
    // useSearchParams() needs a Suspense boundary in Next.js App Router.
    // Even though this is a Client Component, wrapping it in Suspense prevents the entire route
    // from being forced into client-side rendering during prerendering.
    <Suspense
      fallback={
        <div className="pointer-events-none fixed top-20 left-1/2 z-20 -translate-x-1/2">
          <MapStatusPopup message={"Loading map..."} variant="loading" />
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}

function MapPageContent() {
  const searchParams = useSearchParams();
  const { handleBackToHome } = useMainViewModel();

  const initialCoordinates = useMemo(() => {
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    if (!latParam || !lngParam) return null;

    return parseGeoInput(`${latParam},${lngParam}`);
  }, [searchParams]);

  const mapVM = useMapViewModel({
    initialQueryLocation: initialCoordinates ?? undefined,
  });
  const {
    queryLocation,
    isLoading,
    searchInput,
    geocodeSearchResults,
    geocodeError,
    isGeocodeLoading,
    handleSearchInputChange,
    handleOpenMapFromEnter,
    selectGeocodeResult,
    mapErrors,
    tileOverlayEnabled,
    handleTileOverlayToggle,
    cyclingPathsEnabled,
    handleCyclingPathsToggle,
    handleRequestUserLocation,
  } = mapVM;

  return (
    <main className="h-screen w-screen">
      <div className="fixed top-4 z-20 w-full">
        <div className="relative flex w-full items-center px-2">
          <div className="mr-auto">
            <BackButton onClick={handleBackToHome} />
          </div>

          <div className="pointer-events-auto absolute left-1/2 w-[60vw] max-w-[60vw] min-w-56 -translate-x-1/2">
            <SearchBar
              searchValue={searchInput}
              onChangeValue={handleSearchInputChange}
              onEnter={handleOpenMapFromEnter}
              placeholder="Search a place or its coordinates"
              searchResults={geocodeSearchResults}
              isGeocodeLoading={isGeocodeLoading}
              geocodeError={geocodeError}
              onSelectResult={selectGeocodeResult}
              emptyResultsMessage="No places found."
            />
          </div>
        </div>

        {(isLoading || mapErrors.length > 0) && (
          <div className="mt-2 flex w-full justify-center">
            <div className="space-y-2">
              {isLoading && (
                <MapStatusPopup
                  message={"Loading bike parking data..."}
                  variant="loading"
                />
              )}
              {mapErrors.map((item) => (
                <MapStatusPopup
                  key={item.id}
                  message={item.message}
                  variant="error"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed right-4 bottom-4 z-20">
        <div className="flex items-end gap-2">
          <LatLngIndicator
            latitude={queryLocation.latitude}
            longitude={queryLocation.longitude}
          />
          <button
            type="button"
            onClick={handleRequestUserLocation}
            className="ui-floating-btn z-10 p-2"
          >
            <LocateFixed size={20} />
          </button>
          <SettingsMenu
            tileOverlayEnabled={tileOverlayEnabled}
            onTileOverlayToggle={handleTileOverlayToggle}
            cyclingPathsEnabled={cyclingPathsEnabled}
            onCyclingPathsToggle={handleCyclingPathsToggle}
          />
        </div>
      </div>

      <MapView vm={mapVM} />
    </main>
  );
}
