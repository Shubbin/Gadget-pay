import { mockInstallments } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { Progress } from '@/components/ui/progress';

export default function AdminInstallments() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Financials</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Installment Records</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-5 pl-8">Identifier</th>
                <th className="py-5">Product Name</th>
                <th className="py-5">Commitment</th>
                <th className="py-5">Settled</th>
                <th className="py-5 pr-8">Progress Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {mockInstallments.map(i => (
                <tr key={i.id} className="group transition-colors hover:bg-slate-50">
                  <td className="py-6 pl-8 font-mono text-xs text-muted-foreground font-medium uppercase tracking-tighter">{i.id}</td>
                  <td className="py-6 font-bold text-foreground">{i.product}</td>
                  <td className="py-6 font-bold text-foreground">{formatCurrency(i.totalPrice)}</td>
                  <td className="py-6 font-bold text-primary">{formatCurrency(i.amountPaid)}</td>
                  <td className="py-6 pr-8">
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Progress value={i.progress} className="h-1.5 bg-slate-100" />
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{i.progress}% Completed</span>
                    </div>
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
