import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import type { Place } from "./types";
import { getPlaces, savePlaces } from "@/shared/lib/storage";

interface PlaceContextValue {
  places: Place[];
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  newPlaceCoords: [number, number] | null;
  startAdding: (coords: [number, number]) => void;
  cancelAdding: () => void;
  updatePlace: (id: string, updatedPlace: Partial<Place>) => void;
  editingPlaceId: string | null;
  startEditing: (id: string) => void;
  cancelEditing: () => void;
  flyTo: ((lat: number, lon: number, zoom: number) => void) | null;
  setFlyTo: (
    callback: ((lat: number, lon: number, zoom: number) => void) | null,
  ) => void;
  searchPopup: {
    coords: [number, number];
    title: string;
  } | null;
  showSearchPopup: (coords: [number, number], title: string) => void;
  confirmSearchAdd: () => void;
}

const PlaceContext = createContext<PlaceContextValue | null>(null);

export const PlaceContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [places, setPlaces] = useState<Place[]>(() => getPlaces());
  const [newPlaceCoords, setNewPlaceCoords] = useState<[number, number] | null>(
    null,
  );
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const flyToRef = useRef<
    ((lat: number, lon: number, zoom: number) => void) | null
  >(null);
  const [, forceRender] = useState({});
  const [searchPopup, setSearchPopup] = useState<{
    coords: [number, number];
    title: string;
  } | null>(null);

  useEffect(() => {
    savePlaces(places);
  }, [places]);

  const addPlace = (place: Place) => {
    // if user can change status during adding it, then delete status here
    setPlaces((prev) => [...prev, { ...place, status: "wishlist" }]);
  };

  const removePlace = (id: string) => {
    setPlaces((prev) => prev.filter((place) => place.id !== id));
  };

  const updatePlace = (id: string, updatedPlace: Partial<Place>) => {
    setPlaces((prev) =>
      prev.map((place) =>
        place.id === id ? { ...place, ...updatedPlace } : place,
      ),
    );
  };

  const startAdding = (coords: [number, number]) => setNewPlaceCoords(coords);
  const cancelAdding = () => setNewPlaceCoords(null);

  const startEditing = (id: string) => setEditingPlaceId(id);
  const cancelEditing = () => {
    setEditingPlaceId(null);
    setSearchPopup(null);
  };

  const setFlyTo = useCallback(
    (callback: ((lat: number, lon: number, zoom: number) => void) | null) => {
      flyToRef.current = callback;
      forceRender({});
    },
    [],
  );

  const showSearchPopup = (coords: [number, number], title: string) => {
    setSearchPopup({ coords, title });
  };

  const confirmSearchAdd = () => {
    if (!searchPopup) return;

    const place: Place = {
      id: crypto.randomUUID(),
      title: searchPopup.title,
      description: "",
      coords: searchPopup.coords,
      category: "nature",
      status: "wishlist",
      wishRating: 3,
      createdAt: new Date().toISOString(),
    };

    addPlace(place);

    setSearchPopup(null);
  };

  return (
    <PlaceContext.Provider
      value={{
        places,
        addPlace,
        newPlaceCoords,
        startAdding,
        cancelAdding,
        removePlace,
        updatePlace,
        cancelEditing,
        startEditing,
        editingPlaceId,
        flyTo: flyToRef.current,
        setFlyTo,
        showSearchPopup,
        searchPopup,
        confirmSearchAdd,
      }}
    >
      {children}
    </PlaceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePlaces = () => {
  const context = useContext(PlaceContext);

  if (!context) {
    throw new Error("usePlaces must be used within PlaceContextProvider");
  }

  return context;
};
