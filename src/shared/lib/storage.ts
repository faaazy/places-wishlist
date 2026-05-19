import type { Place } from "@/entities";
import type { UserProfile } from "@/entities/user/model/types";

export function getPlaces(): Place[] {
  const raw = localStorage.getItem("places");
  return raw ? JSON.parse(raw) : [];
}

export function savePlaces(places: Place[]): void {
  localStorage.setItem("places", JSON.stringify(places));
}

export function getUser(): UserProfile | null {
  const raw = localStorage.getItem("user_profile");
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem("user_profile", JSON.stringify(user));
}
