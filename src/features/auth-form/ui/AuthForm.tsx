import styles from "./AuthForm.module.css";

export function AuthForm() {
  return (
    <div className={styles.card}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.tabActive}`} type="button">
          Sign In
        </button>
        <button className={styles.tab} type="button">
          Sign Up
        </button>
      </div>

      <form className={styles.form}>
        <div>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            type="email"
            id="email"
            placeholder="you@example.com"
            autoFocus
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            type="password"
            id="password"
            placeholder="Enter your password"
          />
        </div>

        <div className={styles.error}>
          Invalid email or password. Please try again.
        </div>

        <button className={styles.submitBtn} type="submit">
          Sign In
        </button>

        <p className={styles.switchText}>
          Don't have an account?{" "}
          <button className={styles.switchLink} type="button">
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
