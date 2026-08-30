import { useState } from "react";
import { Link } from "react-router";
import { Link2, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useGroups } from "@/entities/group";
import styles from "./GroupsPage.module.css";

export function GroupsPage() {
  const { groups, createGroup, deleteGroup } = useGroups();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    try {
      await createGroup(name.trim(), description.trim());
    } finally {
      setBusy(false);
    }

    setName("");
    setDescription("");
    setShowCreate(false);
  };

  const copyInvite = async (inviteToken: string | null) => {
    if (!inviteToken) return;
    const url = `${window.location.origin}/groups/join?token=${inviteToken}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
    }
  };

  const copyInviteFor = async (groupId: string, inviteToken: string | null) => {
    await copyInvite(inviteToken);
    setCopiedId(groupId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>My groups</h1>
          <button
            className={styles.createBtn}
            type="button"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : (
              <>
                <Plus size={16} />
                New group
              </>
            )}
          </button>
        </div>

        {showCreate && (
          <form className={styles.createForm} onSubmit={submit}>
            <input
              className={styles.input}
              type="text"
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button className={styles.submitBtn} type="submit" disabled={busy}>
              {busy && <Loader2 size={15} className={styles.spin} />}
              Create
            </button>
          </form>
        )}

        <div className={styles.list}>
          {groups.length === 0 && (
            <p className={styles.empty}>
              No groups yet. Create one and invite friends to share places.
            </p>
          )}

          {groups.map((group) => (
            <div key={group.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>{group.name}</div>
                {group.description && (
                  <div className={styles.cardDesc}>{group.description}</div>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.iconBtn}
                  type="button"
                  title="Copy invite link"
                  onClick={() => copyInviteFor(group.id, group.invite_token)}
                >
                  {copiedId === group.id ? (
                    <span className={styles.copied}>Copied ✓</span>
                  ) : (
                    <Link2 size={16} />
                  )}
                </button>
                <Link
                  className={styles.openBtn}
                  to={`/groups/${group.id}`}
                  title="Open group"
                >
                  <Users size={16} />
                </Link>
                <button
                  className={`${styles.iconBtn} ${styles.danger}`}
                  type="button"
                  title="Delete group"
                  onClick={() => deleteGroup(group.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}