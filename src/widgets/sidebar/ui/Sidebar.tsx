import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";
import {
  CircleChevronLeft,
  CircleChevronRight,
  Search,
  // Map,
  // List,
  // User,
  Star,
} from "lucide-react";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import type { Place, PlaceCategory } from "@/entities/place/model/types";
import { AddPlaceForm } from "@/features/add-place/ui/AddPlaceForm";
import { useNavigate } from "react-router";

const filterCategories: (PlaceCategory | "all")[] = [
  "all",
  "nature",
  "city",
  "food",
  "culture",
  "adventure",
];

const filterLabels: Record<string, string> = {
  all: "All",
  nature: "Nature",
  city: "City",
  food: "Food",
  culture: "Culture",
  adventure: "Adventure",
};

function PlaceCard({ place }: { place: Place }) {
  const navigate = useNavigate();

  return (
    <div
      className={styles["sidebar-card"]}
      onClick={() => navigate("?placeId=" + place.id)}
    >
      <div className={styles["place-info"]}>
        <div className={styles["place-name"]}>{place.title}</div>
        <div className={styles["place-location"]}>{place.category}</div>
        <div className={styles["place-rating"]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < place.wishRating
                  ? styles["star-filled"]
                  : styles["star-empty"]
              }
              fill={i < place.wishRating ? "currentColor" : "none"}
            />
          ))}
        </div>
      </div>
      <div className={`${styles["place-status"]} ${styles[place.status]}`}>
        {place.status === "visited"
          ? "Visited"
          : place.status === "skipped"
            ? "Skipped"
            : "Wishlist"}
      </div>
    </div>
  );
}

export function Sidebar() {
  // const [activeTab, setActiveTab] = useState<"map" | "list" | "profile">("map");
  const { places, newPlaceCoords, editingPlaceId } = usePlaces();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<PlaceCategory | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlaces = places.filter((place) => {
    const matchesFilter =
      activeFilter === "all" || place.category === activeFilter;
    const matchesSearch = place.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (newPlaceCoords !== null) {
      setIsOpen(true);
    }
  }, [newPlaceCoords]);

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpened : styles.sidebarClosed}`}
    >
      {/* ---- Top bar ---- */}
      <div className={styles["sidebar-heading"]}>
        <div className={styles["sidebar-heading-top"]}>
          <span className={styles["sidebar-title"]}>My places</span>
          <button
            className={styles["toggle-btn"]}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <CircleChevronLeft /> : <CircleChevronRight />}
          </button>
        </div>
        {newPlaceCoords === null && (
          <div className={styles["sidebar-search"]}>
            <div className={styles["sidebar-search-wrapper"]}>
              <span className={styles["sidebar-search-icon"]}>
                <Search />
              </span>
              <input
                type="text"
                placeholder="Search or add a place..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ---- Filter chips ---- */}
      {newPlaceCoords === null && (
        <div className={styles["sidebar-filters"]}>
          {filterCategories.map((cat) => (
            <button
              key={cat}
              className={`${styles["sidebar-filter-btn"]} ${activeFilter === cat ? styles.active : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {filterLabels[cat]}
            </button>
          ))}
        </div>
      )}

      {/* ---- Place cards ---- */}

      {newPlaceCoords !== null || editingPlaceId !== null ? (
        <div className={styles["sidebar-content"]}>
          <AddPlaceForm />
        </div>
      ) : (
        <div className={styles["sidebar-content"]}>
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
          {filteredPlaces.length === 0 && (
            <div className={styles["sidebar-empty"]}>
              {places.length === 0
                ? "No places yet. Add one on the map!"
                : "No places match your filters."}
            </div>
          )}
        </div>
      )}

      {/* ---- Bottom nav ---- */}

      {/* ill get rid of it for now cuz its uzeless atp */}

      {/* <div className={styles["sidebar-links"]}>
        <div
          className={`${styles["sidebar-link"]} ${activeTab === "map" ? styles.active : ""}`}
        >
          <button onClick={() => setActiveTab("map")}>
            <Map />
            <span>Map</span>
          </button>
        </div>
        <div
          className={`${styles["sidebar-link"]} ${activeTab === "list" ? styles.active : ""}`}
        >
          <button onClick={() => setActiveTab("list")}>
            <List />
            <span>List</span>
          </button>
        </div>
        <div
          className={`${styles["sidebar-link"]} ${activeTab === "profile" ? styles.active : ""}`}
        >
          <button onClick={() => setActiveTab("profile")}>
            <User />
            <span>Profile</span>
          </button>
        </div>
      </div> */}
    </div>
  );
}
