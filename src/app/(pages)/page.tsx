"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/SearchBar";
import parseGeoInput from "../utils/parseGeoInput";
import { buildMapRoute } from "../utils/mapRoute";

export default function Main() {
  const router = useRouter();
  const [geoInputError, setGeoInputError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const openMapWithInput = useCallback(
    (searchValue: string) => {
      const parsedCoordinates = parseGeoInput(searchValue);
      if (!parsedCoordinates) {
        setGeoInputError("Enter coordinates as latitude, longitude.");
        return;
      }

      setGeoInputError(null);
      router.push(buildMapRoute(parsedCoordinates));
    },
    [router],
  );

  const openMapDirectly = useCallback(() => {
    setGeoInputError(null);
    router.push(buildMapRoute());
  }, [router]);

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to ParkWhere
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Enter your geolocation to start near you.
        </p>

        <div className="mt-6">
          <SearchBar
            searchValue={searchValue}
            onChangeValue={setSearchValue}
            onEnter={openMapWithInput}
            placeholder="Enter latitude, longitude (e.g. 1.3521, 103.8198)"
          />
          {geoInputError && (
            <p className="mt-2 text-xs text-rose-300">{geoInputError}</p>
          )}
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
          onClick={() => openMapWithInput(searchValue)}
        >
          Open map with this location
        </button>

        <button
          type="button"
          className="mt-2 rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 underline decoration-slate-500 underline-offset-4 hover:text-white"
          onClick={openMapDirectly}
        >
          Go directly to map
        </button>
      </section>
    </main>
  );
}
