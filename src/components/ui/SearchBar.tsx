import { useState } from "react";
import { OneMapGeocodeResult } from "@/services/external/fetchGeocodeResults";

type SearchBarProps = {
  placeholder?: string;
  searchValue?: string;
  onChangeValue?: (value: string) => void;
  onEnter: (searchValue: string) => void;
  searchResults?: OneMapGeocodeResult[];
  isGeocodeLoading?: boolean;
  geocodeError?: string | null;
  onSelectResult?: (result: OneMapGeocodeResult) => void;
  emptyResultsMessage?: string;
};

export default function SearchBar({
  placeholder,
  searchValue,
  onChangeValue = () => {},
  onEnter,
  searchResults = [],
  isGeocodeLoading = false,
  geocodeError,
  onSelectResult = () => {},
  emptyResultsMessage = "No places found.",
}: SearchBarProps) {
  const [internalSearchInput, setInternalSearchInput] = useState(
    searchValue ?? "",
  );
  const isControlled = typeof searchValue === "string";
  const renderedSearchInput = isControlled ? searchValue : internalSearchInput;
  const shouldShowDropdown = renderedSearchInput.trim().length > 0;
  const hasResults = searchResults.length > 0;

  return (
    <div className="relative w-full">
      <div
        className={`ui-floating-surface flex h-12 w-full ${shouldShowDropdown ? "rounded-b-none" : ""}`}
      >
        <div className="w-full px-4 py-2">
          <label htmlFor="parking-search" className="sr-only">
            Search input
          </label>
          <input
            id="parking-search"
            type="text"
            value={renderedSearchInput}
            onChange={(event) => {
              if (!isControlled) {
                setInternalSearchInput(event.target.value);
              }
              onChangeValue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onEnter(renderedSearchInput);
              }
            }}
            placeholder={placeholder}
            className="h-full w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {shouldShowDropdown && (
        <div className="ui-floating-surface absolute top-full right-0 left-0 -mt-px overflow-hidden rounded-t-none">
          {geocodeError && (
            <p className="border-b border-white/10 px-3 py-2 text-xs text-rose-300">
              {geocodeError}
            </p>
          )}

          {isGeocodeLoading ? (
            <p className="px-3 py-2 text-xs text-slate-900">
              Searching places...
            </p>
          ) : hasResults ? (
            <ul className="max-h-64 divide-y divide-white/10 overflow-auto">
              {searchResults.map((result, index) => {
                return (
                  <li key={`${result.LATITUDE}-${result.LONGITUDE}-${index}`}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        onSelectResult(result);
                        setInternalSearchInput("");
                      }}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {result.BUILDING == "NIL"
                          ? result.ROAD_NAME
                          : result.BUILDING}
                      </p>
                      <p className="text-xs text-slate-900">{result.ADDRESS}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-2 text-xs text-slate-900">
              {emptyResultsMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
