"use client";

import MapErrorPopup from "@/components/map/MapErrorPopup";
import MapView from "@/components/map/MapView";
import SearchBar from "@/components/ui/SearchBar";
import useMainViewModel from "@/viewmodels/MainViewModel";

export default function Main() {
  const mainVM = useMainViewModel();

  return (
    <main className="h-screen w-screen">
      <SearchBar onSearchComplete={mainVM.handleSearchQuery} />
      <MapView vm={mainVM.mapVM} />
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
