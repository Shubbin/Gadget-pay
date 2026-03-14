import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CreditCard, Receipt, Clock, Heart, User, Bell, Wallet, LogOut, Laptop, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const sidebarItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Orders', to: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Installment Plans', to: '/dashboard/installments', icon: CreditCard },
  { label: 'Payment History', to: '/dashboard/payments', icon: Clock },
  { label: 'Receipts', to: '/dashboard/receipts', icon: Receipt },
  { label: 'Wishlist', to: '/dashboard/wishlist', icon: Heart },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
  { label: 'Payment Methods', to: '/dashboard/payment-methods', icon: Wallet },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const sidebar = (
    <div className="flex h-full flex-col gradient-hero">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/20">
          <Laptop className="h-4 w-4 text-sidebar-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-sidebar-foreground">GadgetFlex</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">{sidebar}</aside>
      {/* Mobile sidebar overlay */}
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
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Link to="/dashboard/notifications" className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden text-sm font-medium sm:block">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
