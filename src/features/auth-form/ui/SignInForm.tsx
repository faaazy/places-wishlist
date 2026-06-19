import styles from "./SignInForm.module.css";

export function SignInForm() {
  return (
    <form className={styles.form}>
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
        />
      </div>

      <div className={styles.error}>Invalid email or password. Please try again.</div>

      <button className={styles.submitBtn} type="submit">
        Sign In
      </button>
    </form>
  );
}
