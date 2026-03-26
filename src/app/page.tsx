"use client";

import MapView from "@/components/map/MapView";
import SearchBar from "@/components/ui/SearchBar";

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <SearchBar
        onSearchComplete={(searchString) => console.log(searchString)}
      />
      <MapView />
    </main>
  );
}
