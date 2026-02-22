import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, X } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const Programs = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', department_id: '', duration_years: 4 });

  useEffect(() => { load(); }, []);
  const load = async () => {
    const [p, d] = await Promise.all([
      api.get<any[]>('/api/admin/programs').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/admin/departments').catch(() => ({ success: false, data: [] } as any)),
    ]);
    if (p.success) setPrograms(p.data);
    if (d.success) setDepts(d.data);
  };
  const handleCreate = async () => {
    try { await api.post('/api/admin/programs', form); setShowForm(false); setForm({ name: '', code: '', department_id: '', duration_years: 4 }); load(); } catch { }
  };

  return (
    <div>
      <PageHeader title="Programs" description="Manage degree programs" actions={
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors"><Plus size={16} /> Add Program</button>
      } />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">New Program</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="B.Tech CSE" /></div>
            <div><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="BTECH-CSE" /></div>
            <div>
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                <option value="">Select</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label className="form-label">Duration (years)</label><input type="number" className="form-input" value={form.duration_years} onChange={e => setForm({ ...form, duration_years: +e.target.value })} /></div>
          </div>
          <button onClick={handleCreate} disabled={!form.name || !form.code} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Create</button>
        </motion.div>
      )}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Name</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Code</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Department</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Duration</th>
          </tr></thead>
          <tbody>
            {programs.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground"><BookOpen size={32} className="mx-auto mb-2 opacity-30" />No programs yet</td></tr>
            ) : programs.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 text-sm font-medium">{p.name}</td>
                <td className="p-4 text-sm text-muted-foreground font-mono">{p.code}</td>
                <td className="p-4 text-sm text-muted-foreground">{p.departments?.name || '—'}</td>
                <td className="p-4 text-sm">{p.duration_years || 4} years</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Programs;
