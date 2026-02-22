import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, X } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const Departments = () => {
  const [depts, setDepts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const r = await api.get<any[]>('/api/admin/departments'); if (r.success) setDepts(r.data); } catch { }
  };
  const handleCreate = async () => {
    try { await api.post('/api/admin/departments', form); setShowForm(false); setForm({ name: '', code: '' }); load(); } catch { }
  };

  return (
    <div>
      <PageHeader title="Departments" description="Manage academic departments" actions={
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors"><Plus size={16} /> Add Department</button>
      } />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">New Department</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Computer Science" /></div>
            <div><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="CSE" /></div>
          </div>
          <button onClick={handleCreate} disabled={!form.name || !form.code} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Create</button>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {depts.length === 0 ? (
          <div className="glass-card p-8 col-span-full text-center text-muted-foreground"><Building2 size={32} className="mx-auto mb-2 opacity-30" /><p>No departments yet</p></div>
        ) : depts.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div><h3 className="font-bold text-foreground">{d.name}</h3><p className="text-xs text-muted-foreground font-mono mt-1">{d.code}</p></div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={18} className="text-primary" /></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Departments;
