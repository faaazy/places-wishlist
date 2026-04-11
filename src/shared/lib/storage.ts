import type { Place } from "@/entities";

export function getPlaces(): Place[] {
  const raw = localStorage.getItem("places");
  return raw ? JSON.parse(raw) : [];
}

export function savePlaces(places: Place[]): void {
  localStorage.setItem("places", JSON.stringify(places));
}
