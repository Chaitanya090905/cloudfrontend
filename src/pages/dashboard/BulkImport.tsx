import { useState, useEffect } from 'react';
import { Upload, Download, Users, GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const BulkImport = () => {
  const [tab, setTab] = useState<'students' | 'faculty'>('students');
  const [depts, setDepts] = useState<any[]>([]);
  const [csv, setCsv] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get<any[]>('/api/admin/departments').then(r => { if (r.success) setDepts(r.data); }).catch(() => { }); }, []);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    });
  };

  const handleImport = async () => {
    setLoading(true); setResult(null);
    const parsed = parseCSV(csv);
    if (!parsed.length) { setResult({ error: 'No valid rows found' }); setLoading(false); return; }
    try {
      const res = tab === 'students'
        ? await api.post('/api/institution/bulk/students', { students: parsed })
        : await api.post('/api/institution/bulk/faculty', { faculty: parsed });
      setResult(res.data);
    } catch (err: any) { setResult({ error: err.message }); }
    setLoading(false);
  };

  const studentTpl = 'email,name,department_id,batch_code,roll_number\njohn@college.edu,John Doe,,CSE-A-2024,CS001\njane@college.edu,Jane Smith,,CSE-A-2024,CS002';
  const facultyTpl = 'email,name,department_id,max_hours_per_week\ndr.smith@college.edu,Dr. Smith,,20\nprof.jones@college.edu,Prof. Jones,,18';

  return (
    <div>
      <PageHeader title="Bulk Import" description="Import students and faculty from CSV" />
      <div className="flex gap-0 mb-6 border-b-2 border-border">
        {(['students', 'faculty'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setResult(null); setCsv(''); }}
            className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 -mb-[2px] ${tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'students' ? <GraduationCap size={16} /> : <Users size={16} />} {t === 'students' ? 'Students' : 'Faculty'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="glass-card p-5 mb-4">
            <h3 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2"><Download size={14} /> CSV Template</h3>
            <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-auto whitespace-pre border border-border">{tab === 'students' ? studentTpl : facultyTpl}</pre>
            <button onClick={() => setCsv(tab === 'students' ? studentTpl : facultyTpl)} className="mt-3 text-xs font-semibold text-primary hover:underline">Use Template</button>
          </div>
          {depts.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Department IDs</h4>
              {depts.map(d => <div key={d.id} className="text-xs mb-1"><code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{d.id.slice(0, 8)}</code> — {d.name}</div>)}
            </div>
          )}
        </div>
        <div>
          <div className="glass-card p-5">
            <h3 className="font-bold text-sm text-foreground mb-3">Paste CSV Data</h3>
            <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={10}
              className="form-input font-mono text-xs resize-y w-full" placeholder={`Paste CSV here...\n\n${tab === 'students' ? 'email,name,department_id,batch_code,roll_number' : 'email,name,department_id,max_hours_per_week'}`} />
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{csv ? `${parseCSV(csv).length} rows` : 'No data'}</span>
              <button onClick={handleImport} disabled={!csv.trim() || loading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50">
                <Upload size={14} /> {loading ? 'Importing...' : `Import ${tab === 'students' ? 'Students' : 'Faculty'}`}
              </button>
            </div>
          </div>
          {result && (
            <div className="glass-card p-4 mt-4">
              {result.error ? (
                <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle size={16} /> {result.error}</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-success text-sm font-semibold mb-2"><CheckCircle size={16} /> {result.created} imported</div>
                  {result.errors?.length > 0 && (
                    <div className="mt-2">{result.errors.map((e: any, i: number) => <div key={i} className="text-xs text-destructive">{e.email}: {e.error}</div>)}</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BulkImport;
