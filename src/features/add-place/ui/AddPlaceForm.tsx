import { useState, type SubmitEventHandler } from "react";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import { Star, AlertTriangle } from "lucide-react";
import type {
  Place,
  PlaceCategory,
  WishRating,
} from "@/entities/place/model/types";
import styles from "./AddPlaceForm.module.css";
import { useAddPlace } from "../model/useAddPlace";

const categories: { value: PlaceCategory; label: string }[] = [
  { value: "nature", label: "Nature" },
  { value: "city", label: "City" },
  { value: "food", label: "Food" },
  { value: "culture", label: "Culture" },
  { value: "adventure", label: "Adventure" },
];

export function AddPlaceForm() {
  const {
    cancelAdding,
    editingPlaceId,
    places,
    cancelEditing,
    newPlaceCoords,
  } = usePlaces();

  const editingPlace = editingPlaceId
    ? places.find((place) => place.id == editingPlaceId)
    : null;

  const [title, setTitle] = useState(editingPlace?.title ?? "");
  const [description, setDescription] = useState(
    editingPlace?.description ?? "",
  );
  const [category, setCategory] = useState<PlaceCategory>(
    editingPlace?.category ?? "nature",
  );
  const [wishRating, setWishRating] = useState<WishRating>(
    editingPlace?.wishRating ?? 3,
  );
  const [duplicatePlace, setDuplicatePlace] = useState<Place | null>(null);

  const { submitPlace } = useAddPlace();

  const isEditing = editingPlaceId !== null;

  const findDuplicate = () => {
    if (isEditing) return null;

    const coords = newPlaceCoords;
    if (!coords) return null;

    return (
      places.find((place) => {
        const sameTitle =
          place.title.trim().toLowerCase() === title.trim().toLowerCase();
        if (!sameTitle) return false;

        if (coords) {
          const distLat = Math.abs(place.coords[0] - coords[0]);
          const distLng = Math.abs(place.coords[1] - coords[1]);
          return distLat < 0.005 && distLng < 0.005;
        }

        return false;
      }) ?? null
    );
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!isEditing) {
      const dup = findDuplicate();
      if (dup) {
        setDuplicatePlace(dup);
        return;
      }
    }

    submitPlace({ title, description, category, wishRating });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>
        {editingPlaceId ? "Edit place" : "Add new place"}
      </h3>

      <div>
        <label className={styles.label} htmlFor="title">
          Title
        </label>
        <input
          className={styles.input}
          type="text"
          id="title"
          placeholder="Hiking mountain..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div>
        <label className={styles.label} htmlFor="description">
          Why do you want to go there?
        </label>
        <textarea
          className={styles.textarea}
          id="description"
          placeholder="Share your dream..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className={styles.label}>Category</label>
        <div className={styles.categoryBtns}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`${styles.categoryBtn} ${category === cat.value ? styles.active : ""}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={styles.label}>How much do you want to go?</label>
        <div className={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={22}
              className={`${styles.star} ${star <= wishRating ? styles.filled : ""}`}
              fill={star <= wishRating ? "currentColor" : "none"}
              onClick={() => setWishRating(star as WishRating)}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn}>
          {isEditing ? "Confirm" : "Add to wishlist"}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => {
            setDuplicatePlace(null);
            cancelAdding();
            cancelEditing();
          }}
        >
          Cancel
        </button>
      </div>

      {duplicatePlace && (
        <div className={styles.duplicateWarning} role="alert">
          <div className={styles.duplicateHeader}>
            <AlertTriangle size={16} />
            <span>Looks like you already have this place</span>
          </div>
          <p className={styles.duplicateTitle}>{duplicatePlace.title}</p>
          <div className={styles.duplicateActions}>
            <button
              type="button"
              className={styles.duplicateConfirmBtn}
              onClick={() => {
                setDuplicatePlace(null);
                submitPlace({ title, description, category, wishRating });
              }}
            >
              Add anyway
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setDuplicatePlace(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
