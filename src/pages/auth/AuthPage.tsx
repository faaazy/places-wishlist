import { AuthForm } from "@/features/auth-form/ui/AuthForm";
import styles from "./AuthPage.module.css";

export function AuthPage() {
  return (
    <div className={styles.authPage}>
      <AuthForm />
    </div>
  );
}
