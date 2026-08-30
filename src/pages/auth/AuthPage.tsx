import { Navigate } from "react-router";
import { AuthForm } from "@/features/auth-form/ui/AuthForm";
import { useAuth } from "@/entities/auth/model/AuthContext";
import styles from "./AuthPage.module.css";

export function AuthPage() {
  const { authUser } = useAuth();

  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.authPage}>
      <AuthForm />
    </div>
  );
}
