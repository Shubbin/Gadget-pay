import { mockInstallments } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { Progress } from '@/components/ui/progress';

export default function AdminInstallments() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Installment Plans</h1>
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-4 font-medium">ID</th><th className="p-4 font-medium">Product</th>
            <th className="p-4 font-medium">Total</th><th className="p-4 font-medium">Paid</th><th className="p-4 font-medium">Progress</th>
          </tr></thead>
          <tbody>
            {mockInstallments.map(i => (
              <tr key={i.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4 font-mono text-xs text-muted-foreground">{i.id}</td>
                <td className="p-4 font-medium text-card-foreground">{i.product}</td>
                <td className="p-4 text-card-foreground">{formatCurrency(i.totalPrice)}</td>
                <td className="p-4 text-accent">{formatCurrency(i.amountPaid)}</td>
                <td className="p-4 w-40"><Progress value={i.progress} className="h-2" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
