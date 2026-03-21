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
    <div className="py-24 lg:py-40 bg-[#F9FAFB] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 shadow-premium">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter">Payment <span className="text-primary/40 italic">Calculator</span></h1>
          <p className="mt-6 text-xl font-medium text-muted-foreground/60 max-w-2xl mx-auto tracking-tight">Find the best payment plan for your new gadget. Simple, fast, and clear.</p>
        </div>

        <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-2">
          {/* Inputs */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-premium">
            <h2 className="mb-10 text-lg font-black text-foreground tracking-tight uppercase text-[10px] tracking-[0.2em] text-primary/60">Choose your plan</h2>
            <div className="space-y-12">
              <div className="space-y-6">
                <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">Gadget Price (₦)</Label>
                <div className="relative">
                  <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={10000} max={5000000} className="h-16 px-8 bg-slate-50 border-none rounded-2xl text-foreground focus:ring-primary/10 transition-all font-black text-xl shadow-inner" />
                </div>
                <Slider value={[price]} onValueChange={v => setPrice(v[0])} min={10000} max={5000000} step={10000} className="mt-8" />
                <div className="mt-4 flex justify-between text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]"><span>Min ₦10k</span><span>Max ₦5m</span></div>
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">How many months?</Label>
                <div className="relative">
                  <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={1} max={36} className="h-16 px-8 bg-slate-50 border-none rounded-2xl text-foreground focus:ring-primary/10 transition-all font-black text-xl shadow-inner" />
                </div>
                <Slider value={[duration]} onValueChange={v => setDuration(v[0])} min={1} max={36} step={1} className="mt-8" />
                <div className="mt-4 flex justify-between text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]"><span>1 Month</span><span>36 Months</span></div>
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">How often to pay?</Label>
                <Select value={frequency} onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setFrequency(v)}>
                  <SelectTrigger className="h-16 px-8 bg-slate-50 border-none rounded-2xl text-foreground font-black text-lg shadow-inner uppercase tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-slate-100 text-foreground">
                    <SelectItem value="daily" className="font-bold py-4 uppercase text-[10px] tracking-widest">Daily</SelectItem>
                    <SelectItem value="weekly" className="font-bold py-4 uppercase text-[10px] tracking-widest">Weekly</SelectItem>
                    <SelectItem value="monthly" className="font-bold py-4 uppercase text-[10px] tracking-widest">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-12">
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-premium relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h2 className="mb-8 text-lg font-black text-foreground tracking-tight uppercase text-[10px] tracking-[0.2em] text-primary/60">Your Plan</h2>
              <div className="space-y-8">
                <div className="flex flex-col justify-center rounded-[2rem] bg-slate-50 p-10 border border-slate-100">
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] mb-4">You pay</span>
                  <span className="text-6xl font-black text-primary tracking-tighter">{formatCurrency(result.installment)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-white border border-slate-100">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest block mb-2">Total to pay</span>
                    <span className="text-xl font-black text-foreground">{formatCurrency(result.total)}</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-slate-100">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest block mb-2">Interest</span>
                    <span className="text-xl font-black text-primary italic">{formatCurrency(result.interest)}</span>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Total payments</span>
                  <span className="text-xl font-black text-foreground/40">{result.periods}</span>
                </div>
              </div>
            </div>

            {/* Schedule Preview */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-premium">
              <h3 className="mb-8 text-lg font-black text-foreground tracking-tight uppercase text-[10px] tracking-[0.2em] text-primary/60">Upcoming payments</h3>
              <div className="space-y-6">
                {result.schedule.map(s => (
                  <div key={s.period} className="flex items-center gap-6">
                    <div className="w-10 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">#{s.period}</div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-slate-50 overflow-hidden">
                        <div className="h-full rounded-full bg-primary/20" style={{ width: `${(s.cumulative / result.total) * 100}%` }} />
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-black text-foreground tracking-tight">{formatCurrency(s.amount)}</div>
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
