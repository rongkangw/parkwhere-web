"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MapErrorPopup from "@/components/map/MapErrorPopup";
import MapView from "@/components/map/MapView";
import SearchBar from "@/components/ui/SearchBar";
import useMainViewModel from "@/viewmodels/MainViewModel";
import useMapViewModel from "@/viewmodels/MapViewModel";
import { buildHomeRoute } from "@/app/utils/mapRoute";
import parseGeoInput from "@/app/utils/parseGeoInput";

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCoordinates = useMemo(() => {
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    if (!latParam || !lngParam) return null;

    return parseGeoInput(`${latParam},${lngParam}`);
  }, [searchParams]);

  const mainVM = useMainViewModel({
    initialQueryLocation: initialCoordinates ?? undefined,
  });
  const [mapSearchInput, setMapSearchInput] = useState("");
  const {
    racks,
    fetchedTileIds,
    queryLatitude,
    queryLongitude,
    handleCameraMove,
    runMapSearch,
  } = mainVM;

  const mapVM = useMapViewModel({
    racks,
    fetchedTileIds,
    initialCameraLatitude: queryLatitude,
    initialCameraLongitude: queryLongitude,
    onCameraMove: handleCameraMove,
  });

  const handleBackToHome = useCallback(() => {
    router.push(buildHomeRoute());
  }, [router]);

  const handleMapSearch = useCallback(() => {
    const parsedCoordinates = runMapSearch(mapSearchInput);
    if (!parsedCoordinates) return;

    mapVM.focusOnCoordinates(
      parsedCoordinates.latitude,
      parsedCoordinates.longitude,
    );
  }, [mapSearchInput, mapVM, runMapSearch]);

  return (
    <main className="h-screen w-screen">
      <div className="pointer-events-none fixed top-5 left-1/2 z-20 flex w-[min(92vw,52rem)] -translate-x-1/2 items-center gap-2">
        <button
          type="button"
          onClick={handleBackToHome}
          className="pointer-events-auto h-12 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
        >
          Back
        </button>
        <div className="pointer-events-auto flex-1">
          <SearchBar
            value={mapSearchInput}
            onChangeValue={setMapSearchInput}
            onEnter={handleMapSearch}
            placeholder="Find another place to search"
          />
        </div>
      </div>

      <div className="pointer-events-none fixed top-5 right-5 z-20 rounded-lg border border-slate-300 bg-white/95 px-3 py-2 font-mono text-xs text-slate-700 shadow-sm">
        lat: {queryLatitude.toFixed(6)} | lng: {queryLongitude.toFixed(6)}
      </div>

      <MapView vm={mapVM} />
      {mainVM.isLoading && (
        <MapErrorPopup
          message={"Loading bike parking data..."}
          variant="loading"
        />
      )}
      {mainVM.isError && mainVM.error && (
        <MapErrorPopup message={mainVM.error.message} variant="error" />
      )}
    </main>
  );
}
