import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, X, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { UserRole, ROLE_LABELS } from '@/context/AuthContext';
import { api } from '@/lib/utils';
import { sendWelcomeEmail } from '@/lib/email';

const ROLES: (UserRole | 'all')[] = ['all', 'admin', 'hod', 'faculty', 'student'];

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [filter, setFilter] = useState<UserRole | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'student', department_id: '', batch_id: '', password: 'edunexis@2026' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [u, d, b] = await Promise.all([
        api.get<any[]>('/api/admin/users'),
        api.get<any[]>('/api/admin/departments').catch(() => ({ success: false, data: [] } as any)),
        api.get<any[]>('/api/institution/batches').catch(() => ({ success: false, data: [] } as any)),
      ]);
      if (u.success) setUsers(u.data);
      if (d.success) setDepartments(d.data);
      if (b.success) setBatches(b.data);
    } catch { }
    setLoading(false);
  };

  const handleCreate = async () => {
    setMessage('');
    try {
      const res = await api.post<any>('/api/admin/users', {
        ...form,
        department_id: form.department_id || undefined,
        batch_id: form.batch_id || undefined
      });
      if (res.success) {
        setMessage('✓ User created. Sending email...');

        // Dispatch email using the returned password
        const password = res.data?.temp_password || form.password;
        const orgName = res.data?.org_name || 'EduNexis Institution';

        const emailSent = await sendWelcomeEmail({
          to_email: form.email,
          to_name: form.name,
          org_name: orgName,
          password: password
        });

        if (emailSent) {
          setMessage('✓ User created & credentials emailed');
        } else {
          setMessage('✓ User created (Email failed to send)');
        }

        setShowForm(false);
        setForm({ name: '', email: '', role: 'student', department_id: '', batch_id: '', password: 'edunexis@2026' });
        load();
      }
    } catch (err: any) { setMessage(`✗ ${err.message}`); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try { await api.patch(`/api/admin/users/${id}`, { is_active: !active }); load(); } catch { }
  };

  const filtered = users.filter(u => (filter === 'all' || u.role === filter) && u.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="User Management" description="Create and manage institutional users" actions={
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
          <Plus size={16} /> Add User
        </button>
      } />

      {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard label="Total Users" value={users.length} icon={<Users size={22} />} color="bg-primary/10 text-primary" />
        <StatCard label="HODs" value={users.filter(u => u.role === 'hod').length} icon={<Users size={22} />} color="bg-info/10 text-info" delay={0.05} />
        <StatCard label="Faculty" value={users.filter(u => u.role === 'faculty').length} icon={<Users size={22} />} color="bg-success/10 text-success" delay={0.1} />
        <StatCard label="Students" value={users.filter(u => u.role === 'student').length} icon={<Users size={22} />} color="bg-warning/10 text-warning" delay={0.15} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {ROLES.map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === r ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
            {r === 'all' ? 'All Roles' : ROLE_LABELS[r]}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="form-input pl-9 w-60" />
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">New User</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
            <div><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@edu" /></div>
            <div>
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option><option value="hod">HOD</option><option value="faculty">Faculty</option><option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="form-label">Department Option</label>
              <select className="form-select" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                <option value="">None</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {form.role === 'student' && (
              <div className="col-span-2">
                <label className="form-label">Assign to Batch (Optional section auto-assignment)</label>
                <select className="form-select" value={form.batch_id} onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                  <option value="">Do not assign yet</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                </select>
              </div>
            )}
          </div>
          <button onClick={handleCreate} disabled={!form.name || !form.email} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Create User</button>
        </motion.div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Name</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Email</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Role</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                <td className="p-4 text-sm font-medium text-foreground">{u.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-4"><span className={`badge-role badge-${u.role} text-[10px]`}>{ROLE_LABELS[u.role as UserRole] || u.role}</span></td>
                <td className="p-4"><span className={`badge-role ${u.is_active ? 'badge-success' : 'badge-danger'} text-xs`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="p-4">
                  <button onClick={() => toggleActive(u.id, u.is_active)} className={`text-xs font-semibold px-3 py-1 rounded-md ${u.is_active ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
