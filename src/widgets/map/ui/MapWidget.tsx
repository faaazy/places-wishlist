import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import styles from "./MapWidget.module.css";
import { LocateFixed } from "lucide-react";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import L from "leaflet";
import { PlaceMarkers } from "@/features/place-markers";
import { useNavigate, useSearchParams } from "react-router";

function LocationMarker() {
  const [position, setPosition] = useState<null | [number, number]>(null);
  const map = useMapEvents({
    locationfound(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 15);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function LocateButton() {
  const map = useMap();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (btnRef.current) {
      L.DomEvent.disableClickPropagation(btnRef.current);
    }
  }, []);

  const handleLocate = () => {
    map.locate();
  };

  return (
    <button
      onClick={handleLocate}
      title="Your location"
      className={styles.locateBtn}
      ref={btnRef}
    >
      <LocateFixed size={20} />
    </button>
  );
}

function MapClickHandler({
  onClick,
}: {
  onClick: (coords: [number, number]) => void;
}) {
  const navigate = useNavigate();

  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
      navigate(".", { replace: true });
    },
  });
  return null;
}

function FlyToSelectedPlace() {
  const map = useMap();
  const { places } = usePlaces();
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("placeId");

  const foundPlace = places.find((place) => place.id === placeId);

  useEffect(() => {
    if (foundPlace) {
      map.flyTo(foundPlace.coords, 15);
    }
  }, [foundPlace, map]);

  return null;
}

function FlyToCallbackSetter() {
  const { setFlyTo } = usePlaces();
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    setFlyTo((lat, lon, zoom) => {
      if (typeof lat !== "number" || typeof lon !== "number") return;
      map.flyTo([lat, lon], zoom);
    });
    return () => setFlyTo(null);
  }, [map, setFlyTo]);

  return null;
}

function SearchPopupHandler() {
  const map = useMap();
  const { searchPopup, confirmSearchAdd, clearSearchPopup } = usePlaces();
  const confirmRef = useRef(confirmSearchAdd);
  confirmRef.current = confirmSearchAdd;

  useEffect(() => {
    if (!searchPopup) return;

    const container = document.createElement("div");
    container.className = styles.clickPopup;
    container.style.cssText = "text-align: center;";

    const title = document.createElement("p");
    title.style.cssText =
      "font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: var(--text-h);";
    title.textContent = searchPopup.title;

    const btn = document.createElement("button");
    btn.className = styles.clickPopupBtn;
    btn.textContent = "Add to wishlist";
    btn.onclick = (e) => {
      e.stopPropagation();
      confirmRef.current();
    };

    container.appendChild(title);
    container.appendChild(btn);

    const popup = L.popup()
      .setLatLng(searchPopup.coords)
      .setContent(container)
      .openOn(map);

    const onPopupClose = () => {
      clearSearchPopup();
    };
    map.on("popupclose", onPopupClose);

    return () => {
      map.off("popupclose", onPopupClose);
      map.closePopup(popup);
    };
  }, [searchPopup, map, clearSearchPopup]);

  return null;
}

export const MapWidget = () => {
  const { startAdding, searchPopup } = usePlaces();
  const [clickCoords, setClickCoords] = useState<[number, number] | null>(null);

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onClick={setClickCoords} />

        <LocationMarker />

        <LocateButton />

        <PlaceMarkers />

        <FlyToSelectedPlace />

        <FlyToCallbackSetter />

        <SearchPopupHandler />

        {clickCoords && !searchPopup && (
          <Popup position={clickCoords}>
            <div className={styles.clickPopup}>
              <p className={styles.clickPopupTitle}>Want to visit!</p>
              <button
                className={styles.clickPopupBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  startAdding(clickCoords);
                }}
              >
                Add to wishlist
              </button>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};
