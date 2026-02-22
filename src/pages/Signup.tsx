import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Building2, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/utils';
import logo from '@/assets/edunexis-logo.png';

const FEATURES = [
    'Multi-tenant ERP with complete isolation',
    'Attendance, marks, OD workflows',
    'Auto-timetable generation',
    'Compliance reports (NAAC/UGC)',
    '14-day free trial — no card required',
];

const Signup = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '', organization_name: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

        setLoading(true);
        try {
            const res = await api.post<any>('/api/auth/signup', form);
            if (res.success) {
                const { user: u, token } = res.data;
                login({
                    uid: u.uid, id: u.user_id, name: u.name, email: u.email, role: u.role,
                    tenant_id: u.tenant_id, user_id: u.user_id, tenant_name: u.tenant_name,
                }, token);
                navigate('/dashboard');
            }
        } catch (err: any) { setError(err.message || 'Signup failed'); }
        setLoading(false);
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Benefits */}
            <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-20 right-10 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <Link to="/" className="block mb-12">
                        <img src={logo} alt="EduNexis" className="mx-auto h-16 w-auto brightness-0 invert" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-primary-foreground font-heading mb-3">
                        Start Your Free Trial
                    </h2>
                    <p className="text-primary-foreground/50 mb-10 max-w-sm leading-relaxed">
                        Join 500+ institutions using EduNexis to streamline academic operations.
                    </p>
                    <div className="space-y-4">
                        {FEATURES.map(f => (
                            <div key={f} className="flex items-center gap-3 text-primary-foreground/80">
                                <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-300" />
                                <span className="text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10">
                        <div className="text-xs text-primary-foreground/50 mb-1">FREE FOR 14 DAYS</div>
                        <div className="text-xl font-extrabold text-primary-foreground">₹0 <span className="text-sm font-normal text-primary-foreground/40">/month during trial</span></div>
                        <div className="text-xs text-primary-foreground/40 mt-1">100 students • Full features • No card required</div>
                    </div>
                </div>
                <p className="relative z-10 text-xs text-primary-foreground/30">© 2026 EduNexis. Secure Multi-Tenant SaaS.</p>
            </motion.div>

            {/* Right Panel — Form */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex-1 flex items-center justify-center p-8 bg-background"
            >
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8"><img src={logo} alt="EduNexis" className="mx-auto h-16 w-auto brightness-0 invert" /></div>
                    <h3 className="text-2xl font-bold text-foreground font-heading mb-1">Create your account</h3>
                    <p className="text-sm text-muted-foreground mb-6">Start your 14-day free trial. No credit card required.</p>

                    {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={set('name')} placeholder="Dr. Sharma" required /></div>
                            <div><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></div>
                        </div>
                        <div><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="admin@college.edu" required /></div>
                        <div><label className="form-label">Organization Name *</label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input className="form-input pl-10" value={form.organization_name} onChange={set('organization_name')} placeholder="Manipal University" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={set('password')} placeholder="Min 6 chars" required /></div>
                            <div><label className="form-label">Confirm Password *</label><input type="password" className="form-input" value={form.confirm_password} onChange={set('confirm_password')} placeholder="Repeat" required /></div>
                        </div>
                        <button type="submit" disabled={loading || !form.name || !form.email || !form.password || !form.organization_name}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            {loading ? 'Creating account...' : 'Start Free Trial'}
                        </button>
                    </form>
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
