import { motion } from 'framer-motion';
import { Building2, Shield, FileCheck, CalendarCheck, Calendar, Lock } from 'lucide-react';

const features = [
  { icon: Building2, title: 'Multi-Tenant Architecture', desc: 'Each institution gets isolated data, custom config, and independent admin control within a shared platform.' },
  { icon: Shield, title: 'Role-Based Workflows', desc: 'Five distinct roles with approval chains: Super Admin, Admin, HOD, Faculty, and Student.' },
  { icon: FileCheck, title: 'Compliance Automation', desc: 'Auto-generated NAAC-ready reports with student-faculty ratios, pass rates, and attendance metrics.' },
  { icon: CalendarCheck, title: 'Attendance & Marks Engine', desc: 'Session-wise attendance marking with OD workflow, marks entry with HOD approval and admin locking.' },
  { icon: Calendar, title: 'Timetable Auto-Generation', desc: 'Greedy algorithm avoids batch, faculty, and room clashes. Manual overrides supported.' },
  { icon: Lock, title: 'Secure & Scalable', desc: 'JWT auth, tenant isolation, audit logging, and role-based access control built into every layer.' },
];

const FeaturesGrid = () => (
  <section id="features" className="py-24 bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Platform Features</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">
          Everything Your Institution Needs
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-card p-7 group cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground mb-2 text-lg">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesGrid;
