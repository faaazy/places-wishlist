import { MapPinned } from "lucide-react";
import { Link } from "react-router";
import styles from "./Header.module.css";

export function Header() {
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
            <Link to={"/profile"}>Profile</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
