import { useState, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { api } from '@/lib/utils';

const FacultyWorkload = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batchSubjects, setBatchSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const [r, b] = await Promise.all([
        api.get<any[]>('/api/institution/faculty-workload'),
        api.get<any[]>('/api/institution/batches')
      ]);
      if (r.success) setData(r.data);
      if (b.success) setBatches(b.data);
    } catch { }
    setLoading(false);
  };

  const handleOpenAssign = (faculty: any) => {
    setSelectedFaculty(faculty);
    setSelectedBatchId('');
    setSelectedSubjectId('');
    setBatchSubjects([]);
    setShowModal(true);
  };

  const handleBatchChange = async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedSubjectId('');
    if (!batchId) {
      setBatchSubjects([]);
      return;
    }
    try {
      const r = await api.get<any[]>(`/api/institution/batches/${batchId}/subjects`);
      if (r.success) setBatchSubjects(r.data);
    } catch { }
  };

  const handleAssignSubject = async () => {
    if (!selectedFaculty || !selectedBatchId || !selectedSubjectId) return;
    setAssignLoading(true);
    try {
      await api.post('/api/institution/faculty-assignments', {
        faculty_id: selectedFaculty.id,
        subject_id: selectedSubjectId,
        batch_id: selectedBatchId
      });
      setShowModal(false);
      load(); // Reload data to show updated subjects
    } catch { }
    setAssignLoading(false);
  };

  const utilColor = (p: number) => p > 90 ? 'text-destructive' : p > 70 ? 'text-warning' : 'text-success';
  const utilBg = (p: number) => p > 90 ? 'bg-destructive' : p > 70 ? 'bg-warning' : 'bg-success';

  return (
    <div>
      <PageHeader title="Faculty Workload" description="View teaching load and subject assignments" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard label="Total Faculty" value={data.length} icon={<Clock size={22} />} color="bg-primary/10 text-primary" />
        <StatCard label="Under-loaded" value={data.filter(w => w.utilization < 70).length} icon={<Clock size={22} />} color="bg-success/10 text-success" delay={0.05} />
        <StatCard label="Optimal" value={data.filter(w => w.utilization >= 70 && w.utilization <= 90).length} icon={<Clock size={22} />} color="bg-warning/10 text-warning" delay={0.1} />
        <StatCard label="Over-loaded" value={data.filter(w => w.utilization > 90).length} icon={<Clock size={22} />} color="bg-destructive/10 text-destructive" delay={0.15} />
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Faculty</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Email</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Hours</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Utilization</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subjects</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase w-24">Action</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr> :
              data.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">No faculty found</td></tr> :
                data.map(f => (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{f.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{f.email}</td>
                    <td className="p-4 text-sm"><span className="font-bold">{f.current_hours_per_week}</span><span className="text-muted-foreground"> / {f.max_hours_per_week}</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${utilBg(f.utilization)} transition-all`} style={{ width: `${Math.min(f.utilization, 100)}%` }} /></div>
                        <span className={`text-xs font-bold ${utilColor(f.utilization)}`}>{f.utilization}%</span>
                      </div>
                    </td>
                    <td className="p-4"><div className="flex flex-wrap gap-1">{f.assigned_subjects?.length > 0 ? f.assigned_subjects.map((s: any, i: number) => <span key={i} className="badge-role badge-admin text-[9px]">{s.subjects?.code || '?'} ({s.batches?.code || 'None'})</span>) : <span className="text-xs text-muted-foreground">None</span>}</div></td>
                    <td className="p-4">
                      <button
                        onClick={() => handleOpenAssign(f)}
                        className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md font-semibold hover:bg-muted transition-colors whitespace-nowrap"
                      >
                        Assign Subject
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-1">Assign Subject</h3>
            <p className="text-sm text-muted-foreground mb-6">Allocate a new subject to {selectedFaculty.name}.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="form-label text-xs">Target Batch</label>
                <select className="form-select" value={selectedBatchId} onChange={e => handleBatchChange(e.target.value)}>
                  <option value="">Select Batch...</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Subject to Assign</label>
                <select className="form-select" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} disabled={!selectedBatchId || batchSubjects.length === 0}>
                  <option value="">{selectedBatchId ? (batchSubjects.length > 0 ? 'Select Subject...' : 'No subjects in this batch') : 'Select Batch First...'}</option>
                  {batchSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code}) - Max Mks: {s.max_marks}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted text-muted-foreground transition-colors"
                disabled={assignLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubject}
                disabled={!selectedBatchId || !selectedSubjectId || assignLoading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {assignLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Assign Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyWorkload;
