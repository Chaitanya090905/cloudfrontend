import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, X } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const Batches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', program_id: '', semester: 1, max_students: 60 });

  // View Students logic
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedFA, setSelectedFA] = useState<string>('');
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [selectedNewStudent, setSelectedNewStudent] = useState<string>('');

  // Subject Allocations logic
  const [batchSubjects, setBatchSubjects] = useState<any[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]);
  const [selectedFacultyForSubject, setSelectedFacultyForSubject] = useState<Record<string, string>>({});

  // Inline Subject Creation State
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [allInstitutionSubjects, setAllInstitutionSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Filters for Catalog
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [selectedCatalogSubject, setSelectedCatalogSubject] = useState<any>(null);
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Exams Configuration State
  const [batchExams, setBatchExams] = useState<any[]>([]);
  const [showAddExam, setShowAddExam] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', exam_type: 'internal', max_marks: 100 });

  useEffect(() => { load(); }, []);
  const load = async () => {
    const [b, p, d, allSub] = await Promise.all([
      api.get<any[]>('/api/institution/batches').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/admin/programs').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/admin/departments').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/admin/subjects').catch(() => ({ success: false, data: [] } as any))
    ]);
    if (b.success) setBatches(b.data);
    if (p.success) setPrograms(p.data);
    if (d.success) setDepartments(d.data);
    if (allSub.success) setAllInstitutionSubjects(allSub.data);
  };
  const handleCreate = async () => {
    try { await api.post('/api/institution/batches', form); setShowForm(false); setForm({ name: '', code: '', program_id: '', semester: 1, max_students: 60 }); load(); } catch { }
  };

  const loadBatchStudents = async (batch: any) => {
    setSelectedBatch(batch);
    const [s, f, subR, assignR, examsR] = await Promise.all([
      api.get<any[]>(`/api/institution/batches/${batch.id}/students`).catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/admin/users').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>(`/api/institution/batches/${batch.id}/subjects`).catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>(`/api/institution/faculty-assignments`).catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>(`/api/admin/assessments/exams/${batch.id}`).catch(() => ({ success: false, data: [] } as any))
    ]);
    if (s.success) setBatchStudents(s.data);
    if (f.success) {
      setFacultyList(f.data.filter((u: any) => u.role === 'faculty'));
      const enrolledIds = s.success ? s.data.map((x: any) => x.student_id) : [];
      setUnassignedStudents(f.data.filter((u: any) => u.role === 'student' && !enrolledIds.includes(u.id)));
    }
    if (subR.success) setBatchSubjects(subR.data);

    if (assignR.success) {
      const batchAssignments = assignR.data.filter((a: any) => a.batch_id === batch.id);
      setSubjectAssignments(batchAssignments);
    }

    if (examsR.success) {
      setBatchExams(examsR.data);
    }

    setSelectedStudentIds([]);
    setSelectedFA('');
    setSelectedNewStudent('');
    setSelectedFacultyForSubject({});
    setShowAddExam(false);
  };

  const handleAddStudent = async () => {
    if (!selectedNewStudent) return;
    try {
      await api.post(`/api/institution/batches/${selectedBatch.id}/students/bulk`, {
        students: [{ student_id: selectedNewStudent, roll_number: '' }]
      });
      loadBatchStudents(selectedBatch);
    } catch { }
  };

  const handleAssignFA = async () => {
    if (!selectedFA || selectedStudentIds.length === 0) return;
    try {
      await api.patch(`/api/institution/batches/${selectedBatch.id}/students/fa`, {
        faculty_advisor_id: selectedFA,
        student_ids: selectedStudentIds
      });
      loadBatchStudents(selectedBatch);
    } catch { }
  };

  const handleAssignSubject = async (subjectId: string) => {
    const facultyId = selectedFacultyForSubject[subjectId];
    if (!facultyId) return;
    try {
      await api.post('/api/institution/faculty-assignments', {
        faculty_id: facultyId,
        subject_id: subjectId,
        batch_id: selectedBatch.id
      });
      loadBatchStudents(selectedBatch);
    } catch { }
  };

  const handleCreateSubject = async () => {
    if (!selectedCatalogSubject) return;
    setSubjectLoading(true);
    try {
      await api.post('/api/admin/subjects', {
        name: selectedCatalogSubject.name,
        code: `${selectedCatalogSubject.code}-${selectedBatch.code}`,
        max_marks: selectedCatalogSubject.max_marks || 100,
        semester: selectedBatch.semester,
        program_id: selectedBatch.program_id
      });
      setShowAddSubject(false);
      setSelectedCatalogSubject(null);
      loadBatchStudents(selectedBatch); // reload the subjects pane
    } catch (err) {
      console.error("Failed to add subject", err);
    }
    setSubjectLoading(false);
  };

  const selectedProgram = programs.find(p => p.id === form.program_id);
  const maxSemesters = selectedProgram ? (selectedProgram.duration_years || 4) * 2 : 8;

  const handleCreateExam = async () => {
    if (!examForm.name) return;
    try {
      await api.post('/api/admin/assessments/exams', { ...examForm, batch_id: selectedBatch.id });
      setExamForm({ name: '', exam_type: 'internal', max_marks: 100 });
      setShowAddExam(false);
      loadBatchStudents(selectedBatch);
    } catch { }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await api.del(`/api/admin/assessments/exams/${examId}`);
      loadBatchStudents(selectedBatch);
    } catch { }
  };

  if (selectedBatch) {
    return (
      <div>
        <PageHeader
          title={`${selectedBatch.name} Students`}
          description={`Manage students and FAs for ${selectedBatch.code}`}
          actions={<button onClick={() => setSelectedBatch(null)} className="bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold">Back to Batches</button>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 font-heading">Assign Faculty Advisor</h3>
            <div className="flex flex-col gap-3">
              <label className="form-label">Select Faculty</label>
              <select className="form-select" value={selectedFA} onChange={e => setSelectedFA(e.target.value)}>
                <option value="">Select FA...</option>
                {facultyList.map(f => <option key={f.id} value={f.id}>{f.name} ({f.email})</option>)}
              </select>
              <button
                onClick={handleAssignFA}
                disabled={!selectedFA || selectedStudentIds.length === 0}
                className="bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 mt-2"
              >
                Assign FA to Selected ({selectedStudentIds.length})
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 font-heading">Enrol Student manually</h3>
            <div className="flex flex-col gap-3">
              <label className="form-label">Select unassigned Student</label>
              <select className="form-select" value={selectedNewStudent} onChange={e => setSelectedNewStudent(e.target.value)}>
                <option value="">Select student to enrol...</option>
                {unassignedStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
              <button
                onClick={handleAddStudent}
                disabled={!selectedNewStudent}
                className="bg-secondary text-secondary-foreground py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 mt-2"
              >
                Add Student to Batch
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 w-12"><input type="checkbox" onChange={e => setSelectedStudentIds(e.target.checked ? batchStudents.map(s => s.student_id) : [])} checked={selectedStudentIds.length === batchStudents.length && batchStudents.length > 0} className="rounded border-input text-primary focus:ring-primary" /></th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Roll No</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Faculty Advisor</th>
              </tr>
            </thead>
            <tbody>
              {batchStudents.map(s => (
                <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4"><input type="checkbox" checked={selectedStudentIds.includes(s.student_id)} onChange={e => {
                    if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, s.student_id]);
                    else setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.student_id));
                  }} className="rounded border-input text-primary focus:ring-primary" /></td>
                  <td className="p-4 text-sm font-mono">{s.roll_number || '—'}</td>
                  <td className="p-4 text-sm font-medium">{s.students?.name || '—'}</td>
                  <td className="p-4 text-sm">
                    {s.faculty_advisors?.name ?
                      <span className="badge-role badge-faculty text-[10px]">{s.faculty_advisors.name}</span> :
                      <span className="text-muted-foreground italic text-xs">Unassigned</span>
                    }
                  </td>
                </tr>
              ))}
              {batchStudents.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No students in this batch</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="glass-card overflow-hidden mb-6">
          <div className="p-6 border-b border-border flex justify-between items-center bg-card">
            <div>
              <h3 className="font-bold font-heading">Subject Allocations</h3>
              <p className="text-sm text-muted-foreground">Map specific faculties to teach subjects for this batch.</p>
            </div>
            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Subject
            </button>
          </div>

          {showAddSubject && (
            <div className="p-5 bg-muted/30 border-b border-border">
              <h4 className="text-sm font-semibold mb-3">Add Subject for Semester {selectedBatch.semester}</h4>
              <p className="text-xs text-muted-foreground mb-4">Select an existing course from the catalog to add to this batch.</p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end mb-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Filter Department</label>
                  <select className="form-select text-sm py-1.5" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Filter Semester</label>
                  <select className="form-select text-sm py-1.5" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Select Course from Catalog</label>
                    <select className="form-select text-sm py-1.5" onChange={e => {
                      const sub = allInstitutionSubjects.find(s => s.id === e.target.value);
                      setSelectedCatalogSubject(sub);
                    }}>
                      <option value="">Select a course...</option>
                      {allInstitutionSubjects
                        .filter(s => {
                          if (!filterDept && !filterSem) return true;
                          const prog = programs.find((p: any) => p.id === s.program_id);
                          if (filterDept && prog?.department_id !== filterDept) return false;
                          if (filterSem && s.semester.toString() !== filterSem) return false;
                          return true;
                        })
                        .map(s => <option key={s.id} value={s.id}>{s.name} ({s.code}) - Sem {s.semester}</option>)
                      }
                    </select>
                  </div>
                  <button
                    onClick={handleCreateSubject}
                    disabled={!selectedCatalogSubject || subjectLoading}
                    className="bg-primary text-primary-foreground px-4 py-1.5 rounded font-semibold text-sm disabled:opacity-50 h-[34px]"
                  >
                    {subjectLoading ? 'Adding...' : 'Add to Batch'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subject Code</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Subject Name</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Assigned Faculty</th>
                <th className="text-left p-4 w-64 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {batchSubjects.map(sub => {
                const assignedFaculty = subjectAssignments.find(a => a.subject_id === sub.id)?.faculties?.name;
                return (
                  <tr key={sub.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-mono">{sub.code}</td>
                    <td className="p-4 text-sm font-medium">{sub.name}</td>
                    <td className="p-4 text-sm">
                      {assignedFaculty ? <span className="badge-role badge-admin text-[10px]">{assignedFaculty}</span> : <span className="text-muted-foreground italic text-xs">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      {assignedFaculty ? (
                        <span className="text-xs text-muted-foreground italic px-2">Assigned</span>
                      ) : (
                        <div className="flex gap-2">
                          <select
                            className="form-select text-xs py-1 px-2"
                            value={selectedFacultyForSubject[sub.id] || ''}
                            onChange={e => setSelectedFacultyForSubject(prev => ({ ...prev, [sub.id]: e.target.value }))}
                          >
                            <option value="">Select Faculty...</option>
                            {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                          <button
                            onClick={() => handleAssignSubject(sub.id)}
                            disabled={!selectedFacultyForSubject[sub.id]}
                            className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded font-semibold disabled:opacity-50"
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {batchSubjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span>No subjects found for semester {selectedBatch.semester}</span>
                      <button
                        onClick={() => setShowAddSubject(true)}
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        Add a subject
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="glass-card overflow-hidden mt-6 mb-6">
          <div className="p-6 border-b border-border flex justify-between items-center bg-card">
            <div>
              <h3 className="font-bold font-heading">Configure Batch Exams</h3>
              <p className="text-sm text-muted-foreground">Setup internal (FAT) and external exams.</p>
            </div>
            <button
              onClick={() => setShowAddExam(!showAddExam)}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Exam Form
            </button>
          </div>

          {showAddExam && (
            <div className="p-5 bg-muted/30 border-b border-border">
              <h4 className="text-sm font-semibold mb-3">Add New Exam format for {selectedBatch.code}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end mb-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Exam Name</label>
                  <input type="text" className="form-input text-sm py-1.5" placeholder="e.g. FAT 1" value={examForm.name} onChange={e => setExamForm({ ...examForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Max Marks</label>
                  <input type="number" className="form-input text-sm py-1.5" value={examForm.max_marks} onChange={e => setExamForm({ ...examForm, max_marks: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Grading Type</label>
                  <select className="form-select text-sm py-1.5" value={examForm.exam_type} onChange={e => setExamForm({ ...examForm, exam_type: e.target.value })}>
                    <option value="internal">Internal (Faculty Grades)</option>
                    <option value="external">External (Admin Grades)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateExam} disabled={!examForm.name} className="bg-primary text-primary-foreground text-sm px-4 py-1.5 rounded-lg flex-1 disabled:opacity-50">Save</button>
                  <button onClick={() => setShowAddExam(false)} className="bg-muted text-foreground text-sm px-4 py-1.5 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-border">
            {batchExams.map(ex => (
              <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{ex.name}</span>
                  <span className={`badge-role text-[10px] ${ex.exam_type === 'external' ? 'badge-admin' : 'badge-faculty'}`}>
                    {ex.exam_type}
                  </span>
                  <span className="text-xs text-muted-foreground">{ex.max_marks} Marks</span>
                </div>
                <button title="Delete Exam Format" onClick={() => handleDeleteExam(ex.id)} className="text-destructive/70 hover:text-destructive p-1 rounded transition-colors"><X size={16} /></button>
              </div>
            ))}
            {batchExams.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm italic">
                No exams configured for this batch yet. Click "Add Exam Form" to begin.
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Batches & Sections" description="Manage student batches" actions={
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors"><Plus size={16} /> Create Batch</button>
      } />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">New Batch</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Section A" /></div>
            <div><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="CSE-A-2024" /></div>
            <div><label className="form-label">Program</label><select className="form-select" value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}><option value="">Select</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}</select></div>
            <div>
              <label className="form-label">Semester</label>
              <select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: +e.target.value })} disabled={!form.program_id}>
                {!form.program_id && <option value="">Select Program First</option>}
                {form.program_id && [...Array(maxSemesters)].map((_, i) => <option key={i + 1} value={i + 1}>Semester {i + 1}</option>)}
              </select>
            </div>
            <div><label className="form-label">Max Students</label><input type="number" className="form-input" value={form.max_students} onChange={e => setForm({ ...form, max_students: +e.target.value })} /></div>
          </div>
          <button onClick={handleCreate} disabled={!form.name || !form.code || !form.program_id || !form.semester} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Create</button>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {batches.length === 0 ? (
          <div className="glass-card p-8 col-span-full text-center text-muted-foreground"><Layers size={32} className="mx-auto mb-2 opacity-30" /><p>No batches yet</p></div>
        ) : batches.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex justify-between"><div><h3 className="font-bold text-foreground">{b.name}</h3><p className="text-xs text-muted-foreground font-mono">{b.code}</p></div><span className="badge-role badge-admin text-[10px]">{b.programs?.name || ''}</span></div>
            <div className="mt-3 text-xs text-muted-foreground space-y-1 mb-4"><div>Semester: {b.semester || '—'}</div><div>Max: {b.max_students} students</div></div>
            <button onClick={() => loadBatchStudents(b)} className="w-full bg-secondary text-secondary-foreground py-2 rounded-md text-xs font-semibold hover:bg-muted focus:ring-2 focus:ring-ring focus:outline-none transition-colors">View Students & Assign FA</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Batches;
