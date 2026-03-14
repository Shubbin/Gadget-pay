import { Link } from 'react-router-dom';
import { CreditCard, DollarSign, Clock, CalendarDays, TrendingUp, ShoppingBag } from 'lucide-react';
import DashboardStatCard from '@/components/DashboardStatCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { mockInstallments, mockOrders } from '@/utils/mockData';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Active Plans" value="2" icon={CreditCard} trend="1 new this month" trendUp />
        <DashboardStatCard title="Total Paid" value="$1,941" icon={DollarSign} trend="+$300 this month" trendUp />
        <DashboardStatCard title="Remaining Balance" value="$1,657" icon={Clock} subtitle="Across all plans" />
        <DashboardStatCard title="Next Payment" value="Apr 15" icon={CalendarDays} subtitle="$208 due" />
      </div>

      {/* Active Installments */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Active Installments</h2>
          <Link to="/dashboard/installments"><Button variant="ghost" size="sm">View All</Button></Link>
        </div>
        <div className="space-y-4">
          {mockInstallments.map(inst => (
            <div key={inst.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-card-foreground">{inst.product}</p>
                <span className="text-sm text-muted-foreground">{formatCurrency(inst.monthlyAmount)}/mo</span>
              </div>
              <Progress value={inst.progress} className="mb-2 h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Paid: {formatCurrency(inst.amountPaid)}</span>
                <span>Remaining: {formatCurrency(inst.remaining)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Recent Orders</h2>
          <Link to="/dashboard/orders"><Button variant="ghost" size="sm">View All</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Product</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Plan</th><th className="pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {mockOrders.slice(0, 3).map(o => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-card-foreground">{o.product}</td>
                  <td className="py-3 text-muted-foreground">{o.date}</td>
                  <td className="py-3 text-muted-foreground">{o.plan}</td>
                  <td className="py-3"><Badge variant="secondary" className={getStatusColor(o.status)}>{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
