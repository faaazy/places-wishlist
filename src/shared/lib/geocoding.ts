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
  const trimmed = input.trim();

  const parts = trimmed.split(/[,\s]+/);

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
    {
      headers: {
        "User-Agent": "PlacesWishlist/1.0",
      },
    },
  );

  const data = await res.json();

  return data.map((item: any) => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display_name: item.display_name,
  }));
}
