import { useEffect, useMemo, useState } from "react";
import styles from "./Sidebar.module.css";
import {
  ChevronDown,
  ChevronRight,
  CircleChevronLeft,
  CircleChevronRight,
  Menu,
  Search,
  Star,
} from "lucide-react";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import type { Place, PlaceCategory } from "@/entities/place/model/types";
import { useGroups, type SharedPlaceView } from "@/entities/group";
import { AddPlaceForm } from "@/features/add-place/ui/AddPlaceForm";
import { useNavigate } from "react-router";
import { usePlaceSearch } from "@/shared/lib/usePlaceSearch";
import type { SearchResult } from "@/shared/lib/geocoding";
import { SearchDropdown } from "@/shared/ui/SearchDropdown";
import { UndoToast } from "@/shared/ui/UndoToast";
import { popularPlaces } from "@/shared/data/popularPlaces";
import type { PopularPlace } from "@/shared/data/popularPlaces";

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

function SharedCard({ view }: { view: SharedPlaceView }) {
  const navigate = useNavigate();

  return (
    <div
      className={styles["sidebar-card"]}
      onClick={() => navigate("?placeId=" + view.place.id)}
    >
      <div className={styles["place-info"]}>
        <div className={styles["place-name"]}>{view.place.title}</div>
        <div className={styles["place-location"]}>{view.ownerName}</div>
        <div className={styles["place-rating"]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < view.place.wishRating
                  ? styles["star-filled"]
                  : styles["star-empty"]
              }
              fill={i < view.place.wishRating ? "currentColor" : "none"}
            />
          ))}
        </div>
      </div>
      <div className={`${styles["place-status"]} ${styles.shared}`}>Shared</div>
    </div>
  );
}

function PopularCard({
  place,
  onSelect,
}: {
  place: PopularPlace;
  onSelect: (place: PopularPlace) => void;
}) {
  return (
    <div className={styles["popular-card"]} onClick={() => onSelect(place)}>
      <div className={styles["popular-card-info"]}>
        <div className={styles["popular-card-title"]}>{place.title}</div>
        <div className={styles["popular-card-desc"]}>{place.description}</div>
      </div>
      <div
        className={`${styles["popular-card-category"]} ${styles[place.category]}`}
      >
        {place.category}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { places, newPlaceCoords, editingPlaceId, flyTo, showSearchPopup } =
    usePlaces();
  const { sharedPlaces } = useGroups();
  const [isOpen, setIsOpen] = useState<boolean>(() => window.innerWidth > 768);
  const [myPlacesOpen, setMyPlacesOpen] = useState<boolean>(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeFilter, setActiveFilter] = useState<PlaceCategory | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { results } = usePlaceSearch(searchQuery);

  const filteredPlaces = places
    .filter((place) => {
      const matchesFilter =
        activeFilter === "all" || place.category === activeFilter;
      const matchesSearch = place.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const modifier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "rating") {
        return (a.wishRating - b.wishRating) * modifier;
      }
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        modifier
      );
    });

  const filteredShared = sharedPlaces
    .filter((view) => {
      const matchesFilter =
        activeFilter === "all" || view.place.category === activeFilter;
      const matchesSearch = view.place.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const modifier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "rating") {
        return (a.place.wishRating - b.place.wishRating) * modifier;
      }
      return (
        (new Date(a.place.createdAt).getTime() -
          new Date(b.place.createdAt).getTime()) *
        modifier
      );
    });

  const groupedShared = useMemo(() => {
    const byGroup = new Map<string, SharedPlaceView[]>();
    for (const view of filteredShared) {
      const arr = byGroup.get(view.groupId);
      if (arr) {
        arr.push(view);
      } else {
        byGroup.set(view.groupId, [view]);
      }
    }
    return Array.from(byGroup.entries()).map(([groupId, views]) => ({
      groupId,
      groupName: views[0].groupName,
      views,
    }));
  }, [filteredShared]);

  useEffect(() => {
    if (newPlaceCoords ?? editingPlaceId) {
      setIsOpen(true);
    }
  }, [newPlaceCoords, editingPlaceId]);

  const searchChangeHandler = (value: string) => {
    setSearchQuery(value);
    const hasMatches = places.some((place) =>
      place.title.toLowerCase().includes(value.toLowerCase()),
    );
    setShowDropdown(value.length > 0 && !hasMatches);
  };

  const selectResultHandler = (result: SearchResult) => {
    if (result.lat != null && result.lon != null) {
      showSearchPopup([result.lat, result.lon], result.display_name);

      flyTo?.(result.lat, result.lon, 15);
    }
    setShowDropdown(false);
    setSearchQuery("");
  };

  const closeDropdownHandler = () => {
    setShowDropdown(false);
  };

  const selectPopularPlace = (pp: PopularPlace) => {
    showSearchPopup(pp.coords, pp.title);
    flyTo?.(pp.coords[0], pp.coords[1], 15);
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <>
      <div
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpened : styles.sidebarClosed}`}
      >
        <UndoToast />
      <div className={styles["sidebar-heading"]}>
        <div className={styles["sidebar-heading-top"]}>
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
                  onChange={(e) => searchChangeHandler(e.target.value)}
                />
                {showDropdown && results.length > 0 && (
                  <SearchDropdown
                    results={results}
                    onSelect={selectResultHandler}
                    onClose={closeDropdownHandler}
                  />
                )}
              </div>
            </div>
          )}
          <button
            className={styles["toggle-btn"]}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <CircleChevronLeft /> : <CircleChevronRight />}
          </button>
        </div>
      </div>

      {newPlaceCoords === null && (
        <div className={styles["sidebar-filters"]}>
          {filterCategories.map((categ) => (
            <button
              key={categ}
              className={`${styles["sidebar-filter-btn"]} ${activeFilter === categ ? styles.active : ""}`}
              onClick={() => setActiveFilter(categ)}
            >
              {filterLabels[categ]}
            </button>
          ))}
        </div>
      )}

      {newPlaceCoords === null && (
        <div className={styles["sidebar-sort"]}>
          <div className={styles["sidebar-sort-btns"]}>
            <button
              type="button"
              className={styles["sidebar-sort-btn"]}
              onClick={() => {
                if (sortBy === "date") {
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                } else {
                  setSortBy("date");
                  setSortOrder("desc");
                }
              }}
            >
              Date
              {sortBy === "date" && (
                <span className={styles["sidebar-sort-arrow"]}>
                  {sortOrder === "desc" ? "↓" : "↑"}
                </span>
              )}
            </button>
            <button
              type="button"
              className={styles["sidebar-sort-btn"]}
              onClick={() => {
                if (sortBy === "rating") {
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                } else {
                  setSortBy("rating");
                  setSortOrder("desc");
                }
              }}
            >
              Rating
              {sortBy === "rating" && (
                <span className={styles["sidebar-sort-arrow"]}>
                  {sortOrder === "desc" ? "↓" : "↑"}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {newPlaceCoords !== null || editingPlaceId !== null ? (
        <div className={styles["sidebar-content"]}>
          <AddPlaceForm />
        </div>
      ) : (
        <div className={styles["sidebar-content"]}>
          {filteredPlaces.length > 0 && (
            <button
              type="button"
              className={styles["block-header"]}
              onClick={() => setMyPlacesOpen((open) => !open)}
              title={myPlacesOpen ? "Collapse" : "Expand"}
            >
              <span>My places</span>
              {myPlacesOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          )}
          {myPlacesOpen &&
            filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}

          {groupedShared.length > 0 && (
            <div className={styles["shared-section"]}>
              {groupedShared.map((group) => {
                const collapsed = collapsedGroups.has(group.groupId);
                return (
                  <div key={group.groupId} className={styles["shared-block"]}>
                    <button
                      type="button"
                      className={styles["shared-heading"]}
                      onClick={() => toggleGroup(group.groupId)}
                      title={collapsed ? "Expand" : "Collapse"}
                    >
                      <span>{group.groupName}</span>
                      {collapsed ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    {!collapsed &&
                      group.views.map((view) => (
                        <SharedCard key={view.place.id} view={view} />
                      ))}
                  </div>
                );
              })}
            </div>
          )}

          {filteredPlaces.length === 0 &&
            filteredShared.length === 0 &&
            places.length === 0 && (
              <div className={styles["popular-section"]}>
                <div className={styles["popular-title"]}>
                  <span>Popular places</span>
                  <span className={styles["popular-subtitle"]}>
                    Tap to add to your wishlist
                  </span>
                </div>
                <div className={styles["popular-list"]}>
                  {popularPlaces.map((pp) => (
                    <PopularCard
                      key={pp.title}
                      place={pp}
                      onSelect={selectPopularPlace}
                    />
                  ))}
                </div>
              </div>
            )}
          {filteredPlaces.length === 0 &&
            filteredShared.length === 0 &&
            places.length > 0 && (
              <div className={styles["sidebar-empty"]}>
                No places match your filters.
              </div>
            )}
        </div>
      )}
    </div>

    {!isOpen && (
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setIsOpen(true)}
          title="Open places"
        >
          <Menu size={22} />
        </button>
      )}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
