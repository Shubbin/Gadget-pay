import { LayoutDashboard, MessageSquare, UserCheck, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function SupportDashboard() {
  const tickets = [
    { id: 'T-1001', user: 'Shubbin', type: 'Payment Delay', status: 'In Progress', priority: 'High' },
    { id: 'T-1002', user: 'Makinde', type: 'KYC Verification', status: 'Pending', priority: 'Medium' },
    { id: 'T-1003', user: 'Ola', type: 'Receipt Issue', status: 'Resolved', priority: 'Low' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Assistance</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Customer Care</h1>
          <p className="mt-1 text-muted-foreground font-medium">Helping everyone get their gadgets without stress.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search name or issue..." className="pl-12 h-14 bg-white border-border rounded-xl text-foreground font-bold shadow-sm focus:ring-primary/20" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" /> Active Issues
            </h3>
            <div className="space-y-4">
              {tickets.map((ticket, i) => (
                <motion.div 
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-slate-50 border border-border hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    {ticket.id.split('-')[1]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-foreground">{ticket.user}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                             ticket.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-primary border border-blue-100'
                        }`}>{ticket.priority}</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{ticket.type}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{ticket.status}</span>
                    <button className="h-10 px-6 rounded-lg bg-primary text-[10px] font-bold uppercase tracking-widest text-white hover:bg-primary/90 shadow-sm transition-all">
                        Help Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-6">Agent Stats</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <span className="text-sm font-bold text-muted-foreground">Solved Today</span>
                        </div>
                        <span className="text-lg font-black text-foreground">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            <span className="text-sm font-bold text-muted-foreground">In Queue</span>
                        </div>
                        <span className="text-lg font-black text-foreground">12</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-primary p-8 text-white shadow-lg overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
                <MessageSquare className="h-10 w-10 mb-6 text-white/90" />
                <h3 className="text-2xl font-black mb-1">Team Chat</h3>
                <p className="text-sm font-medium text-white/80 mb-6 italic">Coordinate with other agents in real-time.</p>
                <button className="w-full h-14 rounded-xl bg-white text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
                    Start Chatting
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
