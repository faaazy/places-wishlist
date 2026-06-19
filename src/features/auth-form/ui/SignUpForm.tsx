import styles from "./SignUpForm.module.css";

export function SignUpForm() {
  return (
    <form className={styles.form}>
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
        />
      </div>

      <div className={styles.error}>
        Registration failed. Please check your input and try again.
      </div>

      <button className={styles.submitBtn} type="submit">
        Sign Up
      </button>
    </form>
  );
}
