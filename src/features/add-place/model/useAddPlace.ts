import type { Place } from "@/entities";
import { usePlaces } from "@/entities/place/model/PlaceContext";

type AddPlaceData = Pick<
  Place,
  "title" | "description" | "category" | "wishRating"
>;

export const useAddPlace = () => {
  const {
    addPlace,
    newPlaceCoords,
    cancelAdding,
    editingPlaceId,
    cancelEditing,
    updatePlace,
  } = usePlaces();

  const submitPlace = (data: AddPlaceData) => {
    if (editingPlaceId) {
      updatePlace(editingPlaceId, data);
      cancelEditing();
    } else if (newPlaceCoords) {
      addPlace({
        id: crypto.randomUUID(),
        ...data,
        coords: newPlaceCoords,
        status: "wishlist" as const,
        createdAt: new Date().toISOString(),
      });

      cancelAdding();
    } else {
      return null;
    }
  };

  return { submitPlace };
};
