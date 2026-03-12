import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authService.login({ email, password });
    login(res.token, res.user);
    navigate(res.user.role === 'admin' ? '/admin/boards' : '/dashboard');
  };

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2" />
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <p className="mt-4 text-sm text-slate-400">New user? <Link to="/signup" className="text-brand-500">Create account</Link></p>
    </Card>
  );
};
