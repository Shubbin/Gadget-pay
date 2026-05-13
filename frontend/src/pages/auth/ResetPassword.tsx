import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(password);
      setIsSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-border p-10 rounded-2xl shadow-sm text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 border border-success/20">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Password Updated!</h1>
          <p className="text-muted-foreground mb-8">Your password has been reset successfully. You will be redirected to the login page in a few seconds.</p>
          <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-xl">Go to Login Now</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-border p-10 rounded-2xl shadow-sm"
      >
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">Reset Password</h1>
          <p className="text-muted-foreground font-medium">Create a strong new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium pr-12" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</Label>
            <Input 
              type={showPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" 
              className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium" 
              required 
            />
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-xl bg-primary text-lg font-bold text-white hover:bg-primary/90 transition-all shadow-md"
          >
            {isLoading ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
