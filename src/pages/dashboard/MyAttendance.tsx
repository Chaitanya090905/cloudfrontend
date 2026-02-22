import { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const MyAttendance = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await api.get<any>('/api/student/attendance'); if (r.success) setData(r.data.summary || []); } catch { } };

  return (
    <div>
      <PageHeader title="My Attendance" description="Subject-wise attendance summary" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.length === 0 ? (
          <div className="glass-card p-8 col-span-full text-center text-muted-foreground"><CalendarCheck size={32} className="mx-auto mb-2 opacity-30" /><p>No attendance data yet</p></div>
        ) : data.map((s, i) => {
          const pct = typeof s.percentage === 'number' ? s.percentage : 0;
          const isDefaulter = pct < 75;
          return (
            <div key={i} className="glass-card p-5">
              <div className="flex justify-between items-start mb-3">
                <div><h3 className="font-bold text-foreground">{s.subject_name || s.subjects?.name || 'Subject'}</h3><p className="text-xs text-muted-foreground">{s.subject_code || s.subjects?.code || ''}</p></div>
                {isDefaulter && <span className="badge-role badge-danger text-[10px] flex items-center gap-1"><AlertTriangle size={10} /> Defaulter</span>}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isDefaulter ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className={`text-sm font-bold ${isDefaulter ? 'text-destructive' : 'text-success'}`}>{pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{s.present || 0} / {s.total_sessions || 0} sessions</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MyAttendance;
