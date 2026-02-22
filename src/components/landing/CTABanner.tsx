import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTABanner = () => (
  <section className="py-20 bg-primary relative overflow-hidden">
    <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-0 left-1/4 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />
    <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-extrabold text-primary-foreground font-heading mb-4"
      >
        Ready to Modernize Your Institution?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-primary-foreground/60 mb-8 text-lg"
      >
        Join forward-thinking colleges already using EduNexis to automate academics and ace compliance.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-foreground/90 transition-all shadow-lg"
        >
          Start Free Trial <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default CTABanner;
