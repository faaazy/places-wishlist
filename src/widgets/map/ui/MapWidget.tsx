import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useState } from "react";
import styles from "./MapWidget.module.css";
import { LocateFixed } from "lucide-react";

export const MapWidget = () => {
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

    const handleLocate = () => {
      map.locate();
    };

    return (
      <button
        onClick={handleLocate}
        title="Your location"
        className={styles.locateBtn}
      >
        <LocateFixed size={20} />
      </button>
    );
  }

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
        <LocationMarker />
        <LocateButton />
      </MapContainer>
    </div>
  );
};
