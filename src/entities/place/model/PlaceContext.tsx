import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import type { Place } from "./types";
import { getPlaces } from "@/shared/lib/storage";
import { useAuth } from "@/entities/auth/model/AuthContext";
import { supabase } from "@/shared/lib/supabase";

interface PlaceContextValue {
  places: Place[];
  addPlace: (place: Place) => Promise<void>;
  removePlace: (id: string) => Promise<void>;
  newPlaceCoords: [number, number] | null;
  startAdding: (coords: [number, number]) => void;
  cancelAdding: () => void;
  updatePlace: (id: string, updatedPlace: Partial<Place>) => Promise<void>;
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
  clearSearchPopup: () => void;
}

const PlaceContext = createContext<PlaceContextValue | null>(null);

export const PlaceContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
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

  const { authUser } = useAuth();
  const isAuthenticated = authUser !== null;

  const loadPlaces = useCallback(async () => {
    if (isAuthenticated) {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id_user", authUser.id)
        .order("created_at", { ascending: false });

      if (error) return;
      setPlaces(
        data.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          coords: [row.lat, row.lng] as [number, number],
          category: row.category,
          wishRating: row.wish_rating,
          status: row.status,
          createdAt: row.created_at,
        })),
      );
    } else {
      setPlaces(getPlaces());
    }
  }, [authUser]);

  useEffect(() => {
    async function init() {
      if (authUser) {
        const migrated = localStorage.getItem("migrated_" + authUser.id);
        if (!migrated) {
          await migrateLocalPlaces(authUser.id);
        }
      }

      loadPlaces();
    }

    init();
  }, [authUser]);

  const addPlace = async (place: Place) => {
    if (isAuthenticated) {
      await supabase.from("places").insert({
        id_user: authUser.id,
        title: place.title,
        description: place.description,
        lat: place.coords[0],
        lng: place.coords[1],
        category: place.category,
        wish_rating: place.wishRating,
        status: "wishlist",
      });

      await loadPlaces();
    } else {
      setPlaces((prev) => [...prev, { ...place, status: "wishlist" }]);
    }
  };

  const removePlace = async (id: string) => {
    if (isAuthenticated) {
      await supabase.from("places").delete().eq("id", id);
      await loadPlaces();
    } else {
      setPlaces((prev) => prev.filter((place) => place.id !== id));
    }
  };

  const updatePlace = async (id: string, updatedPlace: Partial<Place>) => {
    if (isAuthenticated) {
      const { coords, wishRating, ...rest } = updatedPlace;

      await supabase
        .from("places")
        .update({
          ...rest,
          ...(wishRating !== undefined && { wish_rating: wishRating }),
          ...(coords !== undefined && { lat: coords[0], lng: coords[1] }),
        })
        .eq("id", id);

      await loadPlaces();
    } else {
      setPlaces((prev) =>
        prev.map((place) =>
          place.id === id ? { ...place, ...updatedPlace } : place,
        ),
      );
    }
  };

  const migrateLocalPlaces = async (userId: string) => {
    const localPlaces = getPlaces();
    if (localPlaces.length === 0) return;

    const { data: existing } = await supabase
      .from("places")
      .select("id")
      .eq("id_user", userId)
      .limit(1);

    if (existing && existing.length > 0) {
      localStorage.setItem("migrated_" + userId, "true");
      localStorage.removeItem("places");
      return;
    }

    const { error } = await supabase.from("places").insert(
      localPlaces.map((p) => ({
        id_user: userId,
        title: p.title,
        description: p.description,
        lat: p.coords[0],
        lng: p.coords[1],
        category: p.category,
        wish_rating: p.wishRating,
        status: p.status,
      })),
    );

    if (!error) {
      localStorage.removeItem("places");
      localStorage.setItem("migrated_" + userId, "true");
    }
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

  const clearSearchPopup = () => setSearchPopup(null);

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
        clearSearchPopup,
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
