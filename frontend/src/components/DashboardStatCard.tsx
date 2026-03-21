import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
 
interface DashboardStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}
 
export default function DashboardStatCard({ title, value, subtitle, icon: Icon, trend, trendUp }: DashboardStatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">{title}</h3>
          <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{subtitle}</p>}
          {trend && (
            <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${trendUp ? 'text-success' : 'text-destructive'}`}>
              <span className="flex items-center rounded-lg bg-current/10 px-2 py-0.5 border border-current/20">
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
