import { LayoutDashboard, Users, ShieldAlert, Zap, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAdminDashboard() {
  const stats = [
    { label: 'App Health', value: '99.9%', icon: Zap, color: 'text-green-500' },
    { label: 'Total Members', value: '12,450', icon: Users, color: 'text-blue-500' },
    { label: 'Security Alerts', value: '0', icon: ShieldAlert, color: 'text-primary' },
    { label: 'Growth', value: '+24%', icon: TrendingUp, color: 'text-accent' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Infrastructure</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Owner Dashboard</h1>
        <p className="mt-1 text-muted-foreground font-medium">Full control over the entire platform ecosystem.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-xl bg-slate-50 border border-border ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Live</span>
            </div>
            <p className="text-3xl font-black text-foreground">{stat.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" /> System Journals
            </h3>
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-border hover:bg-white transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            <div>
                                <p className="text-sm font-bold text-foreground">Cloud Node Connectivity Stable</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2 minutes ago</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline">Inspect</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500" /> Protocol Override
            </h3>
            <div className="grid gap-4">
                <button className="h-16 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    Emergency Service Suspension
                </button>
                <button className="h-16 rounded-xl bg-slate-50 border border-border text-foreground font-bold uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all shadow-sm">
                    Purge System Cache
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
