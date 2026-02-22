import { useState, useEffect } from 'react';
import { ClipboardCheck, Lock, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const MarksLock = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const r = await api.get<any[]>('/api/admin/subjects'); if (r.success) setSubjects(r.data); } catch { } setLoading(false); };

  const handleLock = async (subjectId: string) => {
    setMessage('');
    try { await api.post(`/api/admin/marks/${subjectId}/lock`); setMessage('✓ Marks locked'); load(); } catch (err: any) { setMessage(`✗ ${err.message}`); }
  };

  return (
    <div>
      <PageHeader title="Marks Lock" description="Lock approved marks — makes them visible to students" />
      {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Code</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Semester</th>
            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr> :
              subjects.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground"><ClipboardCheck size={32} className="mx-auto mb-2 opacity-30" />No subjects</td></tr> :
                subjects.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{s.name}</td>
                    <td className="p-4 text-sm font-mono text-muted-foreground">{s.code}</td>
                    <td className="p-4 text-sm text-muted-foreground">Sem {s.semesters?.semester_number || '—'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleLock(s.id)} className="bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-destructive/20 flex items-center gap-1.5 ml-auto"><Lock size={12} /> Lock Marks</button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MarksLock;
