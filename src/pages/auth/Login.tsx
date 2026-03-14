import { Link } from 'react-router-dom';
import { Laptop } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' });
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center gradient-hero lg:flex">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Laptop className="h-8 w-8" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-bold">Welcome to GadgetFlex</h2>
          <p className="text-primary-foreground/80">Buy premium gadgets with flexible installment plans. No hidden fees, instant approval.</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 font-display text-xl font-bold text-primary lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary"><Laptop className="h-5 w-5 text-primary-foreground" /></div>
            GadgetFlex
          </Link>
          <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Sign in to your account</h1>
          <p className="mb-8 text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Email</Label><Input type="email" placeholder="you@example.com" className="mt-1" defaultValue="john@example.com" required /></div>
            <div><Label>Password</Label><Input type="password" placeholder="••••••••" className="mt-1" defaultValue="password" required /></div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="rounded" /> Remember me</label>
              <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Sign In</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
