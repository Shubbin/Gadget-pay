import { orderService } from '@/services';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAll()
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Purchases</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Order History</h1>
        <p className="mt-1 text-muted-foreground font-medium">View and track all your gadgets here.</p>
      </div>

      {orders && orders.length > 0 ? (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o: any) => (
                  <tr key={o.id} className="group transition-colors hover:bg-slate-50">
                    <td className="py-6 pl-6 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">{o.id.split('-')[0]}</td>
                    <td className="py-6">
                      <p className="font-bold text-foreground tracking-tight">{o.product_name || 'Gadget Order'}</p>
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
                  </tr>
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
