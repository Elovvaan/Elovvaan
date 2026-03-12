import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { boardService } from '../../services/boardService';

export const AdminBoardCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', prizeImage: '', pricePerEntry: 1, totalEntries: 100, active: true });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await boardService.createBoard(form);
    navigate('/admin/boards');
  };

  return (
    <Card>
      <h1 className="text-2xl font-bold">Create Board</h1>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        {(['title', 'description', 'prizeImage'] as const).map((key) => (
          <input key={key} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={key} className="rounded-lg border border-slate-700 bg-slate-800 p-2" />
        ))}
        <input type="number" value={form.pricePerEntry} onChange={(e) => setForm((f) => ({ ...f, pricePerEntry: Number(e.target.value) }))} placeholder="price" className="rounded-lg border border-slate-700 bg-slate-800 p-2" />
        <input type="number" value={form.totalEntries} onChange={(e) => setForm((f) => ({ ...f, totalEntries: Number(e.target.value) }))} placeholder="entries" className="rounded-lg border border-slate-700 bg-slate-800 p-2" />
        <Button type="submit">Save board</Button>
      </form>
    </Card>
  );
};
