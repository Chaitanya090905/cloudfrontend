import { motion } from 'framer-motion';
import { Building, Settings, Workflow, BarChart3 } from 'lucide-react';

const steps = [
  { icon: Building, title: 'Onboard Institution', desc: 'Register your college with a unique tenant code. Get instant access to the admin dashboard.' },
  { icon: Settings, title: 'Configure Academic Structure', desc: 'Set up departments, programs, subjects, batches, classrooms, and faculty workload.' },
  { icon: Workflow, title: 'Automate Workflows', desc: 'Attendance marking, marks entry with HOD approval, OD requests, and timetable generation.' },
  { icon: BarChart3, title: 'Generate Compliance Reports', desc: 'One-click NAAC-ready reports with CSV and PDF export. Always audit-ready.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-card">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Process</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">How It Works</h2>
      </motion.div>
      <div className="relative">
        {/* Connector line */}
        <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-border" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                <s.icon className="w-7 h-7" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.2 }}
                className="absolute -top-2 -right-2 lg:top-0 lg:right-auto lg:left-1/2 lg:ml-6 w-7 h-7 rounded-full bg-background border-2 border-primary text-primary text-xs font-bold flex items-center justify-center z-20"
              >
                {i + 1}
              </motion.div>
              <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
