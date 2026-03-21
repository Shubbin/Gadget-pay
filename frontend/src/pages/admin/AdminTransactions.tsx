import { mockPayments } from '@/utils/mockData';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

export default function AdminTransactions() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Ledger</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Global Transactions</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-5 pl-8">Reference</th>
                <th className="py-5">Subject</th>
                <th className="py-5">Settlement</th>
                <th className="py-5">Timestamp</th>
                <th className="py-5 pr-8 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {mockPayments.map(p => (
                <tr key={p.id} className="group transition-colors hover:bg-slate-50">
                  <td className="py-6 pl-8 font-mono text-xs text-muted-foreground font-medium uppercase tracking-tighter">{p.id}</td>
                  <td className="py-6 font-bold text-foreground">{p.product}</td>
                  <td className="py-6 font-bold text-primary">{formatCurrency(p.amount)}</td>
                  <td className="py-6 text-muted-foreground font-medium">{p.date}</td>
                  <td className="py-6 pr-8 text-right">
                    <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${getStatusColor(p.status)}`}>
                      {p.status}
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
