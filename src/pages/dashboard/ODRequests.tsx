import { useState, useEffect } from 'react';
import { Workflow, Check, X, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const ODRequests = () => {
  const [ods, setOds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const r = await api.get<any[]>('/api/faculty/od/pending'); if (r.success) setOds(r.data); } catch { } setLoading(false); };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try { await api.patch(`/api/faculty/od/${id}/action`, { action }); load(); } catch { }
  };

  return (
    <div>
      <PageHeader title="OD Requests" description="Review student on-duty requests" />
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Date</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Reason</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr> :
              ods.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Workflow size={32} className="mx-auto mb-2 opacity-30" />No pending requests</td></tr> :
                ods.map(o => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{o.users?.name || o.student_id?.slice(0, 8)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{o.subjects?.name || '—'}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {o.date} {o.end_date && o.end_date !== o.date ? ` to ${o.end_date}` : ''}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">{o.reason}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleAction(o.id, 'approve')} className="bg-success/10 text-success p-2 rounded-lg hover:bg-success/20"><Check size={14} /></button>
                      <button onClick={() => handleAction(o.id, 'reject')} className="bg-destructive/10 text-destructive p-2 rounded-lg hover:bg-destructive/20"><X size={14} /></button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ODRequests;
