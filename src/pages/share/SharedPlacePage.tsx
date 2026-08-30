import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { MapPinned, Star } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import type { Place, PlaceCategory } from "@/entities/place/model/types";
import { ReadOnlyMap } from "@/widgets/map";
import styles from "./SharedPlacePage.module.css";

interface PlaceRow {
  id: string;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  category: PlaceCategory;
  wish_rating: number;
  status: Place["status"];
  created_at: string;
}

function toPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    coords: [row.lat, row.lng],
    category: row.category,
    wishRating: row.wish_rating as Place["wishRating"],
    status: row.status,
    createdAt: row.created_at,
  };
}

export function SharedPlacePage() {
  const { token = "" } = useParams();

  const [state, setState] = useState<"loading" | "found" | "missing">(
    "loading",
  );
  const [place, setPlace] = useState<Place | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("share_token", token)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setState("missing");
        return;
      }

      setPlace(toPlace(data as PlaceRow));
      setState("found");
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

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
            <h1 className={styles.title}>Place not found</h1>
            <p className={styles.desc}>
              This place is not shared publicly or the link is wrong.
            </p>
            <Link to="/" className={styles.primaryBtn}>
              Open PlacesWishlist
            </Link>
          </div>
        )}

        {state === "found" && place && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h1 className={styles.title}>{place.title}</h1>
                <span
                  className={`${styles.category} ${styles[place.category]}`}
                >
                  {place.category}
                </span>
              </div>

              {place.description && (
                <p className={styles.description}>{place.description}</p>
              )}

              <div className={styles.rating}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < place.wishRating ? "" : styles.starEmpty}
                    fill={i < place.wishRating ? "currentColor" : "none"}
                  />
                ))}
              </div>

              {place.status !== "wishlist" && (
                <div className={styles.status}>{place.status}</div>
              )}

              <div className={styles.coords}>
                {place.coords[0].toFixed(4)}, {place.coords[1].toFixed(4)}
              </div>
            </div>

            <ReadOnlyMap
              points={[
                {
                  id: place.id,
                  coords: place.coords,
                  category: place.category,
                  title: place.title,
                },
              ]}
            />

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