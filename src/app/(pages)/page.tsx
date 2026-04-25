"use client";

import SearchBar from "@/components/ui/SearchBar";
import useMainViewModel from "@/viewmodels/MainViewModel";

export default function MainPage() {
  const vm = useMainViewModel();
  const {
    searchInput,
    searchResults,
    searchError,
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
          />
          {searchError && (
            <p className="mt-2 text-xs text-rose-300">{searchError}</p>
          )}

          {searchInput.trim() && (
            <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-slate-800/70">
              {isGeocodeLoading ? (
                <p className="px-3 py-2 text-xs text-slate-300">
                  Searching places...
                </p>
              ) : searchResults.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-300">
                  No places found.
                </p>
              ) : (
                <ul className="max-h-64 divide-y divide-white/10 overflow-auto">
                  {searchResults.map((result, index) => {
                    return (
                      <li
                        key={`${result.LATITUDE}-${result.LONGITUDE}-${index}`}
                      >
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-white/10"
                          onClick={() => selectGeocodeResult(result)}
                        >
                          <p className="text-sm font-medium text-white">
                            {result.BUILDING || "Unnamed place"}
                          </p>
                          <p className="text-xs text-slate-300">
                            {result.ADDRESS}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
          onClick={handleOpenMapFromEnter}
        >
          Open map with this location
        </button>

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
