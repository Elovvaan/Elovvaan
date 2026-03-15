import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { registerUser } from '../../services/authApi';

const emailPattern = /^\S+@\S+\.\S+$/;

export const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccessMessage(result.message ?? 'Account created successfully. Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 800);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell title="Sign Up" subtitle="Create your Swipe2Win account">
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit} noValidate>
          <div>
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p> : null}
          </div>

          <div>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="email"
              placeholder="Email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
          </div>

          <div>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.password ? <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p> : null}
          </div>

          <div>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p> : null}
          </div>

          {serverError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p> : null}
          {successMessage ? <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-3 text-sm text-slate-600">
          Already have an account? <Link className="text-brand-700" to="/login">Sign in</Link>
        </p>
      </Card>
    </PageShell>
  );
};
