import type { PlaceCategory } from "@/entities/place/model/types";

export interface PopularPlace {
  title: string;
  description: string;
  coords: [number, number];
  category: PlaceCategory;
  wishRating: 1 | 2 | 3 | 4 | 5;
}

export const popularPlaces: PopularPlace[] = [
  {
    title: "Eiffel Tower, Paris",
    description: "Iconic iron lattice tower and symbol of Paris.",
    coords: [48.8584, 2.2945],
    category: "city",
    wishRating: 5,
  },
  {
    title: "Grand Canyon, USA",
    description: "Steep-sided canyon carved by the Colorado River.",
    coords: [36.1069, -112.1129],
    category: "nature",
    wishRating: 5,
  },
  {
    title: "Machu Picchu, Peru",
    description: "15th-century Inca citadel in the Andes.",
    coords: [-13.1631, -72.545],
    category: "adventure",
    wishRating: 5,
  },
  {
    title: "Colosseum, Rome",
    description: "Ancient Roman amphitheatre in the city center.",
    coords: [41.8902, 12.4922],
    category: "culture",
    wishRating: 4,
  },
  {
    title: "Santorini, Greece",
    description: "Cyclades island known for whitewashed villages.",
    coords: [36.3932, 25.4615],
    category: "city",
    wishRating: 4,
  },
  {
    title: "Mount Fuji, Japan",
    description: "Japan's highest peak, a sacred mountain.",
    coords: [35.3606, 138.7274],
    category: "nature",
    wishRating: 5,
  },
  {
    title: "Northern Lights, Iceland",
    description: "Aurora borealis viewing through the Arctic skies.",
    coords: [64.9631, -19.0208],
    category: "nature",
    wishRating: 5,
  },
  {
    title: "Great Barrier Reef, Australia",
    description: "The world's largest coral reef system.",
    coords: [-18.2871, 147.6992],
    category: "nature",
    wishRating: 4,
  },
];
