import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, X, Upload, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const FacultyAssignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]); // For faculty to select subject context
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(''); // For the dropdown in the create form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', due_date: '', max_score: 100 }); // Changed max_marks to max_score

    // Faculty State
    const [selectedAssignmentView, setSelectedAssignmentView] = useState<any>(null); // Replaces selectedAssignment
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [gradingMarks, setGradingMarks] = useState<Record<string, number>>({});
    const [gradingFeedback, setGradingFeedback] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) { // Ensure user is loaded before attempting to load assignments
            load();
        }
    }, [user]); // Depend on user to re-run when user data is available

    const load = async () => {
        try {
            if (user?.role === 'faculty') {
                const [aRes, subRes] = await Promise.all([
                    api.get<any[]>('/api/assignments/faculty'), // Fetch all assignments for faculty
                    api.get<any[]>('/api/faculty/my-subjects') // Fetch subjects for assignment creation
                ]);
                if (aRes.success) setAssignments(aRes.data);
                if (subRes.success) setSubjectAssignments(subRes.data);
            } else if (user?.role === 'student') {
                const r = await api.get<any[]>('/api/assignments/student'); // Fetch student assignments
                if (r.success) setAssignments(r.data);
            }
        } catch (error) {
            console.error("Failed to load assignments:", error);
        }
    };

    const handleCreate = async () => {
        try {
            const assignmentObj = subjectAssignments.find(s => s.id === selectedAssignmentId);
            if (!assignmentObj) {
                console.error("Selected subject allocation not found.");
                return;
            }
            await api.post('/api/assignments', {
                ...form,
                due_date: new Date(form.due_date).toISOString(),
                subject_id: assignmentObj.subject_id,
                batch_id: assignmentObj.batch_id // Include batch_id
            });
            setShowForm(false);
            setForm({ title: '', description: '', due_date: '', max_score: 100 });
            setSelectedAssignmentId(''); // Reset selected subject allocation
            load();
        } catch (error) {
            console.error("Failed to create assignment:", error);
        }
    };

    const loadSubmissions = async (assignment: any) => {
        setSelectedAssignmentView(assignment);
        try {
            const r = await api.get<any[]>(`/api/assignments/${assignment.id}/submissions`);
            if (r.success) {
                setSubmissions(r.data);
                const marks: Record<string, number> = {};
                const feedback: Record<string, string> = {};
                r.data.forEach(sub => {
                    if (sub.score !== null) marks[sub.id] = sub.score; // Changed marks_obtained to score
                    if (sub.feedback) feedback[sub.id] = sub.feedback;
                });
                setGradingMarks(marks);
                setGradingFeedback(feedback);
            }
        } catch (error) {
            console.error("Failed to load submissions:", error);
        }
    };

    const handleGrade = async (submissionId: string, score: number, feedback: string) => {
        try {
            await api.patch(`/api/assignments/submissions/${submissionId}/grade`, { score, feedback });
            loadSubmissions(selectedAssignmentView);
        } catch { }
    };

    if (selectedAssignmentView) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <PageHeader
                    title={`Submissions: ${selectedAssignmentView.title}`}
                    description={`Grading submissions for ${selectedAssignmentView.batches?.name}`}
                    actions={<button onClick={() => setSelectedAssignmentView(null)} className="bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold">Back to Assignments</button>}
                />

                <div className="glass-card overflow-hidden mt-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Submitted At</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">File</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(s => (
                                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="p-4 text-sm font-medium">{s.users?.name || s.student_id?.substring(0, 8)}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{format(new Date(s.submitted_at), 'PPP p')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${s.status === 'graded' ? 'bg-success/10 text-success' :
                                            s.status === 'late' ? 'bg-destructive/10 text-destructive' :
                                                'bg-warning/10 text-warning'
                                            }`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {s.file_url ? <a href={s.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Work</a> : <span className="text-muted-foreground italic">No File</span>}
                                    </td>
                                    <td className="p-4">
                                        {s.status === 'graded' ? (
                                            <div className="text-sm font-mono font-bold">{s.score} / {selectedAssignmentView.max_score}</div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input type="number" max={selectedAssignmentView.max_score} className="form-input py-1 px-2 w-20 text-sm" placeholder="Score" id={`score-${s.id}`} />
                                                <button onClick={() => {
                                                    const input = document.getElementById(`score-${s.id}`) as HTMLInputElement;
                                                    if (input?.value) handleGrade(s.id, parseInt(input.value), '');
                                                }} className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded font-semibold">Grade</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No submissions yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PageHeader
                title="Class Assignments"
                description="Manage your assigned coursework"
                actions={<button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors"><Plus size={16} /> Create Assignment</button>}
            />

            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-6 mb-6 overflow-hidden">
                        <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">New Assignment</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Midterm Essay" /></div>
                            <div className="col-span-1 md:col-span-2"><label className="form-label">Description (Optional)</label><textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Assignment details..." rows={3} /></div>

                            <div>
                                <label className="form-label">Subject & Batch</label>
                                <select className="form-select" value={selectedAssignmentId} onChange={e => setSelectedAssignmentId(e.target.value)}>
                                    <option value="">Select subject context...</option>
                                    {subjectAssignments.map(s => (
                                        <option key={s.id} value={s.id}>{s.subjects?.name} ({s.batches?.code || 'No Batch'})</option>
                                    ))}
                                </select>
                            </div>

                            <div><label className="form-label">Due Date & Time</label><input type="datetime-local" className="form-input" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
                            <div><label className="form-label">Max Score</label><input type="number" className="form-input" value={form.max_score} onChange={e => setForm({ ...form, max_score: +e.target.value })} /></div>
                        </div>
                        <button onClick={handleCreate} disabled={!form.title || !form.due_date || !selectedAssignmentId} className="mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Publish Assignment</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignments.length === 0 ? (
                    <div className="glass-card p-12 col-span-full text-center text-muted-foreground"><FileText size={48} className="mx-auto mb-4 opacity-20" /><p>You haven't posted any assignments.</p></div>
                ) : assignments.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 border-l-4 border-l-primary flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-foreground leading-tight">{a.title}</h3>
                            <span className="badge-role badge-admin text-[10px] whitespace-nowrap ml-2">{a.subjects?.code}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4 flex-1 line-clamp-2">{a.description || 'No description provided.'}</p>
                        <div className="space-y-2 mt-auto pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={14} className="text-primary" /> Due: {format(new Date(a.due_date), 'MMM d, yyyy h:mm a')}</div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-medium bg-muted px-2 py-1 rounded">Max Score: {a.max_score}</span>
                                <button onClick={() => loadSubmissions(a)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">View Submissions</button>
                            </div>
                        </div>
                    </motion.div >
                ))}
            </div >
        </div >
    );
};


const StudentAssignments = () => {
    const [assignments, setAssignments] = useState<any[]>([]);

    useEffect(() => { load(); }, []);

    const load = async () => {
        const res = await api.get<any[]>('/api/assignments/student').catch(() => ({ success: false, data: [] } as any));
        if (res.success) setAssignments(res.data);
    };

    const handleSubmit = async (assignmentId: string, url: string) => {
        try {
            await api.post(`/api/assignments/${assignmentId}/submit`, { file_url: url });
            load();
        } catch { }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PageHeader title="My Assignments" description="Track your pending side-quests and submit work" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignments.length === 0 ? (
                    <div className="glass-card p-12 col-span-full text-center text-muted-foreground"><CalendarDays size={48} className="mx-auto mb-4 opacity-20" /><p>Hooray! No pending assignments.</p></div>
                ) : assignments.map((a, i) => {
                    const isSubmitted = !!a.submission;
                    const isGraded = a.submission?.status === 'graded';
                    const isLate = a.submission?.status === 'late';
                    const overdue = !isSubmitted && new Date() > new Date(a.due_date);

                    return (
                        <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className={`glass-card p-5 border-l-4 flex flex-col h-full ${isGraded ? 'border-l-success' : isSubmitted ? 'border-l-primary/50' : overdue ? 'border-l-destructive' : 'border-l-primary'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-foreground leading-tight">{a.title}</h3>
                                <span className={`px-2 py-1 flex items-center gap-1 rounded text-[10px] font-bold uppercase tracking-wider ${isGraded ? 'bg-success/20 text-success' : isSubmitted ? 'bg-primary/20 text-primary' : overdue ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                    {isGraded ? <CheckCircle2 size={12} /> : null}
                                    {isGraded ? 'Graded' : isSubmitted ? (isLate ? 'Done Late' : 'Submitted') : overdue ? 'Overdue' : 'Pending'}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4 mt-2">By {a.users?.name} · {a.subjects?.name}</p>
                            <div className="text-xs text-muted-foreground flex-1 mb-4">{a.description}</div>

                            <div className="space-y-3 mt-auto pt-4 border-t border-border">
                                <div className={`flex items-center gap-2 text-xs font-medium ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    <Clock size={14} className={overdue ? 'text-destructive' : 'text-primary'} />
                                    Due: {format(new Date(a.due_date), 'MMM d h:mm a')}
                                </div>

                                {isGraded ? (
                                    <div className="bg-success/5 border border-success/20 rounded-lg p-3 text-center">
                                        <div className="text-xs text-success font-semibold tracking-wide uppercase mb-1">Final Score</div>
                                        <div className="text-2xl font-black text-success font-mono">{a.submission.score} <span className="text-sm text-success/70 font-medium">/ {a.max_score}</span></div>
                                        {a.submission.feedback && <div className="text-xs text-success mt-2 italic">"{a.submission.feedback}"</div>}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="url"
                                            placeholder={isSubmitted ? "Update submission URL..." : "Paste your Google Drive link here..."}
                                            className="form-input py-2 px-3 text-xs flex-1"
                                            id={`submit-${a.id}`}
                                            defaultValue={a.submission?.file_url || ""}
                                        />
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById(`submit-${a.id}`) as HTMLInputElement;
                                                if (input?.value) handleSubmit(a.id, input.value);
                                            }}
                                            className="bg-primary text-primary-foreground text-xs px-3 py-2 rounded-md font-semibold hover:bg-secondary transition-colors whitespace-nowrap"
                                        >
                                            <Upload size={14} className="inline mr-1" />
                                            {isSubmitted ? 'Resubmit' : 'Turn In'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};


const Assignments = () => {
    const { user } = useAuth();

    if (!user) return null;

    if (user.role === 'faculty') return <FacultyAssignments />;
    if (user.role === 'student') return <StudentAssignments />;

    return <div className="p-8 text-center text-muted-foreground">Assignments are only available for Faculty and Students.</div>;
};

export default Assignments;
