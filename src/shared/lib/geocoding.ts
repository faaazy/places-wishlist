const NOMINATIM_URL = `https://nominatim.openstreetmap.org/`;

export interface Coords {
  lat: number;
  lon: number;
}

export interface SearchResult {
  lat: number;
  lon: number;
  display_name: string;
}

export function parseCoords(input: string): Coords | null {
  const parts = input.trim().split(/[,\s]+/);

  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}

export async function searchPlace(query: string): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query.trim());
  const res = await fetch(
    `${NOMINATIM_URL}search?q=${encoded}&format=json&limit=5`,
  );

  const data = await res.json();

  return data.map((item: any) => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display_name: item.display_name,
  }));
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<SearchResult[]> {
  const res = await fetch(
    `${NOMINATIM_URL}reverse?format=geojson&lat=${lat}&lon=${lon}&layer=address`,
  );

  const data = await res.json();

  return [{ lat, lon, display_name: data[0].features.display_name }];
}
