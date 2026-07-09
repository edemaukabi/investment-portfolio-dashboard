import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { EyeIcon, EyeOffIcon } from '../../components/icons';
import useDocumentTitle from '../../lib/useDocumentTitle';
import PasswordChecklist from './PasswordChecklist';
import { evaluatePassword } from './passwordRules';
import styles from './LoginPage.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
  form?: string;
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address, e.g. name@example.com';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (!evaluatePassword(password).isValid) {
    errors.password = 'Your password doesn’t meet all the requirements below';
  }
  return errors;
}

export default function LoginPage() {
  useDocumentTitle('Sign in · Trove');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // The requirements only appear once the field is in play, to avoid
  // shouting rules at someone who hasn't started typing.
  const showChecklist = passwordTouched && password.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch {
      setErrors({ form: 'Something went wrong signing you in. Please try again.' });
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <div className={styles.logo} aria-hidden="true">
          T
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="name@example.com"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className={styles.error} role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onFocus={() => setPasswordTouched(true)}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : 'password-hint'
                }
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className={styles.error} role="alert">
                {errors.password}
              </p>
            )}
            {showChecklist ? (
              <PasswordChecklist value={password} />
            ) : (
              !errors.password && (
                <p id="password-hint" className={styles.hint}>
                  Use 8+ characters with a mix of upper &amp; lowercase letters and a
                  number.
                </p>
              )
            )}
          </div>

          {errors.form && (
            <p className={styles.formError} role="alert">
              {errors.form}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <button type="button" className={styles.linkButton}>
          Forgot password?
        </button>

        <div className={styles.divider}>
          <span>Don&apos;t have an account?</span>
        </div>

        <button type="button" className={styles.secondaryButton}>
          Create a Trove account
        </button>

        <p className={styles.demoHint}>
          Demo build — any valid email with a password meeting the rules signs you in.
        </p>
      </main>
    </div>
  );
}
