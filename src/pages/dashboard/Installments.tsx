import { mockInstallments } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { Progress } from '@/components/ui/progress';
import { CalendarDays } from 'lucide-react';

export default function Installments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Installment Plans</h1>
        <p className="text-sm text-muted-foreground">Track your active payment plans</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {mockInstallments.map(inst => (
          <div key={inst.id} className="rounded-xl border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-display font-semibold text-card-foreground">{inst.product}</p>
                <p className="text-sm text-muted-foreground">{inst.id}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-primary">{formatCurrency(inst.monthlyAmount)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
              </div>
            </div>
            <Progress value={inst.progress} className="mb-3 h-3" />
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-semibold text-card-foreground">{formatCurrency(inst.totalPrice)}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-2">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-sm font-semibold text-accent">{formatCurrency(inst.amountPaid)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-sm font-semibold text-card-foreground">{formatCurrency(inst.remaining)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> Next payment: {inst.nextPayment}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
