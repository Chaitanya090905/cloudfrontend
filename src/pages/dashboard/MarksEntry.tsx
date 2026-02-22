import { useState, useEffect } from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const MarksEntry = () => {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [selectedAllocation, setSelectedAllocation] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});

  // Dynamic Exams Logic
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => {
    if (selectedAllocation) {
      loadStudents();
      loadExams();
    } else {
      setExams([]);
      setSelectedExam('');
      setStudents([]);
    }
  }, [selectedAllocation]);

  useEffect(() => {
    if (selectedAllocation && selectedExam) {
      loadExistingMarks();
    } else {
      setMarks({});
    }
  }, [selectedAllocation, selectedExam]);

  const loadSubjects = async () => { try { const r = await api.get<any[]>('/api/faculty/my-subjects'); if (r.success) setAllocations(r.data); } catch { } };
  const loadStudents = async () => { try { const r = await api.get<any[]>(`/api/faculty/assignment-students/${selectedAllocation}`); if (r.success) setStudents(r.data); } catch { } };

  const loadExams = async () => {
    try {
      const allocationObj = allocations.find(a => a.id === selectedAllocation);
      if (!allocationObj?.batch_id) return;

      const r = await api.get<any[]>(`/api/admin/assessments/exams/${allocationObj.batch_id}`);
      if (r.success) {
        // Faculty can only grade 'internal' exams (FAT 1, FAT 2, etc.)
        const internalExams = r.data.filter((e: any) => e.exam_type === 'internal');
        setExams(internalExams);
      }
    } catch { }
  };

  const loadExistingMarks = async () => {
    try {
      const allocationObj = allocations.find(a => a.id === selectedAllocation);
      if (!allocationObj?.subject_id) return;

      const r = await api.get<any[]>(`/api/admin/assessments/exams/${selectedExam}/marks?subject_id=${allocationObj.subject_id}`);
      if (r.success && r.data) {
        const mapped: Record<string, number> = {};
        r.data.forEach((entry: any) => { mapped[entry.student_id] = entry.marks; });
        setMarks(mapped);
      } else {
        setMarks({});
      }
    } catch { }
  };

  const handleSubmit = async () => {
    if (!selectedExam) {
      setMessage('✗ Please select an exam format to grade');
      return;
    }

    setLoading(true); setMessage('');
    const allocationObj = allocations.find(a => a.id === selectedAllocation);
    const subject_id = allocationObj?.subject_id;

    const entries = Object.entries(marks)
      .filter(([_, v]) => v !== undefined && v !== null && v.toString() !== '')
      .map(([student_id, markVal]) => ({ student_id, subject_id, marks: markVal }));

    try {
      await api.post(`/api/admin/assessments/exams/${selectedExam}/marks`, { entries });
      setMessage('✓ Marks submitted successfully');
    } catch (err: any) {
      setMessage(`✗ ${err.message || 'Failed to submit marks'}`);
    }
    setLoading(false);
  };

  const maxMarks = allocations.find(a => a.id === selectedAllocation)?.subjects?.max_marks || 100;

  return (
    <div>
      <PageHeader title="Marks Entry" description="Enter internal marks (like FAT) for your subjects" />
      {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Subject & Batch</label>
          <select className="form-select w-full" value={selectedAllocation} onChange={e => setSelectedAllocation(e.target.value)}>
            <option value="">Select subject allocation</option>
            {allocations.map(a => (
              <option key={a.id} value={a.id}>
                {a.subjects?.name} ({a.batches?.code || 'No Batch'})
              </option>
            ))}
          </select>
        </div>

        {selectedAllocation && (
          <div>
            <label className="form-label">Exam Format</label>
            <select className="form-select w-full" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
              <option value="">Select Exam</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} — Max: {ex.max_marks}
                </option>
              ))}
            </select>
            {exams.length === 0 && <p className="text-xs text-muted-foreground mt-1 text-destructive">No internal exams configured for this batch by admin.</p>}
          </div>
        )}
      </div>

      {selectedAllocation && selectedExam && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Email</th>
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Marks (/{exams.find(e => e.id === selectedExam)?.max_marks || 100})</th>
            </tr></thead>
            <tbody>
              {students.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-muted-foreground"><ClipboardCheck size={32} className="mx-auto mb-2 opacity-30" />No students</td></tr> :
                students.map(s => (
                  <tr key={s.student_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{s.users?.name || s.students?.name || s.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-muted-foreground">{s.users?.email || s.students?.email || s.email || '—'}</td>
                    <td className="p-4"><input type="number" min={0} max={exams.find(e => e.id === selectedExam)?.max_marks || 100} className="form-input w-24 text-center" value={marks[s.student_id] ?? ''} onChange={e => setMarks({ ...marks, [s.student_id]: +e.target.value })} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
          {students.length > 0 && (
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Submit Marks
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default MarksEntry;
