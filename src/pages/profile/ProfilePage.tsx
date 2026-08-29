import { Camera, LogIn, RotateCcw, Save, MapPinned } from "lucide-react";
import styles from "./ProfilePage.module.css";
import { useUser } from "@/entities/user/model/UserContext";
import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "@/entities/user/model/types";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import { useAuth } from "@/entities/auth/model/AuthContext";
import { Link } from "react-router";

function resizeImage(file: File, maxW: number, maxH: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = maxW;
      canvas.height = maxH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, maxW, maxH);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.7);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function ProfilePage() {
  const { user, updateUserProfile } = useUser();
  const { places } = usePlaces();
  const { authUser } = useAuth();

  const isGuest = authUser === null;

  const [newUser, setNewUser] = useState<UserProfile>(user);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fileHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const resized = await resizeImage(file, 200, 200);

    const reader = new FileReader();
    reader.onload = () => {
      setNewUser((prev) => ({ ...prev, avatar_url: reader.result as string }));
    };
    reader.readAsDataURL(resized);
  }

  const total = places.length;
  const wishlisted = places.filter((p) => p.status === "wishlist").length;
  const visited = places.filter((p) => p.status === "visited").length;
  const skipped = places.filter((p) => p.status === "skipped").length;

  useEffect(() => {
    setNewUser(user);
  }, [user]);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {newUser.avatar_url ? (
                <img src={newUser.avatar_url} className={styles.avatarImg} />
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
            {!isGuest && (
              <button
                onClick={() => fileRef.current?.click()}
                className={styles.avatarBtn}
                type="button"
              >
                <Camera size={14} />
              </button>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{user.name || "User"}</h1>
            <p className={styles.meta}>{user.bio || "No bio yet ..."}</p>
          </div>
        </div>

        <div className={styles.card}>
          {isGuest ? (
            <div className={styles.editLocked}>
              <div className={styles.lockText}>
                <h2 className={styles.sectionTitle}>Edit profile</h2>
                <p className={styles.lockMessage}>
                  Sign in to be able to edit your profile and save your places
                  to the cloud.
                </p>
              </div>
              <Link to={"/auth"} className={styles.btnPrimary}>
                <LogIn size={15} />
                Sign in
              </Link>
            </div>
          ) : (
          <>
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
          </>
          )}
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
