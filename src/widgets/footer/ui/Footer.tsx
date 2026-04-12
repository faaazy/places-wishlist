import { MapPinned } from "lucide-react";
import { Link } from "react-router";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <ul>
        <li>
          <Link to={"/"} className={styles.logo}>
            <MapPinned />
          </Link>
        </li>
        <li className={styles.brand}>PlacesWishlist</li>
      </ul>

      <ul>
        <li>
          <Link to={"/"}>Home</Link>
        </li>
        <li>
          <Link to={"/profile"}>Profile</Link>
        </li>
      </ul>
    </footer>
  );
}
