import { useState, useEffect } from 'react';
import { ClipboardCheck, Check, X, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const MarksApproval = () => {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const r = await api.get<any[]>('/api/hod/marks/pending'); if (r.success) setMarks(r.data); } catch { } setLoading(false); };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try { await api.post(`/api/hod/marks/${id}/${action}`); load(); } catch { }
  };

  return (
    <div>
      <PageHeader title="Marks Approval" description="Review and approve submitted marks" />
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Marks</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Faculty</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr> :
              marks.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><ClipboardCheck size={32} className="mx-auto mb-2 opacity-30" />No pending marks</td></tr> :
                marks.map(m => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{m.users?.name || m.student_id?.slice(0, 8)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{m.subjects?.name || m.subject_id?.slice(0, 8)}</td>
                    <td className="p-4 text-sm font-bold">{m.marks_obtained} / {m.subjects?.max_marks || 100}</td>
                    <td className="p-4 text-sm text-muted-foreground">{m.submitted_by_name || '—'}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleAction(m.id, 'approve')} className="bg-success/10 text-success p-2 rounded-lg hover:bg-success/20"><Check size={14} /></button>
                      <button onClick={() => handleAction(m.id, 'reject')} className="bg-destructive/10 text-destructive p-2 rounded-lg hover:bg-destructive/20"><X size={14} /></button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MarksApproval;
