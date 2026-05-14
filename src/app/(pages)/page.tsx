"use client";

import SearchBar from "@/components/ui/SearchBar";
import useMainViewModel from "@/viewmodels/MainViewModel";

export default function MainPage() {
  const vm = useMainViewModel();
  const {
    searchInput,
    searchResults,
    geocodeError,
    handleSearchInputChange,
    isGeocodeLoading,
    handleOpenMapFromEnter,
    openMapDirectly,
    selectGeocodeResult,
  } = vm;

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
        <h1 className="w-full text-center text-3xl font-bold tracking-tight">
          Welcome to ParkWhere
        </h1>
        <p className="mt-3 w-full text-center text-sm text-slate-300">
          Enter your geolocation to start near you.
        </p>

        <div className="mt-6">
          <SearchBar
            searchValue={searchInput}
            onChangeValue={handleSearchInputChange}
            onEnter={handleOpenMapFromEnter}
            placeholder="Search a place"
            searchResults={searchResults}
            isGeocodeLoading={isGeocodeLoading}
            geocodeError={geocodeError}
            onSelectResult={selectGeocodeResult}
          />
        </div>

        <button
          type="button"
          className="mt-2 w-full rounded-md py-1.5 text-xs font-medium text-slate-300 underline decoration-slate-500 underline-offset-4 hover:text-white"
          onClick={openMapDirectly}
        >
          Go directly to map
        </button>
      </section>
    </main>
  );
}
