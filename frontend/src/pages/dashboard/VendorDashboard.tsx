import { useQuery } from '@tanstack/react-query';
import { vendorService } from '@/services';
import { formatCurrency } from '@/utils/helpers';
import { Package, TrendingUp, DollarSign, Plus, Settings, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardStatCard from '@/components/DashboardStatCard';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export default function VendorDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vendorStats'],
    queryFn: () => vendorService.getStats()
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['vendorProducts'],
    queryFn: () => vendorService.getProducts()
  });

  const { data: salesHistory } = useQuery({
    queryKey: ['vendorSalesHistory'],
    queryFn: () => vendorService.getSalesHistory(),
  });

  if (statsLoading || productsLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Loading store dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Merchant Portal</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Seller Dashboard</h1>
          <p className="mt-1 text-muted-foreground font-medium">Manage your gadgets and grow your business.</p>
        </div>
        <Button className="h-14 px-10 rounded-xl bg-primary text-white font-bold shadow-md hover:shadow-lg transition-all gap-2">
          <Plus className="h-5 w-5" /> Add New Gadget
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <DashboardStatCard title="Total Inventory" value={stats?.productCount || 0} icon={Package} />
        <DashboardStatCard title="Orders Content" value={stats?.totalSales || 0} icon={TrendingUp} />
        <DashboardStatCard title="Revenue Stream" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} />
      </div>

      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-foreground tracking-tight mb-8">Sales Overview</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Array.isArray(salesHistory) ? salesHistory : []}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(0,0,0,0.3)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `₦${value/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Active Inventory</h2>
          <Button variant="outline" className="h-10 px-4 rounded-xl border-border text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
            Manage All
          </Button>
        </div>

        <div className="grid gap-6">
          {products?.map((product: any, i: number) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex items-center gap-6 p-4 rounded-2xl bg-white border border-border hover:bg-slate-50 transition-all"
            >
              <div className="h-20 w-20 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-border capitalize text-4xl">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  '📦'
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground tracking-tight">{product.name}</h3>
                <div className="flex items-center gap-6 mt-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.category}</span>
                  <div className="h-3 w-px bg-border" />
                  <span className="text-sm font-bold text-primary">{formatCurrency(product.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pr-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-slate-100 hover:text-primary transition-all"><Settings className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-slate-100 transition-all"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          ))}
          {(!products || (Array.isArray(products) && products.length === 0)) && (
            <div className="py-20 text-center">
              <p className="text-gray-500 font-medium italic">You haven't added any gadgets yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
