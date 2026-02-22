import { useState, useEffect } from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const EndSemesterResults = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');

    const [exams, setExams] = useState<any[]>([]);
    const [selectedExam, setSelectedExam] = useState('');

    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    const [students, setStudents] = useState<any[]>([]);
    const [marks, setMarks] = useState<Record<string, number>>({});

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'super_admin') {
            loadBatches();
        }
    }, [user]);

    useEffect(() => {
        if (selectedBatch) {
            loadExamsAndSubjects();
        } else {
            setExams([]); setSelectedExam('');
            setSubjects([]); setSelectedSubject('');
            setStudents([]); setMarks({});
        }
    }, [selectedBatch]);

    useEffect(() => {
        if (selectedExam && selectedSubject) {
            loadStudentsAndMarks();
        } else {
            setStudents([]); setMarks({});
        }
    }, [selectedExam, selectedSubject]);

    const loadBatches = async () => {
        try {
            const r = await api.get<any[]>('/api/institution/batches');
            if (r.success) setBatches(r.data);
        } catch { }
    };

    const loadExamsAndSubjects = async () => {
        try {
            const [eRes, sRes] = await Promise.all([
                api.get<any[]>(`/api/admin/assessments/exams/${selectedBatch}`),
                api.get<any[]>(`/api/institution/batches/${selectedBatch}/subjects`)
            ]);

            if (eRes.success) {
                setExams(eRes.data.filter((e: any) => e.exam_type === 'external'));
            }
            if (sRes.success) {
                setSubjects(sRes.data);
            }
        } catch { }
    };

    const loadStudentsAndMarks = async () => {
        try {
            const [stRes, mRes] = await Promise.all([
                api.get<any[]>(`/api/institution/batches/${selectedBatch}/students`),
                api.get<any[]>(`/api/admin/assessments/exams/${selectedExam}/marks?subject_id=${selectedSubject}`)
            ]);

            if (stRes.success) {
                setStudents(stRes.data);
            }

            if (mRes.success && mRes.data) {
                const mapped: Record<string, number> = {};
                mRes.data.forEach((entry: any) => { mapped[entry.student_id] = entry.marks; });
                setMarks(mapped);
            } else {
                setMarks({});
            }
        } catch { }
    };

    const handleSaveMarks = async () => {
        setLoading(true); setMessage('');

        // Convert undefined/empty fields to null or exclude them
        const entries = Object.entries(marks)
            .filter(([_, v]) => v !== undefined && v !== null && v.toString() !== '')
            .map(([student_id, markVal]) => ({ student_id, subject_id: selectedSubject, marks: markVal }));

        try {
            await api.post(`/api/admin/assessments/exams/${selectedExam}/marks`, { entries });
            setMessage('✓ External marks saved successfully');
        } catch (err: any) {
            setMessage(`✗ ${err.message || 'Failed to save marks'}`);
        }
        setLoading(false);
    };

    const activeExam = exams.find(e => e.id === selectedExam);

    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        return <div className="p-8 text-center text-muted-foreground">End Semester Results are only manageable by Admins.</div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PageHeader
                title="End Semester Results"
                description="Admin portal to enter external grades for batches"
            />

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {message}
                </div>
            )}

            <div className="glass-card p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="form-label">Select Batch</label>
                        <select className="form-select w-full" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                            <option value="">Select a batch...</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">External Exam Format</label>
                        <select className="form-select w-full" value={selectedExam} onChange={e => setSelectedExam(e.target.value)} disabled={!selectedBatch}>
                            <option value="">Select exam...</option>
                            {exams.map(e => <option key={e.id} value={e.id}>{e.name} — Max: {e.max_marks}</option>)}
                        </select>
                        {selectedBatch && exams.length === 0 && <p className="text-[10px] text-destructive mt-1">No external exams configured for this batch. Add one in Batches.</p>}
                    </div>

                    <div>
                        <label className="form-label">Subject</label>
                        <select className="form-select w-full" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedExam}>
                            <option value="">Select subject...</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {selectedBatch && selectedExam && selectedSubject && (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Roll Number</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Student Name</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase w-48">
                                    Marks (/{activeExam?.max_marks || 100})
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                        <ClipboardCheck size={32} className="mx-auto mb-2 opacity-30" />
                                        No students enrolled in this batch
                                    </td>
                                </tr>
                            ) : (
                                students.map(s => (
                                    <tr key={s.student_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="p-4 text-sm font-mono text-muted-foreground">{s.roll_number || '—'}</td>
                                        <td className="p-4 text-sm font-medium">{s.students?.name || 'Unknown'}</td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                min={0}
                                                max={activeExam?.max_marks || 100}
                                                className="form-input w-24 text-center text-sm py-1"
                                                value={marks[s.student_id] ?? ''}
                                                onChange={e => setMarks({ ...marks, [s.student_id]: +e.target.value })}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {students.length > 0 && (
                        <div className="p-4 border-t border-border flex justify-end">
                            <button
                                onClick={handleSaveMarks}
                                disabled={loading}
                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save End Semester Marks
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EndSemesterResults;
