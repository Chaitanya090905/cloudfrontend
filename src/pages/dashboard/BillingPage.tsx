import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Check, Tag, Loader2, ArrowRight, Gift, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { api } from '@/lib/utils';

const PLAN_CARDS = [
    { key: 'starter', label: 'Starter', price: '₹4,999', period: '/month', limit: '500 students', features: ['Full ERP access', 'Timetable generator', 'Compliance reports', 'Email support'] },
    { key: 'pro', label: 'Pro', price: '₹12,999', period: '/month', limit: '3,000 students', features: ['Everything in Starter', 'Priority support', 'Custom reports', 'API access'], popular: true },
    { key: 'enterprise', label: 'Enterprise', price: '₹49,999', period: '/month', limit: 'Unlimited', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] },
];

const BillingPage = () => {
    const [usage, setUsage] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState('starter');
    const [promoCode, setPromoCode] = useState('');
    const [calculation, setCalculation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [u, h] = await Promise.all([
                api.get<any>('/api/billing/usage'),
                api.get<any[]>('/api/billing/history').catch(() => ({ success: false, data: [] } as any)),
            ]);
            if (u.success) setUsage(u.data);
            if (h.success) setHistory(h.data);
        } catch { }
        setLoading(false);
    };

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            const r = await api.post<any>('/api/billing/calculate', { selected_plan: selectedPlan, promo_code: promoCode });
            if (r.success) setCalculation(r.data);
        } catch (err: any) { setMessage(`✗ ${err.message}`); }
        setCalculating(false);
    };

    useEffect(() => { if (selectedPlan) handleCalculate(); }, [selectedPlan]);

    const handleApplyPromo = () => { handleCalculate(); };

    const handleSubscribe = async () => {
        setSubscribing(true); setMessage('');
        try {
            const r = await api.post<any>('/api/billing/subscribe', { selected_plan: selectedPlan, promo_code: promoCode });
            if (r.success) { setMessage(`✓ ${r.message}`); loadData(); setCalculation(null); }
        } catch (err: any) { setMessage(`✗ ${err.message}`); }
        setSubscribing(false);
    };

    if (loading) return <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

    return (
        <div>
            <PageHeader title="Billing & Subscription" description="Manage your plan, view usage, and upgrade" />

            {message && <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}

            {/* Trial / Usage Banner */}
            {usage && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                        <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Current Plan</div>
                        <div className="text-2xl font-extrabold text-foreground font-heading">{usage.plan_label}</div>
                        {usage.trial_days_remaining !== null && (
                            <div className={`text-sm mt-2 font-semibold ${usage.trial_expired ? 'text-destructive' : 'text-warning'}`}>
                                {usage.trial_expired ? (
                                    <span className="flex items-center gap-1"><AlertTriangle size={14} /> Trial Expired</span>
                                ) : (
                                    `${usage.trial_days_remaining} days remaining`
                                )}
                            </div>
                        )}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
                        <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Student Usage</div>
                        <div className="text-2xl font-extrabold text-foreground font-heading">{usage.active_students} <span className="text-sm font-normal text-muted-foreground">/ {usage.student_limit}</span></div>
                        <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${usage.usage_percentage > 90 ? 'bg-destructive' : usage.usage_percentage > 70 ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${Math.min(usage.usage_percentage, 100)}%` }} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{usage.usage_percentage}% used</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
                        <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Institution</div>
                        <div className="text-lg font-bold text-foreground">{usage.tenant_name}</div>
                        <span className={`badge-role ${usage.is_active ? 'badge-success' : 'badge-danger'} text-[10px] mt-2 inline-block`}>
                            {usage.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </motion.div>
                </div>
            )}

            {/* Plan Cards */}
            <div className="mb-8">
                <h3 className="font-bold text-foreground font-heading text-lg mb-4">Choose a Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {PLAN_CARDS.map((p, i) => (
                        <motion.div
                            key={p.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedPlan(p.key)}
                            className={`glass-card p-6 cursor-pointer transition-all hover:shadow-lg relative ${selectedPlan === p.key ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/30'
                                } ${p.popular ? 'border-primary/30' : ''}`}
                        >
                            {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>}
                            <h4 className="text-lg font-bold text-foreground font-heading">{p.label}</h4>
                            <div className="mt-2"><span className="text-3xl font-extrabold text-foreground">{p.price}</span><span className="text-sm text-muted-foreground">{p.period}</span></div>
                            <div className="text-xs text-muted-foreground mt-1 mb-4">{p.limit}</div>
                            <ul className="space-y-2">
                                {p.features.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check size={14} className="text-success flex-shrink-0" />{f}</li>
                                ))}
                            </ul>
                            {selectedPlan === p.key && <div className="absolute top-4 right-4"><Check size={20} className="text-primary" /></div>}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="font-bold text-foreground font-heading text-sm mb-4 flex items-center gap-2"><Tag size={16} /> Promo Code</h3>
                    <div className="flex gap-3">
                        <input className="form-input flex-1" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter promo code" />
                        <button onClick={handleApplyPromo} disabled={calculating || !promoCode} className="bg-card border border-border text-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50">
                            {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </button>
                    </div>
                    {calculation?.promo_message && (
                        <div className={`mt-3 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${calculation.promo_code ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                            }`}>
                            {calculation.promo_code ? <Gift size={16} /> : <AlertTriangle size={16} />}
                            {calculation.promo_message}
                        </div>
                    )}
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-bold text-foreground font-heading text-sm mb-4 flex items-center gap-2"><CreditCard size={16} /> Payment Summary</h3>
                    {calculation ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{calculation.plan_label} Plan</span><span className="font-medium">₹{calculation.base_price.toLocaleString()}</span></div>
                            {calculation.overage_charge > 0 && (
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Overage ({calculation.overage_students} extra students × ₹5)</span><span className="font-medium text-warning">₹{calculation.overage_charge}</span></div>
                            )}
                            {calculation.discount > 0 && (
                                <div className="flex justify-between text-sm"><span className="text-success">Discount</span><span className="font-medium text-success">-₹{calculation.discount.toLocaleString()}</span></div>
                            )}
                            <div className="border-t border-border pt-3 flex justify-between">
                                <span className="font-bold text-foreground">Total</span>
                                <span className="text-2xl font-extrabold text-foreground">₹{calculation.final_amount.toLocaleString()}</span>
                            </div>
                            {calculation.no_payment_required && (
                                <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-semibold text-center flex items-center justify-center gap-2">
                                    <Gift size={16} /> Promo Applied — No Payment Required
                                </div>
                            )}
                            <button onClick={handleSubscribe} disabled={subscribing}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50 mt-2"
                            >
                                {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                {subscribing ? 'Processing...' : calculation.no_payment_required ? 'Activate Plan' : 'Pay Now'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">Select a plan to see pricing</div>
                    )}
                </div>
            </div>

            {/* Billing History */}
            {history.length > 0 && (
                <div className="mt-8 glass-card overflow-hidden">
                    <div className="p-4 border-b border-border"><h3 className="font-bold font-heading text-sm">Billing History</h3></div>
                    <table className="w-full">
                        <thead><tr className="border-b border-border bg-muted/50">
                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Plan</th>
                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Period</th>
                        </tr></thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="p-4 text-sm font-medium capitalize">{h.plan}</td>
                                    <td className="p-4 text-sm">₹{h.final_amount?.toLocaleString()}{h.promo_code_used && <span className="text-xs text-success ml-2">({h.promo_code_used})</span>}</td>
                                    <td className="p-4"><span className={`badge-role ${h.payment_status === 'paid' || h.payment_status === 'waived' ? 'badge-success' : 'badge-warning'} text-[10px]`}>{h.payment_status}</span></td>
                                    <td className="p-4 text-sm text-muted-foreground">{h.billing_cycle_start} → {h.billing_cycle_end}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BillingPage;
