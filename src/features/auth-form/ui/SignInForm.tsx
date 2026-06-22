import React, { useState } from "react";
import { useAuthForm } from "../model/useAuthForm";
import styles from "./SignInForm.module.css";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { authFormSignIn, error, isSubmitting } = useAuthForm();

  const submitHandler = (e: React.SubmitEvent) => {
    e.preventDefault();
    authFormSignIn({ email, password });
  };

  return (
    <form className={styles.form} onSubmit={submitHandler}>
      <div>
        <label className={styles.label} htmlFor="signin-email">
          Email
        </label>
        <input
          className={styles.input}
          type="email"
          id="signin-email"
          placeholder="you@example.com"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className={styles.label} htmlFor="signin-password">
          Password
        </label>
        <input
          className={styles.input}
          type="password"
          id="signin-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button
        className={styles.submitBtn}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "..." : "Sign In"}
      </button>
    </form>
  );
}
