import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Profile() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>
      <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>First Name</Label><Input defaultValue="John" className="mt-1" /></div>
            <div><Label>Last Name</Label><Input defaultValue="Doe" className="mt-1" /></div>
          </div>
          <div><Label>Email</Label><Input type="email" defaultValue="john@example.com" className="mt-1" /></div>
          <div><Label>Phone</Label><Input defaultValue="+1 (555) 123-4567" className="mt-1" /></div>
          <div><Label>Address</Label><Input defaultValue="123 Market St, San Francisco, CA" className="mt-1" /></div>
          <Button type="submit" className="gradient-primary text-primary-foreground">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
