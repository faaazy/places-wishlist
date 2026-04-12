import { Header } from "@/widgets/header";
import { Outlet } from "react-router";
import styles from "./Layout.module.css";

export function Layout() {
  return (
    <div className={styles.layout}>
      <Header />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
