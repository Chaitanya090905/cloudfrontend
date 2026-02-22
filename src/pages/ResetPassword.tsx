import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/utils';
import logo from '@/assets/edunexis-logo.png';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve email and old password passed from the Login page
    const { email, oldPassword } = location.state || {};

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If someone navigates here directly without state, redirect to login
    if (!email || !oldPassword) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post<any>('/api/auth/reset-password', {
                email,
                old_password: oldPassword,
                new_password: newPassword,
            });

            if (res.success) {
                // Redirect back to login so they can log in with the new password
                navigate('/login', { replace: true });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="absolute top-8 left-8">
                <Link to="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <KeyRound className="w-6 h-6" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-foreground font-heading mb-2">
                    Update Your Password
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-8">
                    Please choose a new, secure password to continue using {email}.
                </p>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-input"
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="Match new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50 mt-6"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Updating Password...' : 'Update Password & Login'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
