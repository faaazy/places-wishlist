import { usePlaces } from "@/entities/place/model/PlaceContext";
import styles from "./UndoToast.module.css";

export function UndoToast() {
  const { removedPlace, undoRemove, clearRemovedPlace } = usePlaces();

  if (!removedPlace) return null;

  return (
    <div className={styles.toast}>
      <span className={styles.toastText}>
        Deleted{" "}
        <strong className={styles.toastTitle}>{removedPlace.title}</strong>
      </span>
      <div className={styles.toastActions}>
        <button
          type="button"
          className={styles.undoBtn}
          onClick={() => {
            undoRemove();
          }}
        >
          Undo
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={clearRemovedPlace}
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
