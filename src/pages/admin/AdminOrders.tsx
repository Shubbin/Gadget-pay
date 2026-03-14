import { mockOrders } from '@/utils/mockData';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Orders</h1>
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-4 font-medium">Order ID</th><th className="p-4 font-medium">Product</th>
            <th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Plan</th><th className="p-4 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {mockOrders.map(o => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4 font-mono text-xs text-muted-foreground">{o.id}</td>
                <td className="p-4 font-medium text-card-foreground">{o.product}</td>
                <td className="p-4 text-card-foreground">{formatCurrency(o.amount)}</td>
                <td className="p-4 text-muted-foreground">{o.plan}</td>
                <td className="p-4"><Badge variant="secondary" className={getStatusColor(o.status)}>{o.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
