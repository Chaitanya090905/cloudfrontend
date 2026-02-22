import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, X } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const Subjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', program_id: '', semester: 1, max_marks: 100 });

  useEffect(() => { load(); }, []);
  const load = async () => {
    const [s, p] = await Promise.all([
      api.get<any[]>('/api/admin/subjects').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/admin/programs').catch(() => ({ success: false, data: [] } as any)),
    ]);
    if (s.success) setSubjects(s.data);
    if (p.success) setPrograms(p.data);
  };
  const handleCreate = async () => {
    try { await api.post('/api/admin/subjects', form); setShowForm(false); setForm({ name: '', code: '', program_id: '', semester: 1, max_marks: 100 }); load(); } catch { }
  };

  const selectedProgram = programs.find(p => p.id === form.program_id);
  const maxSemesters = selectedProgram ? (selectedProgram.duration_years || 4) * 2 : 8;

  return (
    <div>
      <PageHeader title="Subjects" description="Manage subjects for each semester" actions={
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors"><Plus size={16} /> Add Subject</button>
      } />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">New Subject</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Data Structures" /></div>
            <div><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="CS201" /></div>
            <div><label className="form-label">Program</label><select className="form-select" value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}><option value="">Select</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}</select></div>
            <div>
              <label className="form-label">Semester</label>
              <select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: +e.target.value })} disabled={!form.program_id}>
                {!form.program_id && <option value="">Select Program First</option>}
                {form.program_id && [...Array(maxSemesters)].map((_, i) => <option key={i + 1} value={i + 1}>Semester {i + 1}</option>)}
              </select>
            </div>
            <div><label className="form-label">Max Marks</label><input type="number" className="form-input" value={form.max_marks} onChange={e => setForm({ ...form, max_marks: +e.target.value })} /></div>
          </div>
          <button onClick={handleCreate} disabled={!form.name || !form.code || !form.program_id || !form.semester} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Create</button>
        </motion.div>
      )}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Code</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Program</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Semester</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Max Marks</th>
          </tr></thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><FileText size={32} className="mx-auto mb-2 opacity-30" />No subjects yet</td></tr>
            ) : subjects.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 text-sm font-medium">{s.name}</td>
                <td className="p-4 text-sm font-mono text-muted-foreground">{s.code}</td>
                <td className="p-4 text-sm"><span className="badge-role badge-admin text-[10px]">{s.programs?.name || '—'}</span></td>
                <td className="p-4 text-sm text-muted-foreground">Sem {s.semester || '—'}</td>
                <td className="p-4 text-sm">{s.max_marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Subjects;
