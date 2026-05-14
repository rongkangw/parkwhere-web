import { useEffect, useState } from "react";
import parseGeoInput from "@/utils/geo/parseGeoInput";
import fetchGeocodeResults, {
  OneMapGeocodeResult,
} from "@/services/geocoding/fetchGeocodeResults";

type UseGeocodingSearchResult = {
  geocodeResults: OneMapGeocodeResult[];
  isGeocodeLoading: boolean;
  geocodeError: string | null;
};

export default function useGeocodingSearch(
  searchValue: string,
): UseGeocodingSearchResult {
  const [geocodeResults, setGeocodeResults] = useState<OneMapGeocodeResult[]>(
    [],
  );
  const [isGeocodeLoading, setIsGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedSearchValue = searchValue.trim();
    const isCoordinateInput = parseGeoInput(trimmedSearchValue) !== null;

    // ignore empty or coordinate inputs
    if (!trimmedSearchValue || isCoordinateInput) {
      setGeocodeResults([]);
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
        setGeocodeResults(geocodeResults.slice(0, 8));
      } catch (error) {
        if (abortController.signal.aborted) {
          console.info(
            `Geocoding request aborted for query "${trimmedSearchValue}".`,
          );
          return;
        }
        setGeocodeResults([]);
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
    geocodeResults,
    isGeocodeLoading,
    geocodeError,
  };
}
