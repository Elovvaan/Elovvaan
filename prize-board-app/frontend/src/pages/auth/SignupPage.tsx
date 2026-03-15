import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { useAuth } from '../../hooks/useAuth';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationError(null);
    setApiError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setValidationError('Please complete all required fields.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(trimmedName, trimmedEmail, password);
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        setApiError(error.response.data.message);
      } else {
        setApiError('We could not create your account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell title="Signup" subtitle="Join Swipe2Win">
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit}>
          {validationError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{validationError}</p> : null}
          {apiError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p> : null}
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
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
};
