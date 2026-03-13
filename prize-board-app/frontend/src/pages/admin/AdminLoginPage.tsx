import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { useAuth } from '../../hooks/useAuth';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminLogin(email, password);
    navigate('/admin/boards');
  };

  return (
    <PageShell title="Admin Login" subtitle="Restricted access">
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-lg border px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Login as Admin</Button>
        </form>
      </Card>
    </PageShell>
  );
};
