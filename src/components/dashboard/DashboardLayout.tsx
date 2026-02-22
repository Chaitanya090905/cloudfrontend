import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, ROLE_LABELS, UserRole } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Building2, BookOpen, ClipboardCheck,
  FileCheck, BarChart3, CalendarCheck, LogOut, Menu,
  FileText, Layers, DoorOpen, Upload, Clock, Calendar,
  Workflow, GraduationCap, ChevronLeft, CreditCard,
} from 'lucide-react';
import { ReactNode } from 'react';
import logo from '@/assets/edunexis-logo.png';

interface NavItem { label: string; href: string; icon: ReactNode; }

const ROLE_NAV: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Institutions', href: '/dashboard/tenants', icon: <Building2 size={18} /> },
    { label: 'All Users', href: '/dashboard/users', icon: <Users size={18} /> },
    { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard size={18} /> },
    { label: 'End Sem Results', href: '/dashboard/end-semester-results', icon: <ClipboardCheck size={18} /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Users', href: '/dashboard/users', icon: <Users size={18} /> },
    { label: 'Departments', href: '/dashboard/departments', icon: <Building2 size={18} /> },
    { label: 'Programs', href: '/dashboard/programs', icon: <BookOpen size={18} /> },
    { label: 'Subjects', href: '/dashboard/subjects', icon: <FileText size={18} /> },
    { label: 'Batches', href: '/dashboard/batches', icon: <Layers size={18} /> },
    { label: 'Classrooms', href: '/dashboard/classrooms', icon: <DoorOpen size={18} /> },
    { label: 'Bulk Import', href: '/dashboard/bulk-import', icon: <Upload size={18} /> },
    { label: 'Faculty Workload', href: '/dashboard/faculty-workload', icon: <Clock size={18} /> },
    { label: 'Timetable', href: '/dashboard/timetable', icon: <Calendar size={18} /> },
    { label: 'Marks Lock', href: '/dashboard/marks-lock', icon: <ClipboardCheck size={18} /> },
    { label: 'Compliance', href: '/dashboard/compliance', icon: <FileCheck size={18} /> },
    { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard size={18} /> },
    { label: 'End Sem Results', href: '/dashboard/end-semester-results', icon: <ClipboardCheck size={18} /> },
  ],
  hod: [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Marks Approval', href: '/dashboard/marks-approval', icon: <ClipboardCheck size={18} /> },
    { label: 'OD Approval', href: '/dashboard/od-approval', icon: <Workflow size={18} /> },
    { label: 'Dept Stats', href: '/dashboard/dept-stats', icon: <BarChart3 size={18} /> },
  ],
  faculty: [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Attendance', href: '/dashboard/attendance', icon: <CalendarCheck size={18} /> },
    { label: 'Marks Entry', href: '/dashboard/marks-entry', icon: <ClipboardCheck size={18} /> },
    { label: 'Assignments', href: '/dashboard/assignments', icon: <FileText size={18} /> },
    { label: 'OD Requests', href: '/dashboard/od-requests', icon: <Workflow size={18} /> },
    { label: 'My Timetable', href: '/dashboard/timetable', icon: <Calendar size={18} /> },
  ],
  student: [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Attendance', href: '/dashboard/my-attendance', icon: <CalendarCheck size={18} /> },
    { label: 'My Marks', href: '/dashboard/my-marks', icon: <GraduationCap size={18} /> },
    { label: 'Assignments', href: '/dashboard/assignments', icon: <FileText size={18} /> },
    { label: 'Apply OD', href: '/dashboard/apply-od', icon: <Workflow size={18} /> },
    { label: 'My Timetable', href: '/dashboard/timetable', icon: <Calendar size={18} /> },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const navItems = ROLE_NAV[user.role] || [];

  return (
    <div className="flex h-screen bg-background w-full">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2 }}
        className="bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0 overflow-hidden"
      >
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border h-16">
          {collapsed ? (
            <div className="w-9 h-9 bg-sidebar-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
              <img src={logo} alt="EduNexis" className="h-12 w-auto brightness-0 invert" />
            </motion.div>
          )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 ${active
                  ? 'bg-sidebar-accent text-sidebar-primary-foreground font-medium shadow-sm shadow-sidebar-accent/50'
                  : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
                  }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 mx-2 px-3 py-3 text-sm text-sidebar-muted hover:text-sidebar-foreground border-t border-sidebar-border mt-auto mb-2"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition-colors">
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="flex items-center gap-4">
            {user.tenant_id && <span className="text-xs text-muted-foreground hidden sm:block">{user.tenant_id}</span>}
            <span className={`badge-role badge-${user.role} text-[10px]`}>{ROLE_LABELS[user.role]}</span>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
