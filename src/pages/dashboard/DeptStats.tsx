import { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { api } from '@/lib/utils';

const DeptStats = () => {
  const [stats, setStats] = useState<any>({ total_students: 0, defaulters: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const r = await api.get<any>('/api/hod/department/stats'); if (r.success) setStats(r.data); } catch { } setLoading(false); };

  return (
    <div>
      <PageHeader title="Department Statistics" description="Student tracking and defaulter analysis" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard label="Total Students" value={stats.total_students || 0} icon={<BarChart3 size={22} />} color="bg-primary/10 text-primary" />
        <StatCard label="Defaulters (<75%)" value={stats.defaulters?.length || 0} icon={<AlertTriangle size={22} />} color="bg-destructive/10 text-destructive" delay={0.05} />
      </div>
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="font-bold text-foreground font-heading text-sm">Attendance Defaulters</h3></div>
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Attendance %</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Present / Total</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr> :
              !stats.defaulters?.length ? <tr><td colSpan={3} className="p-8 text-center text-muted-foreground text-sm">No defaulters — great job!</td></tr> :
                stats.defaulters.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{d.student_name || d.student_id?.slice(0, 8)}</td>
                    <td className="p-4"><span className="text-sm font-bold text-destructive">{d.percentage}%</span></td>
                    <td className="p-4 text-sm text-muted-foreground">{d.present_count} / {d.total_sessions}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DeptStats;
