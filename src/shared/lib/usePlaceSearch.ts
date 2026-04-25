import { useEffect, useRef, useState } from "react";
import {
  parseCoords,
  reverseGeocode,
  searchPlace,
  type SearchResult,
} from "./geocoding";
import { usePlaces } from "@/entities/place/model/PlaceContext";

export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const { places } = usePlaces();

  const placesRef = useRef(places);
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  useEffect(() => {
    let cancelled = false;

    async function doSearch() {
      const coords = parseCoords(query);
      if (coords) {
        const address = await reverseGeocode(coords.lat, coords.lon);

        if (!cancelled) {
          setResults(address);
        }

        return;
      }

      const filteredPlaces = placesRef.current.filter((place) => {
        return place.title.toLowerCase().includes(query.toLowerCase());
      });

      const placeResults: SearchResult[] = filteredPlaces.map((place) => ({
        lat: place.coords[0],
        lon: place.coords[1],
        display_name: place.title,
      }));

      if (filteredPlaces.length < 3) {
        const apiResults = await searchPlace(query);
        if (!cancelled) {
          setResults([...placeResults, ...apiResults].slice(0, 5));
        }
      } else {
        setResults(placeResults.slice(0, 5));
      }
    }

    if (query.trim()) {
      doSearch();
    }

    return () => {
      cancelled = true;
    };
  }, [query]);

  return { results };
}
