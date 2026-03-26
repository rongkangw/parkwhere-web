import { useEffect, useState } from "react";

type SearchBarProps = {
  onSearchComplete: (searchString: string) => void;
};

export default function SearchBar({ onSearchComplete }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchComplete?.(searchValue);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearchComplete]);

  return (
    <div className="fixed top-6 left-1/2 z-20 flex h-15 w-[50vw] -translate-x-1/2 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-md">
      <div className="px-4 py-2">
        <label htmlFor="parking-search" className="sr-only">
          Search for a rack
        </label>
        <input
          id="parking-search"
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search for a rack"
          className="h-full w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
