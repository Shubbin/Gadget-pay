import { mockOrders } from '@/utils/mockData';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

export default function AdminOrders() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Commerce</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Order Management</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-5 pl-8">Order ID</th>
                <th className="py-5">Product Details</th>
                <th className="py-5">Amount</th>
                <th className="py-5">Payment Plan</th>
                <th className="py-5 pr-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {mockOrders.map(o => (
                <tr key={o.id} className="group transition-colors hover:bg-slate-50">
                  <td className="py-6 pl-8 font-mono text-xs text-muted-foreground font-medium uppercase tracking-tighter">{o.id}</td>
                  <td className="py-6 font-bold text-foreground">{o.product}</td>
                  <td className="py-6 font-bold text-primary">{formatCurrency(o.amount)}</td>
                  <td className="py-6 text-muted-foreground font-medium italic">{o.plan}</td>
                  <td className="py-6 pr-8 text-right">
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
    </div>
  );
}
