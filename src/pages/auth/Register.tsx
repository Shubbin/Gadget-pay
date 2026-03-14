import { Link, useNavigate } from 'react-router-dom';
import { Laptop } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function Register() {
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' });
    toast.success('Account created successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center gradient-hero lg:flex">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Laptop className="h-8 w-8" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-bold">Start Your Journey</h2>
          <p className="text-primary-foreground/80">Join thousands of users who buy gadgets with flexible payment plans.</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 font-display text-xl font-bold text-primary lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary"><Laptop className="h-5 w-5 text-primary-foreground" /></div>
            GadgetFlex
          </Link>
          <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mb-8 text-sm text-muted-foreground">Get started with flexible gadget payments</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>First Name</Label><Input placeholder="John" className="mt-1" required /></div>
              <div><Label>Last Name</Label><Input placeholder="Doe" className="mt-1" required /></div>
            </div>
            <div><Label>Email</Label><Input type="email" placeholder="you@example.com" className="mt-1" required /></div>
            <div><Label>Password</Label><Input type="password" placeholder="••••••••" className="mt-1" required /></div>
            <div><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" className="mt-1" required /></div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Create Account</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
