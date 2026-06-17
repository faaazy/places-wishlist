import { Camera, RotateCcw, Save, MapPinned } from "lucide-react";
import styles from "./ProfilePage.module.css";
import { useUser } from "@/entities/user/model/UserContext";
import { useRef, useState } from "react";
import type { UserProfile } from "@/entities/user/model/types";
import { usePlaces } from "@/entities/place/model/PlaceContext";

export function ProfilePage() {
  const { user, updateUserProfile } = useUser();
  const { places } = usePlaces();

  const [newUser, setNewUser] = useState<UserProfile>(user);
  const fileRef = useRef<HTMLInputElement>(null);

  function fileHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewUser((prev) => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  const total = places.length;
  const wishlisted = places.filter((p) => p.status === "wishlist").length;
  const visited = places.filter((p) => p.status === "visited").length;
  const skipped = places.filter((p) => p.status === "skipped").length;

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {newUser.avatar ? (
                <img src={newUser.avatar} className={styles.avatarImg} />
              ) : (
                <span className={styles.initials}>
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <input
              type="file"
              hidden
              accept="image/*"
              ref={fileRef}
              onChange={fileHandler}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className={styles.avatarBtn}
              type="button"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{user.name || "User"}</h1>
            <p className={styles.meta}>{user.bio || "No bio yet ..."}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="Your name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser((prev) => ({
                  ...prev,
                  [e.target.id]: e.target.value,
                }))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              className={styles.textarea}
              placeholder="Tell about yourself"
              rows={3}
              value={newUser.bio}
              onChange={(e) =>
                setNewUser((prev) => ({
                  ...prev,
                  [e.target.id]: e.target.value,
                }))
              }
            />
          </div>
          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              type="button"
              onClick={() => updateUserProfile(newUser)}
            >
              <Save size={15} />
              Save
            </button>
            <button
              className={styles.btnSecondary}
              type="button"
              onClick={() => setNewUser(user)}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Statistics</h2>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <MapPinned size={16} className={styles.statIcon} />
              <span className={styles.statValue}>{total}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.dot} ${styles.dotWishlist}`} />
              <span className={styles.statValue}>{wishlisted}</span>
              <span className={styles.statLabel}>Wishlist</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.dot} ${styles.dotVisited}`} />
              <span className={styles.statValue}>{visited}</span>
              <span className={styles.statLabel}>Visited</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.dot} ${styles.dotSkipped}`} />
              <span className={styles.statValue}>{skipped}</span>
              <span className={styles.statLabel}>Skipped</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
