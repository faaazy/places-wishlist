import { usePlaces } from "@/entities/place/model/PlaceContext";
import { Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router";

export function PlaceMarkers() {
  const { places, removePlace } = usePlaces();
  const navigate = useNavigate();

  return (
    <>
      {places.map((place) => (
        <Marker
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
