import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { PlaceCategory } from "@/entities/place/model/types";
import styles from "./ReadOnlyMap.module.css";

const colorMap: Record<PlaceCategory, string> = {
  nature: "#22c55e",
  city: "#3b82f6",
  food: "#f97316",
  culture: "#a855f7",
  adventure: "#ec4899",
};

function createIcon(category: PlaceCategory) {
  return L.divIcon({
    className: styles.markerWrapper,
    html: `<div class="${styles.markerIcon}" style="background:${colorMap[category]}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export interface ReadOnlyMapPoint {
  id: string;
  coords: [number, number];
  category: PlaceCategory;
  title: string;
}

function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, bounds]);

  return null;
}

export function ReadOnlyMap({ points }: { points: ReadOnlyMapPoint[] }) {
  const center = points[0]?.coords ?? ([51.505, -0.09] as [number, number]);
  const bounds =
    points.length > 1
      ? L.latLngBounds(points.map((p) => p.coords))
      : points.length === 1
        ? L.latLngBounds([points[0].coords])
        : null;

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className={styles.map}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bounds && <FitBounds bounds={bounds} />}
      {points.map((point) => (
        <Marker
          key={point.id}
          position={point.coords}
          icon={createIcon(point.category)}
        >
          <Popup>{point.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
