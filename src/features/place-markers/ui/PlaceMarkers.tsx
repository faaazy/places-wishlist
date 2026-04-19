import { usePlaces } from "@/entities/place/model/PlaceContext";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router";
import L from "leaflet";

export function PlaceMarkers() {
  const { places, removePlace } = usePlaces();
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
    <>
      {places.map((place) => (
        <Marker
          ref={(el) => {
            if (el) markerRefs.current[place.id] = el;
          }}
          key={place.id}
          position={place.coords}
          eventHandlers={{
            click: () => {
              navigate(`?placeId=${place.id}`);
            },
          }}
        >
          <Popup>
            <h3>{place.title}</h3>
            <p>{place.description}</p>
            <button onClick={() => removePlace(place.id)}>Delete</button>
            <button>Edit</button>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
