import { usePlaces } from "@/entities/place/model/PlaceContext";
import type { PlaceCategory } from "@/entities/place/model/types";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router";
import L from "leaflet";
import { Trash2, Pencil, Star } from "lucide-react";
import styles from "./PlaceMarkers.module.css";
import MarkerClusterGroup from "react-leaflet-markercluster";

const colorMap: Record<PlaceCategory, string> = {
  nature: "#22c55e",
  city: "#3b82f6",
  food: "#f97316",
  culture: "#a855f7",
  adventure: "#ec4899",
};

function createIcon(category: PlaceCategory) {
  return L.divIcon({
    className: styles.markerIconWrapper,
    html: `
      <div class="${styles.markerIcon}" style="background:${colorMap[category]}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div class="${styles.clusterIcon}"><span class="${styles.clusterCount}">${count}</span></div>`,
    className: styles.clusterIconWrapper,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export function PlaceMarkers() {
  const { places, removePlace, startEditing } = usePlaces();
  const navigate = useNavigate();

  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("placeId");

  useEffect(() => {
    if (placeId && markerRefs.current[placeId]) {
      markerRefs.current[placeId].openPopup();
    }
  }, [placeId]);

  return (
    <MarkerClusterGroup
      chunkedLoading
      spiderfyOnMaxZoom
      showCoverageOnHover
      iconCreateFunction={createClusterIcon}
    >
      {places.map((place) => (
        <Marker
          ref={(el) => {
            if (el) markerRefs.current[place.id] = el;
          }}
          key={place.id}
          position={place.coords}
          icon={createIcon(place.category)}
          eventHandlers={{
            click: () => {
              navigate(`?placeId=${place.id}`);
            },
          }}
        >
          <Popup>
            <div className={styles.popup}>
              <div className={styles.popupHeader}>
                <h3 className={styles.popupTitle}>{place.title}</h3>
                <span
                  className={`${styles.popupCategory} ${styles[place.category]}`}
                >
                  {place.category}
                </span>
              </div>

              {place.description && (
                <p className={styles.popupDescription}>{place.description}</p>
              )}

              <div className={styles.popupRating}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < place.wishRating
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                    fill={i < place.wishRating ? "currentColor" : "none"}
                  />
                ))}
              </div>

              <div className={styles.popupActions}>
                <button
                  className={`${styles.popupBtn} ${styles.edit}`}
                  onClick={() => startEditing(place.id)}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  className={`${styles.popupBtn} ${styles.danger}`}
                  onClick={() => removePlace(place.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
