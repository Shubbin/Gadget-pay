import { orderService } from '@/services';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import OrderTracking from '@/components/OrderTracking';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAll()
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Purchases</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Order History</h1>
        <p className="mt-1 text-muted-foreground font-medium">View and track all your gadgets here.</p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-white shadow-sm p-8">
          <TableSkeleton cols={7} rows={5} />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-5 pl-6">Order ID</th>
                  <th className="py-5">Product</th>
                  <th className="py-5 text-right">Price</th>
                  <th className="py-5 pl-8">Plan</th>
                  <th className="py-5">Date</th>
                  <th className="py-5 pr-6 text-right">Status</th>
                  <th className="py-5 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o: any) => (
                  <>
                    <tr 
                      key={o.id} 
                      className={`group cursor-pointer transition-colors ${expandedId === o.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    >
                      <td className="py-6 pl-6 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">{o.id.split('-')[0]}</td>
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                            <p className="font-bold text-foreground tracking-tight">{o.product_name || 'Gadget Order'}</p>
                            {o.status !== 'cancelled' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 italic">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span className="text-[8px] font-black uppercase">Protected</span>
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="py-6 text-right font-bold text-foreground">{formatCurrency(o.total_amount)}</td>
                      <td className="py-6 pl-8">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border">{o.installment_plan || 'Direct'}</span>
                      </td>
                      <td className="py-6 font-medium text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-6 pr-6 text-right">
                        <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${getStatusColor(o.status)}`}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-6 pr-6 text-right">
                        {expandedId === o.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === o.id && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-slate-50/50">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-12 py-12">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 border-b border-border pb-4">Track Your Gadget</h3>
                                <OrderTracking currentStatus={o.status} />
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">No Purchases Found</h2>
          <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Your gadget orders will appear here once you make a purchase.</p>
        </motion.div>
      )}
    </div>
  );
}
