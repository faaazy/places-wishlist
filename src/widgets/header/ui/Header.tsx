import { LogIn, LogOut, MapPinned } from "lucide-react";
import { Link, useNavigate } from "react-router";
import styles from "./Header.module.css";
import { useUser } from "@/entities/user/model/UserContext";
import { useAuth } from "@/entities/auth/model/AuthContext";

export function Header() {
  const { user } = useUser();
  const { authUser, signOut } = useAuth();
  const navigate = useNavigate();

  const signOutHandler = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <Link to={"/"} className={styles.logo}>
        <MapPinned />
        <span>PlacesWishlist</span>
      </Link>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link to={"/"}>Home</Link>
          </li>
          <li>
            <Link to={"/profile"} className={styles.profileLink}>
              {user.avatar_url && (
                <img src={user.avatar_url} className={styles.profileAvatar} />
              )}
              Profile
            </Link>
          </li>
          <li>
            {authUser ? (
              <button
                type="button"
                className={styles.signOutBtn}
                onClick={signOutHandler}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link to={"/auth"} className={styles.signInBtn}>
                <LogIn size={16} />
                Sign in
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
