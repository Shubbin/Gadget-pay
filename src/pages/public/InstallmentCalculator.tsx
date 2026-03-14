import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/utils/helpers';

export default function InstallmentCalculator() {
  const [price, setPrice] = useState(1000);
  const [duration, setDuration] = useState(12);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const result = useMemo(() => {
    const interestRate = 0.05;
    const totalWithInterest = price * (1 + interestRate * (duration / 12));
    const divisor = frequency === 'daily' ? duration * 30 : frequency === 'weekly' ? duration * 4 : duration;
    const installment = Math.ceil(totalWithInterest / divisor);
    const total = installment * divisor;
    const schedule = Array.from({ length: Math.min(divisor, 12) }, (_, i) => ({
      period: i + 1,
      amount: installment,
      cumulative: installment * (i + 1),
      remaining: total - installment * (i + 1),
    }));
    return { installment, total, interest: total - price, schedule, periods: divisor };
  }, [price, duration, frequency]);

  return (
    <div className="py-8 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Calculator className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Installment Calculator</h1>
          <p className="mt-2 text-muted-foreground">Plan your payments before you buy</p>
        </div>

        <div className="mx-auto max-w-4xl grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="mb-6 font-display text-lg font-semibold text-card-foreground">Configure Your Plan</h2>
            <div className="space-y-6">
              <div>
                <Label>Product Price</Label>
                <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={100} max={10000} className="mt-1" />
                <Slider value={[price]} onValueChange={v => setPrice(v[0])} min={100} max={10000} step={50} className="mt-3" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>$100</span><span>$10,000</span></div>
              </div>
              <div>
                <Label>Payment Duration (months)</Label>
                <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={1} max={36} className="mt-1" />
                <Slider value={[duration]} onValueChange={v => setDuration(v[0])} min={1} max={36} step={1} className="mt-3" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>1 mo</span><span>36 mo</span></div>
              </div>
              <div>
                <Label>Payment Frequency</Label>
                <Select value={frequency} onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setFrequency(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Payment Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                  <span className="text-sm text-muted-foreground">Installment Amount</span>
                  <span className="font-display text-2xl font-bold text-primary">{formatCurrency(result.installment)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Payable</span>
                  <span className="font-semibold text-foreground">{formatCurrency(result.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Interest</span>
                  <span className="font-semibold text-warning">{formatCurrency(result.interest)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Number of Payments</span>
                  <span className="font-semibold text-foreground">{result.periods}</span>
                </div>
              </div>
            </div>

            {/* Schedule Preview */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="mb-4 font-display font-semibold text-card-foreground">Payment Schedule Preview</h3>
              <div className="space-y-2">
                {result.schedule.map(s => (
                  <div key={s.period} className="flex items-center gap-3">
                    <div className="w-8 text-xs font-medium text-muted-foreground">#{s.period}</div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full gradient-accent" style={{ width: `${(s.cumulative / result.total) * 100}%` }} />
                      </div>
                    </div>
                    <div className="w-20 text-right text-xs font-medium text-foreground">{formatCurrency(s.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
