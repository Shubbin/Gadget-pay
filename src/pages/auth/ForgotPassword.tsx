import { Link } from 'react-router-dom';
import { Laptop, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password reset link sent to your email!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center gap-2 font-display text-xl font-bold text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary"><Laptop className="h-5 w-5 text-primary-foreground" /></div>
          GadgetFlex
        </Link>
        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="mb-8 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Email</Label><Input type="email" placeholder="you@example.com" className="mt-1" required /></div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground">Send Reset Link</Button>
        </form>
        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
