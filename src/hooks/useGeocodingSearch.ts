import { useEffect, useState } from "react";
import parseGeoInput from "@/utils/geocoding/parseGeoInput";
import fetchGeocodeResults, {
  OneMapGeocodeResult,
} from "@/services/external/fetchGeocodeResults";

type UseGeocodingSearchResult = {
  geocodeSearchResults: OneMapGeocodeResult[];
  isGeocodeLoading: boolean;
  geocodeError: string | null;
};

export default function useGeocodingSearch(
  searchValue: string,
): UseGeocodingSearchResult {
  const [geocodeSearchResults, setGeocodeSearchResults] = useState<
    OneMapGeocodeResult[]
  >([]);
  const [isGeocodeLoading, setIsGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedSearchValue = searchValue.trim();
    const isCoordinateInput = parseGeoInput(trimmedSearchValue) !== null;

    // ignore empty or coordinate inputs
    if (!trimmedSearchValue || isCoordinateInput) {
      setGeocodeSearchResults([]);
      setGeocodeError(null);
      setIsGeocodeLoading(false);
      return;
    }

    setIsGeocodeLoading(true);
    setGeocodeError(null);

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const geocodeResults = await fetchGeocodeResults(
          trimmedSearchValue,
          abortController.signal,
        );
        setGeocodeSearchResults(geocodeResults.slice(0, 8));
      } catch (error) {
        if (abortController.signal.aborted) {
          console.info(
            `Geocoding request aborted for query "${trimmedSearchValue}".`,
          );
          return;
        }
        setGeocodeSearchResults([]);
        setGeocodeError(
          error instanceof Error ? error.message : "Failed to fetch places",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsGeocodeLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [searchValue]);

  return {
    geocodeSearchResults,
    isGeocodeLoading,
    geocodeError,
  };
}
