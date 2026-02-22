import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending_faculty: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', pending_hod: 'badge-admin',
};

const ApplyOD = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [ods, setOds] = useState<any[]>([]);
  const [form, setForm] = useState({ subject_id: '', date: '', end_date: '', reason: '', od_type: 'normal', document_url: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    const [s, o] = await Promise.all([
      api.get<any[]>('/api/student/my-subjects').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/student/od/status').catch(() => ({ success: false, data: [] } as any)),
    ]);
    if (s.success) setSubjects(s.data);
    if (o.success) setOds(o.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage('');

    // Auto-fill a valid subject to bypass DB NOT NULL constraints since UI element is removed
    const defaultSubjectId = subjects.length > 0 ? subjects[0].id : '';
    const payload = { ...form, subject_id: defaultSubjectId };

    try {
      if (form.od_type !== 'normal' && form.end_date) {
        const start = new Date(form.date);
        const end = new Date(form.end_date);
        if (end < start) {
          setMessage('✗ End date cannot be before start date');
          setLoading(false);
          return;
        }
      }

      await api.post('/api/student/od/apply', payload);
      setMessage('✓ OD request submitted successfully');

      setForm({ subject_id: '', date: '', end_date: '', reason: '', od_type: 'normal', document_url: '' });
      loadData();
    } catch (err: any) {
      setMessage(`✗ ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader title="Apply OD" description="Submit on-duty requests" />
      {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold font-heading mb-4">New Request</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Type of OD</label>
              <select className="form-select" value={form.od_type} onChange={e => setForm({ ...form, od_type: e.target.value })}>
                <option value="normal">Normal</option>
                <option value="special">Special</option>
                <option value="medical">Medical</option>
              </select>
            </div>

            {form.od_type === 'normal' ? (
              <div><label className="form-label">Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">From Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                <div><label className="form-label">To Date</label><input type="date" className="form-input" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required /></div>
              </div>
            )}

            <div><label className="form-label">Reason</label><textarea className="form-input" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required placeholder="Describe the reason..." /></div>
            <div><label className="form-label">Document URL (optional)</label><input className="form-input" value={form.document_url} onChange={e => setForm({ ...form, document_url: e.target.value })} placeholder="https://" /></div>
          </div>
          <button type="submit" disabled={loading} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Submit Request
          </button>
        </motion.form>
        <div>
          <h3 className="font-bold font-heading text-foreground mb-4">My Requests</h3>
          <div className="space-y-3">
            {ods.length === 0 ? (
              <div className="glass-card p-6 text-center text-muted-foreground"><Workflow size={24} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No OD requests yet</p></div>
            ) : ods.map(o => (
              <div key={o.id} className="glass-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <span className="badge-role badge-faculty text-[10px] uppercase font-bold">{o.od_type || 'normal'}</span>
                      {o.subjects?.name && <span className="text-xs text-muted-foreground ml-1">({o.subjects.code})</span>}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {o.date} {o.end_date && o.end_date !== o.date ? ` to ${o.end_date}` : ''}
                    </p>
                  </div>
                  <span className={`badge-role ${statusColors[o.status] || 'badge-warning'} text-[10px]`}>{o.status?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{o.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ApplyOD;
