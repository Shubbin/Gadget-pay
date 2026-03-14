import { mockPayments } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Receipts() {
  const successPayments = mockPayments.filter(p => p.status === 'Success');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Receipts</h1>
        <p className="text-sm text-muted-foreground">Download your payment receipts</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {successPayments.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">{p.product}</p>
                <p className="text-xs text-muted-foreground">{p.id} • {p.date} • {formatCurrency(p.amount)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toast.success('Receipt downloaded!')}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
