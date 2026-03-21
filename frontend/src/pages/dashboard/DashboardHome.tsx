import { Link } from 'react-router-dom';
import { CreditCard, DollarSign, Clock, CalendarDays, TrendingUp, ShoppingBag, ShieldCheck, Gift, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import DashboardStatCard from '@/components/DashboardStatCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { referralService, orderService, installmentService, vendorService } from '@/services';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function Dashboard() {
  const { user } = useApp();
  const [copied, setCopied] = useState(false);

  const { data: refStats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => referralService.getStats(),
    enabled: !!user
  });

  const { data: orderStats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => orderService.getStats(),
    enabled: !!user
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: () => orderService.getAll(),
    enabled: !!user
  });

  const { data: activeInstallments } = useQuery({
    queryKey: ['activeInstallments'],
    queryFn: () => installmentService.getAll(),
    enabled: !!user
  });

  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;

  const copyRefLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tierColors: Record<string, string> = {
    'Bronze': 'bg-slate-50 border-border text-slate-700',
    'Silver': 'bg-blue-50 border-blue-100 text-blue-700',
    'Gold': 'bg-amber-50 border-amber-100 text-amber-700',
    'Platinum': 'bg-indigo-50 border-indigo-100 text-indigo-700'
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Overview</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Home</h1>
          <p className="mt-1 text-muted-foreground font-medium">Everything you need, all in one place.</p>
        </div>
        
        {/* Tier Badge */}
        <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border ${tierColors[user?.tier || 'Bronze'] || tierColors.Bronze} shadow-sm font-bold`}>
          <ShieldCheck className="h-5 w-5" />
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-70 leading-none mb-1">Status</p>
            <p className="text-sm leading-none">{user?.tier || 'New Member'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Active Plans" value={activeInstallments?.length || 0} icon={CreditCard} trend="Now" trendUp />
        <DashboardStatCard title="Credit Limit" value={formatCurrency(user?.credit_limit || 0)} icon={TrendingUp} subtitle="Total you can spend" />
        <DashboardStatCard title="Total Owed" value={formatCurrency(orderStats?.totalBalance || 0)} icon={Clock} subtitle="Total to be paid" />
        <DashboardStatCard title="Earnings" value={formatCurrency(refStats?.rewardsEarned || 0)} icon={Gift} subtitle="From invites" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Installments - Spans 2 columns */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Monthly Payments</h2>
            <Link to="/dashboard/installments">
              <Button variant="link" size="sm" className="font-bold text-primary p-0 h-auto">View Plans</Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.isArray(activeInstallments) && activeInstallments.slice(0, 4).map((inst: any) => {
              const amountPaid = parseFloat(inst.order_total) - parseFloat(inst.remaining_balance);
              const progress = Math.round((amountPaid / parseFloat(inst.order_total)) * 100);
              return (
                <div key={inst.id} className="group rounded-xl border border-border bg-slate-50/50 p-6 transition-all hover:bg-secondary/50">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-foreground tracking-tight">{inst.product_name}</p>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{formatCurrency(inst.monthly_amount || 0)}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">monthly</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Progress</span>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-primary shadow-sm" 
                      />
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-1">
                      <span className="text-muted-foreground">Paid: <span className="text-foreground font-bold">{formatCurrency(amountPaid)}</span></span>
                      <span className="text-muted-foreground">Balance: <span className="text-foreground font-bold">{formatCurrency(inst.remaining_balance)}</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!activeInstallments || (Array.isArray(activeInstallments) && activeInstallments.length === 0)) && (
                <div className="col-span-2 py-10 text-center border border-dashed border-white/10 rounded-2xl">
                    <p className="text-gray-500 font-medium italic">No active payment plans found.</p>
                </div>
            )}
          </div>
        </div>

        {/* Global Referral Section */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-orange-50 p-2 text-warning"><Gift className="h-5 w-5" /></div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Invite Friends</h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-8">Get <span className="text-foreground font-bold">₦5,000</span> for every friend you invite.</p>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Invite Link</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    readOnly 
                    value={referralLink} 
                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-muted-foreground focus:outline-none"
                  />
                </div>
                <Button 
                  onClick={copyRefLink} 
                  size="icon" 
                  variant="outline" 
                  className="rounded-xl border-border hover:bg-slate-50"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-border p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Stats</p>
                <Link to="/dashboard/referrals" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Details</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-black text-foreground">{refStats?.referrals?.length || 0}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Invites</p>
                </div>
                <div>
                  <p className="text-xl font-black text-foreground text-right">{refStats?.rewardsEarned || 0}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase text-right tracking-tight">Bonus</p>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full mt-8 rounded-xl h-14 font-bold text-sm gap-2 bg-primary text-white shadow-md">
            Share Link
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {user?.role === 'user' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-900 p-12 text-center relative overflow-hidden group shadow-xl"
        >
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-3xl font-black text-white mb-4 relative z-10">Become a Seller</h2>
          <p className="max-w-xl mx-auto text-slate-400 font-medium mb-10 relative z-10">Open your store and start selling to tech lovers across Nigeria.</p>
          <Button 
            onClick={async () => {
              try {
                await vendorService.register();
                toast.success('Store opened successfully!');
                window.location.reload();
              } catch (e) {
                toast.error('Could not open store');
              }
            }}
            className="rounded-xl h-14 px-10 font-bold bg-primary text-white relative z-10 hover:scale-[1.02] transition-all shadow-lg"
          >
            Start Selling
          </Button>
        </motion.div>
      )}

      {/* Recent Orders */}
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Recent Activity</h2>
          <Link to="/dashboard/orders">
            <Button variant="link" size="sm" className="font-bold text-primary p-0 h-auto">Order History</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <th className="pb-4 pl-4">Product</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.isArray(recentOrders) && recentOrders.slice(0, 5).map((o: any) => (
                <tr key={o.id} className="group transition-colors hover:bg-slate-50">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden border border-border">
                            <img src={o.image_url} alt={o.product_name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground tracking-tight">{o.product_name}</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase">{o.id.split('-')[0]}</p>
                        </div>
                    </div>
                  </td>
                  <td className="py-5 font-medium text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="py-5">
                    <span className="font-bold text-foreground">{formatCurrency(o.total_amount)}</span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <Badge className={`rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${getStatusColor(o.status)}`}>
                      {o.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!recentOrders || (Array.isArray(recentOrders) && recentOrders.length === 0)) && (
                <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500 font-medium italic">No recent orders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
