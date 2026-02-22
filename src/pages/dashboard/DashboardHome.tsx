import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '@/context/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import { Building2, Users, GraduationCap, BarChart3, Zap, AlertTriangle, CreditCard, Loader2 } from 'lucide-react';
import { api } from '@/lib/utils';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        const [users, depts, bill] = await Promise.all([
          api.get<any[]>('/api/admin/users').catch(() => ({ success: false, data: [] } as any)),
          api.get<any[]>('/api/admin/departments').catch(() => ({ success: false, data: [] } as any)),
          api.get<any>('/api/billing/usage').catch(() => ({ success: false, data: null } as any)),
        ]);
        const u = users.success ? users.data : [];
        setStats({
          students: u.filter((x: any) => x.role === 'student').length,
          faculty: u.filter((x: any) => x.role === 'faculty').length,
          departments: depts.success ? depts.data.length : 0,
        });
        if (bill.success) setUsage(bill.data);
      } else if (user?.role === 'hod') {
        const r = await api.get<any>('/api/hod/department/stats').catch(() => ({ success: false, data: {} } as any));
        if (r.success) setStats(r.data);
      } else if (user?.role === 'faculty') {
        const r = await api.get<any>('/api/faculty/dashboard-stats').catch(() => ({ success: false, data: {} } as any));
        if (r.success) setStats(r.data);
      }
    } catch { }
    setLoading(false);
  };

  if (!user) return null;

  const getCards = () => {
    if (loading || !stats) return [];
    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return [
          { label: 'Total Students', value: stats.students || 0, icon: <GraduationCap size={22} />, color: 'bg-info/10 text-info' },
          { label: 'Faculty Members', value: stats.faculty || 0, icon: <Users size={22} />, color: 'bg-success/10 text-success' },
          { label: 'Departments', value: stats.departments || 0, icon: <Building2 size={22} />, color: 'bg-warning/10 text-warning' },
        ];
      case 'hod':
        return [
          { label: 'Dept Students', value: stats.total_students || 0, icon: <GraduationCap size={22} />, color: 'bg-info/10 text-info' },
          { label: 'Dept Faculty', value: stats.total_faculty || 0, icon: <Users size={22} />, color: 'bg-success/10 text-success' },
          { label: 'Defaulters (<75%)', value: stats.defaulters?.length || 0, icon: <BarChart3 size={22} />, color: 'bg-destructive/10 text-destructive' },
          { label: 'Pending Approvals', value: stats.pending_marks || 0, icon: <AlertTriangle size={22} />, color: 'bg-warning/10 text-warning' },
        ];
      case 'faculty':
        return [
          { label: 'My Subjects', value: stats.subjects || 0, icon: <Building2 size={22} />, color: 'bg-info/10 text-info' },
          { label: 'FA Students', value: stats.fa_students || 0, icon: <Users size={22} />, color: 'bg-success/10 text-success' },
          { label: 'Active Assignments', value: stats.active_assignments || 0, icon: <GraduationCap size={22} />, color: 'bg-primary/10 text-primary' },
          { label: 'Pending ODs', value: stats.pending_od || 0, icon: <AlertTriangle size={22} />, color: 'bg-warning/10 text-warning' },
        ];
      default:
        return [{ label: 'Welcome', value: user.name?.split(' ')[0] || '—', icon: <Users size={22} />, color: 'bg-primary/10 text-primary' }];
    }
  };

  const cards = getCards();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground font-heading">Welcome back, {user.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{ROLE_LABELS[user.role]} Dashboard</p>
      </div>

      {/* Trial Expired Banner */}
      {usage?.trial_expired && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-destructive flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-destructive text-sm">Trial Expired – Upgrade Required</p>
              <p className="text-xs text-destructive/70">Your 14-day free trial has ended. Upgrade to continue using EduNexis.</p>
            </div>
          </div>
          <Link to="/dashboard/billing" className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 flex-shrink-0">
            <Zap size={14} /> Upgrade Now
          </Link>
        </div>
      )}

      {/* Trial Active Banner */}
      {usage && !usage.trial_expired && usage.trial_days_remaining !== null && usage.plan === 'trial' && (
        <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="text-warning flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-warning text-sm">Free Trial — {usage.trial_days_remaining} days remaining</p>
              <p className="text-xs text-warning/70">You're on the free trial with up to {usage.student_limit} students.</p>
            </div>
          </div>
          <Link to="/dashboard/billing" className="bg-warning text-warning-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 flex-shrink-0">
            <Zap size={14} /> View Plans
          </Link>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cards.map((c, i) => (
              <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} color={c.color} delay={i * 0.05} />
            ))}
          </div>

          {/* Student Usage Meter */}
          {usage && (user.role === 'admin' || user.role === 'super_admin') && (
            <div className="glass-card p-6 mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-foreground font-heading text-sm">Student Usage</h3>
                <span className="text-xs text-muted-foreground">{usage.active_students} / {usage.student_limit} students</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${usage.usage_percentage > 90 ? 'bg-destructive' : usage.usage_percentage > 70 ? 'bg-warning' : 'bg-success'
                    }`}
                  style={{ width: `${Math.min(usage.usage_percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-xs font-semibold ${usage.usage_percentage > 90 ? 'text-destructive' : 'text-muted-foreground'}`}>{usage.usage_percentage}% utilized</span>
                <Link to="/dashboard/billing" className="text-xs text-primary font-semibold hover:underline">Manage Plan →</Link>
              </div>
            </div>
          )}

          <div className="glass-card p-8">
            <h3 className="font-bold text-foreground mb-3 font-heading">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Navigate using the sidebar to access your role-specific tools and workflows.</p>
          </div>
        </>
      )}
    </div>
  );
};
export default DashboardHome;
