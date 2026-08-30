import { usePlaces } from "@/entities/place/model/PlaceContext";
import { useGroups } from "@/entities/group";
import type { PlaceCategory } from "@/entities/place/model/types";
import type { SharedPlaceView } from "@/entities/group";
import { Fragment, useEffect, useRef, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router";
import L from "leaflet";
import "leaflet.markercluster";
import { Trash2, Pencil, Star, Share2, CopyPlus, Users } from "lucide-react";
import styles from "./PlaceMarkers.module.css";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { SharePlaceModal } from "@/features/share-place";

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

function createSharedIcon(category: PlaceCategory) {
  return L.divIcon({
    className: styles.markerIconWrapper,
    html: `
      <div class="${styles.markerIcon} ${styles.sharedIcon}" style="background:${colorMap[category]}">
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
    iconSize: [30, 30],
    iconAnchor: [20, 20],
  });
}

function SharedPlacePopup({
  view,
  onCopy,
  onEdit,
  onStatusChange,
}: {
  view: SharedPlaceView;
  onCopy: (view: SharedPlaceView) => void;
  onEdit: (placeId: string) => void;
  onStatusChange: (
    view: SharedPlaceView,
    status: SharedPlaceView["place"]["status"],
  ) => void;
}) {
  const place = view.place;

  return (
    <div className={styles.popup}>
      <div className={styles.popupHeader}>
        <h3 className={styles.popupTitle}>{place.title}</h3>
        <span className={`${styles.popupCategory} ${styles[place.category]}`}>
          {place.category}
        </span>
      </div>

      <div className={styles.popupSharedMeta}>
        <Users size={12} />
        <span>
          {view.ownerName} · {view.groupName}
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
              i < place.wishRating ? styles.starFilled : styles.starEmpty
            }
            fill={i < place.wishRating ? "currentColor" : "none"}
          />
        ))}
      </div>

      {view.canEdit && (
        <div className={styles.popupStatus}>
          {(["wishlist", "visited", "skipped"] as const).map((status) => (
            <button
              key={status}
              className={`${styles.popupStatusBtn} ${place.status === status ? styles.active : ""}`}
              onClick={() => onStatusChange(view, status)}
            >
              {status === "wishlist"
                ? "Wishlist"
                : status === "visited"
                  ? "Visited"
                  : "Skipped"}
            </button>
          ))}
        </div>
      )}

      <div className={styles.popupActions}>
        <button
          className={`${styles.popupBtn} ${styles.primary}`}
          onClick={() => onCopy(view)}
        >
          <CopyPlus size={14} />
          Add to my wishlist
        </button>
        {view.canEdit && (
          <button
            className={`${styles.popupBtn} ${styles.edit}`}
            onClick={() => onEdit(place.id)}
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

export function PlaceMarkers() {
  const { places, removePlace, startEditing, updatePlace } = usePlaces();
  const { sharedPlaces, copyToMine, refresh } = useGroups();
  const navigate = useNavigate();

  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("placeId");
  const [shareTarget, setShareTarget] = useState<
    (typeof places)[number] | null
  >(null);

  const myPlaceCoords = new Set(
    places.map(
      (place) => `${place.coords[0].toFixed(6)},${place.coords[1].toFixed(6)}`,
    ),
  );
  const visibleShared = sharedPlaces.filter((view) => {
    const [lat, lng] = view.place.coords;
    return !myPlaceCoords.has(`${lat.toFixed(6)},${lng.toFixed(6)}`);
  });

  useEffect(() => {
    if (placeId && markerRefs.current[placeId]) {
      markerRefs.current[placeId].openPopup();
    }
  }, [placeId]);

  const handleCopy = (view: SharedPlaceView) => {
    copyToMine(view);
  };

  const handleStatusChange = (
    view: SharedPlaceView,
    status: SharedPlaceView["place"]["status"],
  ) => {
    updatePlace(view.place.id, { status });
    refresh();
  };

  const handleRef = (placeId: string) => (el: L.Marker | null) => {
    if (el) markerRefs.current[placeId] = el;
  };

  return (
    <Fragment>
      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom
        showCoverageOnHover
        iconCreateFunction={createClusterIcon}
      >
        {places.map((place) => {
          const sharedGroups = sharedPlaces
            .filter((view) => view.place.id === place.id)
            .flatMap((view) => view.sharedGroups);
          return (
            <Marker
              ref={handleRef(place.id)}
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

                  {sharedGroups.length > 0 && (
                    <div className={styles.popupSharedMeta}>
                      <Share2 size={12} />
                      <span>Shared in: {sharedGroups.join(", ")}</span>
                    </div>
                  )}

                  {place.description && (
                    <p className={styles.popupDescription}>
                      {place.description}
                    </p>
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

                  <div className={styles.popupStatus}>
                    {(["wishlist", "visited", "skipped"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          className={`${styles.popupStatusBtn} ${place.status === status ? styles.active : ""}`}
                          onClick={() => updatePlace(place.id, { status })}
                        >
                          {status === "wishlist"
                            ? "Wishlist"
                            : status === "visited"
                              ? "Visited"
                              : "Skipped"}
                        </button>
                      ),
                    )}
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
                      className={`${styles.popupBtn} ${styles.primary}`}
                      onClick={() => setShareTarget(place)}
                    >
                      <Share2 size={14} />
                      Share
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
          );
        })}

        {visibleShared.map((view) => (
          <Marker
            ref={handleRef(view.place.id)}
            key={view.place.id}
            position={view.place.coords}
            icon={createSharedIcon(view.place.category)}
            eventHandlers={{
              click: () => {
                navigate(`?placeId=${view.place.id}`);
              },
            }}
          >
            <Popup>
              <SharedPlacePopup
                view={view}
                onCopy={handleCopy}
                onEdit={startEditing}
                onStatusChange={handleStatusChange}
              />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {shareTarget && (
        <SharePlaceModal
          place={shareTarget}
          onClose={() => setShareTarget(null)}
        />
      )}
    </Fragment>
  );
}
