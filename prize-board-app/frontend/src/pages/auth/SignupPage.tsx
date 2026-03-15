import { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';

const SIGNUP_URL = 'https://prize-board-backend-production-5ac2.up.railway.app/api/auth/register';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRequestUrl, setLastRequestUrl] = useState(SIGNUP_URL);
  const [lastResponseStatus, setLastResponseStatus] = useState<string>('not requested yet');
  const [successResponse, setSuccessResponse] = useState<string | null>(null);
  const [errorResponse, setErrorResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationError(null);
    setSuccessResponse(null);
    setErrorResponse(null);
    setLastRequestUrl(SIGNUP_URL);
    setLastResponseStatus('pending');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setValidationError('Please complete all required fields.');
      setLastResponseStatus('not sent (validation failed)');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      setLastResponseStatus('not sent (validation failed)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(SIGNUP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      setLastResponseStatus(String(response.status));

      const responseText = await response.text();

      if (response.ok) {
        setSuccessResponse(responseText);
      } else {
        setErrorResponse(responseText);
      }
    } catch (error) {
      setLastResponseStatus('network error');
      setErrorResponse(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell title="Signup" subtitle="Temporary backend signup verification">
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit}>
          {validationError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{validationError}</p> : null}

          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700 break-all">
            Final request URL: {lastRequestUrl}
          </p>
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700 break-all">
            Response status: {lastResponseStatus}
          </p>

          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />

          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Signup'}
          </Button>

          {successResponse !== null ? (
            <pre className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800 whitespace-pre-wrap break-all">
              Success response:
              {'\n'}
              {successResponse}
            </pre>
          ) : null}

          {errorResponse !== null ? (
            <pre className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 whitespace-pre-wrap break-all">
              Error response:
              {'\n'}
              {errorResponse}
            </pre>
          ) : null}
        </form>
      </Card>
    </PageShell>
  );
};
