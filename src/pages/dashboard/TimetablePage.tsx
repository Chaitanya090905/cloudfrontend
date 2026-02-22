import { useState, useEffect } from 'react';
import { Calendar, Zap, Plus, X } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TimetablePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetable, setTimetable] = useState<any>({ slots: [], grid: {} });
  const [periods, setPeriods] = useState<any[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [slotForm, setSlotForm] = useState({ subject_id: '', faculty_id: '', classroom_id: '', day_of_week: 1, period_number: 1, start_time: '09:00', end_time: '09:50', slot_type: 'lecture' });
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadSetup(); }, []);
  useEffect(() => { if (selectedBatch) loadTimetable(); }, [selectedBatch]);

  const loadSetup = async () => {
    const [b, p] = await Promise.all([
      api.get<any[]>('/api/institution/batches').catch(() => ({ success: false, data: [] } as any)),
      api.get<any[]>('/api/institution/period-templates').catch(() => ({ success: false, data: [] } as any)),
    ]);
    if (b.success) { setBatches(b.data); if (b.data.length) setSelectedBatch(b.data[0].id); }
    if (p.success) setPeriods(p.data.filter((pp: any) => !pp.is_break));
    if (isAdmin) {
      const [s, f, c] = await Promise.all([
        api.get<any[]>('/api/admin/subjects').catch(() => ({ success: false, data: [] } as any)),
        api.get<any[]>('/api/admin/users').catch(() => ({ success: false, data: [] } as any)),
        api.get<any[]>('/api/institution/classrooms').catch(() => ({ success: false, data: [] } as any)),
      ]);
      if (s.success) setSubjects(s.data);
      if (f.success) setFaculty(f.data.filter((u: any) => u.role === 'faculty' && u.is_active));
      if (c.success) setClassrooms(c.data);
    }
  };

  const loadTimetable = async () => {
    try { const r = await api.get<any>(`/api/institution/timetable/batch/${selectedBatch}`); if (r.success) setTimetable(r.data); } catch { }
  };

  const handleGenerate = async () => {
    setGenerating(true); setMessage('');
    try {
      const r = await api.post<any>('/api/institution/timetable/generate', { batch_id: selectedBatch, force_regenerate: true });
      if (r.success) { setMessage(`✓ Generated ${r.data.allocated_slots} slots`); loadTimetable(); }
    } catch (err: any) { setMessage(`✗ ${err.message}`); }
    setGenerating(false);
  };

  const handleAddSlot = async () => {
    try { await api.post('/api/institution/timetable/slots', { batch_id: selectedBatch, ...slotForm, day_of_week: +slotForm.day_of_week, period_number: +slotForm.period_number }); setShowManual(false); loadTimetable(); } catch (err: any) { setMessage(`✗ ${err.message}`); }
  };

  const handleDeleteSlot = async (id: string) => {
    try { await api.del(`/api/institution/timetable/slots/${id}`); loadTimetable(); } catch { }
  };

  const maxPeriod = periods.length ? Math.max(...periods.map(p => p.period_number)) : 6;
  const periodNums = Array.from({ length: maxPeriod }, (_, i) => i + 1);
  const periodMap: Record<number, any> = {};
  periods.forEach(p => { periodMap[p.period_number] = p; });

  const subjectColors = ['bg-info/10 border-info/30', 'bg-success/10 border-success/30', 'bg-warning/10 border-warning/30', 'bg-primary/10 border-primary/30', 'bg-destructive/10 border-destructive/30'];
  const subjectColorMap: Record<string, string> = {};
  let colorIdx = 0;
  timetable.slots?.forEach((s: any) => {
    const code = s.subjects?.code || s.subject_id;
    if (code && !subjectColorMap[code]) { subjectColorMap[code] = subjectColors[colorIdx % subjectColors.length]; colorIdx++; }
  });

  return (
    <div>
      <PageHeader title={isAdmin ? 'Timetable Manager' : 'My Timetable'} description={isAdmin ? 'Generate and manage class schedules' : 'Your weekly class schedule'} actions={isAdmin ? (
        <div className="flex gap-2">
          <button onClick={() => setShowManual(true)} className="bg-card border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-muted transition-colors"><Plus size={14} /> Add Slot</button>
          <button onClick={handleGenerate} disabled={generating || !selectedBatch} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50"><Zap size={16} className={generating ? 'animate-spin' : ''} /> {generating ? 'Generating...' : 'Auto-Generate'}</button>
        </div>
      ) : undefined} />

      {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}

      <div className="flex flex-wrap gap-2 mb-6">
        {batches.map(b => (
          <button key={b.id} onClick={() => setSelectedBatch(b.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedBatch === b.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
            {b.code}
          </button>
        ))}
        {!batches.length && <p className="text-sm text-muted-foreground">No batches found. Create batches first.</p>}
      </div>

      {showManual && isAdmin && (
        <div className="glass-card p-5 mb-6">
          <div className="flex justify-between mb-3"><h3 className="font-bold text-sm">Add Slot Manually</h3><button onClick={() => setShowManual(false)}><X size={16} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="form-label text-xs">Subject</label><select className="form-select text-xs" value={slotForm.subject_id} onChange={e => setSlotForm({ ...slotForm, subject_id: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></div>
            <div><label className="form-label text-xs">Faculty</label><select className="form-select text-xs" value={slotForm.faculty_id} onChange={e => setSlotForm({ ...slotForm, faculty_id: e.target.value })}><option value="">Select</option>{faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
            <div><label className="form-label text-xs">Room</label><select className="form-select text-xs" value={slotForm.classroom_id} onChange={e => setSlotForm({ ...slotForm, classroom_id: e.target.value })}><option value="">Any</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="form-label text-xs">Day</label><select className="form-select text-xs" value={slotForm.day_of_week} onChange={e => setSlotForm({ ...slotForm, day_of_week: +e.target.value })}>{[1, 2, 3, 4, 5, 6].map(d => <option key={d} value={d}>{DAYS[d - 1]}</option>)}</select></div>
            <div><label className="form-label text-xs">Period</label><select className="form-select text-xs" value={slotForm.period_number} onChange={e => setSlotForm({ ...slotForm, period_number: +e.target.value })}>{periodNums.map(p => <option key={p} value={p}>P{p}</option>)}</select></div>
            <div><label className="form-label text-xs">Start</label><input className="form-input text-xs" value={slotForm.start_time} onChange={e => setSlotForm({ ...slotForm, start_time: e.target.value })} /></div>
            <div><label className="form-label text-xs">End</label><input className="form-input text-xs" value={slotForm.end_time} onChange={e => setSlotForm({ ...slotForm, end_time: e.target.value })} /></div>
            <div className="flex items-end"><button onClick={handleAddSlot} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold w-full">Add</button></div>
          </div>
        </div>
      )}

      {selectedBatch && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-xs font-semibold text-muted-foreground uppercase w-20 sticky left-0 bg-muted/50">Day</th>
                {periodNums.map(p => <th key={p} className="p-3 text-xs font-semibold text-muted-foreground text-center"><div>P{p}</div>{periodMap[p] && <div className="text-[10px] font-normal opacity-70">{String(periodMap[p].start_time).slice(0, 5)}</div>}</th>)}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map(day => (
                <tr key={day} className="border-b border-border last:border-0">
                  <td className="p-3 text-sm font-semibold text-foreground sticky left-0 bg-card">{DAYS[day - 1]}</td>
                  {periodNums.map(p => {
                    const slot = timetable.grid?.[day]?.[p];
                    return (
                      <td key={p} className="p-2 text-center relative">
                        {slot ? (
                          <div className={`p-2 rounded-lg border text-xs ${subjectColorMap[slot.subjects?.code || slot.subject_id] || 'bg-muted border-border'}`}>
                            <div className="font-bold text-foreground">{slot.subjects?.code || '?'}</div>
                            <div className="text-muted-foreground">{slot.users?.name || '?'}</div>
                            {slot.classrooms?.code && <div className="text-muted-foreground text-[10px]">{slot.classrooms.code}</div>}
                            {isAdmin && <button onClick={() => handleDeleteSlot(slot.id)} className="absolute top-1 right-1 text-destructive/50 hover:text-destructive text-[10px] font-bold">✕</button>}
                          </div>
                        ) : (
                          <div className="p-2 text-muted-foreground/30 text-xs">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {timetable.slots?.length === 0 && selectedBatch && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No timetable generated yet.</p>
          {isAdmin && <p className="text-xs mt-1">Click &quot;Auto-Generate&quot; or add slots manually.</p>}
        </div>
      )}
    </div>
  );
};
export default TimetablePage;
