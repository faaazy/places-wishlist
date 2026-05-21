import { MapPinned } from "lucide-react";
import { Link } from "react-router";
import styles from "./Header.module.css";
import { useUser } from "@/entities/user/model/UserContext";

export function Header() {
  const { user } = useUser();

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
              {user.avatar && <img src={user.avatar} className={styles.profileAvatar} />}
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
