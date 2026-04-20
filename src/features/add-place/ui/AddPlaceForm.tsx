import { useState, type SubmitEventHandler } from "react";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import { Star } from "lucide-react";
import type { PlaceCategory, WishRating } from "@/entities/place/model/types";
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
  const { cancelAdding, editingPlaceId, places, cancelEditing } = usePlaces();

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

  const { submitPlace } = useAddPlace();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    submitPlace({ title, description, category, wishRating });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>Add new place</h3>

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
          {editingPlaceId !== null ? "Confirm" : "Add to wishlist"}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => {
            cancelAdding();
            cancelEditing();
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
