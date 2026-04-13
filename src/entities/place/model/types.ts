export type PlaceCategory = "nature" | "city" | "food" | "culture" | "adventure";

type WishRating = 1 | 2 | 3 | 4 | 5;

type PlaceStatus = "wishlist" | "visited" | "skipped";

export interface Place {
  id: string;
  title: string;
  description: string;
  coords: [number, number];
  category: PlaceCategory;
  wishRating: WishRating;
  status: PlaceStatus;
  createdAt: string;
}
