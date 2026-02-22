import { Link } from 'react-router-dom';
import logo from '@/assets/edunexis-logo.png';

const LandingFooter = () => (
  <footer className="bg-primary py-16">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <div className="mb-4">
            <img src={logo} alt="EduNexis" className="h-14 w-auto brightness-0 invert" />
          </div>
          <p className="text-sm text-primary-foreground/50 leading-relaxed">
            India's workflow-driven Academic Operating System for higher education.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary-foreground mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/50">
            <li><a href="#features" className="hover:text-primary-foreground transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-primary-foreground transition-colors">Pricing</a></li>
            <li><a href="#how-it-works" className="hover:text-primary-foreground transition-colors">How It Works</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary-foreground mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/50">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">About</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary-foreground mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/50">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/30">
        2026 EduNexis. All rights reserved.
      </div>
    </div>
  </footer>
);

export default LandingFooter;
