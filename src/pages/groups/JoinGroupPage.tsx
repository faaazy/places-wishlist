import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { LogIn, Loader2, Users } from "lucide-react";
import { useAuth } from "@/entities/auth/model/AuthContext";
import { useGroups } from "@/entities/group";
import styles from "./JoinGroupPage.module.css";

export function JoinGroupPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { authUser } = useAuth();
  const { joinGroup } = useGroups();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const groupId = await joinGroup(token);
      navigate(`/groups/${groupId}`, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to join the group",
      );
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <Users size={26} />
        </div>

        {!token ? (
          <>
            <h1 className={styles.title}>Invalid invite link</h1>
            <p className={styles.desc}>
              This invite link is malformed. Ask the group admin to share a new
              one.
            </p>
            <Link to="/" className={styles.backBtn}>
              Go to map
            </Link>
          </>
        ) : !authUser ? (
          <>
            <h1 className={styles.title}>Join group</h1>
            <p className={styles.desc}>
              You need to be signed in to join a group.
            </p>
            <Link
              to={`/auth?next=${encodeURIComponent(
                `/groups/join?token=${token}`,
              )}`}
              className={styles.primaryBtn}
            >
              <LogIn size={15} />
              Sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Join group</h1>
            <p className={styles.desc}>
              You have been invited to a private group. Joining will let the
              group share places with you.
            </p>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={handleJoin}
              disabled={busy}
            >
              {busy && <Loader2 size={15} className={styles.spin} />}
              Join group
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}