import { mockPayments } from '@/utils/mockData';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

export default function Payments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Payment History</h1>
        <p className="text-sm text-muted-foreground">View all your transactions</p>
      </div>
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-4 font-medium">Transaction ID</th><th className="p-4 font-medium">Product</th>
            <th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {mockPayments.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4 font-mono text-xs text-muted-foreground">{p.id}</td>
                <td className="p-4 font-medium text-card-foreground">{p.product}</td>
                <td className="p-4 font-medium text-card-foreground">{formatCurrency(p.amount)}</td>
                <td className="p-4 text-muted-foreground">{p.date}</td>
                <td className="p-4"><Badge variant="secondary" className={getStatusColor(p.status)}>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
