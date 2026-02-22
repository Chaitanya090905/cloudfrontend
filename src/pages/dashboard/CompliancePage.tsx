import { useState, useEffect } from 'react';
import { FileCheck, Download, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { api } from '@/lib/utils';

const CompliancePage = () => {
  const [data, setData] = useState<any>({ summary: {}, subjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const r = await api.get<any>('/api/compliance/semester-summary'); if (r.success) setData(r.data); } catch { } setLoading(false); };

  const handleExport = (type: 'csv' | 'pdf') => {
    api.download(`/api/compliance/export/${type}`, `compliance-report.${type}`).catch(() => { });
  };

  const s = data.summary || {};

  return (
    <div>
      <PageHeader title="Compliance Reports" description="Semester summary and regulatory metrics" actions={
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="bg-card border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-muted"><Download size={14} /> CSV</button>
          <button onClick={() => handleExport('pdf')} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary"><Download size={14} /> PDF</button>
        </div>
      } />
      {loading ? <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard label="Students" value={s.total_students || 0} icon={<FileCheck size={22} />} color="bg-primary/10 text-primary" />
            <StatCard label="Faculty" value={s.total_faculty || 0} icon={<FileCheck size={22} />} color="bg-info/10 text-info" delay={0.05} />
            <StatCard label="S:F Ratio" value={s.student_faculty_ratio || '—'} icon={<FileCheck size={22} />} color="bg-warning/10 text-warning" delay={0.1} />
            <StatCard label="Avg Attendance" value={`${s.average_attendance || 0}%`} icon={<FileCheck size={22} />} color="bg-success/10 text-success" delay={0.15} />
          </div>
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="font-bold font-heading text-sm">Subject Performance</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Code</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Avg Marks</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Pass %</th>
              </tr></thead>
              <tbody>
                {!data.subjects?.length ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No subject data</td></tr> :
                  data.subjects.map((sub: any, i: number) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm font-medium">{sub.subject_name}</td>
                      <td className="p-4 text-sm font-mono text-muted-foreground">{sub.subject_code}</td>
                      <td className="p-4 text-sm font-bold">{sub.average_marks}</td>
                      <td className="p-4"><span className={`text-sm font-bold ${sub.pass_percentage >= 60 ? 'text-success' : 'text-destructive'}`}>{sub.pass_percentage}%</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
export default CompliancePage;
