import { useState } from "react";
import { useAuthForm } from "../model/useAuthForm";
import styles from "./SignUpForm.module.css";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { authFormSignUp, error, isSubmitting } = useAuthForm();

  const submitHandler = (e: React.SubmitEvent) => {
    e.preventDefault();
    authFormSignUp({ name, email, password });
  };

  return (
    <form className={styles.form} onSubmit={submitHandler}>
      <div>
        <label className={styles.label} htmlFor="signup-name">
          Name
        </label>
        <input
          className={styles.input}
          type="text"
          id="signup-name"
          placeholder="Your name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className={styles.label} htmlFor="signup-email">
          Email
        </label>
        <input
          className={styles.input}
          type="email"
          id="signup-email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className={styles.label} htmlFor="signup-password">
          Password
        </label>
        <input
          className={styles.input}
          type="password"
          id="signup-password"
          placeholder="Create a password"
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
        {isSubmitting ? "..." : "Sign Up"}
      </button>
    </form>
  );
}
