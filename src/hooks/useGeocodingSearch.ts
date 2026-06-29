import { useEffect, useMemo, useState } from "react";
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

  const validatedSearchValue = useMemo(() => {
    const trimmed = searchValue.trim();
    if (!trimmed || parseGeoInput(trimmed) !== null) {
      return null;
    }
    return trimmed;
  }, [searchValue]);

  useEffect(() => {
    if (!validatedSearchValue) {
      return;
    }

    const abortController = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setIsGeocodeLoading(true);
      setGeocodeError(null);

      try {
        const geocodeResults = await fetchGeocodeResults(
          validatedSearchValue,
          abortController.signal,
        );
        setGeocodeSearchResults(geocodeResults.slice(0, 8));
      } catch (error) {
        if (abortController.signal.aborted) {
          console.info(
            `Geocoding request aborted for query "${validatedSearchValue}".`,
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
  }, [validatedSearchValue]);

  return {
    geocodeSearchResults,
    isGeocodeLoading,
    geocodeError,
  };
}
