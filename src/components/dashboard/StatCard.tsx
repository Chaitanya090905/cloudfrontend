import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  delay?: number;
}

const StatCard = ({ label, value, icon, color = 'bg-primary/10 text-primary', delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="stat-card"
  >
    <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full" />
    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <div className="text-2xl font-extrabold text-foreground font-heading">{value}</div>
    <div className="text-xs text-muted-foreground font-medium mt-1">{label}</div>
  </motion.div>
);

export default StatCard;
