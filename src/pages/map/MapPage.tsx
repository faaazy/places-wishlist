import { MapWidget } from "@/widgets/map/ui/MapWidget";
import styles from "./MapPage.module.css";

export function MapPage() {
  return (
    <div className={styles.mapPage}>
      <MapWidget />
    </div>
  );
}
