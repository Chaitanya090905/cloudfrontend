import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const MyMarks = () => {
  const [legacyMarks, setLegacyMarks] = useState<any[]>([]);
  const [dynamicExams, setDynamicExams] = useState<any[]>([]);
  const [assignmentsData, setAssignmentsData] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        api.get<any>('/api/student/marks'),
        api.get<any[]>('/api/assignments/student')
      ]);

      if (mRes.success && mRes.data) {
        setLegacyMarks(mRes.data.legacy_marks || []);
        setDynamicExams(mRes.data.dynamic_exams || []);
      }

      if (aRes.success && aRes.data) {
        setAssignmentsData(aRes.data);
      }
    } catch { }
  };

  // Group marks by subject
  const subjectsMap: Record<string, any> = {};

  // Process legacy marks
  legacyMarks.forEach(lm => {
    if (!lm.subjects) return;
    const subId = lm.subject_id;
    if (!subjectsMap[subId]) {
      subjectsMap[subId] = {
        id: subId,
        name: lm.subjects.name,
        code: lm.subjects.code,
        legacy: lm,
        exams: []
      };
    } else {
      subjectsMap[subId].legacy = lm;
    }
  });

  // Process dynamic exams
  dynamicExams.forEach(de => {
    if (!de.subjects) return;
    const subId = de.subject_id;
    if (!subjectsMap[subId]) {
      subjectsMap[subId] = {
        id: subId,
        name: de.subjects.name,
        code: de.subjects.code,
        legacy: null,
        exams: [de],
        assignments: []
      };
    } else {
      subjectsMap[subId].exams.push(de);
    }
  });

  // Process assignments
  assignmentsData.forEach(a => {
    if (!a.subjects) return;
    const subId = a.subject_id;
    // Only show graded assignments in "Marks" view
    if (a.submission?.status !== 'graded') return;

    if (!subjectsMap[subId]) {
      subjectsMap[subId] = {
        id: subId,
        name: a.subjects.name,
        code: a.subjects.code,
        legacy: null,
        exams: [],
        assignments: [a]
      };
    } else {
      if (!subjectsMap[subId].assignments) subjectsMap[subId].assignments = [];
      subjectsMap[subId].assignments.push(a);
    }
  });

  const groupedSubjects = Object.values(subjectsMap);

  return (
    <div>
      <PageHeader title="My Performance" description="View all internal marks, FATs, and external exams" />

      {groupedSubjects.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground flex flex-col items-center">
          <GraduationCap size={48} className="mb-4 opacity-20" />
          <p>No assessment records available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupedSubjects.map(sub => (
            <div key={sub.id} className="glass-card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg font-heading line-clamp-1" title={sub.name}>{sub.name}</h3>
                    <p className="text-sm font-mono text-muted-foreground">{sub.code}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                {sub.legacy && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block mb-0.5">Legacy Internal</span>
                      <span className="font-bold">
                        {sub.legacy.marks_obtained} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${sub.legacy.marks_obtained >= 50 ? 'text-success' : 'text-destructive'}`}>
                      {Math.round((sub.legacy.marks_obtained / 100) * 100)}%
                    </span>
                  </div>
                )}

                {sub.exams.map((ex: any) => {
                  const pct = Math.round((Number(ex.marks) / ex.exams?.max_marks) * 100);
                  return (
                    <div key={ex.id} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground block mb-0.5 flex items-center gap-1.5">
                          {ex.exams?.name}
                          <span className={`badge-role text-[9px] px-1.5 py-0 ${ex.exams?.exam_type === 'external' ? 'badge-admin' : 'badge-faculty'}`}>
                            {ex.exams?.exam_type}
                          </span>
                        </span>
                        <span className="font-bold">
                          {ex.marks} <span className="text-xs text-muted-foreground font-normal">/ {ex.exams?.max_marks}</span>
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${pct >= 50 ? 'text-success' : 'text-destructive'}`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}

                {sub.assignments?.map((a: any) => {
                  const pct = Math.round((Number(a.submission.score) / a.max_score) * 100);
                  return (
                    <div key={a.id} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground block mb-0.5 flex items-center gap-1.5">
                          {a.title}
                          <span className="badge-role badge-faculty text-[9px] px-1.5 py-0">Assignment</span>
                        </span>
                        <span className="font-bold">
                          {a.submission.score} <span className="text-xs text-muted-foreground font-normal">/ {a.max_score}</span>
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${pct >= 50 ? 'text-success' : 'text-destructive'}`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyMarks;
