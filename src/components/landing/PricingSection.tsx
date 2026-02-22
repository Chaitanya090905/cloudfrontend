import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '4,999',
    period: '/mo',
    desc: 'For small colleges getting started',
    features: ['Up to 500 students', '5 admin users', 'Attendance & Marks', 'Basic compliance reports', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '14,999',
    period: '/mo',
    desc: 'For growing institutions',
    badge: 'Recommended',
    features: ['Up to 5,000 students', '25 admin users', 'Full workflow automation', 'NAAC-ready reports', 'Timetable auto-generation', 'Priority support', 'CSV & PDF exports'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For universities & groups',
    features: ['Unlimited students', 'Unlimited admins', 'Multi-campus support', 'Custom integrations', 'Dedicated SLA', 'On-premise option', '24/7 phone support'],
    highlighted: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-24 bg-card">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Pricing</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Simple, Student-Based Pricing</h2>
        <p className="text-muted-foreground mt-3">14-day free trial on all plans. No credit card required.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className={`relative rounded-2xl p-8 transition-all duration-300 ${
              p.highlighted
                ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105'
                : 'glass-card'
            }`}
          >
            {p.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-warning-foreground text-xs font-bold px-4 py-1 rounded-full">
                {p.badge}
              </span>
            )}
            <h3 className={`text-xl font-bold font-heading mb-1 ${p.highlighted ? '' : 'text-foreground'}`}>{p.name}</h3>
            <p className={`text-sm mb-5 ${p.highlighted ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{p.desc}</p>
            <div className="mb-6">
              <span className={`text-4xl font-extrabold font-heading ${p.highlighted ? '' : 'text-foreground'}`}>
                {p.price === 'Custom' ? '' : '\u20B9'}{p.price}
              </span>
              <span className={`text-sm ${p.highlighted ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{p.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {p.features.map(f => (
                <li key={f} className={`flex items-center gap-2 text-sm ${p.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  <Check className={`w-4 h-4 flex-shrink-0 ${p.highlighted ? 'text-primary-foreground' : 'text-success'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${
                p.highlighted
                  ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {p.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
