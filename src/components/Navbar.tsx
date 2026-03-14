import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, Laptop } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Calculator', to: '/calculator' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, isAuthenticated } = useApp();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Laptop className="h-5 w-5 text-primary-foreground" />
          </div>
          GadgetFlex
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location.pathname === l.to ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/marketplace" className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent p-0 text-[10px] text-accent-foreground">
                {cartCount}
              </Badge>
            )}
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm" variant="outline" className="gap-2"><User className="h-4 w-4" />Dashboard</Button>
            </Link>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Link to="/login"><Button size="sm" variant="ghost">Sign In</Button></Link>
              <Link to="/register"><Button size="sm" className="gradient-primary text-primary-foreground">Get Started</Button></Link>
            </div>
          )}
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              {l.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}><Button size="sm" variant="ghost" className="w-full">Sign In</Button></Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}><Button size="sm" className="w-full gradient-primary text-primary-foreground">Get Started</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
