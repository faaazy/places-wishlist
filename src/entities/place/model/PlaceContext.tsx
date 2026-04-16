import { createContext, useContext, useEffect, useState } from "react";
import type { Place } from "./types";
import { getPlaces, savePlaces } from "@/shared/lib/storage";

interface PlaceContextValue {
  places: Place[];
  addPlace: (place: Place) => void;
  newPlaceCoords: [number, number] | null;
  startAdding: (coords: [number, number]) => void;
  cancelAdding: () => void;
  updatePlace: (id: string, updatedPlace: Partial<Place>) => void;
  removePlace: (id: string) => void;
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
      }}
    >
      {children}
    </PlaceContext.Provider>
  );
};

export const usePlaces = () => {
  const context = useContext(PlaceContext);

  if (!context) {
    throw new Error("usePlaces must be used within PlaceContextProvider");
  }

  return context;
};
