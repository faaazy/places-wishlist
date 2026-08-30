import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, Loader2, X } from "lucide-react";
import type { Place } from "@/entities/place/model/types";
import { useGroups } from "@/entities/group";
import { supabase } from "@/shared/lib/supabase";
import { Link } from "react-router";
import styles from "./SharePlaceModal.module.css";

interface SharePlaceModalProps {
  place: Place;
  onClose: () => void;
}

export function SharePlaceModal({ place, onClose }: SharePlaceModalProps) {
  const {
    groups,
    sharedPlaces,
    sharePlace,
    unsharePlace,
    setCanEdit,
    setPlacePublic,
  } = useGroups();

  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "groups" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null | undefined>(
    undefined,
  );

  const shares = sharedPlaces.filter((v) => v.place.id === place.id);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("places")
        .select("share_token")
        .eq("id", place.id)
        .single();
      if (!cancelled && !error) {
        setPublicToken((data?.share_token as string) ?? null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [place.id]);

  const copy = async (url: string, key: "link" | "groups") => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const togglePublic = async (on: boolean) => {
    setBusy("public");
    try {
      const token = await setPlacePublic(place.id, on);
      setPublicToken(token);
      if (on && token) {
        const url = `${window.location.origin}/share/place/${token}`;
        await copy(url, "link");
      }
    } finally {
      setBusy(null);
    }
  };

  const toggleGroupShare = async (groupId: string, on: boolean) => {
    setBusy(groupId);
    setErrorMsg(null);
    try {
      if (on) {
        await sharePlace(place.id, groupId, false);
      } else {
        await unsharePlace(place.id, groupId);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const toggleCanEdit = async (groupId: string, on: boolean) => {
    setBusy(groupId);
    try {
      await setCanEdit(place.id, groupId, on);
    } finally {
      setBusy(null);
    }
  };

  const publicLink =
    publicToken !== undefined && publicToken !== null
      ? `${window.location.origin}/share/place/${publicToken}`
      : null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Share “{place.title}”</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Public link</span>
          {publicLink ? (
            <div className={styles.linkRow}>
              <code className={styles.link}>{publicLink}</code>
              <button
                className={styles.copyBtn}
                type="button"
                onClick={() => copy(publicLink, "link")}
              >
                {busy === "public" ? (
                  <Loader2 size={14} className={styles.spin} />
                ) : copied === "link" ? (
                  "Copied ✓"
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          ) : (
            <button
              className={styles.publishBtn}
              type="button"
              disabled={busy === "public"}
              onClick={() => togglePublic(true)}
            >
              {busy === "public" ? (
                <Loader2 size={15} className={styles.spin} />
              ) : (
                <Link2 size={15} />
              )}
              Create share link
            </button>
          )}
          {publicLink && (
            <button
              className={styles.unpublishBtn}
              type="button"
              disabled={busy === "public"}
              onClick={() => togglePublic(false)}
            >
              Remove public link
            </button>
          )}
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Share to groups</span>

          {errorMsg && <p className={styles.error}>{errorMsg}</p>}

          {groups.length === 0 ? (
            <p className={styles.empty}>
              You have no groups yet.{" "}
              <Link to="/groups" className={styles.link}>
                Create a group
              </Link>
            </p>
          ) : (
            <div className={styles.groupList}>
              {groups.map((group) => {
                const share = shares.find((v) => v.groupId === group.id);
                const isShared = Boolean(share);
                const canEdit = share?.canEdit ?? false;

                return (
                  <div key={group.id} className={styles.groupRow}>
                    <label className={styles.groupName}>
                      <input
                        type="checkbox"
                        checked={isShared}
                        disabled={busy === group.id}
                        onChange={(e) =>
                          toggleGroupShare(group.id, e.target.checked)
                        }
                      />
                      <span>{group.name}</span>
                      {busy === group.id && (
                        <Loader2 size={13} className={styles.spin} />
                      )}
                    </label>
                    <label className={styles.canEdit}>
                      <input
                        type="checkbox"
                        checked={canEdit}
                        disabled={!isShared || busy === group.id}
                        onChange={(e) =>
                          toggleCanEdit(group.id, e.target.checked)
                        }
                      />
                      <span>Can edit</span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
