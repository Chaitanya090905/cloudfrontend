import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '@/assets/edunexis-logo.png';

const Navbar = () => (
  <motion.nav
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-secondary"
  >
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <img src={logo} alt="EduNexis" className="h-14 w-auto brightness-0 invert" />
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-primary-foreground/70">
        <a href="#features" className="hover:text-primary-foreground transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-primary-foreground transition-colors">How It Works</a>
        <a href="#pricing" className="hover:text-primary-foreground transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors hidden sm:block">
          Sign In
        </Link>
        <Link
          to="/login"
          className="bg-primary-foreground text-primary px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/90 transition-all"
        >
          Start Free Trial
        </Link>
      </div>
    </div>
  </motion.nav>
);

export default Navbar;
