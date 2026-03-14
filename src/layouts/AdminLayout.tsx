import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingBag, CreditCard, DollarSign, BarChart3, LogOut, Laptop, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const sidebarItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Installments', to: '/admin/installments', icon: CreditCard },
  { label: 'Transactions', to: '/admin/transactions', icon: DollarSign },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const sidebar = (
    <div className="flex h-full flex-col bg-foreground">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-muted-foreground/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <Laptop className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <span className="font-display text-lg font-bold text-background">GadgetFlex</span>
          <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">Admin</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-muted-foreground/20 text-background' : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-background'}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-muted-foreground/20 p-3">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted-foreground/10 hover:text-background">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-shrink-0 lg:block">{sidebar}</aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full">{sidebar}</aside>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-lg">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-semibold">Admin Panel</h1>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
