import type { Place } from "@/entities";
import { usePlaces } from "@/entities/place/model/PlaceContext";

type AddPlaceData = Pick<
  Place,
  "title" | "description" | "category" | "wishRating"
>;

export const useAddPlace = () => {
  const { addPlace, newPlaceCoords, cancelAdding } = usePlaces();

  const submitPlace = (data: AddPlaceData) => {
    if (!newPlaceCoords) return;

    addPlace({
      id: crypto.randomUUID(),
      ...data,
      coords: newPlaceCoords,
      status: "wishlist" as const,
      createdAt: new Date().toISOString(),
    });

    cancelAdding();
  };

  return { submitPlace };
};
