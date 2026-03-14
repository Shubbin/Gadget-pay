import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const salesData = [
  { month: 'Jan', sales: 12400 }, { month: 'Feb', sales: 15800 }, { month: 'Mar', sales: 18200 },
  { month: 'Apr', sales: 22100 }, { month: 'May', sales: 19500 }, { month: 'Jun', sales: 24800 },
];

const installmentData = [
  { month: 'Jan', active: 180 }, { month: 'Feb', active: 210 }, { month: 'Mar', active: 245 },
  { month: 'Apr', active: 280 }, { month: 'May', active: 298 }, { month: 'Jun', active: 312 },
];

const categoryData = [
  { name: 'Laptops', value: 35 }, { name: 'Phones', value: 30 },
  { name: 'Tablets', value: 20 }, { name: 'Accessories', value: 15 },
];

const COLORS = ['hsl(224, 58%, 33%)', 'hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(220, 14%, 60%)'];

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display font-semibold text-card-foreground">Sales Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(224, 58%, 33%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display font-semibold text-card-foreground">Installment Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={installmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="active" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="mb-4 font-display font-semibold text-card-foreground">Top Selling Categories</h2>
          <div className="flex flex-col items-center md:flex-row md:justify-center gap-8">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-card-foreground">{cat.name}: {cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
