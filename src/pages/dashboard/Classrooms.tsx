import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DoorOpen, Plus, X } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const ROOM_TYPES = ['lecture', 'lab', 'seminar', 'auditorium'];

const Classrooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', building: '', floor: '', capacity: 60, room_type: 'lecture' });

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await api.get<any[]>('/api/institution/classrooms'); if (r.success) setRooms(r.data); } catch { } };
  const handleCreate = async () => {
    try { await api.post('/api/institution/classrooms', form); setShowForm(false); setForm({ name: '', code: '', building: '', floor: '', capacity: 60, room_type: 'lecture' }); load(); } catch { }
  };

  return (
    <div>
      <PageHeader title="Classrooms & Labs" description="Manage rooms for timetable scheduling" actions={
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors"><Plus size={16} /> Add Room</button>
      } />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4"><h3 className="font-bold font-heading">New Room</h3><button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Room 101" /></div>
            <div><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="R101" /></div>
            <div><label className="form-label">Type</label><select className="form-select" value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}>{ROOM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></div>
            <div><label className="form-label">Building</label><input className="form-input" value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} placeholder="Main Block" /></div>
            <div><label className="form-label">Floor</label><input className="form-input" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder="Ground" /></div>
            <div><label className="form-label">Capacity</label><input type="number" className="form-input" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} /></div>
          </div>
          <button onClick={handleCreate} disabled={!form.name || !form.code} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">Add Room</button>
        </motion.div>
      )}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Room</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Code</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Type</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Building</th>
            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Capacity</th>
          </tr></thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><DoorOpen size={32} className="mx-auto mb-2 opacity-30" />No rooms yet</td></tr>
            ) : rooms.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 text-sm font-medium">{r.name}</td>
                <td className="p-4 text-sm font-mono text-muted-foreground">{r.code}</td>
                <td className="p-4"><span className="badge-role badge-admin text-[10px]">{r.room_type}</span></td>
                <td className="p-4 text-sm text-muted-foreground">{r.building || '—'}</td>
                <td className="p-4 text-sm">{r.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Classrooms;
