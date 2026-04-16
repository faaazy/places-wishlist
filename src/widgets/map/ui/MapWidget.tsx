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

function LocationMarker() {
  const [position, setPosition] = useState<null | [number, number]>(null);
  const map = useMapEvents({
    locationfound(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
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
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export const MapWidget = () => {
  const { startAdding } = usePlaces();
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

        {clickCoords && (
          <Popup position={clickCoords}>
            <p>Want to visit!</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startAdding(clickCoords);
              }}
            >
              Add to wishlist
            </button>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};
