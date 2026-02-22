import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import heroImage from '@/assets/hero-illustration.png';
import logo from '@/assets/edunexis-logo.png';

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center bg-primary overflow-hidden">
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
    {/* Floating shapes */}
    <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/4 left-[10%] w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
    <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-primary-foreground/3 rounded-full blur-3xl" />

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary-foreground/60 mb-4">
            Academic Operating System
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] mb-6 font-heading">
            India's First Workflow-Driven{' '}
            <span className="bg-gradient-to-r from-primary-foreground to-primary-foreground/70 bg-clip-text text-transparent">
              Academic ERP
            </span>
          </h1>
          <p className="text-lg text-primary-foreground/60 max-w-lg mb-8 leading-relaxed">
            Compliance-first, multi-tenant SaaS platform powering attendance, marks, timetables, and NAAC documentation for Indian higher education institutions.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4">
          <Link to="/login" className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-7 py-3.5 rounded-lg font-semibold hover:bg-primary-foreground/90 transition-all shadow-lg shadow-primary-foreground/10">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-2 border-2 border-primary-foreground/20 text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:border-primary-foreground/40 transition-all">
            <Play className="w-4 h-4" /> Book Demo
          </a>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 text-xs text-primary-foreground/40">
          14-day free trial. No credit card required.
        </motion.p>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
        <img src={heroImage} alt="EduNexis Dashboard Preview" className="w-full rounded-2xl shadow-2xl shadow-black/30" />
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
