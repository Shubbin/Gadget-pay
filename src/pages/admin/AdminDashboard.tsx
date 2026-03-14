import { DollarSign, Users, ShoppingBag, TrendingUp, Package, CreditCard } from 'lucide-react';
import DashboardStatCard from '@/components/DashboardStatCard';
import { mockOrders } from '@/utils/mockData';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Total Revenue" value="$45,231" icon={DollarSign} trend="+12% from last month" trendUp />
        <DashboardStatCard title="Total Users" value="1,205" icon={Users} trend="+54 this week" trendUp />
        <DashboardStatCard title="Active Orders" value="48" icon={ShoppingBag} trend="+8 today" trendUp />
        <DashboardStatCard title="Active Installments" value="312" icon={CreditCard} subtitle="$128K outstanding" />
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Order</th><th className="pb-3 font-medium">Product</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {mockOrders.map(o => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                  <td className="py-3 text-card-foreground">{o.product}</td>
                  <td className="py-3 text-card-foreground">{formatCurrency(o.amount)}</td>
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
