import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Users, FileCheck, LogIn, Loader2 } from 'lucide-react';
import { useAuth, ROLE_LABELS, ROLE_COLORS, User } from '@/context/AuthContext';
import { api } from '@/lib/utils';
import logo from '@/assets/edunexis-logo.png';

const securityFeatures = [
  { icon: Shield, label: 'Secure JWT Auth' },
  { icon: Lock, label: 'Tenant Isolation' },
  { icon: FileCheck, label: 'Audit Logs' },
  { icon: Users, label: 'Role-based Access' },
];

const Login = () => {
  const { login, availableUsers, fetchAvailableUsers } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchAvailableUsers().finally(() => setFetching(false));
  }, []);

  const doLogin = async (loginEmail: string) => {
    setLoading(true);
    setError('');
    try {
      const loginPassword = password || 'mock';
      const res = await api.post<any>('/api/auth/login', { email: loginEmail, password: loginPassword });
      if (res.success) {
        const u = res.data.user;

        if (u.requires_password_reset) {
          navigate('/reset-password', { state: { email: loginEmail, oldPassword: loginPassword } });
          return;
        }

        login({
          uid: u.uid || u.user_id || u.id,
          id: u.user_id || u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          tenant_id: u.tenant_id,
          user_id: u.user_id || u.id,
          department_id: u.department_id,
        }, res.data.token || `mock-${loginEmail}`);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleQuickLogin = (user: User) => doLogin(user.email);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doLogin(email); };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-20 right-10 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link to="/" className="block mb-16">
            <img src={logo} alt="EduNexis" className="mx-auto h-16 w-auto brightness-0 invert" />
          </Link>
          <h2 className="text-3xl font-extrabold text-primary-foreground font-heading mb-3">
            Academic Operating System
          </h2>
          <p className="text-primary-foreground/50 mb-12 max-w-sm leading-relaxed">
            Workflow-driven ERP powering compliance-first academic management for Indian institutions.
          </p>
          <div className="space-y-4">
            {securityFeatures.map(f => (
              <div key={f.label} className="flex items-center gap-3 text-primary-foreground/70">
                <div className="w-8 h-8 bg-primary-foreground/8 rounded-lg flex items-center justify-center">
                  <f.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/30">2026 EduNexis. Secure. Compliant. Modern.</p>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <img src={logo} alt="EduNexis" className="mx-auto h-16 w-auto brightness-0 invert" />
          </div>
          <h3 className="text-2xl font-bold text-foreground font-heading mb-1">Sign In</h3>
          <p className="text-sm text-muted-foreground mb-8">Select a role or enter credentials to continue</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {/* Quick Login */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {fetching ? 'Loading users...' : `Quick Access (${availableUsers.length} users)`}
            </p>
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto">
                {availableUsers.map(u => (
                  <motion.button
                    key={u.id || u.email}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleQuickLogin(u)}
                    disabled={loading}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-primary/3 transition-all text-left disabled:opacity-50"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: ROLE_COLORS[u.role] || '#666' }}
                    >
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                    <span className={`badge-role badge-${u.role} text-[10px]`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </motion.button>
                ))}
                {!fetching && availableUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found. Register an institution first.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or sign in with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="your@email.edu" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="Enter password" />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up Free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
