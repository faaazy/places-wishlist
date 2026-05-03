import { useEffect, useRef, useState } from "react";
import {
  parseCoords,
  reverseGeocode,
  searchPlace,
  type SearchResult,
} from "./geocoding";

export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      const coords = parseCoords(query); // ???

      if (coords) {
        const apiResults = await reverseGeocode(coords.lat, coords.lon);
        if (!cancelledRef.current) {
          setResults(apiResults);
        }
        return;
      }

      const apiResults = await searchPlace(query);
      if (!cancelledRef.current) {
        setResults(apiResults.slice(0, 5));
      }
    }, 500);

    return () => {
      cancelledRef.current = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  return { results };
}
