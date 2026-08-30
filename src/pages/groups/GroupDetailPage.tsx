import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  LogOut,
  Save,
  Trash2,
  UserX,
  Users,
} from "lucide-react";
import { useGroups, type GroupMember } from "@/entities/group";
import { useAuth } from "@/entities/auth/model/AuthContext";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import { withBase } from "@/shared/lib/url";
import styles from "./GroupDetailPage.module.css";

export function GroupDetailPage() {
  const { id = "" } = useParams();

  const { authUser } = useAuth();
  const {
    loading,
    groups,
    sharedPlaces,
    renameGroup,
    deleteGroup,
    leaveGroup,
    removeMember,
    regenerateInvite,
    setGroupPublic,
    sharePlace,
    setCanEdit,
    unsharePlace,
    getMembers,
  } = useGroups();
  const { places } = usePlaces();

  const group = groups.find((g) => g.id === id);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState("");

  const groupPlaces = sharedPlaces.filter((v) => v.groupId === id);
  const sharedPlaceIds = new Set(groupPlaces.map((v) => v.place.id));
  const availablePlaces = places.filter((p) => !sharedPlaceIds.has(p.id));

  const loadMembers = useCallback(async () => {
    if (!group) return;
    try {
      const data = await getMembers(group.id);
      setMembers(data);
    } catch {
    }
  }, [group, getMembers]);

  useEffect(() => {
    setName(group?.name ?? "");
  }, [group]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingBox}>Loading…</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <Link to="/groups" className={styles.backLink}>
            <ArrowLeft size={15} /> Back to groups
          </Link>
          <p className={styles.notFound}>
            Group not found or you are not a member.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = members.some(
    (m) => m.user_id === authUser?.id && m.role === "admin",
  );

const inviteUrl = group.invite_token
    ? withBase(`groups/join?token=${group.invite_token}`)
    : null;

const listUrl = group.share_token
    ? withBase(`share/list/${group.share_token}`)
    : null;

  const copy = async (url: string | null, key: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const saveName = async () => {
    if (!name.trim() || name === group.name) return;
    setBusy("name");
    try {
      await renameGroup(group.id, name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async () => {
    setBusy("invite");
    try {
      const token = await regenerateInvite(group.id);
      await copy(withBase(`groups/join?token=${token}`), "invite");
    } finally {
      setBusy(null);
    }
  };

  const togglePublic = async (isPublic: boolean) => {
    setBusy("public");
    try {
      const token = await setGroupPublic(group.id, isPublic);
      if (isPublic && token) {
        await copy(withBase(`share/list/${token}`), "public");
      }
    } finally {
      setBusy(null);
    }
  };

  const handleMemberRemove = async (userId: string) => {
    setBusy("member");
    try {
      if (userId === authUser?.id) {
        await leaveGroup(group.id);
      } else {
        await removeMember(group.id, userId);
      }
    } finally {
      setBusy(null);
    }
    loadMembers();
  };

  const handleSharePlace = async () => {
    if (!selectedPlace) return;
    setBusy("addPlace");
    try {
      await sharePlace(selectedPlace, group.id, false);
      setSelectedPlace("");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <Link to="/groups" className={styles.backLink}>
          <ArrowLeft size={15} /> Back to groups
        </Link>

        <div className={styles.card}>
          <div className={styles.renameRow}>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={saveName}
              disabled={busy === "name"}
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? "Saved" : "Save"}
            </button>
            {(isAdmin || group.created_by === authUser?.id) && (
              <button
                className={styles.dangerBtn}
                type="button"
                title="Delete group"
                onClick={() => deleteGroup(group.id)}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Invite members</h2>
          {inviteUrl ? (
            <div className={styles.linkRow}>
              <code className={styles.link}>{inviteUrl}</code>
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={() => copy(inviteUrl, "invite")}
              >
                {copied === "invite" ? "Copied ✓" : "Copy"}
              </button>
              {isAdmin && (
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={regenerate}
                  disabled={busy === "invite"}
                >
                  Regenerate
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={regenerate}
              disabled={busy === "invite"}
            >
              Create invite link
            </button>
          ) : null}

          {isAdmin && (
            <>
              <div className={styles.publicRow}>
                <div>
                  <div className={styles.publicTitle}>Public list link</div>
                  <div className={styles.publicDesc}>
                    Anyone with the link can view the places shared in this
                    group.
                  </div>
                </div>
                <div className={styles.publicRowActions}>
                  {listUrl && (
                    <>
                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={() => copy(listUrl, "public")}
                      >
                        {copied === "public" ? "Copied ✓" : "Copy"}
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={() => togglePublic(false)}
                        disabled={busy === "public"}
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {!listUrl && (
                    <button
                      className={styles.primaryBtn}
                      type="button"
                      onClick={() => togglePublic(true)}
                      disabled={busy === "public"}
                    >
                      Make public
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Users size={16} /> Members
          </h2>
          <div className={styles.memberList}>
            {members.map((member) => (
              <div key={member.user_id} className={styles.memberRow}>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>
                    {member.user?.name ?? "Unknown"}
                  </span>
                  <span
                    className={`${styles.roleBadge} ${member.role === "admin" ? styles.admin : ""}`}
                  >
                    {member.role}
                  </span>
                </div>
                {(isAdmin || member.user_id === authUser?.id) && (
                  <button
                    className={styles.iconBtn}
                    type="button"
                    title={
                      member.user_id === authUser?.id
                        ? "Leave group"
                        : "Remove member"
                    }
                    disabled={busy === "member"}
                    onClick={() => handleMemberRemove(member.user_id)}
                  >
                    {member.user_id === authUser?.id ? (
                      <LogOut size={15} />
                    ) : (
                      <UserX size={15} />
                    )}
                  </button>
                )}
              </div>
            ))}
            {members.length === 0 && (
              <p className={styles.empty}>No members.</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Shared places</h2>

          <div className={styles.addPlaceRow}>
            <select
              className={styles.select}
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
            >
              <option value="">Share a place…</option>
              {availablePlaces.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.title}
                </option>
              ))}
            </select>
            <button
              className={styles.primaryBtn}
              type="button"
              disabled={!selectedPlace || busy === "addPlace"}
              onClick={handleSharePlace}
            >
              Share
            </button>
          </div>

          <div className={styles.sharedList}>
            {groupPlaces.map((view) => (
              <div key={view.place.id} className={styles.sharedRow}>
                <div className={styles.sharedInfo}>
                  <div className={styles.sharedTitle}>{view.place.title}</div>
                  <div className={styles.sharedMeta}>
                    by {view.ownerName}
                  </div>
                </div>
                {isAdmin && (
                  <label className={styles.canEdit}>
                    <input
                      type="checkbox"
                      checked={view.canEdit}
                      disabled={busy === "canEdit"}
                      onChange={(e) =>
                        setCanEdit(view.place.id, group.id, e.target.checked)
                      }
                    />
                    <span>Can edit</span>
                  </label>
                )}
                <button
                  className={`${styles.iconBtn} ${styles.danger}`}
                  type="button"
                  title="Unshare"
                  onClick={() => unsharePlace(view.place.id, group.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {groupPlaces.length === 0 && (
              <p className={styles.empty}>No places shared yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}