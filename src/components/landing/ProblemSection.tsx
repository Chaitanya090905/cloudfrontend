import { motion } from 'framer-motion';
import { ClipboardList, FileSpreadsheet, FileWarning, ShieldOff } from 'lucide-react';

const problems = [
  { icon: ClipboardList, title: 'Manual Attendance', desc: 'Paper registers, lost records, and impossible-to-audit attendance tracking across departments.' },
  { icon: FileSpreadsheet, title: 'Excel-Based Marks', desc: 'Scattered spreadsheets with no approval workflow, version conflicts, and zero audit trail.' },
  { icon: FileWarning, title: 'NAAC Documentation Chaos', desc: 'Months of manual report compilation that should take minutes with structured data.' },
  { icon: ShieldOff, title: 'No Governance Workflow', desc: 'No role-based approvals. Faculty, HODs, and admins operating without clear process boundaries.' },
];

const ProblemSection = () => (
  <section className="py-24 bg-card">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-destructive mb-3 block">The Problem</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">
          Indian Colleges Are Still Running on Paper & Excel
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {problems.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl border border-destructive/10 bg-destructive/5 hover:bg-destructive/8 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <p.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
