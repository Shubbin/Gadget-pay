import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { DollarSign, Users, AlertTriangle, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import api from '@/services/api';

const COLORS = ['#1e3a8a', '#fbbf24', '#10b981', '#ef4444'];

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-detailed-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/detailed');
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-[600px]">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const stats = [
    { label: 'Total Portfolio', value: `₦${data.financials.totalPortfolio.toLocaleString()}`, icon: Wallet, color: 'text-blue-500' },
    { label: 'Recovered Revenue', value: `₦${data.financials.recoveredRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Outstanding Debt', value: `₦${data.financials.outstandingDebt.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-500' },
    { label: 'Risk Alerts', value: '12', icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="h-20 w-20" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">{stat.label}</p>
            <h3 className="text-3xl font-display font-black text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plan Popularity */}
        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-black text-white">Plan Popularity</h3>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.plans}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="frequency"
                >
                  {data.plans.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
           <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-black text-white">Risk Heatmap</h3>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="risk_score" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                />
                <Bar dataKey="risk_score" fill="#1e3a8a" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
