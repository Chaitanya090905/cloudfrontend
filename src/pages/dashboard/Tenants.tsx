import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, X } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const Tenants = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', admin_email: '', admin_name: '' });
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await api.get<any[]>('/api/admin/tenants'); if (r.success) setTenants(r.data); } catch { } };
  const handleCreate = async () => {
    setMessage('');
    try { await api.post('/api/auth/register-institution', form); setMessage('✓ Institution created'); setShowForm(false); setForm({ name: '', code: '', admin_email: '', admin_name: '' }); load(); } catch (err: any) { setMessage(`✗ ${err.message}`); }
  };

  return (
    <div>
      <PageHeader title="Institutions" description="Manage tenant institutions" actions={
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors"><Plus size={16} /> Register Institution</button>
      } />
      {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">Register New Institution</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Manipal University" /></div>
            <div><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="manipal" /></div>
            <div><label className="form-label">Admin Email</label><input className="form-input" value={form.admin_email} onChange={e => setForm({ ...form, admin_email: e.target.value })} placeholder="admin@manipal.edu" /></div>
            <div><label className="form-label">Admin Name</label><input className="form-input" value={form.admin_name} onChange={e => setForm({ ...form, admin_name: e.target.value })} placeholder="Prof. Sharma" /></div>
          </div>
          <button onClick={handleCreate} disabled={!form.name || !form.code || !form.admin_email} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Register</button>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tenants.length === 0 ? (
          <div className="glass-card p-8 col-span-full text-center text-muted-foreground"><Building2 size={32} className="mx-auto mb-2 opacity-30" /><p>No institutions registered</p></div>
        ) : tenants.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex justify-between items-start mb-2">
              <div><h3 className="font-bold text-foreground">{t.name}</h3><p className="text-xs text-muted-foreground font-mono">{t.code}</p></div>
              <span className={`badge-role ${t.is_active ? 'badge-success' : 'badge-danger'} text-[10px]`}>{t.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Plan: <span className="font-medium text-foreground">{t.subscription_plan}</span></div>
              <div>Max Students: {t.max_students}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Tenants;
