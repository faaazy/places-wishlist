import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { MapPinned, Star } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import type { Place, PlaceCategory } from "@/entities/place/model/types";
import { ReadOnlyMap, type ReadOnlyMapPoint } from "@/widgets/map";
import styles from "./SharedListPage.module.css";

interface ListRow {
  name: string;
  description: string | null;
  shared_places: {
    place_id: string;
    shared_at: string;
    place?: {
      id: string;
      title: string;
      description: string | null;
      lat: number;
      lng: number;
      category: PlaceCategory;
      wish_rating: number;
      status: Place["status"];
      created_at: string;
    } | null;
  }[];
}

export function SharedListPage() {
  const { token = "" } = useParams();

  const [state, setState] = useState<"loading" | "found" | "missing">(
    "loading",
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(
          "name, description, shared_places(place_id, shared_at, place:places(id, title, description, lat, lng, category, wish_rating, status, created_at))",
        )
        .eq("share_token", token)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setState("missing");
        return;
      }

      const row = data as unknown as ListRow;
      const items = (row.shared_places ?? [])
        .map((sp) => sp.place)
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description ?? "",
          coords: [p.lat, p.lng] as [number, number],
          category: p.category,
          wishRating: p.wish_rating as Place["wishRating"],
          status: p.status,
          createdAt: p.created_at,
        }));

      setName(row.name);
      setDescription(row.description ?? "");
      setPlaces(items);
      setState("found");
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const points: ReadOnlyMapPoint[] = places.map((place) => ({
    id: place.id,
    coords: place.coords,
    category: place.category,
    title: place.title,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <Link to="/" className={styles.logo}>
          <MapPinned />
          <span>PlacesWishlist</span>
        </Link>

        {state === "loading" && (
          <div className={styles.centerBox}>Loading…</div>
        )}

        {state === "missing" && (
          <div className={styles.centerBox}>
            <h1 className={styles.title}>List not found</h1>
            <p className={styles.desc}>
              This list is not shared publicly or the link is wrong.
            </p>
            <Link to="/" className={styles.primaryBtn}>
              Open PlacesWishlist
            </Link>
          </div>
        )}

        {state === "found" && (
          <>
            <div className={styles.headerBlock}>
              <h1 className={styles.title}>{name}</h1>
              {description && (
                <p className={styles.desc}>{description}</p>
              )}
              <p className={styles.count}>
                {places.length} {places.length === 1 ? "place" : "places"}
              </p>
            </div>

            {places.length > 0 && <ReadOnlyMap points={points} />}

            <div className={styles.list}>
              {places.map((place) => (
                <div key={place.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardTitle}>{place.title}</span>
                    <span
                      className={`${styles.category} ${styles[place.category]}`}
                    >
                      {place.category}
                    </span>
                  </div>
                  {place.description && (
                    <p className={styles.cardDesc}>{place.description}</p>
                  )}
                  <div className={styles.rating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < place.wishRating ? "" : styles.starEmpty}
                        fill={i < place.wishRating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {places.length === 0 && (
                <p className={styles.noPlaces}>
                  No places shared in this list yet.
                </p>
              )}
            </div>

            <div className={styles.cta}>
              <Link to="/" className={styles.primaryBtn}>
                Open in PlacesWishlist
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}