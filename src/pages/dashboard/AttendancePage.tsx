import { useState, useEffect, useMemo } from 'react';
import { CalendarCheck, Check, X as XIcon, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const AttendancePage = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('morning');
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { if (selectedAssignmentId) loadStudents(); }, [selectedAssignmentId]);

  const loadSubjects = async () => {
    try { const r = await api.get<any[]>('/api/faculty/my-subjects'); if (r.success) setAssignments(r.data); } catch { }
  };
  const loadStudents = async () => {
    const assignmentObj = assignments.find(a => a.id === selectedAssignmentId);
    if (!assignmentObj) return;

    try {
      const [r, h] = await Promise.all([
        api.get<any[]>(`/api/faculty/assignment-students/${selectedAssignmentId}`).catch(() => ({ success: false, data: [] } as any)),
        api.get<any[]>(`/api/faculty/attendance/${assignmentObj.subject_id}`).catch(() => ({ success: false, data: [] } as any))
      ]);

      if (r.success) {
        setStudents(r.data);
        const att: Record<string, string> = {};
        r.data.forEach((s: any) => { att[s.student_id] = 'present'; });
        setAttendance(att);
      }
      if (h.success) {
        setHistory(h.data);
      }
    } catch { }
  };

  const toggleStatus = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : prev[id] === 'absent' ? 'od' : 'present' }));
  };

  const handleSubmit = async () => {
    setLoading(true); setMessage('');
    const assignmentObj = assignments.find(a => a.id === selectedAssignmentId);
    if (!assignmentObj) {
      setLoading(false);
      setMessage('✗ Subject assignment not found');
      return;
    }
    const subject_id = assignmentObj.subject_id;
    const records = Object.entries(attendance).map(([student_id, status]) => ({ student_id, status }));
    try {
      await api.post('/api/faculty/attendance/mark', { subject_id, date, session, records });
      setMessage('✓ Attendance marked');
      loadStudents(); // reload history
    } catch (err: any) { setMessage(`✗ ${err.message}`); }
    setLoading(false);
  };

  const statusColor = (s: string) => s === 'present' ? 'bg-success text-white' : s === 'absent' ? 'bg-destructive text-white' : 'bg-info text-white';

  const insights = useMemo(() => {
    if (!history.length) return null;

    const studentStats: Record<string, { present: number, total: number, name: string }> = {};
    history.forEach(h => {
      if (!studentStats[h.student_id]) {
        studentStats[h.student_id] = { present: 0, total: 0, name: h.users?.name || 'Unknown' };
      }
      studentStats[h.student_id].total++;
      if (h.status === 'present' || h.status === 'od') {
        studentStats[h.student_id].present++;
      }
    });

    const lowAttendance = Object.values(studentStats)
      .map(s => ({ name: s.name, percentage: Math.round((s.present / s.total) * 100) }))
      .filter(s => s.percentage < 75)
      .sort((a, b) => a.percentage - b.percentage);

    const overallPercentage = Math.round(
      (Object.values(studentStats).reduce((acc, curr) => acc + curr.present, 0) /
        Object.values(studentStats).reduce((acc, curr) => acc + curr.total, 0)) * 100
    );

    // Get last 7 days chart
    const dateGroups: Record<string, { present: number, total: number }> = {};
    history.forEach(h => {
      if (!dateGroups[h.date]) dateGroups[h.date] = { present: 0, total: 0 };
      dateGroups[h.date].total++;
      if (h.status === 'present' || h.status === 'od') dateGroups[h.date].present++;
    });

    const chartData = Object.entries(dateGroups)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7)
      .map(([d, counts]) => ({
        date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attendance: Math.round((counts.present / counts.total) * 100)
      }));

    return { lowAttendance, chartData, overallPercentage };
  }, [history]);

  return (
    <div>
      <PageHeader title="Mark Attendance" description="Record daily attendance for your subjects" />
      {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="form-label">Subject Allocation</label>
          <select className="form-select" value={selectedAssignmentId} onChange={e => setSelectedAssignmentId(e.target.value)}>
            <option value="">Select subject context...</option>
            {assignments.map(a => <option key={a.id} value={a.id}>{a.subjects?.name} ({a.batches?.code || 'No Batch'})</option>)}
          </select>
        </div>
        <div><label className="form-label">Date</label><input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div><label className="form-label">Session</label><select className="form-select" value={session} onChange={e => setSession(e.target.value)}><option value="morning">Morning</option><option value="afternoon">Afternoon</option></select></div>
      </div>
      {selectedAssignmentId && (
        <div className="space-y-6">
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-bold font-heading">Class Attendance Trend</h3>
                  <span className="ml-auto badge-role badge-faculty">{insights.overallPercentage}% Overall</span>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={insights.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip
                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '12px' }}
                      />
                      <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                        {insights.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.attendance < 75 ? 'var(--destructive)' : 'var(--primary)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold font-heading text-foreground">Defaulters</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Students below 75% attendance threshold.</p>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {insights.lowAttendance.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground italic h-full flex items-center justify-center">No students currently below 75% threshold.</div>
                  ) : (
                    insights.lowAttendance.map((student, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <span className="text-sm font-semibold truncate pr-2" title={student.name}>{student.name}</span>
                        <span className="text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-md">{student.percentage}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
              <h3 className="font-bold font-heading text-sm">Mark Today's Attendance</h3>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr></thead>
              <tbody>
                {students.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-muted-foreground text-sm">No students enrolled</td></tr> :
                  students.map(s => (
                    <tr key={s.student_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm font-medium">{s.users?.name || 'Unknown'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{s.users?.email || 'N/A'}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleStatus(s.student_id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${statusColor(attendance[s.student_id] || 'present')} transition-all`}>
                          {attendance[s.student_id] || 'present'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {students.length > 0 && (
              <div className="p-4 border-t border-border flex justify-end">
                <button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />} Submit Attendance
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AttendancePage;
