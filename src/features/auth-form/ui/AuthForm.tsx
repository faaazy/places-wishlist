import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import styles from "./AuthForm.module.css";

export function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className={styles.card}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${isSignIn ? styles.tabActive : ""}`}
          type="button"
          onClick={() => setIsSignIn(true)}
        >
          Sign In
        </button>
        <button
          className={`${styles.tab} ${!isSignIn ? styles.tabActive : ""}`}
          type="button"
          onClick={() => setIsSignIn(false)}
        >
          Sign Up
        </button>
      </div>

      {isSignIn ? <SignInForm /> : <SignUpForm />}

      <p className={styles.switchText}>
        {isSignIn ? (
          <>
            Don't have an account?{" "}
            <button
              className={styles.switchLink}
              type="button"
              onClick={() => setIsSignIn(false)}
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              className={styles.switchLink}
              type="button"
              onClick={() => setIsSignIn(true)}
            >
              Sign In
            </button>
          </>
        )}
      </p>
    </div>
  );
}
