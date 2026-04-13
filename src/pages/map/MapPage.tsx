import { MapWidget } from "@/widgets/map/ui/MapWidget";
import styles from "./MapPage.module.css";
import { Sidebar } from "@/widgets/sidebar";

export function MapPage() {
  return (
    <div className={styles.mapPage}>
      <Sidebar />
      <MapWidget />
    </div>
  );
}
