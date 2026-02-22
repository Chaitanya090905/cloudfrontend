import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const rows = [
  { feature: 'Workflow-first', ours: true, theirs: false, theirLabel: 'Feature clutter' },
  { feature: 'Compliance-ready', ours: true, theirs: false, theirLabel: 'Manual reports' },
  { feature: 'Multi-tenant SaaS', ours: true, theirs: false, theirLabel: 'Single-install' },
  { feature: 'Real-time dashboards', ours: true, theirs: false, theirLabel: 'Static systems' },
  { feature: 'Role-based approval chains', ours: true, theirs: false, theirLabel: 'Flat permissions' },
  { feature: 'Auto timetable generation', ours: true, theirs: false, theirLabel: 'Manual scheduling' },
];

const Differentiation = () => (
  <section className="py-24 bg-background">
    <div className="max-w-4xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Comparison</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Why EduNexis?</h2>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card overflow-hidden">
        <div className="grid grid-cols-3 bg-primary text-primary-foreground text-sm font-semibold">
          <div className="p-4">Feature</div>
          <div className="p-4 text-center">EduNexis</div>
          <div className="p-4 text-center">Traditional ERP</div>
        </div>
        {rows.map((r, i) => (
          <motion.div
            key={r.feature}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-3 border-t border-border text-sm"
          >
            <div className="p-4 font-medium text-foreground">{r.feature}</div>
            <div className="p-4 flex justify-center">
              <div className="w-6 h-6 rounded-full bg-success/15 text-success flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs">{r.theirLabel}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Differentiation;
